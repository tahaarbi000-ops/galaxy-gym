const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { GetUsers, GetUserById, DeleteUser, AddMember, AddTrainer, AddSecretary, UpdateTrainer, UpdatesSecretary, UpdateMemberStatus } = require("../controllers/UserControllers");
const route = express.Router()

route.post("/member",AddMember)
route.post("/trainer",AddTrainer)
route.post("/secretary",AddSecretary)
route.get("/:type",GetUsers)
route.get("/:id",GetUserById)
route.put("/trainer/:id",UpdateTrainer)
route.put("/secretary/:id",UpdatesSecretary)
route.delete("/:id",DeleteUser)
route.patch("/member/:id/status", UpdateMemberStatus);


module.exports = route