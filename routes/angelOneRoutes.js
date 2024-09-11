const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const { getLtpofTokens } = require("../controllers/angelOneController");

const router = express.Router();
router.post("/ltp-data", authMiddleware, getLtpofTokens);

module.exports = router;
