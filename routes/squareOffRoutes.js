const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  squareOffOrder,
  canceSquareOffOrder,
  listSquareOffOrders,
} = require("../sockets/success-order-socket");

const router = express.Router();

router.post("/place_order", authMiddleware, squareOffOrder);
router.post("/cancel", authMiddleware, canceSquareOffOrder);
router.post("/list", authMiddleware, listSquareOffOrders);

module.exports = router;
