const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("users",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true,
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    phone:{
        type:DataTypes.STRING(8),
        allowNull:false,
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    shift:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    role:{
         type:DataTypes.ENUM("admin","secrétariat"),
        allowNull:false,
    },
    status:{
         type:DataTypes.ENUM("actif","congé"),
        allowNull:true,
        defaultValue:"actif"
    },
})
module.exports = User;