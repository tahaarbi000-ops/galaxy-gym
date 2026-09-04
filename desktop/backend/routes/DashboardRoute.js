const express = require("express");
const { Stats, RevenueEvolution, MembersByCategory, LastMembers } = require("../controllers/DashboardController");
const route = express.Router();

route.get("/stats",Stats);
route.get("/revenue-evolution",RevenueEvolution);
route.get("/members-by-category",MembersByCategory);
route.get("/last-members",LastMembers);

module.exports = route