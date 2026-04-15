// controllers/messageController.js
// Handles fetching messages between two users

const Message = require("../models/Message");

// @route   GET /api/messages/:userId
// @desc    Get all messages between logged-in user and :userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherUserId = req.params.userId;

    // Fetch messages where sender/receiver matches either user
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // Sort by oldest first

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

// @route   POST /api/messages/send/:receiverId
// @desc    Save a message to DB (also emitted via socket)
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const senderId = req.user._id;
    const receiverId = req.params.receiverId;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const newMessage = await Message.create({ senderId, receiverId, message });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
};

module.exports = { getMessages, sendMessage };