const { Op, fn, col } = require("sequelize");
const { Member, Trainer, Subscription, Category } = require("../models");

exports.Stats = async (req,res) => {
    try{
        const now = new Date();

        const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const startPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const totalMembers = await Member.count();

        const currentMonthMembers = await Member.count({
            where: {
                createdAt: {
                    [Op.gte]: startCurrentMonth,
                    [Op.lt]: endCurrentMonth,
                },
            },
        });

        const previousMonthMembers = await Member.count({
            where: {
                createdAt: {
                    [Op.gte]: startPreviousMonth,
                    [Op.lt]: endPreviousMonth,
                },
            },
        });
        let memberGrowth = 0;

        if (previousMonthMembers > 0) {
            memberGrowth =
                ((currentMonthMembers - previousMonthMembers) /
                    previousMonthMembers) *
                100;
        }
        const currentRevenue =
    (await Subscription.sum("amount", {
        where: {
            status: "payé",
            date: {
                [Op.gte]: startCurrentMonth,
                [Op.lt]: endCurrentMonth,
            },
        },
    })) || 0;

    const previousRevenue =
        (await Subscription.sum("amount", {
            where: {
                status: "payé",
                date: {
                    [Op.gte]: startPreviousMonth,
                    [Op.lt]: endPreviousMonth,
                },
            },
        })) || 0;
        let revenueGrowth = 0;
        const trainer = await Trainer.count()

    if (previousRevenue > 0) {
        revenueGrowth =
            ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    }
    res.json({
    members: {
        total: totalMembers,
        thisMonth: currentMonthMembers,
        lastMonth: previousMonthMembers,
        growth: Number(memberGrowth.toFixed(1)),
    },
    trainer,
    revenue: {
        thisMonth: currentRevenue,
        lastMonth: previousRevenue,
        growth: Number(revenueGrowth.toFixed(1)),
    },
});
    }catch(err){
        console.log(err)
        return res.status(500).json({
            message: "server error"
        });
    }
}

exports.RevenueEvolution = async (req, res) => {
    try {
        const now = new Date();

        // First day of the month 6 months ago
        const startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 6,
            1
        );

        const revenues = await Subscription.findAll({
            attributes: [
                [fn("DATE_TRUNC", "month", col("date")), "month"],
                [fn("SUM", col("amount")), "revenue"],
            ],
            where: {
                status: "payé",
                date: {
                    [Op.gte]: startDate,
                },
            },
            group: [fn("DATE_TRUNC", "month", col("date"))],
            order: [[fn("DATE_TRUNC", "month", col("date")), "ASC"]],
            raw: true,
        });

        // French month names
        const months = [
            "Jan",
            "Fév",
            "Mars",
            "Avr",
            "Mai",
            "Juin",
            "Juil",
            "Août",
            "Sep",
            "Oct",
            "Nov",
            "Déc",
        ];

        const chart = [];

        // Fill missing months with 0
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

            const revenue =
                revenues.find((r) => {
                    const d = new Date(r.month);
                    return (
                        d.getFullYear() === date.getFullYear() &&
                        d.getMonth() === date.getMonth()
                    );
                })?.revenue || 0;

            chart.push({
                month: months[date.getMonth()],
                revenue: Number(revenue),
            });
        }

        const currentRevenue = chart[6].revenue;
        const previousRevenue = chart[5].revenue;

        let growth = 0;

        if (previousRevenue > 0) {
            growth =
                ((currentRevenue - previousRevenue) / previousRevenue) * 100;
        }

        return res.json({
            chart,
            currentRevenue,
            previousRevenue,
            growth: Number(growth.toFixed(1)),
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server Error",
        });
    }
};

exports.MembersByCategory = async (req, res) => {
    try {
        const data = await Member.findAll({
            attributes: [
                "category_id",
                [fn("COUNT", col("members.id")), "total"],
            ],
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["id", "name"],
                },
            ],
            group: [
                "category_id",
                "category.id",
                "category.name",
            ],
            order: [[fn("COUNT", col("members.id")), "DESC"]],
        });

        const result = data.map((item) => ({
            id: item.category.id,
            category: item.category.name,
            members: Number(item.get("total")),
        }));

        return res.json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server Error",
        });
    }
};

exports.LastMembers = async (req, res) => {
    try {
        const members = await Member.findAll({
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["name"],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit: 5,
        });

        const result = members.map((member) => ({
            id: member.id,
            name: member.name,
            plan: member.category?.name ?? "-",
            joined: member.createdAt.toISOString().split("T")[0],
            status: member.status,
        }));

        return res.json({ result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server Error",
        });
    }
};