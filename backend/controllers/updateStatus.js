// backend/controllers/verification.controller.js
const mongoose = require("mongoose");
const Accident = require("../model/accident_schema");
const Ambulance = require("../model/ambulance.model");
const PoliceStation = require("../model/PoliceStation.model");
const Hospital = require("../model/Hospital.model");
const { getNearestByDriving } = require("../services/locationService");
const { dispatchAmbulance } = require("../services/dispatchAmbulance.service");

exports.updateAccidentStatus = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const { status } = req.body;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(400).json({ 
        success: false, 
        message: "Invalid accident ID" 
      });

    if (!["ACCEPTED", "REJECTED", "verified"].includes(status))
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status value" 
      });

    // Update accident status
    const updatedAccident = await Accident.findByIdAndUpdate(
      _id,
      {
        status,
        reviewedAt: new Date(),
        verifiedBy: req.user?._id, // If you have authentication
      },
      { new: true }
    );

    if (!updatedAccident)
      return res.status(404).json({ 
        success: false, 
        message: "Accident not found" 
      });

    let dispatchResults = null;
    let nearestServices = null;

    
    if (status === "ACCEPTED" || status === "verified") {
      const { latitude, longitude } = updatedAccident.location;

      if (latitude != null && longitude != null) {
        console.log(`📍 Accident location: ${latitude}, ${longitude}`);
        
        // 1. GET ALL SERVICES IN PARALLEL (faster)
        const [ambulances, hospitals, policeStationsGeo] = await Promise.all([
          Ambulance.find({}),
          Hospital.find({}),
          PoliceStation.aggregate([
            {
              $geoNear: {
                near: { type: "Point", coordinates: [longitude, latitude] },
                distanceField: "distance",
                spherical: true,
              },
            },
            { $limit: 20 },
          ]),
        ]);

        // 2. FIND NEAREST SERVICES IN PARALLEL
        const [nearestAmbulances, nearestHospitals, nearestPolice] = await Promise.all([
          getNearestByDriving({ latitude, longitude }, ambulances),
          getNearestByDriving({ latitude, longitude }, hospitals),
          getNearestByDriving({ latitude, longitude }, policeStationsGeo),
        ]);

        // Save for response
        nearestServices = {
          ambulances: nearestAmbulances.slice(0, 3), // Top 3
          hospitals: nearestHospitals.slice(0, 2),   // Top 2 hospitals
          police: nearestPolice.slice(0, 2),         // Top 2 police stations
        };

        console.log("🚑 Nearest ambulances:", nearestServices.ambulances.length);
        console.log("🏥 Nearest hospitals:", nearestServices.hospitals.length);
        console.log("👮 Nearest police:", nearestServices.police.length);

        // 3. DISPATCH AMBULANCES (using your existing function)
        const ambulanceDispatch = await dispatchAmbulance(updatedAccident);
        
      
        dispatchResults = {
          ambulance: ambulanceDispatch,
          // police: await notifyPolice(nearestServices.police, updatedAccident),
          // hospital: await notifyHospitals(nearestServices.hospitals, updatedAccident),
        };

        console.log("✅ All services dispatched:", dispatchResults);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Accident ${status.toLowerCase()}`,
      data: updatedAccident,
      nearestServices,
      dispatchResults,
    });
  } catch (error) {
    console.error("❌ Verification error:", error);
    return next(error);
  }
};

async function notifyPolice(policeStations, accident) {
  try {
    console.log(`👮 Notifying ${policeStations.length} police stations`);
    
    const notifications = policeStations.map(station => ({
      stationId: station._id,
      name: station.name,
      address: station.address,
      phone: station.phone,
      distance: station.distanceKm,
      accidentId: accident._id,
      location: accident.address,
      severity: accident.severity,
      timestamp: new Date().toISOString()
    }));

   
    notifications.forEach(notif => {
      console.log(`📞 Police alert: ${notif.name} - ${notif.distance}km away`);
    });

    return {
      notified: policeStations.length,
      stations: policeStations.map(s => s.name),
      method: "logged" // Change to "sms", "email", "api" when implemented
    };
  } catch (error) {
    console.error("❌ Police notification failed:", error);
    return { error: error.message };
  }
}


async function notifyHospitals(hospitals, accident) {
  try {
    console.log(`🏥 Notifying ${hospitals.length} hospitals`);
    
    const notifications = hospitals.map(hospital => ({
      hospitalId: hospital._id,
      name: hospital.name,
      address: hospital.address,
      phone: hospital.phone,
      distance: hospital.distanceKm,
      accidentId: accident._id,
      location: accident.address,
      severity: accident.severity,
      expectedPatients: accident.severity === "HIGH" ? "Multiple" : "Single",
      timestamp: new Date().toISOString()
    }));

    
    notifications.forEach(notify => {
      console.log(`🏥 Hospital alert: ${notify.name} - Prepare for ${notify.expectedPatients} patient(s)`);
    });

    return {
      notified: hospitals.length,
      hospitals: hospitals.map(h => h.name),
      method: "logged"
    };
  } catch (error) {
    console.error("❌ Hospital notification failed:", error);
    return { error: error.message };
  }
}