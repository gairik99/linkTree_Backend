const express = require("express");
const validateToken = require("../middleware/authMiddleware");
const {
  updateUser,
  getUserWithLinks,
} = require("../controller/userController");
const router = express.Router();

router.route("/updateuser").patch(validateToken, updateUser);
router.route("/userwithlinks/:userId").get(getUserWithLinks);

module.exports = router;
