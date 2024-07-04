const express = require('express');
const { register, login, verifyRefreshToken } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify_refresh_token', verifyRefreshToken);

module.exports = router;
