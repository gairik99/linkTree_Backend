const express = require("express");
const validateToken = require("../middleware/authMiddleware");
const {
  createLink,
  getLinks,
  updateLink,
  deleteLink,
  getUserLinksWithClicks,
  getTopLinks,
} = require("../controller/linkController");
const router = express.Router();

router.route("/createlink").post(validateToken, createLink);
router.route("/getlinks").get(validateToken, getLinks);
router.route("/getlinkwithclicks").get(validateToken, getUserLinksWithClicks);
router.route("/updatelink/:linkId").patch(validateToken, updateLink);
router.route("/deletelink/:linkId").delete(validateToken, deleteLink);
router.route("/gettoplink").get(validateToken, getTopLinks);

module.exports = router;
