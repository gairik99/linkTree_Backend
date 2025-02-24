const Link = require("../models/linkModel");

// @desc    Create a new link
// @route   POST /api/links
// @access  Private
const createLink = async (req, res) => {
  try {
    // Get authenticated user ID from middleware
    const userId = req.user.id;

    // Validate required fields
    const { linkTitle, linkUrl, category, domain } = req.body;
    if (!linkTitle || !linkUrl || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: linkTitle, linkUrl, category",
      });
    }

    // Create new link (domain is auto-generated in pre-save hook)
    const newLink = await Link.create({
      linkTitle,
      linkUrl,
      category,
      user: userId,
      domain,
    });

    res.status(201).json({
      success: true,
      data: newLink,
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(", ")}`,
      });
    }

    // Handle duplicate URL for same user
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already saved this URL",
      });
    }

    // Handle invalid URL format (from pre-save hook)
    if (error.message.includes("Invalid URL")) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid URL",
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: "Server error creating link",
    });
  }
};

module.exports = {
  createLink,
};
