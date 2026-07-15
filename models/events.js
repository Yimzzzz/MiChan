const { db } = require('../database');

function getEvents(cb) {
  db.all(
    'SELECT id, title, description, type, event_date AS eventDate, created_by AS createdBy, created_at AS createdAt FROM events ORDER BY event_date ASC',
    [],
    cb
  );
}

function createEvent({ title, description, type, eventDate, createdBy }, cb) {
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO events (title, description, type, event_date, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, type, eventDate, createdBy, createdAt],
    function (err) {
      if (err) return cb(err);
      cb(null, { id: this.lastID, title, description, type, eventDate, createdBy, createdAt });
    }
  );
}

function updateEvent(id, { title, description, type, eventDate }, cb) {
  db.run(
    'UPDATE events SET title = ?, description = ?, type = ?, event_date = ? WHERE id = ?',
    [title, description, type, eventDate, id],
    function (err) {
      if (err) return cb(err);
      cb(null, { id, title, description, type, eventDate });
    }
  );
}

function deleteEvent(id, cb) {
  db.run('DELETE FROM events WHERE id = ?', [id], cb);
}

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };