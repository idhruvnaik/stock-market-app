const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  getLtpofTokens,
  fetchHoliday,
} = require("../controllers/angelOneController");

const router = express.Router();
router.post("/ltp-data", authMiddleware, getLtpofTokens);
router.post("/fetch_holiday", authMiddleware, fetchHoliday);

module.exports = router;
