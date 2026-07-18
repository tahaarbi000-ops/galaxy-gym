const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { AddCategory, GetCategories, UpdateCategory, DeleteCategory, GetCategoryById, UpdateCategoryStatus } = require("../controllers/CategoryControllers");
const route = express.Router()

route.post("/",AddCategory)
route.get("/",GetCategories)
route.get("/:id",GetCategoryById)
route.put("/:id",UpdateCategory)
route.put("/:id/status",UpdateCategoryStatus)
route.delete("/:id",DeleteCategory)

module.exports = route