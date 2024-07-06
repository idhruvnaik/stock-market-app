const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { list, add } = require('../controllers/watchListController');

const router = express.Router();

router.post('/list', authMiddleware, list);
router.post('/add', authMiddleware, add);

module.exports = router;