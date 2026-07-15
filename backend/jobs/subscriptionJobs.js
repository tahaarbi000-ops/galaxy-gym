const { Op } = require("sequelize");
const { Subscription, Payment } = require("../models");
const ScheduledJobs = require("../models/ScheduledJobs");

const JOB_NAME = "daily-subscription-check";

function todayDateOnly() {
  // Matches DATEONLY format (YYYY-MM-DD), independent of time-of-day
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
 */
async function createDailyPayments() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

  // Pull every subscription, newest first, and keep only the latest
  // one per member — avoids relying on the Member->Subscription
  // association (which is currently hasOne, not hasMany, and doesn't
  // support include.order/limit).
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
    // Deliberately don't update last_run_date on failure, so it retries next check
  }
}


function startJobWatcher({ recheckIntervalMs = 60 * 60 * 1000 } = {}) {
  runDailyJobsIfNeeded(); // catch up immediately on boot
  setInterval(runDailyJobsIfNeeded, recheckIntervalMs); // e.g. every hour
}

module.exports = { runDailyJobsIfNeeded, startJobWatcher };