const { db } = require('../database');

function createSession(userId, token, expiresAt, cb) {
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO sessions (user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?)',
    [userId, token, createdAt, expiresAt],
    function (err) {
      if (err) return cb(err);
      cb(null, { id: this.lastID, userId, token, createdAt, expiresAt });
    }
  );
}

function findSessionByToken(token, cb) {
  db.get('SELECT id, user_id AS userId, token, created_at AS createdAt, expires_at AS expiresAt FROM sessions WHERE token = ?', [token], cb);
}

function deleteSession(token, cb) {
  db.run('DELETE FROM sessions WHERE token = ?', [token], cb);
}

function deleteSessionsForUser(userId, cb) {
  db.run('DELETE FROM sessions WHERE user_id = ?', [userId], cb);
}

module.exports = { createSession, findSessionByToken, deleteSession, deleteSessionsForUser };