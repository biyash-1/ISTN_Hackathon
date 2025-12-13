const express = require("express");
const accidentRouter = express.Router();

const accidentValidation = require("../middlewares/accidentValidation");
const { createAccident, getAccident } = require("../controllers/accidentControllers");
const updateStatus = require("../controllers/updateStatus");


accidentRouter.post(
  "/report",
  accidentValidation,
  createAccident
);

accidentRouter.put(
  "/updateStatus/:_id",
  updateStatus.updateAccidentStatus
);

accidentRouter.get(
  "/getreport",
  getAccident
);

module.exports = accidentRouter;
