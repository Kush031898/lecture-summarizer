const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { getProfile, updateProfile, getSummaryHistory } = require("../controllers/Profile");

router.get("/getProfile", auth, getProfile);
router.put("/updateProfile", auth, updateProfile);
router.get("/history", auth, getSummaryHistory);

module.exports = router;
