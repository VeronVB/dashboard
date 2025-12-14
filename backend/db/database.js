const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'data.db');
const db = new Database(dbPath);

// Inicjalizacja tabeli
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    type TEXT DEFAULT 'string'
  )
`);

// Domyślne wartości (INSERT OR IGNORE = nie nadpisuj istniejących)
const defaults = [
  ['dashboard_title', 'Homelab Dashboard', 'string'],
  ['search_enabled', 'true', 'boolean'],
  ['theme', 'dark', 'string'],
  ['background_url', '', 'string'],
];

const insertDefault = db.prepare(
  'INSERT OR IGNORE INTO settings (key, value, type) VALUES (?, ?, ?)'
);

defaults.forEach(row => insertDefault.run(...row));

// Helper functions
const getSetting = (key) => {
  const row = db.prepare('SELECT * FROM settings WHERE key = ?').get(key);
  if (!row) return null;
  
  // Konwersja typów
  if (row.type === 'boolean') return row.value === 'true';
  if (row.type === 'number') return Number(row.value);
  return row.value;
};

const setSetting = (key, value, type = 'string') => {
  return db.prepare(
    'INSERT OR REPLACE INTO settings (key, value, type) VALUES (?, ?, ?)'
  ).run(key, String(value), type);
};

const getAllSettings = () => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const result = {};
  rows.forEach(row => {
    if (row.type === 'boolean') result[row.key] = row.value === 'true';
    else if (row.type === 'number') result[row.key] = Number(row.value);
    else result[row.key] = row.value;
  });
  return result;
};

module.exports = { db, getSetting, setSetting, getAllSettings };