const { getConversationBetween, createConversation, getUserConversations } = require('../models/conversations');
const { getMessages, createMessage, markMessagesRead } = require('../models/messages');
const { findByUsername, findById, findUsersByQuery } = require('../models/users');

function searchUsers(req, res) {
  const query = String(req.query.q || '').trim();
  if (!query) return res.json([]);
  findUsersByQuery(query, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
}

function getConversations(req, res) {
  const userId = req.user.id;
  getUserConversations(userId, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    const conversations = rows.map((row) => ({
      id: row.id,
      partnerId: row.userA === userId ? row.userB : row.userA,
      createdAt: row.createdAt,
    }));
    res.json(conversations);
  });
}

function startConversation(req, res) {
  const userId = req.user.id;
  const partnerId = Number(req.body.partnerId);
  if (!partnerId || partnerId === userId) return res.status(400).json({ error: 'invalid partner id' });

  getConversationBetween(userId, partnerId, (err, existing) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (existing) return res.json(existing);
    createConversation(userId, partnerId, (createErr, conversation) => {
      if (createErr) return res.status(500).json({ error: 'db error' });
      res.status(201).json(conversation);
    });
  });
}

function getConversationMessages(req, res) {
  const conversationId = Number(req.params.conversationId);
  if (!conversationId) return res.status(400).json({ error: 'invalid conversation id' });
  getMessages(conversationId, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
}

function postMessage(req, res) {
  const conversationId = Number(req.params.conversationId);
  const senderId = req.user.id;
  const content = String(req.body.content || '').trim();
  if (!conversationId || !content) return res.status(400).json({ error: 'conversation id and content required' });

  createMessage(conversationId, senderId, content, (err, message) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.status(201).json(message);
  });
}

function markRead(req, res) {
  const conversationId = Number(req.params.conversationId);
  if (!conversationId) return res.status(400).json({ error: 'invalid conversation id' });
  markMessagesRead(conversationId, req.user.id, (err) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ ok: true });
  });
}

module.exports = { searchUsers, getConversations, startConversation, getConversationMessages, postMessage, markRead };