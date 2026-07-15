const { db } = require('../database');

const PUBLIC_USER_FIELDS = [
  'id',
  'username',
  'display_name AS displayName',
  'bio',
  'course',
  'avatar_url AS avatarUrl',
  'role',
  'created_at AS createdAt',
  'threads_count AS threadsCount',
  'replies_count AS repliesCount',
].join(', ');

const AUTH_USER_FIELDS = PUBLIC_USER_FIELDS + ', password_hash';

function findByUsername(username, cb) {
  db.get(`SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE username = ?`, [username], cb);
}

function findByUsernameWithPassword(username, cb) {
  db.get(`SELECT ${AUTH_USER_FIELDS} FROM users WHERE username = ?`, [username], cb);
}

function findById(id, cb) {
  db.get(`SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE id = ?`, [id], cb);
}

function findUsersByQuery(query, cb) {
  const like = `%${query.trim().toLowerCase()}%`;
  db.all(
    `SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE lower(username) LIKE ? OR lower(display_name) LIKE ? ORDER BY created_at DESC LIMIT 50`,
    [like, like],
    cb
  );
}

function createUser({ username, passwordHash, displayName, course, role = 'user', createdAt }, cb) {
  const avatarUrl = '';
  const bio = '';
  db.run(
    `INSERT INTO users (username, password_hash, display_name, bio, course, avatar_url, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [username, passwordHash, displayName, bio, course, avatarUrl, role, createdAt],
    function (err) {
      if (err) return cb(err);
      findById(this.lastID, cb);
    }
  );
}

function updateProfile(id, { displayName, bio, course, avatarUrl }, cb) {
  db.run(
    `UPDATE users SET display_name = ?, bio = ?, course = ?, avatar_url = ? WHERE id = ?`,
    [displayName, bio, course, avatarUrl, id],
    function (err) {
      if (err) return cb(err);
      findById(id, cb);
    }
  );
}

function incrementThreadCount(userId, cb) {
  db.run(
    `UPDATE users SET threads_count = COALESCE(threads_count, 0) + 1 WHERE id = ?`,
    [userId],
    cb
  );
}

function incrementReplyCount(userId, cb) {
  db.run(
    `UPDATE users SET replies_count = COALESCE(replies_count, 0) + 1 WHERE id = ?`,
    [userId],
    cb
  );
}

module.exports = {
  findByUsername,
  findByUsernameWithPassword,
  findById,
  findUsersByQuery,
  createUser,
  updateProfile,
  incrementThreadCount,
  incrementReplyCount,
};
