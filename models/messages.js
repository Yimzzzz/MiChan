const { db } = require('../database');

function getMessages(conversationId, cb) {
  db.all(
    'SELECT id, conversation_id AS conversationId, sender_id AS senderId, content, created_at AS createdAt, read_at AS readAt FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    [conversationId],
    cb
  );
}

function createMessage(conversationId, senderId, content, cb) {
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES (?, ?, ?, ?)',
    [conversationId, senderId, content, createdAt],
    function (err) {
      if (err) return cb(err);
      cb(null, { id: this.lastID, conversationId, senderId, content, createdAt, readAt: null });
    }
  );
}

function markMessagesRead(conversationId, userId, cb) {
  db.run(
    'UPDATE messages SET read_at = ? WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL',
    [new Date().toISOString(), conversationId, userId],
    cb
  );
}

module.exports = { getMessages, createMessage, markMessagesRead };