const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/authMiddleware");
const {
  createClick,
  getUserClicksByCategory,
} = require("../controller/clickController");

router.route("/createclick/:linkId?").post(createClick);
router.route("/getlinksbycategory").get(validateToken, getUserClicksByCategory);

module.exports = router;
