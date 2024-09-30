const express = require("express");
const { login, verifyRefreshToken, register } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/verify_refresh_token", verifyRefreshToken);
router.post("/register", register);

module.exports = router;
