const { Op } = require("sequelize");
const { Category } = require("../models");
const Member = require("../models/Member");
const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

exports.GetSubscription = async (req, res) => {
  try {
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
      order: [["date", "DESC"]], // newest first
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const startOfMonth = new Date(currentYear, currentMonth, 1);

    const isCurrentMonth = (date) => {
      const d = new Date(date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    };

    // Group everything by member first
    const byMember = new Map();

    for (const sub of subscriptions) {
      const memberId = sub.member_id;
      if (!byMember.has(memberId)) {
        byMember.set(memberId, {
          currentMonth: null,
          lastPast: null,
          unpaid: [], // every unpaid record, current or past
        });
      }
      const entry = byMember.get(memberId);

      if (isCurrentMonth(sub.date)) {
        if (!entry.currentMonth) entry.currentMonth = sub; // most recent (desc order)
      } else if (new Date(sub.date) < startOfMonth) {
        if (!entry.lastPast) entry.lastPast = sub;
      }

      if (sub.status === "non payé" || sub.status === "en retard") {
        entry.unpaid.push(sub);
      }
    }

    const result = [];
    for (const entry of byMember.values()) {
      const base = entry.currentMonth || entry.lastPast;
      if (!base) continue;

      const unpaidCount = entry.unpaid.length;
      const totalDue = entry.unpaid.reduce((sum, s) => sum + Number(s.amount), 0);

      result.push({
        ...base.toJSON(),
        unpaidCount,
        totalDue,
        // true when there's unpaid debt from months OTHER than the one being shown as `base`
        hasPastDebt: entry.unpaid.some((s) => s.id !== base.id),
      });
    }

    return res.json({ message: "all subscriptions", subscriptions: result });
  } catch (err) {
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

exports.Pay = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // member_id
    const { amount, method, subscription_id } = req.body;

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

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    let paidAmount = amount;

    if (subscription) {
      // Existing unpaid record (current month, past month, or Arriéré) -> mark it paid
      const oldStatus = subscription.status;
      subscription.status = "payé";
      if (amount) subscription.amount = amount;
      await subscription.save();
      paidAmount = amount || subscription.amount;

      var previousStatus = oldStatus;
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
      });
      paidAmount = amount;
      var previousStatus = "non payé";
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
      new_values: { status: "payé" },
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
      .flatMap((s) => s.payments.map((p) => ({ ...p.toJSON(), status: s.status })))
      .sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at));

    return res.json({ message: "payment history", payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};