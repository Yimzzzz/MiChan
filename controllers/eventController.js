const { getEvents, createEvent, updateEvent, deleteEvent } = require('../models/events');
const { createNotification } = require('../models/notifications');

const ALLOWED_TYPES = ['Exámenes', 'Tareas', 'Eventos deportivos', 'Reuniones', 'Fechas importantes'];

function listEvents(req, res) {
  getEvents((err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
}

function createNewEvent(req, res) {
  const { title, description, type, eventDate } = req.body || {};
  if (!title || !description || !type || !eventDate) {
    return res.status(400).json({ error: 'all fields required' });
  }
  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ error: 'invalid event type' });
  }
  createEvent({ title, description, type, eventDate, createdBy: req.user.id }, (err, event) => {
    if (err) return res.status(500).json({ error: 'db error' });
    createNotification({ text: `Nuevo evento: ${event.title}`, time: 'ahora', createdAt: new Date().toISOString() }, () => {});
    res.status(201).json(event);
  });
}

function editEvent(req, res) {
  const eventId = Number(req.params.id);
  const { title, description, type, eventDate } = req.body || {};
  if (!eventId || !title || !description || !type || !eventDate) {
    return res.status(400).json({ error: 'invalid event data' });
  }
  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ error: 'invalid event type' });
  }
  updateEvent(eventId, { title, description, type, eventDate }, (err, event) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(event);
  });
}

function removeEvent(req, res) {
  const eventId = Number(req.params.id);
  if (!eventId) return res.status(400).json({ error: 'invalid event id' });
  deleteEvent(eventId, (err) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ ok: true });
  });
}

module.exports = { listEvents, createNewEvent, editEvent, removeEvent, ALLOWED_TYPES };