const { db } = require('../database');

function getRepliesByThread(threadId, cb) {
  db.all(
    'SELECT id, thread_id AS threadId, author, content, image, created_at AS createdAt FROM replies WHERE thread_id = ? ORDER BY created_at ASC',
    [threadId],
    cb
  );
}

function createReply({ threadId, author, content, image, createdAt }, cb) {
  db.run(
    'INSERT INTO replies (thread_id, author, content, image, created_at) VALUES (?, ?, ?, ?, ?)',
    [threadId, author, content, image, createdAt],
    function (err) {
      if (err) return cb(err);
      cb(null, {
        id: this.lastID,
        thread_id: threadId,
        author,
        content,
        image,
        createdAt,
      });
    }
  );
}

module.exports = {
  getRepliesByThread,
  createReply,
};
