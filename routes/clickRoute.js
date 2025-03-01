const express = require("express");
const router = express.Router();
const { createClick } = require("../controller/clickController");

router.route("/createclick/:linkId?").post(createClick);

module.exports = router;
