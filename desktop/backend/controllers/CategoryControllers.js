const { body, validationResult } = require("express-validator");
const Category = require("../models/Category");
const { Member, Trainer } = require("../models");
const sequelize = require("../config/db");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const { Op } = require("sequelize");
const Offer = require("../models/Offer");

exports.AddCategory = [
    body("name").trim().notEmpty().withMessage("name required"),
    body("price")
        .notEmpty().withMessage("price required")
        .isFloat({ gt: 0 }).withMessage("price must be a positive number"),
    body("icon").notEmpty().withMessage("icon required"),
    body("has_offer")
        .isBoolean().withMessage("has offer must be a boolean")
        .toBoolean(),

    // Offer prices are only required when has_offer is true
    body("offerPrice3Months")
        .if((value, { req }) => req.body.has_offer === true || req.body.has_offer === "true")
        .notEmpty().withMessage("3-month offer price required")
        .isFloat({ gt: 0 }).withMessage("3-month offer price must be a positive number"),

    body("offerPrice6Months")
        .if((value, { req }) => req.body.has_offer === true || req.body.has_offer === "true")
        .notEmpty().withMessage("6-month offer price required")
        .isFloat({ gt: 0 }).withMessage("6-month offer price must be a positive number"),

    body("offerPriceYear")
        .if((value, { req }) => req.body.has_offer === true || req.body.has_offer === "true")
        .notEmpty().withMessage("yearly offer price required")
        .isFloat({ gt: 0 }).withMessage("yearly offer price must be a positive number"),

    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).json({ errors: error.array().map(err => err.msg) });
        }
        try {
            const userId = req.userId;
            const { name, price, icon, has_offer, offerPrice3Months, offerPrice6Months, offerPriceYear } = req.body;

            const category = await Category.findOne({ where: { name, status: "active" } });
            if (category) {
                return res.status(400).json({ message: "category exist" });
            }

            const user = await User.findByPk(userId);
            const categoryCreated = await Category.create({ name, price, icon, has_offer });

            if (has_offer) {
                await Offer.create({
                    three_month_amount: offerPrice3Months,
                    six_month_amount: offerPrice6Months,
                    yearly_amount: offerPriceYear,
                    category_id: categoryCreated.id,
                });
            }

            await ActivityLog.create({
                action: "create",
                description: `${user.name} a ajouté le catégorie ${name}`,
                entity_type: "category",
                entity_id: categoryCreated.id,
                entity_name: name,
                user_name: user.name,
                user_role: user.role,
                user_id: user.id,
                new_values: { name, price, icon, has_offer },
            });

            return res.status(201).json({ message: "category created" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "server error" });
        }
    },
];

exports.GetCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
    include: [
        {
            model: Member,
            as: "memberCategory",
            attributes: [],
            where: {
                status: {
                    [Op.ne]: "suspendu"
                }
            },
            required: false
        },
        {
            model: Trainer,
            as: "trainerCategory",
            attributes: []
        },
        {
            model: Offer,
            as: "offers",
            attributes: [
                "id",
                "three_month_amount",
                "six_month_amount",
                "yearly_amount"
            ],
            required: false
        }
    ],

    attributes: {
        include: [
            [
                sequelize.fn(
                    "COUNT",
                    sequelize.fn(
                        "DISTINCT",
                        sequelize.col("memberCategory.id")
                    )
                ),
                "membersCount"
            ],
            [
                sequelize.fn(
                    "COUNT",
                    sequelize.fn(
                        "DISTINCT",
                        sequelize.col("trainerCategory.id")
                    )
                ),
                "trainersCount"
            ]
        ]
    },

    group: [
        "categories.id",
        "offers.id",
        "offers.three_month_amount",
        "offers.six_month_amount",
        "offers.yearly_amount"
    ]
});

        return res.json({ categories });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "server error" });
    }
};

exports.GetMemberCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({where:{status:"active"},
        include:[
            {
                model:Offer,
                as:"offers"
            }
        ]})

        return res.json({ categories });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "server error" });
    }
};

exports.GetCategoryById = async (req,res) => {
    
}
exports.DeleteCategory = async (req,res) => {
    
}
exports.UpdateCategory = [
    body("name").trim().notEmpty().withMessage("name required"),
    body("price")
        .notEmpty().withMessage("price required")
        .isFloat({ gt: 0 }).withMessage("price must be a positive number"),
    body("icon").notEmpty().withMessage("icon required"),
    body("has_offer")
        .isBoolean().withMessage("has offer must be a boolean")
        .toBoolean(),

    body("offerPrice3Months")
        .if((value, { req }) => req.body.has_offer === true || req.body.has_offer === "true")
        .notEmpty().withMessage("3-month offer price required")
        .isFloat({ gt: 0 }).withMessage("3-month offer price must be a positive number"),

    body("offerPrice6Months")
        .if((value, { req }) => req.body.has_offer === true || req.body.has_offer === "true")
        .notEmpty().withMessage("6-month offer price required")
        .isFloat({ gt: 0 }).withMessage("6-month offer price must be a positive number"),

    body("offerPriceYear")
        .if((value, { req }) => req.body.has_offer === true || req.body.has_offer === "true")
        .notEmpty().withMessage("yearly offer price required")
        .isFloat({ gt: 0 }).withMessage("yearly offer price must be a positive number"),

    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).json({ errors: error.array().map(err => err.msg) });
        }
        try {
            const userId = req.userId;
            const { name, price, icon, has_offer, offerPrice3Months, offerPrice6Months, offerPriceYear } = req.body;
            const { id } = req.params;

            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "not found" });
            }

            const categoryName = await Category.findOne({ where: { name } });
            if (categoryName && categoryName.id !== category.id) {
                return res.status(400).json({ message: "category exist" });
            }

            const user = await User.findByPk(userId);

            await ActivityLog.create({
                action: "update",
                description: `${user.name} a modifié le catégorie ${category.name}`,
                entity_type: "category",
                entity_id: id,
                entity_name: category.name,
                user_name: user.name,
                user_role: user.role,
                user_id: user.id,
                old_values: { name: category.name, price: category.price, icon: category.icon, has_offer: category.has_offer },
                new_values: { name, price, icon, has_offer },
            });

            await category.update({ name, price, icon, has_offer });

            if (has_offer) {
                await Offer.upsert({
                    category_id: category.id,
                    three_month_amount: offerPrice3Months,
                    six_month_amount: offerPrice6Months,
                    yearly_amount: offerPriceYear,
                });
            } else {
                await Offer.destroy({ where: { category_id: category.id } });
            }

            return res.status(200).json({ message: "category updated" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "server error" });
        }
    },
];

exports.UpdateCategoryStatus = [
    body("status").notEmpty().withMessage("status required"),
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).json({ errors: error.array().map(err => err.msg) });
        }
        try {
            const userId = req.userId
            const { status } = req.body;
            const { id } = req.params;
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "not found" });
            }

            const user = await User.findByPk(userId)

            await ActivityLog.create({
                action:"update",
                description:`${user.name} a modifié le état de catégorie ${category.name}`,
                entity_type:"category",
                entity_id:id,
                entity_name:category.name,
                user_name:user.name,
                user_role:user.role,
                user_id:user.id,
                old_values: {"status":category.status},
                new_values: {"status":status},
            })

            await category.update({ status });
            return res.status(200).json({ message: "category updated" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "server error" });
        }
    }
];