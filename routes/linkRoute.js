const express = require("express");
const validateToken = require("../middleware/authMiddleware");
const { createLink } = require("../controller/linkController");
const router = express.Router();

router.route("/createlink").post(validateToken, createLink);

module.exports = router;
