const Accident = require("../model/accident_schema");

const createAccident = async (req, res) => {
  try {
    const payload = { ...req.body }; // clone
    console.log("req.body", payload);

    await Accident.create(payload);

    res.status(201).json({
      message: "Accident reported successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create accident report",
      error: error.message,
    });
  }
};

const getAccident = async (req, res) => {
  try {
    const accidents = await Accident.find().sort({
      status: -1, // non-Accepted first
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: accidents.length,
      data: accidents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch accident reports",
      error: error.message,
    });
  }
};

module.exports = {
  createAccident,
  getAccident,
};
