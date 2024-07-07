const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { list, add, remove } = require('../controllers/watchListController');

const router = express.Router();

router.post('/list', authMiddleware, list);
router.post('/add', authMiddleware, add);
router.post('/remove', authMiddleware, remove);

module.exports = router;