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

module.exports = { createClick };
