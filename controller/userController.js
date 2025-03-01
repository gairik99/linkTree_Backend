const User = require("../models/userModel");
const Link = require("../models/linkModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const updateUser = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.id;

    // List of allowed fields to update
    const allowedUpdates = [
      "firstName",
      "lastName",
      "userName",
      "imageurl",
      "category",
      "bio",
      "bannerBackground",
      "bannerColor",
      "password",
      "buttonAlignment",
      "buttonStyle",
      "buttonColor",
      "buttonFontColor",
      "theme",
      "email",
    ];
    const updates = req.body;

    // Validate request has updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    // Check for invalid fields
    const invalidFields = Object.keys(updates).filter(
      (field) => !allowedUpdates.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields detected: ${invalidFields.join(", ")}`,
        validFields: allowedUpdates,
      });
    }
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }
    // Update the user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "ok",
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
  }
};

const getUserWithLinks = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Get user without sensitive fields
    const user = await User.findById(userId).select("-password -agree").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get associated links and exclude user reference
    const links = await Link.find({ user: userId }).select("-user");

    // Add links to user object
    user.links = links;

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user data",
      error: error.message,
    });
  }
};

module.exports = {
  updateUser,
  getUserWithLinks,
};
