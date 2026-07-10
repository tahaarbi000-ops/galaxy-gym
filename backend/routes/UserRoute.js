const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { GetUsers, GetUserById, UpdateUser, DeleteUser, AddMember, AddTrainer, AddSecretary } = require("../controllers/UserControllers");
const route = express.Router()

route.post("/member",AddMember)
route.post("/trainer",AddTrainer)
route.post("/secretary",AddSecretary)
route.get("/:type",GetUsers)
route.get("/:id",GetUserById)
route.put("/:id",UpdateUser)
route.delete("/:id",DeleteUser)

module.exports = route