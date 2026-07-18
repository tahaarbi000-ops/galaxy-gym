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

    // Fetch member with its category to check both statuses
    const member = await Member.findByPk(memberId, {
      include: [{ model: Category, as: "category" }],
    });

    if (!member) continue;

    // Condition 1: skip if member is not "actif"
    if (member.status !== "actif") continue;

    // Condition 2: skip if the member's category is not "active"
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
    await createDailyPayments();
    await updateLateMembers();

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