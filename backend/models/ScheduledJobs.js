const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ScheduledJobs = sequelize.define("scheduled_jobs", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  job_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  last_run_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = ScheduledJobs;