const { findSessionByToken } = require('../models/sessions');
const { findById } = require('../models/users');

function requireAuth(req, res, next) {
  const token = req.cookies?.michan_session || req.get('Authorization')?.replace(/^Bearer\s+/, '');
  if (!token) {
    return res.status(401).json({ error: 'authentication required' });
  }

  findSessionByToken(token, (err, session) => {
    if (err || !session) return res.status(401).json({ error: 'invalid session' });
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'session expired' });
    }
    findById(session.userId, (userErr, user) => {
      if (userErr || !user) return res.status(401).json({ error: 'invalid session user' });
      req.user = user;
      next();
    });
  });
}

function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'authentication required' });
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };