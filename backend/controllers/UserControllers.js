const { body, validationResult } = require("express-validator");
const Category = require("../models/Category");
const Subscription = require("../models/Subscription");
const User = require("../models/User");

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
    const user = await User.create({name,phone,role:"membre"});
    const category = await Category.findByPk(category_id)
    if(!category){
        return res.status(404).json({ message:"category not found" });
    }
    await Subscription.create({amount:category.price,member_id:user.id,category_id})
    return res.status(201).json({message:"member created"});
    }catch(err){
        console.log(err)
        res.status(500).json({message:"server error"})
    }

}
]
exports.GetUsers = async (req,res) => {
     try{
         const {type} = req.params
    const users = await User.findAll({where: {role:type},
        include:[
        {
            model:Subscription,
            as:"subscription",
            include:[{
                model:Category,
                as:"categorySubscription",
                attributes:["name"]
            }]
        }
    ]})
   
    return res.json({message:"all users",users});
    }catch(err){
        console.log(err)
        res.status(500).json({message:"server error"})
    }
}
exports.GetUserById = async (req,res) => {
    
}
exports.DeleteUser = async (req,res) => {
    
}
exports.UpdateUser = async (req,res) => {
    
}