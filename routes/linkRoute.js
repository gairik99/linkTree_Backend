const express = require("express");
const validateToken = require("../middleware/authMiddleware");
const {
  createLink,
  getLinks,
  updateLink,
  deleteLink,
} = require("../controller/linkController");
const router = express.Router();

router.route("/createlink").post(validateToken, createLink);
router.route("/getlinks").get(validateToken, getLinks);
router.route("/updatelink/:linkId").patch(validateToken, updateLink);
router.route("/deletelink/:linkId").delete(validateToken, deleteLink);

module.exports = router;
