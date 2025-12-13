const Ambulance = require("../model/Ambulance");
const { getNearestByDriving } = require("./locationService");

exports.dispatchAmbulance = async (accident) => {
  const ambulances = await Ambulance.find({ status: "AVAILABLE" });

  if (!ambulances.length) return;

  const nearest = await getNearestByDriving(
    {
      latitude: accident.location.coordinates[1],
      longitude: accident.location.coordinates[0],
    },
    ambulances
  );

  nearest.forEach((amb) => {
    const matched = ambulances.find(a => a._id.equals(amb._id));
    if (matched?.socketId) {
      global.io.to(matched.socketId).emit("emergency:new", {
        id: accident._id,
        patientName: "Unknown",
        location: amb.address,
        distance: `${amb.distanceKm} km`,
        time: "Just now",
        priority: "high",
        lat: accident.location.coordinates[1],
        lng: accident.location.coordinates[0],
      });
    }
  });
};
