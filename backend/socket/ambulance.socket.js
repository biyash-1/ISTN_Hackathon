// backend/socket/ambulance.socket.js
const Ambulance = require("../model/ambulance.model");

module.exports = (io, socket) => {
  // Ambulance comes online
  socket.on("ambulance:register", async (ambulanceId) => {
    try {
      console.log(`🚑 Ambulance registration attempt: ${ambulanceId}`);
      
      const ambulance = await Ambulance.findByIdAndUpdate(
        ambulanceId,
        {
          socketId: socket.id,
          status: "AVAILABLE",
          lastSeen: new Date()
        },
        { new: true }
      );
      
      if (ambulance) {
        console.log(`✅ Ambulance registered: ${ambulance.name} (${ambulanceId})`);
        socket.emit("registered", {
          success: true,
          ambulanceId: ambulance._id,
          name: ambulance.name,
          socketId: socket.id
        });
      } else {
        console.log(`❌ Ambulance not found: ${ambulanceId}`);
        socket.emit("registered", {
          success: false,
          error: "Ambulance not found"
        });
      }
    } catch (error) {
      console.error("❌ Registration error:", error.message);
      socket.emit("registered", {
        success: false,
        error: error.message
      });
    }
  });

  // Ambulance changes status
  socket.on("ambulance:status", async ({ status }) => {
    try {
      await Ambulance.findOneAndUpdate(
        { socketId: socket.id },
        { status, lastSeen: new Date() }
      );
      console.log(`📊 Status updated to: ${status}`);
    } catch (error) {
      console.error("Status update error:", error);
    }
  });

  // Ambulance accepts emergency
  socket.on("emergency:accept", async ({ accidentId }) => {
    console.log(`✅ Ambulance accepting accident: ${accidentId}`);
    // Your existing logic here
  });

  // Socket disconnect
  socket.on("disconnect", async () => {
    console.log("🔌 Socket disconnected:", socket.id);
    try {
      await Ambulance.findOneAndUpdate(
        { socketId: socket.id },
        { 
          status: "OFFLINE",
          socketId: null,
          lastSeen: new Date()
        }
      );
    } catch (error) {
      console.error("Disconnect update error:", error);
    }
  });
};