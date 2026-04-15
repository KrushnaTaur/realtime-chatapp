// server.js
// Entry point for the backend server

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { initSocket } = require("./socket/socketHandler");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app); // Wrap express in HTTP server for socket.io

// ─────────────────────────────────────
// CORS Configuration
// ─────────────────────────────────────
const CLIENT_URL = process.env.CLIENT_URL || "http://127.0.0.1:5500";

app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// ─────────────────────────────────────
// Socket.io Setup
// ─────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, "http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize all socket event handlers
initSocket(io);

// ─────────────────────────────────────
// Middleware
// ─────────────────────────────────────
app.use(express.json()); // Parse JSON request bodies

// ─────────────────────────────────────
// API Routes
// ─────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "✅ Chat API is running" });
});

// ─────────────────────────────────────
// Start Server
// ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});