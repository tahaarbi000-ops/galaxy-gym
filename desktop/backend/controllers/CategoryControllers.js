const { body, validationResult } = require("express-validator");
const Category = require("../models/Category");
const { Member, Trainer } = require("../models");
const sequelize = require("../config/db");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

exports.AddCategory = [
    body("name").notEmpty().withMessage("name required"),
    body("price").notEmpty().withMessage("price required"),
    body("icon").notEmpty().withMessage("icon required"),
    async (req,res) => {
        const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({ errors: errors.array().map(err => err.msg) });
    }
    try{
    const userId = req.userId
    const { name,price,icon } = req.body;
    const category = await Category.findOne({where: {name}})
    if(category){
        return res.status(400).json({ message:"category exist" });
    }
    const user = await User.findByPk(userId)
    const categoryCreated =  await Category.create({name,price,icon})

    await ActivityLog.create({
                action:"create",
                description:`${user.name} a ajouté le catégorie ${name}`,
                entity_type:"category",
                entity_id:categoryCreated.id,
                entity_name:name,
                user_name:user.name,
                user_role:user.role,
                user_id:user.id,
                new_values: {"name":name,"price":price,"icon":icon},
            })


    return res.status(201).json({message:"category created"});
    }catch(err){
        console.log(err)
        res.status(500).json({message:"server error"})
    }
}
]

exports.GetCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [
                {
                    model: Member,
                    as: "memberCategory",
                    attributes: []
                },
                {
                    model: Trainer,
                    as: "trainerCategory",
                    attributes: []
                }
            ],
            attributes: {
                include: [
                    [
                        sequelize.fn(
                            "COUNT",
                            sequelize.fn("DISTINCT", sequelize.col("memberCategory.id"))
                        ),
                        "membersCount"
                    ],
                    [
                        sequelize.fn(
                            "COUNT",
                            sequelize.fn("DISTINCT", sequelize.col("trainerCategory.id"))
                        ),
                        "trainersCount"
                    ]
                ]
            },
            group: ["categories.id"]
        });

        return res.json({ categories });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "server error" });
    }
};

exports.GetMemberCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({where:{status:"active"}})

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
    body("name").notEmpty().withMessage("name required"),
    body("price").notEmpty().withMessage("price required"),
    body("icon").notEmpty().withMessage("icon required"),
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            // was `errors.array()` — undeclared variable, throws ReferenceError
            return res.status(422).json({ errors: error.array().map(err => err.msg) });
        }
        try {
            const userId = req.userId
            const { name, price, icon } = req.body;
            const { id } = req.params;
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "not found" });
            }

            const categoryName = await Category.findOne({ where: { name } });
            if (categoryName && categoryName.id !== category.id) {
                return res.status(400).json({ message: "category exist" });
            }
            const user = await User.findByPk(userId)

            await ActivityLog.create({
                action:"update",
                description:`${user.name} a modifié le catégorie ${category.name}`,
                entity_type:"category",
                entity_id:id,
                entity_name:category.name,
                user_name:user.name,
                user_role:user.role,
                user_id:user.id,
                old_values: {"name":category.name,"price":category.price,"icon":category.icon},
                new_values: {"name":name,"price":price,"icon":icon},
            })

            await category.update({ name, price, icon });
            return res.status(200).json({ message: "category updated" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "server error" });
        }
    }
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