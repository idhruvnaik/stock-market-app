const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  squareOffOrder,
  canceSquareOffOrder,
  listSquareOffOrders,
  updateOrder,
} = require("../sockets/success-order-socket");

const router = express.Router();

router.post("/place_order", authMiddleware, squareOffOrder);
router.post("/cancel", authMiddleware, canceSquareOffOrder);
router.post("/list", authMiddleware, listSquareOffOrders);
router.post("/update", authMiddleware, updateOrder);

module.exports = router;
