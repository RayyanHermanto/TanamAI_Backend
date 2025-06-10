const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./predictions.sqlite');

db.serialize(() => {
  // Tambahkan kolom model_type jika belum ada
  db.get("PRAGMA table_info(predictions)", (err, result) => {
    db.all("PRAGMA table_info(predictions)", (err, columns) => {
      const hasModelType = columns.some(col => col.name === 'model_type');
      if (!hasModelType) {
        db.run("ALTER TABLE predictions ADD COLUMN model_type TEXT", (err) => {
          if (err) {
            console.error("❌ Gagal menambahkan kolom model_type:", err.message);
          } else {
            console.log("✅ Kolom model_type berhasil ditambahkan");
          }
        });
      }
    });
  });

  // Create table jika belum ada (harus tetap ada)
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
