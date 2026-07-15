const { getRepliesByThread, createReply } = require('../models/replies');
const { incrementReplyCount } = require('../models/users');

function listReplies(req, res) {
  const threadId = Number(req.params.id);
  if (!threadId) return res.status(400).json({ error: 'invalid thread id' });

  getRepliesByThread(threadId, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows || []);
  });
}

function postReply(req, res) {
  const threadId = Number(req.params.id);
  if (!threadId) return res.status(400).json({ error: 'invalid thread id' });
  const { author = 'Anónimo', content, image = '' } = req.body || {};
  if (!content) return res.status(400).json({ error: 'content required' });

  const createdAt = new Date().toISOString();
  createReply({ threadId, author, content, image, createdAt }, (err, reply) => {
    if (err) return res.status(500).json({ error: 'db insert error' });
    if (req.body.userId) {
      incrementReplyCount(req.body.userId, () => {});
    }
    res.status(201).json(reply);
  });
}

module.exports = { listReplies, postReply };
