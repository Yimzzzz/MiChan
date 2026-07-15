const express = require('express');
const router = express.Router();
const { login, logout, logoutAll } = require('../controllers/sessionController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.post('/logout-all', requireAuth, logoutAll);

module.exports = router;
