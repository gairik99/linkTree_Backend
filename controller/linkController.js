const { get } = require("mongoose");
const Link = require("../models/linkModel");

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

// Get all links
const getLinks = async (req, res) => {
  try {
    const userId = req.user.id;
    const links = await Link.find({ user: userId });
    res.status(200).json({ success: true, data: links });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const updateLink = async (req, res) => {
  try {
    const { linkId } = req.params; // Get linkId from URL params // Get updated fields from request body

    // Validate required fields
    const { linkTitle, linkUrl, domain } = req.body;
    // Find the link by ID and update it
    const updatedLink = await Link.findByIdAndUpdate(
      linkId,
      {
        linkTitle,
        linkUrl,
        domain, // Optionally update the domain
      },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedLink) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedLink,
    });
  } catch (error) {
    console.error("Error updating link:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(", ")}`,
      });
    }

    // Handle invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error updating link",
    });
  }
};

const deleteLink = async (req, res) => {
  try {
    const { linkId } = req.params;

    // Find and delete the link
    const deletedLink = await Link.findByIdAndDelete(linkId);

    if (!deletedLink) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Link deleted successfully",
      data: deletedLink,
    });
  } catch (error) {
    console.error("Error deleting link:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error deleting link",
    });
  }
};

module.exports = {
  createLink,
  getLinks,
  updateLink,
  deleteLink,
};
