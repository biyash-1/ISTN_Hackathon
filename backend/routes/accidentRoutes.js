const express = require("express");
const accidentRouter = express.Router();

const accidentValidation = require("../middlewares/accidentValidation");
const createAccident = require("../controllers/accidentControllers");
const getAccident = require("../controllers/accidentControllers")

accidentRouter.post(
  "/report",
  accidentValidation, // ✅ NO parentheses
  createAccident
);

accidentRouter.get("/getreport",getAccident)
module.exports = accidentRouter;
