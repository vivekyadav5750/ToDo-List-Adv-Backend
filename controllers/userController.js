const User = require("../models/User");

// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(200).json({
        message: "No users found",
        users: []
      });
    }
    res.status(200).json({
      message: "Users retrieved successfully",
      users
    });
  } catch (error) {
    next(error);
  }
};
