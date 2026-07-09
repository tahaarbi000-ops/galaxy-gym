const { body } = require("express-validator");

exports.Login = [body("email").notEmpty().withMessage("email required"),
body("password").notEmpty().withMessage("password required")
    ,(req,res) => {
    const error = 
}]