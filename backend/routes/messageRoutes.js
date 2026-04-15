// routes/messageRoutes.js
// Protected routes for chat messages

const express = require("express");
const router = express.Router();
const { getMessages, sendMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

// GET /api/messages/:userId - fetch conversation history
router.get("/:userId", protect, getMessages);

// POST /api/messages/send/:receiverId - save a sent message
router.post("/send/:receiverId", protect, sendMessage);

module.exports = router;