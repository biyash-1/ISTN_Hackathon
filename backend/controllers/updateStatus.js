const mongoose = require("mongoose");
const Accident = require("../model/accident_schema");
const Ambulance = require("../model/ambulance.model");
const PoliceStation = require("../model/PoliceStation.model");
const Hospital = require("../model/Hospital.model");
const { getNearestByDriving } = require("../services/locationService");
const { notifyServices } = require("../services/notificationDispatcher");

exports.updateAccidentStatus = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const { status } = req.body;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(400).json({ success: false, message: "Invalid accident ID" });
    if (!["ACCEPTED", "REJECTED"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status value" });

    // Update status
    const updatedAccident = await Accident.findByIdAndUpdate(
      _id,
      { status, reviewedAt: new Date() },
      { new: true }
    );
    if (!updatedAccident)
      return res.status(404).json({ success: false, message: "Accident not found" });

    // Initialize result variables
    let nearestAmbulances = [];
    let nearestPoliceStations = [];
    let nearestHospitals = [];

    if (status === "ACCEPTED") {
      const { latitude, longitude } = updatedAccident.location;

      if (latitude != null && longitude != null) {
        // Get all services
        const ambulances = await Ambulance.find({});
        const hospitals = await Hospital.find({});
        const policeStations = await PoliceStation.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [longitude, latitude] },
              distanceField: "distance",
              spherical: true,
            },
          },
          { $limit: 20 }, // Get more for driving distance calculation
        ]);

        // Calculate nearest by driving distance
        nearestAmbulances = await getNearestByDriving({ latitude, longitude }, ambulances);
        nearestPoliceStations = await getNearestByDriving({ latitude, longitude }, policeStations);
        nearestHospitals = await getNearestByDriving({ latitude, longitude }, hospitals);

        await notifyServices({
      services: nearestAmbulances,
      serviceType: "Ambulance",
      accidentLocation: { latitude, longitude },
    });

    await notifyServices({
      services: nearestPoliceStations,
      serviceType: "Police Station",
      accidentLocation: { latitude, longitude },
    });

    await notifyServices({
      services: nearestHospitals,
      serviceType: "Hospital",
      accidentLocation: { latitude, longitude },
    });

        

        console.log("Nearest ambulances:", nearestAmbulances);
        console.log("Nearest police stations:", nearestPoliceStations);
        console.log("Nearest 3 hospitals:", nearestHospitals);

        // TODO: Trigger notifications here
      }
    }

    return res.status(200).json({
      success: true,
      message: `Accident ${status.toLowerCase()}`,
      data: updatedAccident,
      nearestAmbulances,
      nearestPoliceStations,
      nearestHospitals,
    });
  } catch (error) {
    return next(error);
  }
};