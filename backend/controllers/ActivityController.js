const ActivityLog = require("../models/ActivityLog")

exports.GetActivity = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, entity_type, action } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const offset = (pageNum - 1) * limitNum;

        const ROLE_MAP = { admin: 'admin', secretary: 'secrétariat' };

        const where = {};
        if (role && ROLE_MAP[role]) where.user_role = ROLE_MAP[role];
        if (entity_type) where.entity_type = entity_type;
        if (action) where.action = action;

        const { count, rows } = await ActivityLog.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
        });

        return res.json({
            message: "activity data",
            activity: rows,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(count / limitNum),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
}