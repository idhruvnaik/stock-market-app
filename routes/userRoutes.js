const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  profile,
  create,
  update,
  list,
  login_history,
} = require("../controllers/usersController");

const router = express.Router();

router.post("/profile", authMiddleware, profile);
router.post("/create", authMiddleware, create);
router.post("/update", authMiddleware, update);
router.post("/list", authMiddleware, list);
router.post("/login_history", authMiddleware, login_history);

module.exports = router;
