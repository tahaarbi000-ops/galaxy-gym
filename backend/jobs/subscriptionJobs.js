const { Op } = require("sequelize");
const { Subscription, Payment, Member } = require("../models");
const Category = require("../models/Category");
const ScheduledJobs = require("../models/ScheduledJobs");

const JOB_NAME = "daily-subscription-check";

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

/**
 * For every member, if today matches their billing anniversary day
 * (day-of-month of their most recent subscription) and no subscription
 * exists yet for the current month, create one as "non payé".
 *
 * Skips the member if:
 *  - the member's status is not "actif"
 *  - the member's category status is not "active"
 */
async function createDailyPayments() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

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
    const billingDate = new Date(lastSub.date);
    if (billingDate.getDate() !== today.getDate()) continue;

    const member = await Member.findByPk(memberId, {
      include: [{ model: Category, as: "category" }],
    });

    if (!member) continue;
    if (member.status !== "actif") continue;
    if (!member.category || member.category.status !== "active") continue;

    const existing = await Subscription.findOne({
      where: {
        member_id: memberId,
        date: { [Op.gte]: startOfMonth, [Op.lt]: startOfNextMonth },
      },
    });
    if (existing) continue;

    await Subscription.create({
      member_id: memberId,
      date: today,
      amount: lastSub.amount,
      status: "non payé",
    });
  }
}

/**
 * "non payé" -> "en retard" once the due date has passed within the
 * SAME billing cycle. This only covers the current month's lateness,
 * not debt carried over from earlier months (that's markArrears below).
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
 * "non payé" / "en retard" -> "Arriéré" once the unpaid record belongs
 * to a month BEFORE the current one. At that point it's no longer
 * "late this cycle" — it's debt the member is carrying forward.
 *
 * IMPORTANT: this must run AFTER createDailyPayments() and
 * updateLateMembers() in the same pass, so a record has already had
 * the chance to become "en retard" for its own month before we check
 * whether it's now stale relative to a NEW month that just started.
 *
 * Runs every day (not just on billing anniversaries) because arrears
 * become visible the moment the calendar rolls into a new month —
 * independent of any individual member's billing date.
 */
async function markArrears() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const pastUnpaid = await Subscription.findAll({
    where: {
      status: { [Op.in]: ["non payé", "en retard"] },
      date: { [Op.lt]: startOfMonth },
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
    // Order matters: create this month's record first, flag current-month
    // lateness second, THEN roll anything still unpaid from before this
    // month into Arriéré.
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