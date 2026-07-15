const { db } = require('../database');

function toggleLike(userId, threadId, cb) {
  db.get('SELECT id FROM likes WHERE user_id = ? AND thread_id = ?', [userId, threadId], (err, row) => {
    if (err) return cb(err);
    if (row) {
      db.run('DELETE FROM likes WHERE id = ?', [row.id], (deleteErr) => {
        if (deleteErr) return cb(deleteErr);
        cb(null, false);
      });
    } else {
      db.run('INSERT INTO likes (user_id, thread_id, created_at) VALUES (?, ?, ?)', [userId, threadId, new Date().toISOString()], function (insertErr) {
        if (insertErr) return cb(insertErr);
        cb(null, true);
      });
    }
  });
}

function countLikes(threadId, cb) {
  db.get('SELECT COUNT(*) AS count FROM likes WHERE thread_id = ?', [threadId], (err, row) => {
    if (err) return cb(err);
    cb(null, row ? row.count : 0);
  });
}

module.exports = { toggleLike, countLikes };