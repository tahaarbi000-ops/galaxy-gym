const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./Category");

const Offer = sequelize.define("offer",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true,
    },
    three_month_amount:{
        type:DataTypes.DECIMAL(10,2)
    },
    six_month_amount:{
        type:DataTypes.DECIMAL(10,2)
    },
    yearly_amount:{
        type:DataTypes.DECIMAL(10,2)
    },
     category_id:{
         type:DataTypes.BIGINT,
        allowNull:true,
        references:{
            model:Category,
            key:"id"
        }
    },
   
})
module.exports = Offer;