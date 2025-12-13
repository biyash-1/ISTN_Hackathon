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
    let accidents = await Accident.find();

    // Sort so "reported" status comes first
    accidents.sort((a, b) => {
      if (a.status === "reported" && b.status !== "reported") return -1;
      if (a.status !== "reported" && b.status === "reported") return 1;
      return new Date(b.createdAt) - new Date(a.createdAt); // newest first
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
