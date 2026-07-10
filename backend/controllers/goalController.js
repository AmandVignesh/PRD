const { dbRun, dbGet, dbAll } = require('../database/db');

// Helper to fetch a single goal with its progress
const fetchGoalWithProgress = async (id) => {
  const row = await dbGet(`
    SELECT 
      g.*,
      COUNT(t.id) AS totalTasks,
      SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) AS completedTasks
    FROM Goals g
    LEFT JOIN Task t ON g.id = t.goalId
    WHERE g.id = ?
    GROUP BY g.id
  `, [id]);

  if (!row) return null;

  const totalTasks = row.totalTasks || 0;
  const completedTasks = row.completedTasks || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    ...row,
    totalTasks,
    completedTasks,
    progress
  };
};

// GET /api/goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await dbAll(`
      SELECT 
        g.*,
        COUNT(t.id) AS totalTasks,
        SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) AS completedTasks
      FROM Goals g
      LEFT JOIN Task t ON g.id = t.goalId
      GROUP BY g.id
      ORDER BY g.createdAt DESC
    `);

    const formattedGoals = goals.map(row => {
      const totalTasks = row.totalTasks || 0;
      const completedTasks = row.completedTasks || 0;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      return {
        id: row.id,
        title: row.title,
        period: row.period,
        createdAt: row.createdAt,
        totalTasks,
        completedTasks,
        progress
      };
    });

    res.json(formattedGoals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

// POST /api/goals
exports.createGoal = async (req, res) => {
  try {
    const { title, period } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Goal title is required.' });
    }

    if (!period || !['week', 'month'].includes(period)) {
      return res.status(400).json({ error: "Goal period must be 'week' or 'month'." });
    }

    const now = new Date().toISOString();

    const result = await dbRun(`
      INSERT INTO Goals (title, period, createdAt)
      VALUES (?, ?, ?)
    `, [title.trim(), period, now]);

    const newGoal = await fetchGoalWithProgress(result.lastID);
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

// PUT /api/goals/:id
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, period } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Goal title is required.' });
    }

    if (!period || !['week', 'month'].includes(period)) {
      return res.status(400).json({ error: "Goal period must be 'week' or 'month'." });
    }

    const goal = await dbGet('SELECT id FROM Goals WHERE id = ?', [id]);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await dbRun(`
      UPDATE Goals 
      SET title = ?, period = ? 
      WHERE id = ?
    `, [title.trim(), period, id]);

    const updatedGoal = await fetchGoalWithProgress(id);
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

// DELETE /api/goals/:id
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await dbGet('SELECT id FROM Goals WHERE id = ?', [id]);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Explicitly unlink tasks to ensure standard SQLite compliance (survive but lose reference)
    await dbRun('UPDATE Task SET goalId = NULL WHERE goalId = ?', [id]);

    // Delete the goal itself
    await dbRun('DELETE FROM Goals WHERE id = ?', [id]);

    res.json({ message: 'Goal deleted successfully', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};
