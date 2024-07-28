const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  placeOrder,
  list,
  cancelOrder,
  updateOrder,
} = require("../sockets/order-socket");

const router = express.Router();
router.post("/place_order", authMiddleware, placeOrder);
router.post("/list", authMiddleware, list);
router.post("/cancel", authMiddleware, cancelOrder);
router.post("/update", authMiddleware, updateOrder);

module.exports = router;
