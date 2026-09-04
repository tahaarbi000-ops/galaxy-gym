const express = require("express");
const AppSettings = require("../models/AppSettings");
const route = express.Router()
route.get('/', async (req, res) => {
  try {
    const settings = await AppSettings.findByPk(1);

    if (!settings) {
      return res.status(404).json({
        active: false,
        message: "Trial settings not found",
      });
    }

    const now = new Date();
    const trialEndsAt = new Date(settings.trial_ends_at);

    const active = now < trialEndsAt;

    return res.status(200).json({
      active,
      trialEndsAt: settings.trial_ends_at,
      message: active ? "Trial active" : "Trial ended",
    });
  } catch (err) {
    console.error("Trial status error:", err);

    return res.status(500).json({
      active: false,
      message: "Unable to check trial status",
    });
  }
});

module.exports = route