require("dotenv").config();

const User = require("../models/User");
const sequelize = require("../config/db");
const bcrypt = require("bcryptjs");
async function createAdmin (){
    try{
        await sequelize.sync();
    const existAdmin = await User.findOne({where: {email:"admin@admin.com"}});
    if(existAdmin){
        console.warn("Admin already exists");
        process.exit();

    }
    const hashed = await bcrypt.hash("123456",10);
    await User.create({name:"admin admin",email:"admin@admin.com",password:hashed,role:"admin",phone:"55740526"});
    console.log("Admin created");
    process.exit();
    }catch(err){
        console.log(err);
        process.exit();
    }
}
createAdmin()