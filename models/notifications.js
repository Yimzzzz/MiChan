const { db } = require('../database');

function getNotifications(cb) {
  db.all('SELECT id, text, time, created_at AS createdAt FROM notifications ORDER BY id DESC LIMIT 50', [], cb);
}

function createNotification({ text, time, createdAt }, cb) {
  db.run(
    'INSERT INTO notifications (text, time, created_at) VALUES (?, ?, ?)',
    [text, time, createdAt],
    function (err) {
      if (err) return cb(err);
      cb(null, { id: this.lastID, text, time, createdAt });
    }
  );
}

function clearNotifications(cb) {
  db.run('DELETE FROM notifications', [], cb);
}

module.exports = {
  getNotifications,
  createNotification,
  clearNotifications,
};
