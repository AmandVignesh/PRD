import React, { useState, useEffect, useCallback } from 'react';
import { tasksApi, goalsApi } from '../services/api';
import TaskInput from '../components/TaskInput';
import TaskFilters from '../components/TaskFilters';
import TaskList from '../components/TaskList';
import GoalSection from '../components/GoalSection';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all tasks and goals from backend
  const fetchData = useCallback(async (showPageLoader = false) => {
    if (showPageLoader) setLoading(true);
    setError('');
    try {
      const [fetchedTasks, fetchedGoals] = await Promise.all([
        tasksApi.getAll(),
        goalsApi.getAll()
      ]);
      setTasks(fetchedTasks);
      setGoals(fetchedGoals);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to connect to the backend server.');
    } finally {
      if (showPageLoader) setLoading(false);
    }
  }, []);

  // Fetch initial data on mount
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Task Handlers
  const handleCreateTask = async (taskData) => {
    setTasksLoading(true);
    try {
      const newTask = await tasksApi.create(taskData);
      // Optimistically add or just refresh both tasks and goals to keep stats & relationships exact
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create task');
      throw err;
    } finally {
      setTasksLoading(false);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await tasksApi.toggle(id);
      // Toggling affects task status AND goals completion progress, so refresh both
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to toggle task');
      throw err;
    }
  };

  const handleUpdateTask = async (id, updatedData) => {
    try {
      await tasksApi.update(id, updatedData);
      // Updating might link/unlink goals or change status, refresh both
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update task');
      throw err;
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await tasksApi.delete(id);
      // Deleting a task alters goal progress, refresh both
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      throw err;
    }
  };

  // Goal Handlers
  const handleCreateGoal = async (goalData) => {
    try {
      await goalsApi.create(goalData);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create goal');
      throw err;
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await goalsApi.delete(id);
      // Deleting a goal unlinks its tasks, so refresh both tasks & goals
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete goal');
      throw err;
    }
  };

  // Filter logic (done frontend side as per PRD)
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === 'active') return task.completed === 0;
    if (activeFilter === 'completed') return task.completed === 1;
    return true; // 'all'
  });

  // Calculate counts for filters
  const counts = {
    all: tasks.length,
    active: tasks.filter(t => t.completed === 0).length,
    completed: tasks.filter(t => t.completed === 1).length,
  };

  // Stats for the Quick Stats Header Widget
  const totalTasks = tasks.length;
  const completedTasks = counts.completed;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueCount = tasks.filter(t => {
    if (t.completed === 1 || !t.dueDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return t.dueDate < todayStr;
  }).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-medium">Loading Focus Workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Network or General Error banner */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
          <button 
            onClick={() => fetchData(true)} 
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Quick Stats Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/35 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tasks</span>
          <span className="text-2xl font-bold text-slate-200 mt-2">{counts.active}</span>
        </div>
        <div className="bg-slate-900/35 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
          <span className="text-2xl font-bold text-slate-200 mt-2">{counts.completed}</span>
        </div>
        <div className="bg-slate-900/35 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-bold text-slate-200">{completionRate}%</span>
            <span className="text-xs text-indigo-400 font-semibold">Done</span>
          </div>
        </div>
        <div className="bg-slate-900/35 border border-slate-800/70 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Tasks</span>
          <span className={`text-2xl font-bold mt-2 ${overdueCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
            {overdueCount}
          </span>
        </div>
      </div>

      {/* Core Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Workspace (Left 2 Columns on Large Screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fast Task Capture */}
          <TaskInput goals={goals} onCreateTask={handleCreateTask} />

          {/* Filtering */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <TaskFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              counts={counts}
            />
            {counts.completed > 0 && activeFilter === 'completed' && (
              <span className="text-xs text-slate-500 italic">Showing completed assessment milestones</span>
            )}
          </div>

          {/* Task List container */}
          <div className="relative">
            {tasksLoading && (
              <div className="absolute top-2 right-2">
                <svg className="animate-spin h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
            <TaskList
              tasks={filteredTasks}
              goals={goals}
              activeFilter={activeFilter}
              onToggleComplete={handleToggleComplete}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onResetFilter={() => setActiveFilter('all')}
            />
          </div>
        </div>

        {/* Goals Sidebar (Right Column) */}
        <div className="lg:col-span-1">
          <GoalSection
            goals={goals}
            onCreateGoal={handleCreateGoal}
            onDeleteGoal={handleDeleteGoal}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
