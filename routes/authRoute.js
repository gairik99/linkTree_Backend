const express = require("express");
const router = express.Router();

const { login, createUser } = require("../controller/authController");

router.post("/login", login);
router.post("/register", createUser);

module.exports = router;
