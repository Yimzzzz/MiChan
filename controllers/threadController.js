const { getAllThreads, createThread } = require('../models/threads');
const { toggleLike, countLikes } = require('../models/likes');
const { incrementThreadCount } = require('../models/users');
const { createNotification } = require('../models/notifications');

function listThreads(req, res) {
  const sort = String(req.query.sort || 'recent');
  getAllThreads(sort, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    const threads = rows.map((r) => {
      let tags = [];
      try {
        tags = JSON.parse(r.tags || '[]');
      } catch (e) {
        tags = (r.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
      }
      return {
        id: r.id,
        author: r.author,
        title: r.title,
        excerpt: (r.content || '').slice(0, 220),
        content: r.content,
        tags,
        imageUrl: r.image_url || '',
        createdAt: r.created_at,
        likes: r.likes || 0,
        replies: r.replies || 0,
      };
    });
    res.json(threads);
  });
}

function createNewThread(req, res) {
  const user = req.user;
  const { title, content, tags = [] } = req.body || {};
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const author = user ? user.displayName || user.username : req.body.author || 'Anónimo';
  const userId = user ? user.id : null;
  const createdAt = new Date().toISOString();
  createThread({ author, userId, title, content, tags, createdAt }, (err, thread) => {
    if (err) return res.status(500).json({ error: 'db insert error' });
    createNotification({ text: `Nuevo hilo: ${thread.title}`, time: 'ahora', createdAt }, () => {});
    if (userId) {
      incrementThreadCount(userId, () => {});
    }
    res.status(201).json(thread);
  });
}

function likeThread(req, res) {
  const userId = req.user && req.user.id;
  const threadId = Number(req.params.id);
  if (!userId) return res.status(401).json({ error: 'authentication required' });
  if (!threadId) return res.status(400).json({ error: 'invalid thread id' });

  toggleLike(userId, threadId, (err, liked) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ liked });
  });
}

function getThreadLikes(req, res) {
  const threadId = Number(req.params.id);
  if (!threadId) return res.status(400).json({ error: 'invalid thread id' });

  countLikes(threadId, (err, count) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ count });
  });
}

module.exports = { listThreads, createNewThread, likeThread, getThreadLikes };
