const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { logout, logoutAll } = require('../controllers/sessionController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.post('/logout-all', requireAuth, logoutAll);
router.get('/me', requireAuth, me);

module.exports = router;
