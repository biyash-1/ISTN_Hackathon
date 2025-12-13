// frontend/services/sockets.ts
import { io, Socket } from "socket.io-client";

// Use environment variable or fallback
const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Create socket instance with proper configuration
const socket: Socket = io(SOCKET_URL, {
  path: "/socket.io/",
  withCredentials: true,
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
  autoConnect: true
});

// Debug logging
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
  console.log("Server URL:", SOCKET_URL);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error.message);
  console.error("Error object:", error);
});

socket.on("disconnect", (reason) => {
  console.log("⚠️ Socket disconnected:", reason);
  if (reason === "io server disconnect") {
    // Reconnect manually
    socket.connect();
  }
});

// Test event
socket.on("registered", (data) => {
  console.log("Registration response:", data);
});

// Test function
export const testSocket = () => {
  console.log("Testing socket connection...");
  console.log("Socket connected:", socket.connected);
  console.log("Socket ID:", socket.id);
  
  socket.emit("ping", { test: "Hello from frontend" });
  socket.on("pong", (data) => {
    console.log("Pong received:", data);
  });
};

export { socket };
export default socket;