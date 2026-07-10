const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./Category");

const Member = sequelize.define("members",{
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
    status:{
         type:DataTypes.ENUM("actif","inactif"),
        allowNull:true,
        defaultValue:"actif"
    },
    category_id:{
        type:DataTypes.BIGINT,
        allowNull:true,
        references:{
            model:Category,
            key:"id",
        }
    },
})
module.exports = Member;