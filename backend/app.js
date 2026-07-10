const express = require("express")
const route = express.Router();
const authRoute = require("./routes/AuthRoute")
const userRoute = require("./routes/UserRoute")
const categoryRoute = require("./routes/CategoryRoute")

route.use('/auth',authRoute)
route.use('/user',userRoute)
route.use('/category',categoryRoute)

module.exports = route