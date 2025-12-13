// backend/services/dispatchAmbulance.service.js
const Ambulance = require("../model/ambulance.model");
const { getNearestByDriving } = require("./locationService");

const dispatchAmbulance = async (accident) => {
  try {
    console.log(
      `🚨 DISPATCHING: Accident ${accident._id} at ${new Date().toISOString()}`
    );

    // Extract coordinates safely - handle multiple location formats
    let latitude, longitude;
    
    if (accident.location) {
      if (accident.location.latitude && accident.location.longitude) {
        // Format 1: { location: { latitude, longitude } }
        latitude = accident.location.latitude;
        longitude = accident.location.longitude;
        console.log(`📍 Using lat/lng object: ${latitude}, ${longitude}`);
      } else if (Array.isArray(accident.location.coordinates)) {
        // Format 2: GeoJSON [longitude, latitude]
        latitude = accident.location.coordinates[1];
        longitude = accident.location.coordinates[0];
        console.log(`📍 Using GeoJSON coordinates: ${latitude}, ${longitude}`);
      } else if (accident.latitude && accident.longitude) {
        // Format 3: Direct fields on accident
        latitude = accident.latitude;
        longitude = accident.longitude;
        console.log(`📍 Using direct coordinates: ${latitude}, ${longitude}`);
      } else {
        console.error("❌ Unrecognized location format:", accident.location);
        return { dispatched: false, reason: "Invalid location format" };
      }
    } else {
      console.error("❌ No location found in accident");
      return { dispatched: false, reason: "No location data" };
    }

    // 1. Get only AVAILABLE ambulances with socket connections
    const ambulances = await Ambulance.find({
      status: "AVAILABLE",
      socketId: { $exists: true, $ne: null },
    });

    console.log(`📊 Available ambulances: ${ambulances.length}`);

    if (ambulances.length === 0) {
      console.log("⚠️ No available ambulances with active connections");
      return { dispatched: false, reason: "No available ambulances" };
    }

    // 2. Find nearest using your existing function
    const nearest = await getNearestByDriving(
      { latitude, longitude },
      ambulances
    );

    console.log(`📍 Nearest ambulances found: ${nearest.length}`);

    if (nearest.length === 0) {
      console.log("⚠️ No ambulances found within range");
      return { dispatched: false, reason: "No ambulances in range" };
    }

    let dispatchedCount = 0;
    const dispatchedAmbulances = [];
    
    for (const amb of nearest) {
      const matched = ambulances.find(
        (a) => a._id.toString() === amb._id.toString()
      );

      if (matched?.socketId) {
        console.log(
          `📡 Notifying ambulance: ${matched.name} (${matched.socketId})`
        );

        const emergencyData = {
          accidentId: accident._id,
          id: accident._id.toString(),
          patientName: "Emergency Case",
          location: accident.address || accident.locationText || "Accident Location",
          distance: `${amb.distanceKm?.toFixed(1) || "Unknown"} km`,
          time: "Just now",
          priority: (accident.severity || "high").toLowerCase(),
          lat: latitude,
          lng: longitude,
          description: accident.description || "Emergency accident reported",
          imageUrl: accident.images?.[0]?.url || accident.imageUrl,
          reportedAt: accident.createdAt || new Date(),
          verified: true,
        };

        // Send to specific ambulance
        global.io.to(matched.socketId).emit("emergency:new", emergencyData);
        dispatchedCount++;
        dispatchedAmbulances.push({
          id: matched._id,
          name: matched.name,
          distance: amb.distanceKm,
        });

        console.log(`✅ Sent emergency to ${matched.name}`);
      }
    }

    console.log(`✅ Dispatched to ${dispatchedCount} ambulance(s)`);

    return {
      dispatched: dispatchedCount > 0,
      count: dispatchedCount,
      ambulances: dispatchedAmbulances,
    };
  } catch (error) {
    console.error("❌ Dispatch error:", error);
    console.error("❌ Error stack:", error.stack);
    return { dispatched: false, error: error.message };
  }
};

module.exports = { dispatchAmbulance };