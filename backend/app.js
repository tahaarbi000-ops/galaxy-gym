const express = require("express")
const route = express.Router();
const authRoute = require("./routes/AuthRoute")
const userRoute = require("./routes/UserRoute")
const categoryRoute = require("./routes/CategoryRoute");
const subscriptionRoute = require("./routes/SubscriptionRoute");
const dashboardRoute = require("./routes/DashboardRoute");
const AuthenticateToken = require("./middlewares/AuthenticateToken");

route.use('/auth',authRoute)
route.use('/user',AuthenticateToken,userRoute)
route.use('/category',AuthenticateToken,categoryRoute)
route.use('/subscription',AuthenticateToken,subscriptionRoute)
route.use('/dashboard',AuthenticateToken,dashboardRoute)

module.exports = route