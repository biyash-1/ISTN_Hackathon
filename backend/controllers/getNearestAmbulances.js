const mongoose = require("mongoose");
const Accident = require("../model/accident_schema");
const Ambulance = require("../model/ambulance_schema");
const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

async function getNearestAmbulancesByDriving(accidentLocation, ambulances) {
  // 1. Prepare destinations
  const destinations = ambulances.map(a => ({
    lat: a.location.coordinates[1],
    lng: a.location.coordinates[0],
  }));

  // 2. Call Google Distance Matrix API
  const response = await client.distancematrix({
    params: {
      origins: [{ lat: accidentLocation.latitude, lng: accidentLocation.longitude }],
      destinations: destinations,
      mode: "driving",
      key: process.env.GOOGLE_MAPS_API_KEY, // set in your .env
    },
  });

  const distances = response.data.rows[0].elements.map((elem, index) => ({
    ambulance: ambulances[index],
    distanceMeters: elem.distance.value,
    durationSec: elem.duration.value,
  }));

  // 3. Sort by driving distance and take 3 nearest
  distances.sort((a, b) => a.distanceMeters - b.distanceMeters);

  return distances.slice(0, 3).map(d => ({
    _id: d.ambulance._id,
    name: d.ambulance.name,
    phone: d.ambulance.phone,
    address: d.ambulance.address,
    distanceKm: +(d.distanceMeters / 1000).toFixed(2),
    durationMin: Math.round(d.durationSec / 60),
  }));
}

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
      // 1️⃣ Get all ambulances
      const ambulances = await Ambulance.find({});

      // 2️⃣ Calculate driving distances and get 3 nearest
      const nearestAmbulances = await getNearestAmbulancesByDriving(
        { latitude, longitude },
        ambulances
      );

      console.log("Nearest 3 ambulances by driving distance:", nearestAmbulances);
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