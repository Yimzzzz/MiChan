const { db } = require('../database');

function stats(req, res) {
  db.serialize(() => {
    db.get('SELECT COUNT(*) AS threads FROM threads', [], (err, threadRow) => {
      if (err) return res.status(500).json({ error: 'db error' });
      db.get('SELECT COUNT(*) AS users FROM users', [], (userErr, userRow) => {
        if (userErr) return res.status(500).json({ error: 'db error' });
        res.json({
          users: userRow ? userRow.users : 0,
          threads: threadRow ? threadRow.threads : 0,
          online: 0,
          activity: '-',
        });
      });
    });
  });
}

module.exports = { stats };
