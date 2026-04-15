# 💬 Real-Time Chat Application

A full-stack real-time chat app with JWT authentication, private messaging, online/offline status, and typing indicators.

**🌐 Live Demo:** [realtimechat-krushnataur.vercel.app](https://realtimechat-krushnataur.vercel.app)  
**⚙️ Backend API:** [realtime-chatapp-w7bf.onrender.com](https://realtime-chatapp-w7bf.onrender.com)

---

## 🚀 Features

- 🔐 **JWT Authentication** — Signup, login, and protected routes
- 💬 **Real-Time Messaging** — Instant one-to-one chat via Socket.io
- 🟢 **Online / Offline Status** — See who's currently active
- ✍️ **Typing Indicator** — Live "is typing..." feedback
- 🕐 **Message Timestamps** — Every message shows time sent
- 🔴 **Unread Badge** — Dot indicator for new messages from other users
- 🔍 **User Search** — Filter the sidebar by name
- 📱 **Responsive UI** — Works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |
| Hosting | Vercel (frontend) + Render (backend) |

---

## 📁 Folder Structure

```
realtime-chat/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Signup & login
│   │   ├── userController.js      # Get all users
│   │   └── messageController.js   # Send & fetch messages
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protection
│   ├── models/
│   │   ├── User.js                # User schema
│   │   └── Message.js             # Message schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── messageRoutes.js
│   ├── socket/
│   │   └── socketHandler.js       # All Socket.io events
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── config.js              # Backend URL config
│   │   ├── auth.js                # Login/signup handlers
│   │   └── chat.js                # Chat logic + sockets
│   ├── index.html                 # Chat UI
│   ├── login.html
│   └── signup.html
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/KrushnaTaur/realtime-chat.git
cd realtime-chat
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.mongodb.net/chatapp
JWT_SECRET=your_super_secret_key
PORT=5000
CLIENT_URL=http://127.0.0.1:5500
```

### 3. Install & run backend

```bash
npm install
npm run dev        # nodemon auto-restart
# or
npm start
```

Backend runs at `http://localhost:5000`

### 4. Serve the frontend

Open `frontend/index.html` with **VS Code Live Server**, or:

```bash
cd frontend
npx serve .
```

Frontend runs at `http://127.0.0.1:5500`

### 5. Test with two users

1. Open `http://127.0.0.1:5500/signup.html` in a normal tab — sign up as **User A**
2. Open the same URL in an **incognito tab** — sign up as **User B**
3. Both land on the chat page — select each other and chat in real-time!

---

## 🌐 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login and receive JWT |
| GET | `/api/users` | ✅ | Get all users except self |
| GET | `/api/messages/:userId` | ✅ | Get conversation history |
| POST | `/api/messages/send/:receiverId` | ✅ | Save a sent message |

---

## 🔌 Socket.io Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `user:online` | `userId` | Register user as online |
| `message:send` | `{ senderId, receiverId, message, createdAt }` | Send a message |
| `typing:start` | `{ senderId, receiverId }` | User started typing |
| `typing:stop` | `{ senderId, receiverId }` | User stopped typing |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `users:online` | `[userId, ...]` | Broadcast updated online list |
| `message:receive` | `{ senderId, message, createdAt }` | Deliver incoming message |
| `typing:show` | `{ senderId }` | Show typing indicator |
| `typing:hide` | `{ senderId }` | Hide typing indicator |

---

## ☁️ Deployment

### Backend — [Render](https://render.com)

1. Push `backend/` to GitHub
2. New Web Service → connect repo
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` → your Vercel frontend URL
6. Live at: `https://realtime-chatapp-w7bf.onrender.com`

### Frontend — [Vercel](https://vercel.com)

1. Update `frontend/js/config.js`:
   ```js
   const CONFIG = {
     BACKEND_URL: "https://realtime-chatapp-w7bf.onrender.com"
   };
   ```
2. Update the Socket.io script tag in `frontend/index.html`:
   ```html
   <script src="https://realtime-chatapp-w7bf.onrender.com/socket.io/socket.io.js"></script>
   ```
3. Push `frontend/` to GitHub
4. New Project on Vercel → import repo → set root to `frontend/`
5. Live at: `https://realtimechat-krushnataur.vercel.app`

---

> Built by **Krushna Taur**
