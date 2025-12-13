const Accident = require("../model/accident_schema");

const createAccident = async (req, res) => {
  try {
    const accident = await Accident.create(req.body);

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
    const accidents = await Accident.find().sort({ createdAt: -1 });

    console.log("res",accidents)
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

module.exports = createAccident;
module.exports = getAccident;
