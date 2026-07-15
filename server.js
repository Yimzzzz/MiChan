const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from workspace root (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname)));

// In-memory data (simple demo backend)
let notifications = [];

// SQLite setup
const dbPath = path.join(__dirname, 'michan.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('SQLite open error:', err);
  else console.log('Opened SQLite database at', dbPath);
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT,
      title TEXT,
      content TEXT,
      tags TEXT,
      created_at TEXT
    )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      created_at TEXT
    )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      time TEXT,
      created_at TEXT
    )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER,
      author TEXT,
      content TEXT,
      image TEXT,
      created_at TEXT,
      FOREIGN KEY(thread_id) REFERENCES threads(id)
    )`
  );
});

const bcrypt = require('bcryptjs');

function getStats(cb) {
  db.get('SELECT COUNT(*) AS cnt FROM threads', [], (err, row) => {
    if (err) return cb({ users: 0, threads: 0, online: 0, activity: '-' });
    return cb({ users: 0, threads: row ? row.cnt : 0, online: 0, activity: '-' });
  });
}

// API: stats
app.get('/api/stats', (req, res) => {
  getStats((stats) => res.json(stats));
});

// API: threads (SQLite-backed)
app.get('/api/threads', (req, res) => {
  db.all('SELECT id, author, title, content, tags, created_at FROM threads ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    const out = rows.map((r) => {
      let tags = [];
      try {
        tags = JSON.parse(r.tags || '[]');
      } catch (e) {
        tags = (r.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
      }
      return {
        id: r.id,
        author: r.author,
        title: r.title,
        excerpt: (r.content || '').slice(0, 220),
        content: r.content,
        tags,
        createdAt: r.created_at,
      };
    });
    res.json(out);
  });
});

// Replies for a thread
app.get('/api/threads/:id/replies', (req, res) => {
  const threadId = Number(req.params.id);
  if (!threadId) return res.status(400).json({ error: 'invalid thread id' });
  db.all('SELECT id, thread_id, author, content, image, created_at FROM replies WHERE thread_id = ? ORDER BY created_at ASC', [threadId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows || []);
  });
});

app.post('/api/threads/:id/replies', (req, res) => {
  const threadId = Number(req.params.id);
  if (!threadId) return res.status(400).json({ error: 'invalid thread id' });
  const { author = 'Anónimo', content, image = '' } = req.body || {};
  if (!content) return res.status(400).json({ error: 'content required' });
  const createdAt = new Date().toISOString();
  db.run('INSERT INTO replies (thread_id, author, content, image, created_at) VALUES (?, ?, ?, ?, ?)', [threadId, author, content, image, createdAt], function (err) {
    if (err) return res.status(500).json({ error: 'db insert error' });
    const reply = { id: this.lastID, thread_id: threadId, author, content, image, created_at: createdAt };
    res.status(201).json(reply);
  });
});

app.post('/api/threads', (req, res) => {
  const { author = 'Anónimo', title, content, tags = [] } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const tagsArray = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean);
  const createdAt = new Date().toISOString();
  const tagsText = JSON.stringify(tagsArray);

  const sql = 'INSERT INTO threads (author, title, content, tags, created_at) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [author, title, content, tagsText, createdAt], function (err) {
    if (err) return res.status(500).json({ error: 'db insert error' });
    const thread = {
      id: this.lastID,
      author,
      title,
      excerpt: content.slice(0, 220),
      content,
      tags: tagsArray,
      createdAt,
    };
    // persist notification to DB
    const noteText = `Nuevo hilo: ${thread.title}`;
    const noteCreated = new Date().toISOString();
    db.run(
      'INSERT INTO notifications (text, time, created_at) VALUES (?, ?, ?)',
      [noteText, 'ahora', noteCreated],
      function (nerr) {
        if (nerr) console.error('notification insert error', nerr);
      }
    );
    res.status(201).json(thread);
  });
});

// API: notifications
app.get('/api/notifications', (req, res) => {
  db.all('SELECT id, text, time, created_at FROM notifications ORDER BY id DESC LIMIT 50', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    const out = rows.map((r) => ({ id: r.id, text: r.text, time: r.time || 'ahora', created_at: r.created_at }));
    res.json(out);
  });
});

app.post('/api/notifications/clear', (req, res) => {
  db.run('DELETE FROM notifications', [], (err) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ ok: true });
  });
});

// API: authentication (simple demo)
app.post('/api/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const createdAt = new Date().toISOString();
  const salt = bcrypt.genSaltSync(8);
  const hash = bcrypt.hashSync(password, salt);
  db.run('INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)', [username, hash, createdAt], function (err) {
    if (err) {
      if (err.message && err.message.includes('UNIQUE')) return res.status(409).json({ error: 'username already exists' });
      return res.status(500).json({ error: 'db error' });
    }
    res.status(201).json({ id: this.lastID, username, created_at: createdAt });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  db.get('SELECT id, username, password_hash FROM users WHERE username = ?', [username], (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!row) return res.status(401).json({ error: 'invalid credentials' });
    const ok = bcrypt.compareSync(password, row.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    res.json({ id: row.id, username: row.username });
  });
});

// Fallback for SPA routes (optional)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`MiChan server listening on http://localhost:${port}`);
});
