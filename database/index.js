const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'michan.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite open error:', err);
    return;
  }
  console.log('Opened SQLite database at', dbPath);
});

function ensureColumn(table, column, definition) {
  db.all(`PRAGMA table_info(${table})`, (err, rows) => {
    if (err) {
      console.error(`Failed to validate column ${column} in ${table}:`, err);
      return;
    }
    const exists = Array.isArray(rows) && rows.some((row) => row.name === column);
    if (!exists) {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (alterErr) => {
        if (alterErr) {
          console.error(`Failed to add column ${column} to ${table}:`, alterErr);
        } else {
          console.log(`Added missing column ${column} to ${table}`);
        }
      });
    }
  });
}

function migrate() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password_hash TEXT,
        display_name TEXT,
        bio TEXT,
        course TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'user',
        created_at TEXT,
        threads_count INTEGER DEFAULT 0,
        replies_count INTEGER DEFAULT 0
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS threads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT,
        author_id INTEGER,
        title TEXT,
        content TEXT,
        tags TEXT,
        image_url TEXT,
        created_at TEXT,
        FOREIGN KEY(author_id) REFERENCES users(id)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id INTEGER,
        author TEXT,
        author_id INTEGER,
        content TEXT,
        image TEXT,
        created_at TEXT,
        FOREIGN KEY(thread_id) REFERENCES threads(id),
        FOREIGN KEY(author_id) REFERENCES users(id)
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
      `CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        token TEXT UNIQUE,
        created_at TEXT,
        expires_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_a INTEGER,
        user_b INTEGER,
        created_at TEXT,
        FOREIGN KEY(user_a) REFERENCES users(id),
        FOREIGN KEY(user_b) REFERENCES users(id)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER,
        sender_id INTEGER,
        content TEXT,
        created_at TEXT,
        read_at TEXT,
        FOREIGN KEY(conversation_id) REFERENCES conversations(id),
        FOREIGN KEY(sender_id) REFERENCES users(id)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        type TEXT,
        event_date TEXT,
        created_by INTEGER,
        created_at TEXT,
        FOREIGN KEY(created_by) REFERENCES users(id)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        thread_id INTEGER,
        created_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(thread_id) REFERENCES threads(id)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_id INTEGER,
        target_type TEXT,
        target_id INTEGER,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT,
        FOREIGN KEY(reporter_id) REFERENCES users(id)
      )`
    );

    // Add missing columns for existing databases.
    ensureColumn('users', 'display_name', 'TEXT');
    ensureColumn('users', 'bio', 'TEXT');
    ensureColumn('users', 'course', 'TEXT');
    ensureColumn('users', 'avatar_url', 'TEXT');
    ensureColumn('users', 'role', "TEXT DEFAULT 'user'");
    ensureColumn('users', 'threads_count', 'INTEGER DEFAULT 0');
    ensureColumn('users', 'replies_count', 'INTEGER DEFAULT 0');
    ensureColumn('threads', 'image_url', 'TEXT');
    ensureColumn('threads', 'author_id', 'INTEGER');
    ensureColumn('replies', 'author_id', 'INTEGER');
  });
}

migrate();

module.exports = { db };
