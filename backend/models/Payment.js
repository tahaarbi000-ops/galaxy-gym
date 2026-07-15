const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Subscription = require("./Subscription");

const Payment = sequelize.define("payment", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue:DataTypes.NOW
    },

    subscription_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Subscription,
            key: "id",
        },
    },
});

module.exports = Payment;