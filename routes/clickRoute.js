const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/authMiddleware");
const {
  createClick,
  getUserClicksByCategory,
  getClicksByMonth,
  getTotalClicksByOS,
  getClicksByDomain,
} = require("../controller/clickController");

router.route("/createclick/:linkId?").post(createClick);
router.route("/getclickbycategory").get(validateToken, getUserClicksByCategory);
router.route("/getclickbymonth").get(validateToken, getClicksByMonth);
router.route("/getclickbyos").get(validateToken, getTotalClicksByOS);
router.route("/getclickbydomain").get(validateToken, getClicksByDomain);

module.exports = router;
