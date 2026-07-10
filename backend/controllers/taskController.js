const { dbRun, dbGet, dbAll } = require('../database/db');

// Helper to fetch a single task with goal info
const fetchTaskWithGoal = async (id) => {
  return await dbGet(`
    SELECT t.*, g.title AS goalTitle, g.period AS goalPeriod
    FROM Task t
    LEFT JOIN Goals g ON t.goalId = g.id
    WHERE t.id = ?
  `, [id]);
};

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await dbAll(`
      SELECT t.*, g.title AS goalTitle, g.period AS goalPeriod
      FROM Task t
      LEFT JOIN Goals g ON t.goalId = g.id
      ORDER BY 
        t.completed ASC,
        CASE WHEN t.dueDate IS NULL OR t.dueDate = '' THEN 1 ELSE 0 END ASC,
        t.dueDate ASC,
        t.createdAt DESC
    `);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, priority, dueDate, goalId } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const taskPriority = priority || 'medium'; // default to medium
    const taskDueDate = dueDate || null;
    const taskGoalId = goalId || null;
    const now = new Date().toISOString();

    const result = await dbRun(`
      INSERT INTO Task (title, completed, priority, dueDate, goalId, createdAt, updatedAt)
      VALUES (?, 0, ?, ?, ?, ?, ?)
    `, [title.trim(), taskPriority, taskDueDate, taskGoalId, now, now]);

    const newTask = await fetchTaskWithGoal(result.lastID);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// PATCH /api/tasks/:id/toggle
exports.toggleTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await dbGet('SELECT completed FROM Task WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newCompleted = task.completed === 1 ? 0 : 1;
    const now = new Date().toISOString();

    await dbRun(`
      UPDATE Task 
      SET completed = ?, updatedAt = ? 
      WHERE id = ?
    `, [newCompleted, now, id]);

    const updatedTask = await fetchTaskWithGoal(id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, priority, dueDate, goalId } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const task = await dbGet('SELECT id FROM Task WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const taskPriority = priority || 'medium';
    const taskDueDate = dueDate || null;
    const taskGoalId = goalId || null;
    const now = new Date().toISOString();

    await dbRun(`
      UPDATE Task 
      SET title = ?, priority = ?, dueDate = ?, goalId = ?, updatedAt = ? 
      WHERE id = ?
    `, [title.trim(), taskPriority, taskDueDate, taskGoalId, now, id]);

    const updatedTask = await fetchTaskWithGoal(id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await dbGet('SELECT id FROM Task WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await dbRun('DELETE FROM Task WHERE id = ?', [id]);
    res.json({ message: 'Task deleted successfully', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
