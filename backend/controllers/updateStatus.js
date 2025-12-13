const mongoose = require("mongoose");
const Accident = require("../model/accident_schema");
const Ambulance = require("../model/ambulance.model");

exports.updateAccidentStatus = async (req, res, next) => {
  try {
    let { _id } = req.params;
    const { status } = req.body;

    // ✅ Trim whitespace/newlines
    _id = _id.trim();

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid accident ID format",
      });
    }

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Update accident status
    const updatedAccident = await Accident.findByIdAndUpdate(
      _id,
      {
        status,
        reviewedAt: new Date(),
      },
      { new: true }
    );
    console.log("ipdated accident",updatedAccident)

    if (!updatedAccident) {
      return res.status(404).json({
        success: false,
        message: "Accident record not found",
      });
    }

    // ✅ If status is ACCEPTED, calculate nearest 3 ambulances
    if (status === "ACCEPTED") {
      const { latitude, longitude } = updatedAccident.location;

      if (latitude != null && longitude != null) {
        try {
          const nearestAmbulances = await Ambulance.aggregate([
            {
              $geoNear: {
                near: { type: "Point", coordinates: [longitude, latitude] },
                distanceField: "distance",
                spherical: true,
              },
            },
            { $limit: 3 },
            {
              $project: {
                _id: 1,
                name: 1,
                phone: 1,
                address: 1,
                distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
              },
            },
          ]);

          console.log("Nearest 3 ambulances:", nearestAmbulances);
        } catch (geoError) {
          console.error("Error finding nearest ambulances:", geoError);
        }
      } else {
        console.warn("Accident location missing, cannot find nearest ambulances.");
      }
    }

    // Respond to client
    return res.status(200).json({
      success: true,
      message: `Accident ${status.toLowerCase()}`,
      data: updatedAccident,
    });
  } catch (error) {
    return next(error); // Pass error to Express error handler
  }
};