const { Op } = require("sequelize");
const { Category } = require("../models");
const Member = require("../models/Member");
const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

exports.GetSubscription = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", status = "" } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const subscriptions = await Subscription.findAll({
      include: [
        {
          model: Member,
          as: "member",
          attributes: ["id", "name"],
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["date", "DESC"]],
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startOfMonth = new Date(currentYear, currentMonth, 1);

    const isCurrentMonth = (date) => {
      const d = new Date(date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    };

    const byMember = new Map();

    for (const sub of subscriptions) {
      const memberId = sub.member_id;
      if (!byMember.has(memberId)) {
        byMember.set(memberId, {
          currentMonth: null,
          lastPast: null,
          unpaid: [],
        });
      }
      const entry = byMember.get(memberId);

      if (isCurrentMonth(sub.date)) {
        if (!entry.currentMonth) entry.currentMonth = sub;
      } else if (new Date(sub.date) < startOfMonth) {
        if (!entry.lastPast) entry.lastPast = sub;
      }

      if (sub.status === "non payé" || sub.status === "en retard") {
        entry.unpaid.push(sub);
      }
    }

    let result = [];
    for (const entry of byMember.values()) {
      const base = entry.currentMonth || entry.lastPast;
      if (!base) continue;

      const unpaidCount = entry.unpaid.length;
      const totalDue = entry.unpaid.reduce((sum, s) => sum + Number(s.amount), 0);

      result.push({
        ...base.toJSON(),
        unpaidCount,
        totalDue,
        hasPastDebt: entry.unpaid.some((s) => s.id !== base.id),
      });
    }

    // Filter by member name
    if (search) {
      const term = search.toLowerCase();
      result = result.filter((r) => r.member?.name?.toLowerCase().includes(term));
    }

    // Filter by status
    if (status) {
      result = result.filter((r) => r.status === status);
    }

    const total = result.length;
    const totalPages = Math.max(Math.ceil(total / limitNum), 1);
    const offset = (pageNum - 1) * limitNum;
    const paginated = result.slice(offset, offset + limitNum);

    return res.json({
      message: "all subscriptions",
      subscriptions: paginated,
      pagination: { total, page: pageNum, limit: limitNum, totalPages },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.History = async (req, res) => {
  try {
    const { id } = req.params;
    const subscriptions = await Subscription.findAll({
      where: { member_id: id },
      order: [["date", "DESC"]],
    });

    return res.json({ message: "history subscriptions", subscriptions });
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

const PAYMENT_TYPE_MONTHS = {
  monthly: 1,
  three_month: 3,
  six_month: 6,
  yearly: 12,
};

function computeNextPaymentDate(fromDate, paymentType) {
  const months = PAYMENT_TYPE_MONTHS[paymentType] || 1;
  const next = new Date(fromDate.getFullYear(), fromDate.getMonth() + months, fromDate.getDate());
  return next;
}

exports.Pay = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // member_id
    const { amount, subscription_id, payment_type } = req.body;

    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: "member not found" });
    }

    const now = new Date();
    let subscription = null;

    if (subscription_id) {
      // Frontend told us exactly which month/record to pay
      // (this is the case when the member has Arriéré / multiple unpaid months
      // and the secretary picked one from the history/badge).
      subscription = await Subscription.findOne({
        where: { id: subscription_id, member_id: id },
      });
      if (!subscription) {
        return res.status(404).json({ message: "subscription record not found" });
      }
    } else {
      // No specific record given -> settle the OLDEST unpaid record first.
      // Priority: Arriéré (older, carried-over debt) before en retard,
      // before non payé, so a single "Payer" click clears the actual
      // oldest debt instead of silently creating a new current-month record.
      subscription = await Subscription.findOne({
        where: {
          member_id: id,
          status: { [Op.in]: ["arriéré", "en retard", "non payé"] },
        },
        order: [["date", "ASC"]],
      });
    }

    let paidAmount = amount;
    let previousStatus;

    // payment_type resolution: explicit body value wins, otherwise keep
    // whatever the existing subscription already has, otherwise default
    // to the model default ("monthly") when creating a brand-new record.
    const resolvedPaymentType =
      payment_type || (subscription && subscription.payment_type) || "monthly";

    if (subscription) {
      // Existing unpaid record (current month, past month, or Arriéré) -> mark it paid
      previousStatus = subscription.status;
      subscription.status = "payé";
      if (amount) subscription.amount = amount;
      if (payment_type) subscription.payment_type = payment_type;
      subscription.next_payment_at = computeNextPaymentDate(now, resolvedPaymentType);
      await subscription.save();
      paidAmount = amount || subscription.amount;
    } else {
      // Truly nothing unpaid anywhere for this member -> create a fresh
      // paid record for the current month (e.g. paying ahead of schedule).
      if (!amount) {
        return res.status(400).json({ message: "amount is required" });
      }
      subscription = await Subscription.create({
        member_id: id,
        date: now,
        amount,
        status: "payé",
        payment_type: resolvedPaymentType,
        next_payment_at: computeNextPaymentDate(now, resolvedPaymentType),
      });
      paidAmount = amount;
      previousStatus = "non payé";
    }

    // Log this payment in the payment table
    await Payment.create({
      amount: paidAmount,
      paid_at: now,
      subscription_id: subscription.id,
    });

    const fullSubscription = await Subscription.findByPk(subscription.id, {
      include: [
        {
          model: Member,
          as: "member",
          attributes: ["id", "name"],
          include: [{ model: Category, as: "category", attributes: ["name"] }],
        },
        {
          model: Payment,
          as: "payments",
        },
      ],
    });

    const user = await User.findByPk(userId);
    await ActivityLog.create({
      action: "create",
      description: `${user.name} a marqué l'abonnement de ${fullSubscription.member.name}`,
      entity_type: "subscription",
      entity_id: id,
      entity_name: fullSubscription.member.name,
      user_name: user.name,
      user_role: user.role,
      user_id: user.id,
      old_values: { status: previousStatus },
      new_values: { status: "payé", payment_type: resolvedPaymentType, next_payment_at: fullSubscription.next_payment_at },
    });

    return res.json({ message: "payment recorded", subscription: fullSubscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};


exports.GetPayments = async (req, res) => {
  try {
    const { id } = req.params; // member_id
    const subscriptions = await Subscription.findAll({
      where: { member_id: id },
      include: [{ model: Payment, as: "payments" }],
      order: [["date", "DESC"]],
    });

    const payments = subscriptions
      .flatMap((s) =>
        s.payments.map((p) => ({
          ...p.toJSON(),
          status: s.status,
          subscription_date: s.date,   // <-- which month this payment covers
          subscription_id: s.id,       // already on p, but explicit here too
        }))
      )
      .sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at));

    return res.json({ message: "payment history", payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};