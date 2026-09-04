const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Category = sequelize.define("categories",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true,
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    price:{
        type:DataTypes.FLOAT,
        allowNull:false,
    },
    icon:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
    },
})
module.exports = Category;