const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'data.db');
const db = new Database(dbPath);

// ============================================================
// TABELA: settings
// ============================================================
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    type TEXT DEFAULT 'string'
  )
`);

// Domyślne wartości settings
const defaults = [
  ['dashboard_title', 'Homelab Dashboard', 'string'],
  ['search_enabled', 'true', 'boolean'],
  ['theme', 'dark', 'string'],
  ['background_url', '', 'string'],
  ['sidebar_position', 'right', 'string'],
  ['show_footer', 'true', 'boolean'],
];

const insertDefault = db.prepare(
  'INSERT OR IGNORE INTO settings (key, value, type) VALUES (?, ?, ?)'
);

defaults.forEach(row => insertDefault.run(...row));

// ============================================================
// TABELA: widgets (NOWY SCHEMAT Z KOLUMNĄ size)
// ============================================================
db.exec(`
  CREATE TABLE IF NOT EXISTS widgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    config TEXT NOT NULL,
    size TEXT DEFAULT 'medium',  -- <<< DODANO TUTAJ
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
// >>> USUNIĘTO KOD MIGRACYJNY ALTER TABLE

// ============================================================
// SETTINGS: Helper functions
// ============================================================
const getSetting = (key) => {
  const row = db.prepare('SELECT * FROM settings WHERE key = ?').get(key);
  if (!row) return null;
  
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

// ============================================================
// WIDGETS: Helper functions
// ============================================================

/**
 * Pobierz wszystkie widgety posortowane po position
 */
const getAllWidgets = () => {
  const rows = db.prepare('SELECT * FROM widgets ORDER BY position ASC').all();
  return rows.map(row => ({
    ...row,
    config: JSON.parse(row.config),
    // Nie jest już potrzebny fallback `row.size || 'medium'`, 
    // ponieważ baza danych gwarantuje domyślną wartość
  }));
};

/**
 * Pobierz pojedynczy widget po ID
 */
const getWidget = (id) => {
  const row = db.prepare('SELECT * FROM widgets WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    config: JSON.parse(row.config),
    // Nie jest już potrzebny fallback
  };
};

/**
 * Dodaj nowy widget
 */
const createWidget = (type, name, config, position = null, size = 'medium') => {
  // Jeśli position nie podano, ustaw na max + 1
  if (position === null) {
    const maxPos = db.prepare('SELECT MAX(position) as max FROM widgets').get();
    position = (maxPos.max || 0) + 1;
  }
  
  const result = db.prepare(`
    INSERT INTO widgets (type, name, position, config, size)
    VALUES (?, ?, ?, ?, ?)
  `).run(type, name, position, JSON.stringify(config), size);
  
  return getWidget(result.lastInsertRowid);
};

/**
 * Aktualizuj widget
 */
const updateWidget = (id, updates) => {
  console.log('=== updateWidget BACKEND ===');
  console.log('ID:', id);
  console.log('updates:', updates);
  
  const current = getWidget(id);
  if (!current) throw new Error('Widget not found');
  
  console.log('current.size:', current.size);
  
  const { type, name, config, position, size } = updates;
  
  console.log('Extracted size:', size);
  console.log('Will save:', size ?? current.size);
  
  db.prepare(`
    UPDATE widgets
    SET type = ?,
        name = ?,
        config = ?,
        position = ?,
        size = ?
    WHERE id = ?
  `).run(
    type ?? current.type,
    name ?? current.name,
    JSON.stringify(config ?? current.config),
    position ?? current.position,
    size ?? current.size,
    id
  );
  
  const updated = getWidget(id);
  console.log('After UPDATE - updated.size:', updated.size);
  
  return updated;
};

/**
 * Usuń widget
 */
const deleteWidget = (id) => {
  const result = db.prepare('DELETE FROM widgets WHERE id = ?').run(id);
  return result.changes > 0;
};

/**
 * Aktualizuj pozycje wielu widgetów (dla drag-and-drop)
 */
const updateWidgetPositions = (updates) => {
  const stmt = db.prepare('UPDATE widgets SET position = ? WHERE id = ?');
  const transaction = db.transaction((updates) => {
    for (const { id, position } of updates) {
      stmt.run(position, id);
    }
  });
  
  transaction(updates);
};

module.exports = {
  db,
  // Settings
  getSetting,
  setSetting,
  getAllSettings,
  // Widgets
  getAllWidgets,
  getWidget,
  createWidget,
  updateWidget,
  deleteWidget,
  updateWidgetPositions,
};