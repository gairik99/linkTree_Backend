const Click = require("../models/clickModel.js");
const Link = require("../models/linkModel.js");
const mongoose = require("mongoose");
const UAParser = require("ua-parser-js");

const createClick = async (req, res) => {
  try {
    const { user, domain, category } = req.body;
    const linkId = req.params.linkId;

    // Validate required fields
    if (!user || !category || !domain) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: user,  or category",
      });
    }

    // Validate MongoDB ID format if linkId exists
    if (linkId && !mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({ message: "Invalid link ID format" });
    }

    // Parse device information
    const userAgent = req.headers["user-agent"];
    const parser = new UAParser(userAgent);
    const { browser, os, device } = parser.getResult();

    const click = await Click.create({
      user,
      link: linkId || undefined,
      domain,
      category,
      device: {
        type: device.type || "desktop",
        browser: {
          name: browser.name,
          version: browser.version,
        },
        os: {
          name: os.name,
          version: os.version,
        },
        vendor: device.vendor,
      },
    });

    res.status(201).json({
      status: "success",
      data: click,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to track click",
      error: error.message,
    });
  }
};

const getUserClicksByCategory = async (req, res) => {
  try {
    const userId = req.user.id;

    const clicksByCategory = await Click.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: {
            $ifNull: ["$_id", "uncategorized"],
          },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: clicksByCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getClicksByMonth = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id); // Convert to ObjectId

    // console.log("UserId:", userId); // Debugging

    const clicksByMonth = await Click.aggregate([
      { $match: { user: userId } }, // Filter by user
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalClicks: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }, // Sort by latest month first
    ]);

    // console.log("Aggregated Data:", clicksByMonth); // Debugging

    res.status(200).json({ success: true, data: clicksByMonth });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
module.exports = { createClick, getUserClicksByCategory, getClicksByMonth };
