const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { GetSubscription, History, Pay } = require("../controllers/SubscriptionContollers");
const route = express.Router()

route.get("/",GetSubscription)
route.post("/pay/:id", Pay);
route.get("/history/:id",History)



module.exports = route