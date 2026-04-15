// socket/socketHandler.js
// Handles all Socket.io real-time events

// Map to track online users: { userId: socketId }
const onlineUsers = new Map();

const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─────────────────────────────────────────
    // EVENT: User comes online
    // Client emits this after login with their userId
    // ─────────────────────────────────────────
    socket.on("user:online", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId; // Store userId on socket for cleanup

      // Broadcast updated online users list to everyone
      io.emit("users:online", Array.from(onlineUsers.keys()));
      console.log(`👤 User online: ${userId} | Total online: ${onlineUsers.size}`);
    });

    // ─────────────────────────────────────────
    // EVENT: Send a private message
    // Client emits: { senderId, receiverId, message, messageId, createdAt }
    // ─────────────────────────────────────────
    socket.on("message:send", (data) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);

      if (receiverSocketId) {
        // Receiver is online — emit message directly to them
        io.to(receiverSocketId).emit("message:receive", data);
      }
      // Note: Message is saved to DB via REST API call from the client
    });

    // ─────────────────────────────────────────
    // EVENT: Typing indicator
    // Client emits: { senderId, receiverId, isTyping }
    // ─────────────────────────────────────────
    socket.on("typing:start", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:show", { senderId });
      }
    });

    socket.on("typing:stop", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:hide", { senderId });
      }
    });

    // ─────────────────────────────────────────
    // EVENT: Disconnect
    // Remove user from online map and notify others
    // ─────────────────────────────────────────
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("users:online", Array.from(onlineUsers.keys()));
        console.log(`❌ User offline: ${socket.userId} | Total online: ${onlineUsers.size}`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };