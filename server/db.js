const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mission-control.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    assignee TEXT DEFAULT '',
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('high', 'medium', 'low')),
    due_date TEXT,
    status TEXT DEFAULT 'backlog' CHECK(status IN ('backlog', 'in-progress', 'review', 'done')),
    position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_board_id ON tasks(board_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
`);

module.exports = db;
