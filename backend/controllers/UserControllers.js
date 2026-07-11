const { body, validationResult } = require("express-validator");
const Category = require("../models/Category");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { Member } = require("../models");
const Trainer = require("../models/Trainer");
const bcrypt = require("bcryptjs");

exports.AddMember = [
    body("name").notEmpty().withMessage("name required"),
    body("phone").notEmpty().withMessage("phone required"),
    body("category_id").notEmpty().withMessage("category required"),
    async (req,res) => {
        const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({ errors: errors.array().map(err => err.msg) });
    }
    try{
    const { name,phone,category_id } = req.body;
    const category = await Category.findByPk(category_id)
    if(!category){
        return res.status(404).json({ message:"category not found" });
    }
    const member = await Member.create({name,phone,category_id});
    await Subscription.create({amount:category.price,member_id:member.id})
    return res.status(201).json({message:"member created"});
    }catch(err){
        console.log(err)
        res.status(500).json({message:"server error"})
    }

}
]
exports.AddTrainer = [
    body("name").notEmpty().withMessage("name required"),
    body("phone").notEmpty().withMessage("phone required"),
    body("experience").notEmpty().withMessage("experience required"),
    body("specialty").notEmpty().withMessage("specialty required"),
    async (req,res) => {
        const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({ errors: errors.array().map(err => err.msg) });
    }
    try{
    const { name,phone,specialty,experience } = req.body;
    await Trainer.create({name,phone,experience,specialty});
    return res.status(201).json({message:"trainer created"});
    }catch(err){
        console.log(err)
        res.status(500).json({message:"server error"})
    }

}
]

exports.AddSecretary = [
    body("name").notEmpty().withMessage("name required"),
    body("phone").notEmpty().withMessage("phone required"),
    body("email").notEmpty().withMessage("email required"),
    body("shift").notEmpty().withMessage("shift required"),
    body("status").notEmpty().withMessage("status required"),
    body("password").notEmpty().withMessage("password required"),
    async (req,res) => {
        const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({ errors: errors.array().map(err => err.msg) });
    }
    try{
    const { name,phone,email,password,shift,status } = req.body;
    const user = await User.findOne({where:{email}})
    if(user){
        return res.status(400).json({message:"email exist"});
    }
    const hashPassword = await bcrypt.hash(password,10)
    await User.create({name,phone,email,status,shift,password:hashPassword,role:"secrétariat"});
    return res.status(201).json({message:"secretary created"});
    }catch(err){
        console.log(err)
        res.status(500).json({message:"server error"})
    }

}
]
exports.GetUsers = async (req,res) => {
    try{
        const {type} = req.params
        let data = [];
        if(type === "member"){
            data = await Member.findAll({
                include:[
                    {
                        model:Category,
                        as:"category",
                        attributes:["name"]
                    }
                ]
            })
        }    
        else if(type === "trainer"){
            data = await Trainer.findAll()
        }
        else{
            data = await User.findAll({where:{role:"secrétariat"},attributes:{exclude:"password"}})
        } 
    return res.json({message:`all ${type}`,users:data});
    }catch(err){
        console.log(err)
        res.status(500).json({message:"server error"})
    }
}
exports.GetUserById = async (req,res) => {
    
}
exports.DeleteUser = async (req,res) => {
    
}
exports.UpdateTrainer = [
    body("name").notEmpty().withMessage("name required"),
    body("phone").notEmpty().withMessage("phone required"),
    body("experience").notEmpty().withMessage("experience required"),
    body("specialty").notEmpty().withMessage("specialty required"),
    async (req,res) => {
        const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({ errors: errors.array().map(err => err.msg) });
    }
    try{
        const {id} = req.params
        const { name,phone,specialty,experience } = req.body;
        const user = await Trainer.findByPk(id)
        if(!user){
            res.status(404).json({message:"trainer not found"})
        }
        user.update({name,phone,experience,specialty})
    return res.json({message:`trainer updated`});
    }catch(err){
        res.status(500).json({message:"server error"})
    }
}
]

exports.UpdatesSecretary = [
    body("name").notEmpty().withMessage("name required"),
    body("phone").notEmpty().withMessage("phone required"),
    body("email").notEmpty().withMessage("email required"),
    body("shift").notEmpty().withMessage("shift required"),
    body("status").notEmpty().withMessage("status required"),

    async (req, res) => {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return res.status(422).json({
                errors: error.array().map(err => err.msg)
            });
        }

        try {
            const { id } = req.params;
            const { name, phone, email, password, shift, status } = req.body;

            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    message: "secretary not found"
                });
            }

            // Check if email already exists for another user
            const emailExist = await User.findOne({
                where: { email }
            });

            if (emailExist && emailExist.id !== user.id) {
                return res.status(400).json({
                    message: "email already exists"
                });
            }

            const updateData = {
                name,
                phone,
                email,
                shift,
                status
            };

            // Update password only if provided
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            await user.update(updateData);

            return res.json({
                message: "secretary updated"
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "server error"
            });
        }
    }
];

exports.UpdateMemberStatus = [
    body("status")
        .notEmpty().withMessage("status required")
        .isIn(["actif", "inactif", "suspendu"]).withMessage("invalid status"),

    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).json({
                errors: error.array().map(err => err.msg)
            });
        }

        try {
            const { id } = req.params;
            const { status } = req.body;

            const member = await User.findByPk(id);
            if (!member) {
                return res.status(404).json({ message: "member not found" });
            }

            await member.update({ status });

            return res.status(200).json({ message: "status updated" });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "server error" });
        }
    }
];