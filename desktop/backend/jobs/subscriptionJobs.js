const { Op } = require("sequelize");
const { Subscription, Payment, Member } = require("../models");
const Category = require("../models/Category");
const ScheduledJobs = require("../models/ScheduledJobs");

const JOB_NAME = "daily-subscription-check";

const INTERVAL_MONTHS = {
  "monthly": 1,
  "three_month": 3,
  "six_month": 6,
  "yearly": 12,
};

function todayDateOnly() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Parse a DATEONLY value (returned by Postgres/Sequelize as a plain
 * "YYYY-MM-DD" string) into a LOCAL-timezone midnight Date object —
 * the same frame todayDateOnly() uses.
 *
 * `new Date("2026-10-13")` parses as UTC midnight. Comparing that
 * directly against a local-midnight `today` (from todayDateOnly())
 * silently shifts the effective due time by the server's UTC offset:
 * for UTC+1, local midnight on the 13th is 2026-10-12T23:00Z, which is
 * BEFORE the UTC-parsed due date of 2026-10-13T00:00Z. That made
 * `next_payment_at <= today` false for the entire due day and only
 * true a day later — the job would run on the 13th and do nothing,
 * then fire a day late on the 14th.
 *
 * Extracting the Y/M/D digits directly and building the Date via the
 * local-time constructor sidesteps the UTC/local mismatch entirely.
 */
function parseDateOnly(value) {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const datePart = String(value).split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * For every member, walk forward through every subscription cycle that
 * is already due (next_payment_at <= today) and hasn't been created yet.
 *
 * IMPORTANT: each new record is dated on its OWN due date
 * (cursor.next_payment_at), NOT on "today". The day this job happens to
 * execute is irrelevant to the record's `date` — if the job is late
 * (server down, missed a run, etc.) and only picks things up a day (or
 * several cycles) later, the record still reflects the day it was
 * actually due, and next_payment_at continues to be computed from that
 * same due date + interval. This is what keeps `date` and
 * `next_payment_at` consistent with each other and with the original
 * schedule, no matter when the job actually runs.
 *
 * This also catches up on MULTIPLE missed cycles in one pass (e.g. the
 * job was down for two billing cycles), instead of only ever creating
 * one record for "today" and silently skipping earlier missed cycles.
 *
 * Skips the member if:
 *  - the member's status is not "actif"
 *  - the member's category status is not "active"
 */
async function createDailyPayments() {
  const today = todayDateOnly();

  const allSubscriptions = await Subscription.findAll({
    order: [["date", "DESC"]],
  });

  const latestByMember = new Map();
  for (const sub of allSubscriptions) {
    if (!latestByMember.has(sub.member_id)) {
      latestByMember.set(sub.member_id, sub);
    }
  }

  for (const [memberId, lastSub] of latestByMember) {
    if (!lastSub.next_payment_at) continue;
    if (parseDateOnly(lastSub.next_payment_at) > today) continue;

    const member = await Member.findByPk(memberId, {
      include: [{ model: Category, as: "category" }],
    });

    if (!member) continue;
    if (member.status !== "actif") continue;
    if (!member.category || member.category.status !== "active") continue;

    let cursor = lastSub;

    // Walk forward one due cycle at a time until we've caught up to today.
    // Bounded by how many cycles are actually due — can't run away since
    // each iteration's due date strictly increases.
    while (cursor.next_payment_at && parseDateOnly(cursor.next_payment_at) <= today) {
      const dueDate = parseDateOnly(cursor.next_payment_at);

      const existing = await Subscription.findOne({
        where: {
          member_id: memberId,
          date: dueDate,
        },
      });

      if (existing) {
        // Already created for this due date (e.g. a previous run got this
        // far but crashed before finishing later cycles) — move on to the
        // next cycle using this record as the new anchor.
        cursor = existing;
        continue;
      }

      const intervalMonths = INTERVAL_MONTHS[cursor.payment_type] || 1;

      cursor = await Subscription.create({
        member_id: memberId,
        date: dueDate,
        amount: cursor.amount,
        payment_type: cursor.payment_type,
        status: "non payé",
        next_payment_at: addMonths(dueDate, intervalMonths),
      });
    }
  }
}

/**
 * "non payé" -> "en retard" as soon as the record is more than a day
 * old and still unpaid. This flags lateness within the CURRENT cycle,
 * before it's old enough to count as carried-over arrears.
 */
async function updateLateMembers() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const overdue = await Subscription.findAll({
    where: {
      status: "non payé",
      date: { [Op.lt]: startOfToday },
    },
  });

  for (const sub of overdue) {
    sub.status = "en retard";
    await sub.save();
  }
}

/**
 * "non payé" / "en retard" -> "arriéré" once the record's OWN
 * next_payment_at has passed. That means a whole new cycle for that
 * member has started (regardless of whether their plan is monthly,
 * three_month, six_month, or yearly) while this one was still unpaid —
 * so it's no longer "late this cycle", it's debt carried forward.
 *
 * IMPORTANT: this must run AFTER createDailyPayments() and
 * updateLateMembers() in the same pass, so a record has already had
 * the chance to become "en retard" for its own cycle before we check
 * whether it's now stale relative to the next one.
 *
 * Runs every day (not just on billing anniversaries) because a given
 * member's next_payment_at can fall on any day, independent of when
 * this job happens to check.
 */
async function markArrears() {
  const today = todayDateOnly();

  const pastUnpaid = await Subscription.findAll({
    where: {
      status: { [Op.in]: ["non payé", "en retard"] },
      next_payment_at: { [Op.lte]: today },
    },
  });

  for (const sub of pastUnpaid) {
    sub.status = "arriéré";
    await sub.save();
  }
}

async function runDailyJobsIfNeeded() {
  try {
    const [jobRecord] = await ScheduledJobs.findOrCreate({
      where: { job_name: JOB_NAME },
      defaults: { last_run_date: new Date(0) },
    });

    if (isSameDay(jobRecord.last_run_date, todayDateOnly())) {
      return;
    }

    console.log(`Running ${JOB_NAME}...`);
    // Order matters: create this cycle's record first, flag current-cycle
    // lateness second, THEN roll anything still unpaid whose next_payment_at
    // has already passed into arriéré.
    await createDailyPayments();
    await updateLateMembers();
    await markArrears();

    jobRecord.last_run_date = todayDateOnly();
    await jobRecord.save();
    console.log(`${JOB_NAME} completed.`);
  } catch (error) {
    console.error(`${JOB_NAME} failed:`, error);
  }
}

function startJobWatcher({ recheckIntervalMs = 60 * 60 * 1000 } = {}) {
  runDailyJobsIfNeeded();
  setInterval(runDailyJobsIfNeeded, recheckIntervalMs);
}

module.exports = { runDailyJobsIfNeeded, startJobWatcher };