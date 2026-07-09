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
        allowNull:true,
    },
    password:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    role:{
         type:DataTypes.ENUM("admin","membre","entraineurs","secrétariat"),
        allowNull:false,
    }
})
module.exports = User;