const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { list } = require('../controllers/usersController');

const router = express.Router();

router.post('/list', authMiddleware, list);

module.exports = router;