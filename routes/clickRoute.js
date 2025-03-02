const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/authMiddleware");
const {
  createClick,
  getUserClicksByCategory,
  getClicksByMonth,
} = require("../controller/clickController");

router.route("/createclick/:linkId?").post(createClick);
router.route("/getclickbycategory").get(validateToken, getUserClicksByCategory);
router.route("/getclickbymonth").get(validateToken, getClicksByMonth);

module.exports = router;
