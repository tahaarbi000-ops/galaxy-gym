const express = require("express");
require("dotenv").config();
const cors = require("cors");
const sequelize = require("./config/db");
const app = express();
const appStart = require("./app");
const AuthenticateAPI = require("./middlewares/AuthenticateAPI")
require("./models/index")
const { checkMissedJobs, scheduleSubscriptionJobs } = require("./jobs/subscriptionJobs");
const { startJobWatcher } = require("./jobs/subscriptionJobs");
const { startBackupCron, checkAndBackup } = require("./jobs/Backupservice");


const port = process.env.PORT || 5000;

sequelize.authenticate()
 sequelize.sync({ alter: true });

app.use(express.json());
app.use(cors());

app.use("/api/v1", AuthenticateAPI, appStart);


app.listen(port, async () => {
  startJobWatcher();
  // startBackupCron()
  // checkAndBackup().then(console.log).catch(console.error);

  console.log(`Server started on port ${port}`);
});
