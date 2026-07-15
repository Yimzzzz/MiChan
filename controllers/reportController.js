const { db } = require('../database');

function reportItem(req, res) {
  const reporterId = req.user.id;
  const { targetType, targetId, reason } = req.body || {};
  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ error: 'targetType, targetId and reason required' });
  }
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO reports (reporter_id, target_type, target_id, reason, created_at) VALUES (?, ?, ?, ?, ?)',
    [reporterId, targetType, targetId, reason, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: 'db error' });
      res.status(201).json({ id: this.lastID, reporterId, targetType, targetId, reason, status: 'pending', createdAt });
    }
  );
}

function listReports(req, res) {
  db.all('SELECT id, reporter_id AS reporterId, target_type AS targetType, target_id AS targetId, reason, status, created_at AS createdAt FROM reports ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
}

function resolveReport(req, res) {
  const reportId = Number(req.params.id);
  const { status } = req.body || {};
  if (!reportId || !['pending', 'resolved', 'dismissed'].includes(status)) {
    return res.status(400).json({ error: 'invalid report or status' });
  }
  db.run('UPDATE reports SET status = ? WHERE id = ?', [status, reportId], function (err) {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ ok: true });
  });
}

module.exports = { reportItem, listReports, resolveReport };