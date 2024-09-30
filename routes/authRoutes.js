const express = require("express");
const { login, verifyRefreshToken } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/verify_refresh_token", verifyRefreshToken);

module.exports = router;
