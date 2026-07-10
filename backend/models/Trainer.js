const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Trainer = sequelize.define("trainers",{
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
    specialty:{
         type:DataTypes.STRING,
        allowNull:true,
    },
    experience:{
         type:DataTypes.INTEGER,
        allowNull:true,
    },
})
module.exports = Trainer;