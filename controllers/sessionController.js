const crypto = require('crypto');
const { createSession, deleteSession, deleteSessionsForUser } = require('../models/sessions');
const { findByUsernameWithPassword } = require('../models/users');
const bcrypt = require('bcryptjs');

function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  findByUsernameWithPassword(username, (err, user) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password_hash || '');
    if (!valid) return res.status(401).json({ error: 'invalid credentials' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    createSession(user.id, token, expiresAt, (sessionErr) => {
      if (sessionErr) return res.status(500).json({ error: 'session creation failed' });
      res.cookie('michan_session', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      res.json({ id: user.id, username: user.username, displayName: user.displayName, course: user.course, role: user.role });
    });
  });
}

function logout(req, res) {
  const token = req.cookies?.michan_session || req.get('Authorization')?.replace(/^Bearer\s+/, '');
  if (!token) return res.status(200).json({ ok: true });
  deleteSession(token, (err) => {
    if (err) console.error('logout error', err);
    res.clearCookie('michan_session');
    res.json({ ok: true });
  });
}

function logoutAll(req, res) {
  if (!req.user) return res.status(401).json({ error: 'authentication required' });
  deleteSessionsForUser(req.user.id, (err) => {
    if (err) return res.status(500).json({ error: 'logout all failed' });
    res.clearCookie('michan_session');
    res.json({ ok: true });
  });
}

module.exports = { login, logout, logoutAll };