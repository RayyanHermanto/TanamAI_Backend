const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./predictions.sqlite');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL,
      image_filename TEXT NOT NULL,
      top3 TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
