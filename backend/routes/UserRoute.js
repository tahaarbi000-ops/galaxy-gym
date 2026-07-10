const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { AddUser, GetUsers, GetUserById, UpdateUser, DeleteUser } = require("../controllers/UserControllers");
const route = express.Router()

route.post("/",AddUser)
route.get("/",GetUsers)
route.get("/:id",GetUserById)
route.put("/:id",UpdateUser)
route.delete("/:id",DeleteUser)

module.exports = route