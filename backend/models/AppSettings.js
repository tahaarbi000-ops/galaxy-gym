const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AppSettings = sequelize.define("app_settings", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  trial_started_at: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue:DataTypes.NOW
  },
  trial_ends_at: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

module.exports = AppSettings;