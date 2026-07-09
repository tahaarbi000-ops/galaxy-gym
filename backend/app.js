const express = require("express")
const route = express.Router();
const authRoute = require("./routes/AuthRoute")

route.use('/auth',authRoute)

module.exports = route