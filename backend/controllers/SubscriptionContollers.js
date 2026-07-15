const { Op } = require("sequelize");
const { Category } = require("../models");
const Member = require("../models/Member");
const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");

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
      order: [["date", "DESC"]], // newest first so the loop below naturally picks the latest
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const startOfMonth = new Date(currentYear, currentMonth, 1);

    const isCurrentMonth = (date) => {
      const d = new Date(date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    };

    // For each member, keep the current-month sub if it exists,
    // otherwise keep the most recent sub before this month.
    const byMember = new Map();

    for (const sub of subscriptions) {
      const memberId = sub.member_id;
      if (!byMember.has(memberId)) {
        byMember.set(memberId, { currentMonth: null, lastPast: null });
      }
      const entry = byMember.get(memberId);

      if (isCurrentMonth(sub.date)) {
        if (!entry.currentMonth) entry.currentMonth = sub; // first = most recent (desc order)
      } else if (new Date(sub.date) < startOfMonth) {
        if (!entry.lastPast) entry.lastPast = sub; // first = most recent past record
      }
    }

    const result = [];
    for (const { currentMonth, lastPast } of byMember.values()) {
      result.push(currentMonth || lastPast);
    }

    return res.json({ message: "all subscriptions", subscriptions: result.filter(Boolean) });
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
    const { id } = req.params; // member_id
    const { amount, method } = req.body;

    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: "member not found" });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Look for an existing subscription record for this member THIS month
    let subscription = await Subscription.findOne({
      where: {
        member_id: id,
        date: { [Op.gte]: startOfMonth, [Op.lt]: startOfNextMonth },
      },
    });

    let paidAmount = amount;

    if (subscription) {
      // Already has a record this month (e.g. "non payé" / "en retard") -> mark it paid
      subscription.status = "payé";
      if (amount) subscription.amount = amount;
      await subscription.save();
      paidAmount = amount || subscription.amount;
    } else {
      // No record yet this month -> create one as paid
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