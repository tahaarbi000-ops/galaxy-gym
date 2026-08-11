const express = require("express");
const { Login, Profile } = require("../controllers/AuthControllers");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const route = express.Router()

route.post("/login",Login)
route.get("/profile",AuthenticateToken,Profile)

module.exports = route