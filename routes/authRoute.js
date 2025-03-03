const express = require("express");
const router = express.Router();

const {
  login,
  createUser,
  forgotPassword,
  resetPassword,
} = require("../controller/authController");

router.post("/login", login);
router.post("/register", createUser);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetPassword);

module.exports = router;
