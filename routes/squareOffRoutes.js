const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { squareOffOrder } = require("../sockets/success-order-socket");

const router = express.Router();

router.post("/place_order", authMiddleware, squareOffOrder);

module.exports = router;
