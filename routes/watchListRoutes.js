const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { list, setOrder } = require("../controllers/watchListController");
const { add, remove } = require("../sockets/watchlist-socket");

const router = express.Router();

router.post("/list", authMiddleware, list);
router.post("/add", authMiddleware, add);
router.post("/remove", authMiddleware, remove);
router.post("/set_order", authMiddleware, setOrder);

module.exports = router;
