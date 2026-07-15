const { getNotifications, clearNotifications } = require('../models/notifications');

function listNotifications(req, res) {
  getNotifications((err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows.map((r) => ({ id: r.id, text: r.text, time: r.time || 'ahora', createdAt: r.createdAt })));
  });
}

function clearAllNotifications(req, res) {
  clearNotifications((err) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ ok: true });
  });
}

module.exports = { listNotifications, clearAllNotifications };
