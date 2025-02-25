const express = require("express");
const validateToken = require("../middleware/authMiddleware");
const { createLink, getLinks } = require("../controller/linkController");
const router = express.Router();

router.route("/createlink").post(validateToken, createLink);
router.route("/getlinks").get(validateToken, getLinks);

module.exports = router;
