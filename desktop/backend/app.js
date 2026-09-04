const express = require("express")
const route = express.Router();
const authRoute = require("./routes/AuthRoute")
const userRoute = require("./routes/UserRoute")
const categoryRoute = require("./routes/CategoryRoute");
const subscriptionRoute = require("./routes/SubscriptionRoute");
const dashboardRoute = require("./routes/DashboardRoute");
const ActivityRoute = require("./routes/ActivityRoute");
const BackupRoute = require("./routes/BackupRoute");
const TrailRoute = require("./routes/TrailRoute");
const AuthenticateToken = require("./middlewares/AuthenticateToken");
const AppSettings = require("./models/AppSettings");

route.use('/auth',authRoute)
route.use('/user',AuthenticateToken,userRoute)
route.use('/category',AuthenticateToken,categoryRoute)
route.use('/subscription',AuthenticateToken,subscriptionRoute)
route.use('/dashboard',AuthenticateToken,dashboardRoute)
route.use('/activity',AuthenticateToken,ActivityRoute)
route.use('/backup',AuthenticateToken,BackupRoute)
route.use('/trial',TrailRoute)

module.exports = route