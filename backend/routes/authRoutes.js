const express = require("express");
const loginValidation = require("./../middlewares/loginValidation");
const loginController = require("../controllers/loginController");
const ambulanceController = require("../controllers/ambulanceController");

const authRouter = express.Router();

authRouter.post("/admin-login", loginValidation, loginController);
authRouter.post("/ambulance-login", loginValidation, ambulanceController);
module.exports = authRouter;
