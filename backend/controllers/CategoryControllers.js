const { body, validationResult } = require("express-validator");
const Category = require("../models/Category");

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
exports.GetCategories = async (req,res) => {
    try{
    const categories = await Category.findAll()
   
    return res.json({message:"all categories",categories});
    }catch(err){
        res.status(500).json({message:"server error"})
    }
}
exports.GetCategoryById = async (req,res) => {
    
}
exports.DeleteCategory = async (req,res) => {
    
}
exports.UpdateCategory = async (req,res) => {
    
}