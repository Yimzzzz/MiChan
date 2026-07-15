const { db } = require('../database');

function getConversationBetween(userA, userB, cb) {
  db.get(
    'SELECT id, user_a AS userA, user_b AS userB, created_at AS createdAt FROM conversations WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)',
    [userA, userB, userB, userA],
    cb
  );
}

function createConversation(userA, userB, cb) {
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO conversations (user_a, user_b, created_at) VALUES (?, ?, ?)',
    [userA, userB, createdAt],
    function (err) {
      if (err) return cb(err);
      cb(null, { id: this.lastID, userA, userB, createdAt });
    }
  );
}

function getUserConversations(userId, cb) {
  db.all(
    'SELECT id, user_a AS userA, user_b AS userB, created_at AS createdAt FROM conversations WHERE user_a = ? OR user_b = ? ORDER BY created_at DESC',
    [userId, userId],
    cb
  );
}

module.exports = { getConversationBetween, createConversation, getUserConversations };