// controllers/userController.js
// Handles fetching user list for chat sidebar

const User = require("../models/User");

// @route   GET /api/users
// @desc    Get all users except the logged-in user
// @access  Private (requires JWT)
const getAllUsers = async (req, res) => {
  try {
    // Exclude current user and password field from results
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

module.exports = { getAllUsers };