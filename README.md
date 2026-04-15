# 💬 Real-Time Chat Application

A full-stack real-time chat app built with Node.js, Express, MongoDB, Socket.io, and vanilla HTML/CSS/JS.

---

## 📁 Folder Structure

```
realtime-chat/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Signup & Login logic
│   │   ├── userController.js      # Get all users
│   │   └── messageController.js   # Send & fetch messages
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protection middleware
│   ├── models/
│   │   ├── User.js                # User schema (name, email, password)
│   │   └── Message.js             # Message schema (senderId, receiverId, message)
│   ├── routes/
│   │   ├── authRoutes.js          # POST /api/auth/signup|login
│   │   ├── userRoutes.js          # GET  /api/users
│   │   └── messageRoutes.js       # GET/POST /api/messages
│   ├── socket/
│   │   └── socketHandler.js       # All Socket.io event handlers
│   ├── .env.example               # Environment variable template
│   ├── package.json
│   └── server.js                  # Entry point
│
└── frontend/
    ├── css/
    │   └── style.css              # All styles
    ├── js/
    │   ├── config.js              # Backend URL config
    │   ├── auth.js                # Login/signup form handlers
    │   └── chat.js                # Main chat logic + Socket.io
    ├── index.html                 # Chat UI
    ├── login.html                 # Login page
    └── signup.html                # Signup page
```

---

## ⚙️ Environment Setup

1. Copy `.env.example` to `.env` inside the `backend/` folder:

```bash
cd backend
cp .env.example .env
```

2. Fill in your `.env`:

```env
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.mongodb.net/chatapp
JWT_SECRET=your_super_secret_key_change_this
PORT=5000
CLIENT_URL=http://127.0.0.1:5500
```

---

## 🚀 Run Locally

### Step 1 — Install backend dependencies

```bash
cd backend
npm install
```

### Step 2 — Start backend server

```bash
npm run dev       # uses nodemon (auto-restart on changes)
# or
npm start         # plain node
```

Backend runs at: `http://localhost:5000`

### Step 3 — Serve the frontend

Use **VS Code Live Server** extension:
- Right-click `frontend/index.html` → "Open with Live Server"
- It will open at `http://127.0.0.1:5500`

OR use any static file server:
```bash
cd frontend
npx serve .       # serves on http://localhost:3000
```

> **Important:** The `index.html` loads Socket.io from `http://localhost:5000/socket.io/socket.io.js`. Make sure the backend is running first.

### Step 4 — Test with two users

1. Open `http://127.0.0.1:5500/signup.html` in **Browser Tab 1** — create User A
2. Open `http://127.0.0.1:5500/signup.html` in **Browser Tab 2 (Incognito)** — create User B
3. Both will be redirected to the chat page
4. Select each other from the sidebar and start chatting in real-time!

---

## 🌐 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login + get JWT |
| GET | `/api/users` | ✅ JWT | Get all users except self |
| GET | `/api/messages/:userId` | ✅ JWT | Get message history |
| POST | `/api/messages/send/:receiverId` | ✅ JWT | Save a sent message |

---

## 🔌 Socket.io Events

| Event (Client → Server) | Payload | Description |
|--------------------------|---------|-------------|
| `user:online` | `userId` | Mark user as online |
| `message:send` | `{ senderId, receiverId, message, ... }` | Send a message |
| `typing:start` | `{ senderId, receiverId }` | Start typing indicator |
| `typing:stop` | `{ senderId, receiverId }` | Stop typing indicator |

| Event (Server → Client) | Payload | Description |
|--------------------------|---------|-------------|
| `users:online` | `[userId, ...]` | Updated online user list |
| `message:receive` | `{ senderId, message, ... }` | Incoming message |
| `typing:show` | `{ senderId }` | Show typing indicator |
| `typing:hide` | `{ senderId }` | Hide typing indicator |

---

## ☁️ Deployment

### Backend → Render.com

1. Push your `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add Environment Variables:
   - `MONGO_URI` → your MongoDB Atlas URI
   - `JWT_SECRET` → a long random string
   - `CLIENT_URL` → your Vercel frontend URL (e.g. `https://my-chat.vercel.app`)
6. Deploy. Copy your Render URL (e.g. `https://chat-backend.onrender.com`)

### Frontend → Vercel

1. Push your `frontend/` folder to a GitHub repo (or subfolder)
2. **Before deploying**, update `frontend/js/config.js`:
   ```js
   const CONFIG = {
     BACKEND_URL: "https://chat-backend.onrender.com"  // Your Render URL
   };
   ```
3. Also update `frontend/index.html` — change the socket.io script src:
   ```html
   <script src="https://chat-backend.onrender.com/socket.io/socket.io.js"></script>
   ```
4. Go to [vercel.com](https://vercel.com) → **New Project** → Import repo
5. Set **Root Directory** to `frontend` if in monorepo
6. Deploy. Your app is live!

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |
| Hosting | Render (backend) + Vercel (frontend) |