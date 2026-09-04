const AppSettings = require("../models/AppSettings");

module.exports = async (req, res, next) => {
  try {
    const settings = await AppSettings.findByPk(1);

    if (!settings) {
      return res.status(403).json({ message: "Trial settings not found" });
    }

    const today = new Date();
    const trialEndsAt = new Date(settings.trial_ends_at);

    if (today >= trialEndsAt) {
      return res.status(403).json({
        message: "Trial ended",
      });
    }

    next();
  } catch (err) {
    console.error("Trial check error:", err);

    return res.status(500).json({
      message: "Unable to check trial status",
    });
  }
};