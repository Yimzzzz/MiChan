const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { getProfile, editProfile, searchUsers } = require('../controllers/userController');

router.get('/search', requireAuth, searchUsers);
router.get('/:id', getProfile);
router.put('/:id', requireAuth, editProfile);

module.exports = router;
