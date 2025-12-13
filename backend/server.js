// backend/server.js - COMPLETE WORKING VERSION
const http = require("http");
const socketIO = require("socket.io");
const app = require("./index");  // Import Express app from index.js

// Create HTTP server with Express app
const server = http.createServer(app);

// Socket.IO configuration
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  },
  path: "/socket.io/",  // Explicit path
  transports: ["polling", "websocket"]
});

// Add a test route to verify server is running
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Server is running",
    socket: "Socket.IO is active",
    timestamp: new Date().toISOString()
  });
});

// Initialize socket handlers
const initSocket = require("./socket");
initSocket(io);

// Make io globally available for other files
global.io = io;

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  ===========================================
  🚀 SERVER STARTED SUCCESSFULLY
  ===========================================
  📍 REST API:     http://localhost:${PORT}
  🔌 Socket.IO:    ws://localhost:${PORT}/socket.io/
  🩺 Health Check: http://localhost:${PORT}/api/health
  
  🎯 Frontend: http://localhost:3000
  ===========================================
  `);
});

// Handle server errors
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.log("Try: kill -9 $(lsof -t -i:5000)");
    process.exit(1);
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});