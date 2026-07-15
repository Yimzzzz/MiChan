const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { searchUsers, getConversations, startConversation, getConversationMessages, postMessage, markRead } = require('../controllers/chatController');

router.get('/users', requireAuth, searchUsers);
router.get('/conversations', requireAuth, getConversations);
router.post('/conversations', requireAuth, startConversation);
router.get('/conversations/:conversationId/messages', requireAuth, getConversationMessages);
router.post('/conversations/:conversationId/messages', requireAuth, postMessage);
router.post('/conversations/:conversationId/read', requireAuth, markRead);

module.exports = router;