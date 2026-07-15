const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { findByUsername, findByUsernameWithPassword, createUser } = require('../models/users');
const { createSession } = require('../models/sessions');

function createSessionForUser(user, res) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  createSession(user.id, token, expiresAt, (err) => {
    if (err) {
      return res.status(500).json({ error: 'session creation failed' });
    }
    res.cookie('michan_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({ id: user.id, username: user.username, displayName: user.displayName, course: user.course, role: user.role });
  });
}

function register(req, res) {
  const { username, password, course } = req.body || {};
  if (!username || !password || !course) {
    return res.status(400).json({ error: 'username, password and course required' });
  }

  findByUsername(username, (err, existing) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (existing) return res.status(409).json({ error: 'username already exists' });

    const createdAt = new Date().toISOString();
    const hash = bcrypt.hashSync(password, 8);

    createUser({ username, passwordHash: hash, displayName: username, course, createdAt }, (createErr, user) => {
      if (createErr) return res.status(500).json({ error: 'db error' });
      createSessionForUser(user, res);
    });
  });
}

function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  findByUsernameWithPassword(username, (err, user) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password_hash || '');
    if (!valid) return res.status(401).json({ error: 'invalid credentials' });

    createSessionForUser(user, res);
  });
}

function me(req, res) {
  if (!req.user) return res.status(401).json({ error: 'authentication required' });
  res.json(req.user);
}

module.exports = { register, login, me };
