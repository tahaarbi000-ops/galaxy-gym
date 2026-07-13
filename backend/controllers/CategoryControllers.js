const { body, validationResult } = require("express-validator");
const Category = require("../models/Category");
const { Member, Trainer } = require("../models");
const sequelize = require("../config/db");

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
    const { name,price,icon } = req.body;
    const category = await Category.findOne({where: {name}})
    if(category){
        return res.status(400).json({ message:"category exist" });
    }
    await Category.create({name,price,icon})
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
                sequelize.col("memberCategory.id")
            ),
            "membersCount"
        ],
        [
            sequelize.fn(
                "COUNT",
                sequelize.col("trainerCategory.id")
            ),
            "trainersCount"
        ]
    ]
},
    group: ["categories.id"]
});

        return res.json({
            categories
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "server error"
        });
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
            const { name, price, icon } = req.body;
            const { id } = req.params;
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "not found" });
            }

            // Exclude the current category from the duplicate check,
            // otherwise saving with its own unchanged name always 400s
            const categoryName = await Category.findOne({ where: { name } });
            if (categoryName && categoryName.id !== category.id) {
                return res.status(400).json({ message: "category exist" });
            }

            await category.update({ name, price, icon });
            return res.status(200).json({ message: "category updated" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "server error" });
        }
    }
];