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
// TABELA: tabs (NOWA)
// ============================================================
db.exec(`
  CREATE TABLE IF NOT EXISTS tabs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
  )
`);

// Dodaj domyślną zakładkę "Home", jeśli tabela jest pusta
const checkTabs = db.prepare('SELECT count(*) as count FROM tabs').get();
if (checkTabs.count === 0) {
  db.prepare('INSERT INTO tabs (name, order_index) VALUES (?, ?)').run('Główny', 0);
}

// ============================================================
// TABELA: widgets (ZAKTUALIZOWANA o tab_id)
// ============================================================
db.exec(`
  CREATE TABLE IF NOT EXISTS widgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tab_id INTEGER DEFAULT 1, -- <<< FK do tabs
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    config TEXT NOT NULL,
    size TEXT DEFAULT 'medium',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tab_id) REFERENCES tabs(id) ON DELETE CASCADE
  )
`);

// ============================================================
// SETTINGS FUNCTIONS
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
// TABS FUNCTIONS (NOWE)
// ============================================================

const getAllTabs = () => {
  return db.prepare('SELECT * FROM tabs ORDER BY order_index ASC').all();
};

const createTab = (name) => {
  const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM tabs').get();
  const nextOrder = (maxOrder.max || 0) + 1;
  const res = db.prepare('INSERT INTO tabs (name, order_index) VALUES (?, ?)').run(name, nextOrder);
  return { id: res.lastInsertRowid, name, order_index: nextOrder };
};

const updateTab = (id, name) => {
  db.prepare('UPDATE tabs SET name = ? WHERE id = ?').run(name, id);
  return { id, name };
};

const deleteTab = (id) => {
  // SQLite z ON DELETE CASCADE usunie widgety automatycznie, ale dla pewności w better-sqlite3:
  // Wymaga włączenia PRAGMA foreign_keys = ON; w sesji, albo ręcznego usuwania.
  // Zrobimy ręcznie dla bezpieczeństwa:
  const trans = db.transaction(() => {
    db.prepare('DELETE FROM widgets WHERE tab_id = ?').run(id);
    db.prepare('DELETE FROM tabs WHERE id = ?').run(id);
  });
  trans();
  return true;
};

// ============================================================
// WIDGETS FUNCTIONS
// ============================================================

const getAllWidgets = () => {
  const rows = db.prepare('SELECT * FROM widgets ORDER BY position ASC').all();
  return rows.map(row => ({
    ...row,
    config: JSON.parse(row.config),
  }));
};

const getWidget = (id) => {
  const row = db.prepare('SELECT * FROM widgets WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    config: JSON.parse(row.config),
  };
};

const createWidget = (type, name, config, tab_id = 1, position = null, size = 'medium') => {
  if (position === null) {
    // Max position W RAMACH DANEJ ZAKŁADKI
    const maxPos = db.prepare('SELECT MAX(position) as max FROM widgets WHERE tab_id = ?').get(tab_id);
    position = (maxPos.max || 0) + 1;
  }
  
  const result = db.prepare(`
    INSERT INTO widgets (type, name, config, tab_id, position, size)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(type, name, JSON.stringify(config), tab_id, position, size);
  
  return getWidget(result.lastInsertRowid);
};

const updateWidget = (id, updates) => {
  const current = getWidget(id);
  if (!current) throw new Error('Widget not found');
  
  const { type, name, config, position, size, tab_id } = updates;
  
  db.prepare(`
    UPDATE widgets
    SET type = ?, name = ?, config = ?, position = ?, size = ?, tab_id = ?
    WHERE id = ?
  `).run(
    type ?? current.type,
    name ?? current.name,
    JSON.stringify(config ?? current.config),
    position ?? current.position,
    size ?? current.size,
    tab_id ?? current.tab_id,
    id
  );
  
  return getWidget(id);
};

const deleteWidget = (id) => {
  const result = db.prepare('DELETE FROM widgets WHERE id = ?').run(id);
  return result.changes > 0;
};

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
  getSetting, setSetting, getAllSettings,
  getAllTabs, createTab, updateTab, deleteTab, // Export tabs logic
  getAllWidgets, getWidget, createWidget, updateWidget, deleteWidget, updateWidgetPositions,
};