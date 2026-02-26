const API_BASE = '/api';

export async function fetchBoards() {
  const res = await fetch(`${API_BASE}/boards`);
  if (!res.ok) throw new Error('Failed to fetch boards');
  return res.json();
}

export async function fetchTasks(boardId) {
  const res = await fetch(`${API_BASE}/boards/${boardId}/tasks`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(task) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTask(id, updates) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
}

export async function reorderTasks(updates) {
  const res = await fetch(`${API_BASE}/tasks/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });
  if (!res.ok) throw new Error('Failed to reorder tasks');
  return res.json();
}
