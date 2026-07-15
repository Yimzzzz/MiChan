const { findById, updateProfile, findUsersByQuery } = require('../models/users');

function getProfile(req, res) {
  const userId = Number(req.params.id);
  if (!userId) return res.status(400).json({ error: 'invalid user id' });
  findById(userId, (err, user) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json(user);
  });
}

function editProfile(req, res) {
  const userId = Number(req.params.id);
  if (!userId) return res.status(400).json({ error: 'invalid user id' });
  const { displayName, bio, course, avatarUrl } = req.body || {};
  updateProfile(userId, { displayName, bio, course, avatarUrl }, (err, user) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(user);
  });
}

function searchUsers(req, res) {
  const query = String(req.query.q || '').trim();
  if (!query) return res.json([]);
  findUsersByQuery(query, (err, users) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(users);
  });
}

module.exports = { getProfile, editProfile, searchUsers };
