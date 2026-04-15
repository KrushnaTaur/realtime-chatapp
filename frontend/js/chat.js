// js/chat.js
// Main chat application logic — users list, messaging, socket events

const API = CONFIG.BACKEND_URL;

// ─────────────────────────────────────
// AUTH GUARD — Redirect if not logged in
// ─────────────────────────────────────
const token = localStorage.getItem("token");
const currentUser = JSON.parse(localStorage.getItem("user") || "null");

if (!token || !currentUser) {
  window.location.href = "login.html";
}

// ─────────────────────────────────────
// DOM ELEMENTS
// ─────────────────────────────────────
const userListEl = document.getElementById("userList");
const messagesEl = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatHeader = document.getElementById("chatHeader");
const typingIndicator = document.getElementById("typingIndicator");
const noChatSelected = document.getElementById("noChatSelected");
const chatArea = document.getElementById("chatArea");
const currentUserNameEl = document.getElementById("currentUserName");
const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("searchInput");

// Display current user's name in sidebar
if (currentUserNameEl) currentUserNameEl.textContent = currentUser.name;

// ─────────────────────────────────────
// STATE
// ─────────────────────────────────────
let selectedUser = null;    // Currently selected chat partner
let allUsers = [];          // Full list of users
let onlineUserIds = [];     // Array of online user IDs
let typingTimeout = null;   // Timer for typing stop detection

// ─────────────────────────────────────
// SOCKET.IO SETUP
// ─────────────────────────────────────
const socket = io(API, {
  transports: ["websocket", "polling"],
});

// Tell server this user is online
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
  socket.emit("user:online", currentUser._id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});

// ─────────────────────────────────────
// SOCKET EVENT: Receive a message
// ─────────────────────────────────────
socket.on("message:receive", (data) => {
  // Only show message if it's from the currently selected chat
  if (selectedUser && data.senderId === selectedUser._id) {
    appendMessage(data.message, "received", data.createdAt);
    scrollToBottom();
  } else {
    // Show notification dot on the sender's user card
    showUnreadBadge(data.senderId);
  }
});

// ─────────────────────────────────────
// SOCKET EVENT: Online users update
// ─────────────────────────────────────
socket.on("users:online", (userIds) => {
  onlineUserIds = userIds;
  updateOnlineStatus();
});

// ─────────────────────────────────────
// SOCKET EVENT: Typing indicators
// ─────────────────────────────────────
socket.on("typing:show", ({ senderId }) => {
  if (selectedUser && senderId === selectedUser._id) {
    typingIndicator.style.display = "flex";
    scrollToBottom();
  }
});

socket.on("typing:hide", ({ senderId }) => {
  if (selectedUser && senderId === selectedUser._id) {
    typingIndicator.style.display = "none";
  }
});

// ─────────────────────────────────────
// FETCH ALL USERS
// ─────────────────────────────────────
async function loadUsers() {
  try {
    const res = await fetch(`${API}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      logout();
      return;
    }

    allUsers = await res.json();
    renderUserList(allUsers);
  } catch (err) {
    console.error("Failed to load users:", err);
  }
}

function renderUserList(users) {
  userListEl.innerHTML = "";

  if (users.length === 0) {
    userListEl.innerHTML = '<li class="no-users">No other users yet</li>';
    return;
  }

  users.forEach((user) => {
    const isOnline = onlineUserIds.includes(user._id);
    const li = document.createElement("li");
    li.className = `user-item${selectedUser?._id === user._id ? " active" : ""}`;
    li.dataset.userId = user._id;
    li.innerHTML = `
      <div class="user-avatar">${getInitials(user.name)}</div>
      <div class="user-info">
        <span class="user-name">${escapeHtml(user.name)}</span>
        <span class="user-status ${isOnline ? "online" : "offline"}">
          ${isOnline ? "● Online" : "○ Offline"}
        </span>
      </div>
      <span class="unread-badge" id="badge-${user._id}" style="display:none">●</span>
    `;
    li.addEventListener("click", () => openChat(user));
    userListEl.appendChild(li);
  });
}

// ─────────────────────────────────────
// OPEN CHAT WITH A USER
// ─────────────────────────────────────
async function openChat(user) {
  selectedUser = user;

  // Update UI
  noChatSelected.style.display = "none";
  chatArea.style.display = "flex";
  chatHeader.innerHTML = `
    <div class="chat-header-info">
      <div class="chat-avatar">${getInitials(user.name)}</div>
      <div>
        <div class="chat-user-name">${escapeHtml(user.name)}</div>
        <div class="chat-user-status ${onlineUserIds.includes(user._id) ? "online" : "offline"}">
          ${onlineUserIds.includes(user._id) ? "● Online" : "○ Offline"}
        </div>
      </div>
    </div>
  `;

  // Mark as active in sidebar
  document.querySelectorAll(".user-item").forEach((el) => el.classList.remove("active"));
  const activeEl = document.querySelector(`[data-user-id="${user._id}"]`);
  if (activeEl) activeEl.classList.add("active");

  // Clear unread badge
  const badge = document.getElementById(`badge-${user._id}`);
  if (badge) badge.style.display = "none";

  // Load message history
  await loadMessages(user._id);
  messageInput.focus();
}

// ─────────────────────────────────────
// LOAD MESSAGES BETWEEN TWO USERS
// ─────────────────────────────────────
async function loadMessages(userId) {
  messagesEl.innerHTML = '<div class="loading-msgs">Loading messages...</div>';
  typingIndicator.style.display = "none";

  try {
    const res = await fetch(`${API}/api/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const messages = await res.json();

    messagesEl.innerHTML = "";

    if (messages.length === 0) {
      messagesEl.innerHTML = '<div class="no-messages">No messages yet. Say hello! 👋</div>';
      return;
    }

    messages.forEach((msg) => {
      const type = msg.senderId === currentUser._id ? "sent" : "received";
      appendMessage(msg.message, type, msg.createdAt);
    });

    scrollToBottom();
  } catch (err) {
    messagesEl.innerHTML = '<div class="error-msgs">Failed to load messages.</div>';
    console.error("Load messages error:", err);
  }
}

// ─────────────────────────────────────
// SEND MESSAGE
// ─────────────────────────────────────
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !selectedUser) return;

  messageInput.value = "";
  stopTyping();

  // Optimistic UI: show message immediately
  appendMessage(text, "sent", new Date().toISOString());
  scrollToBottom();

  try {
    // Save message to DB via REST API
    const res = await fetch(`${API}/api/messages/send/${selectedUser._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: text }),
    });

    const savedMsg = await res.json();

    // Emit via socket for real-time delivery to receiver
    socket.emit("message:send", {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      message: text,
      messageId: savedMsg._id,
      createdAt: savedMsg.createdAt,
    });
  } catch (err) {
    console.error("Send message error:", err);
  }
}

// ─────────────────────────────────────
// TYPING INDICATOR LOGIC
// ─────────────────────────────────────
messageInput.addEventListener("input", () => {
  if (!selectedUser) return;

  socket.emit("typing:start", {
    senderId: currentUser._id,
    receiverId: selectedUser._id,
  });

  // Stop typing indicator after 1.5 seconds of inactivity
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(stopTyping, 1500);
});

function stopTyping() {
  if (!selectedUser) return;
  socket.emit("typing:stop", {
    senderId: currentUser._id,
    receiverId: selectedUser._id,
  });
}

// ─────────────────────────────────────
// SEND ON BUTTON CLICK OR ENTER KEY
// ─────────────────────────────────────
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ─────────────────────────────────────
// SEARCH USERS
// ─────────────────────────────────────
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allUsers.filter((u) =>
    u.name.toLowerCase().includes(query)
  );
  renderUserList(filtered);
});

// ─────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────
logoutBtn.addEventListener("click", logout);

function logout() {
  socket.emit("user:offline", currentUser._id);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// ─────────────────────────────────────
// HELPERS
// ─────────────────────────────────────

// Append a message bubble to the chat window
function appendMessage(text, type, timestamp) {
  // Remove "no messages" placeholder if present
  const placeholder = messagesEl.querySelector(".no-messages");
  if (placeholder) placeholder.remove();

  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.innerHTML = `
    <div class="message-bubble">${escapeHtml(text)}</div>
    <div class="message-time">${formatTime(timestamp)}</div>
  `;
  messagesEl.appendChild(div);
}

// Update online/offline status dots in user list
function updateOnlineStatus() {
  allUsers.forEach((user) => {
    const statusEl = document.querySelector(`[data-user-id="${user._id}"] .user-status`);
    if (statusEl) {
      const isOnline = onlineUserIds.includes(user._id);
      statusEl.className = `user-status ${isOnline ? "online" : "offline"}`;
      statusEl.textContent = isOnline ? "● Online" : "○ Offline";
    }
    // Update open chat header status too
    if (selectedUser && selectedUser._id === user._id) {
      const headerStatus = document.querySelector(".chat-user-status");
      if (headerStatus) {
        const isOnline = onlineUserIds.includes(user._id);
        headerStatus.className = `chat-user-status ${isOnline ? "online" : "offline"}`;
        headerStatus.textContent = isOnline ? "● Online" : "○ Offline";
      }
    }
  });
}

// Show a red unread dot badge on a user's list item
function showUnreadBadge(userId) {
  const badge = document.getElementById(`badge-${userId}`);
  if (badge) badge.style.display = "inline-block";
}

// Scroll chat to the latest message
function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Format timestamp to HH:MM AM/PM
function formatTime(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Get initials from a name (e.g. "John Doe" → "JD")
function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Prevent XSS by escaping HTML special characters
function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ─────────────────────────────────────
// INIT
// ─────────────────────────────────────
loadUsers();

// Refresh user list every 30 seconds to catch new signups
setInterval(loadUsers, 30000);