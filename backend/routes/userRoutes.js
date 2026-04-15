// routes/userRoutes.js
// Protected routes for user data

const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Protected - requires valid JWT
router.get("/", protect, getAllUsers);

module.exports = router;