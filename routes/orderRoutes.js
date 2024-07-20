const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { placeOrder, list } = require("../controllers/orderController");

const router = express.Router();
router.post("/place_order", authMiddleware, placeOrder);
router.post("/list", authMiddleware, list);

module.exports = router;
