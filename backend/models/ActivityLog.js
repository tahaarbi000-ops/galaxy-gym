const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const ActivityLog = sequelize.define("activity-log", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    action: {
        type: DataTypes.ENUM("create", "update", "delete", "pay", "login"),
        allowNull: false,
    },
    entity_type: {
        type: DataTypes.ENUM("member", "trainer", "category", "subscription","user"),
        allowNull: true,
    },
    entity_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    entity_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
     user_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    old_values:{
        type: DataTypes.JSON,
        allowNull: true,
    },
     new_values:{
        type: DataTypes.JSON,
        allowNull: true,
    },

     user_role: {
        type: DataTypes.ENUM("admin","secrétariat"),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        },
    },
});

module.exports = ActivityLog;