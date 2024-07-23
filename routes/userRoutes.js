const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { profile } = require("../controllers/usersController");

const router = express.Router();

router.post("/profile", authMiddleware, profile);

module.exports = router;
