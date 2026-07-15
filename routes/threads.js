const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { listThreads, createNewThread, likeThread, getThreadLikes } = require('../controllers/threadController');

router.get('/', listThreads);
router.post('/', createNewThread);
router.post('/:id/like', requireAuth, likeThread);
router.get('/:id/likes', getThreadLikes);

module.exports = router;
