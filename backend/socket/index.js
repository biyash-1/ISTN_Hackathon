
const ambulanceSocket = require("./ambulance.socket");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 New socket connection:", socket.id);
    
    // Simple test endpoint
    socket.on("ping", (data) => {
      console.log("Ping received from", socket.id, ":", data);
      socket.emit("pong", { 
        message: "Pong!", 
        timestamp: new Date().toISOString() 
      });
    });
    

    ambulanceSocket(io, socket);
  });
};