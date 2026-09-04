const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backupController");


router.get("/status", backupController.getBackupStatus);
router.get("/history",  backupController.getBackupHistory);
router.post("/run-now", backupController.runBackupNow);

module.exports = router;