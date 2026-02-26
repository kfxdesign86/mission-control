const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET /api/boards - list all boards
app.get('/api/boards', (req, res) => {
  try {
    const boards = db.prepare('SELECT * FROM boards ORDER BY id').all();
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/boards/:id/tasks - get tasks for a board
app.get('/api/boards/:id/tasks', (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT * FROM tasks 
      WHERE board_id = ? 
      ORDER BY status, position, created_at
    `).all(req.params.id);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks - create task
app.post('/api/tasks', (req, res) => {
  try {
    const { board_id, title, description, assignee, priority, due_date, status } = req.body;
    
    // Get max position for this status
    const maxPos = db.prepare(`
      SELECT COALESCE(MAX(position), -1) as maxPos 
      FROM tasks WHERE board_id = ? AND status = ?
    `).get(board_id, status || 'backlog');
    
    const result = db.prepare(`
      INSERT INTO tasks (board_id, title, description, assignee, priority, due_date, status, position)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      board_id,
      title,
      description || '',
      assignee || '',
      priority || 'medium',
      due_date || null,
      status || 'backlog',
      maxPos.maxPos + 1
    );
    
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id - update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { title, description, assignee, priority, due_date, status, position } = req.body;
    const taskId = req.params.id;
    
    // Get current task
    const currentTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // If status changed or position changed, handle reordering
    const newStatus = status !== undefined ? status : currentTask.status;
    const newPosition = position !== undefined ? position : currentTask.position;

    if (status !== undefined && status !== currentTask.status) {
      // Moving to new column - get max position
      const maxPos = db.prepare(`
        SELECT COALESCE(MAX(position), -1) as maxPos 
        FROM tasks WHERE board_id = ? AND status = ?
      `).get(currentTask.board_id, newStatus);
      
      db.prepare(`
        UPDATE tasks SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          assignee = COALESCE(?, assignee),
          priority = COALESCE(?, priority),
          due_date = ?,
          status = ?,
          position = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        title, description, assignee, priority, due_date,
        newStatus, position !== undefined ? newPosition : maxPos.maxPos + 1, taskId
      );
    } else {
      db.prepare(`
        UPDATE tasks SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          assignee = COALESCE(?, assignee),
          priority = COALESCE(?, priority),
          due_date = ?,
          status = COALESCE(?, status),
          position = COALESCE(?, position),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(title, description, assignee, priority, due_date, status, position, taskId);
    }
    
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id - delete task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch update positions (for drag-and-drop reordering)
app.put('/api/tasks/reorder', (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, status, position }
    
    const updateStmt = db.prepare(`
      UPDATE tasks SET status = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    
    const transaction = db.transaction((updates) => {
      for (const update of updates) {
        updateStmt.run(update.status, update.position, update.id);
      }
    });
    
    transaction(updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mission Control API running on http://0.0.0.0:${PORT}`);
});
