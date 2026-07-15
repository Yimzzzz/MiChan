const express = require('express');
const router = express.Router();
const { listReplies, postReply } = require('../controllers/replyController');

router.get('/:id/replies', listReplies);
router.post('/:id/replies', postReply);

module.exports = router;
