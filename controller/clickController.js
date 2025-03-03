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

    // Fetch actual click data from the database
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
    ]);

    // Get current year (or you can pass the year dynamically)
    const currentYear = new Date().getFullYear();

    // Create an array for all 12 months with totalClicks = 0 by default
    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      _id: { year: currentYear, month: i + 1 }, // Months start from 1 (January)
      totalClicks: 0,
    }));

    // Merge actual data with default months
    const mergedData = allMonths.map((defaultMonth) => {
      const found = clicksByMonth.find(
        (data) =>
          data._id.year === defaultMonth._id.year &&
          data._id.month === defaultMonth._id.month
      );
      return found || defaultMonth;
    });

    res.status(200).json({ success: true, data: mergedData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getTotalClicksByOS = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id); // Get user ID from request

    const clicks = await Click.aggregate([
      {
        $match: { user: userId }, // Filter clicks by user
      },
      {
        $set: {
          "device.os.name": { $ifNull: ["$device.os.name", "others"] }, // Replace null or missing OS name with "others"
        },
      },
      {
        $group: {
          _id: "$device.os.name",
          totalClicks: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ success: true, data: clicks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getClicksByDomain = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id); // Get user ID from request

    const clicks = await Click.aggregate([
      {
        $match: { user: userId, domain: { $ne: "others" } }, // Exclude 'others' domain
      },
      {
        $group: {
          _id: "$domain",
          totalClicks: { $sum: 1 },
        },
      },
      {
        $sort: { totalClicks: -1 },
      }, // Sort in descending order
      {
        $facet: {
          topDomains: [{ $limit: 3 }], // Get top 3 domains
          rest: [
            { $skip: 3 },
            {
              $group: { _id: "others", totalClicks: { $sum: "$totalClicks" } },
            },
          ], // Group rest as 'others'
        },
      },
      {
        $project: {
          data: { $concatArrays: ["$topDomains", "$rest"] }, // Merge results
        },
      },
      {
        $unwind: "$data",
      },
      {
        $replaceRoot: { newRoot: "$data" },
      },
    ]);

    res.status(200).json({ success: true, data: clicks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createClick,
  getUserClicksByCategory,
  getClicksByMonth,
  getTotalClicksByOS,
  getClicksByDomain,
};
