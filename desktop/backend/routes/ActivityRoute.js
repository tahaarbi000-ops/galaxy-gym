const express = require("express");
const { Login, Profile } = require("../controllers/AuthControllers");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { GetActivity } = require("../controllers/ActivityController");
const route = express.Router()

route.get("/",GetActivity)

module.exports = route