const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { placeOrder } = require("../controllers/squareOffController");

const router = express.Router();

router.post("/place_order", authMiddleware, placeOrder);

module.exports = router;
