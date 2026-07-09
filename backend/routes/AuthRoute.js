const express = require("express");
const { Login } = require("../controllers/AuthControllers");
const route = express.Router()

route.post("/login",Login)

module.exports = route