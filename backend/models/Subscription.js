const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Category = require("./Category");

const Subscription = sequelize.define("subscriptions",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true,
    },
    date:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    amount:{
        type:DataTypes.FLOAT,
        allowNull:false,
    },
    status:{
        type:DataTypes.ENUM("payé","non payé","en retard"),
        allowNull:false,
        defaultValue:"non payé"
    },
    member_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:User,
            key:"id",
        }
    },
    category_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:Category,
            key:"id",
        }
    },
})
module.exports = Subscription;