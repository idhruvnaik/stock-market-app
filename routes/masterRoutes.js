const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { symbols } = require('../controllers/masterController');

const router = express.Router();

router.get('/symbols', authMiddleware, symbols);

module.exports = router;
