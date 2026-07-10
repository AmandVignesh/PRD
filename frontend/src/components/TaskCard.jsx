import React, { useState } from 'react';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

export default function TaskCard({ task, goals, onToggleComplete, onUpdateTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [editGoalId, setEditGoalId] = useState(task.goalId || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to resolve task due date label
  const getDueDateLabel = (dateStr, isCompleted) => {
    if (!dateStr) return null;

    // Get today's local date string
    const todayObj = new Date();
    const todayStr = formatDateLocal(todayObj);

    // Get tomorrow's local date string
    const tomorrowObj = new Date();
    tomorrowObj.setDate(todayObj.getDate() + 1);
    const tomorrowStr = formatDateLocal(tomorrowObj);

    if (dateStr === todayStr) {
      return { text: 'Today', status: 'today' };
    }
    if (dateStr === tomorrowStr) {
      return { text: 'Tomorrow', status: 'tomorrow' };
    }
    
    // Check if overdue (before today and not completed)
    if (dateStr < todayStr && !isCompleted) {
      return { text: 'Overdue', status: 'overdue' };
    }

    // Format other dates as (e.g. Jul 15)
    try {
      const parsedDate = new Date(dateStr + 'T00:00:00');
      const formatted = parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { text: formatted, status: 'future' };
    } catch {
      return { text: dateStr, status: 'future' };
    }
  };

  function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggleComplete(task.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    setIsSaving(true);
    try {
      await onUpdateTask(task.id, {
        title: editTitle.trim(),
        priority: editPriority,
        dueDate: editDueDate || null,
        goalId: editGoalId ? parseInt(editGoalId) : null
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDeleteTask(task.id);
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  const getPriorityBadgeStyles = (p) => {
    switch (p) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getDateBadgeStyles = (status) => {
    switch (status) {
      case 'overdue':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
      case 'today':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'tomorrow':
        return 'bg-slate-800 text-slate-300 border-slate-700/60';
      default:
        return 'bg-slate-900/60 text-slate-400 border-slate-800/80';
    }
  };

  const dateLabel = getDueDateLabel(task.dueDate, task.completed === 1);

  if (isEditing) {
    const goalOptions = [
      { value: '', label: 'None', icon: '🎯' },
      ...goals.map((g) => ({
        value: String(g.id),
        label: `${g.period === 'week' ? 'Weekly' : 'Monthly'}: ${g.title}`,
        icon: g.period === 'week' ? '📅' : '🗓️'
      }))
    ];

    return (
      <div className="relative z-20 bg-slate-900/60 border border-indigo-500/40 rounded-xl p-4 shadow-xl space-y-3.5 transition-all duration-200">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Task Title</label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            disabled={isSaving}
            className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Custom Priority Segmented Control */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Priority</label>
            <div className="flex bg-slate-950/60 p-1 border border-slate-800 rounded-xl space-x-1">
              {['low', 'medium', 'high'].map((p) => {
                const isCurrent = editPriority === p;
                let activeColor = 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40';
                if (isCurrent) {
                  if (p === 'high') activeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-sm';
                  else if (p === 'medium') activeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm';
                  else activeColor = 'bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-sm';
                }

                return (
                  <button
                    key={p}
                    type="button"
                    disabled={isSaving}
                    onClick={() => setEditPriority(p)}
                    className={`flex-1 py-1.5 rounded-lg text-center text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border border-transparent cursor-pointer disabled:opacity-50 ${activeColor}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date with Custom Calendar Picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Due Date</label>
            <CustomDatePicker
              value={editDueDate}
              onChange={setEditDueDate}
              disabled={isSaving}
            />
          </div>

          {/* CustomSelect for Goals */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Goal</label>
            <CustomSelect
              options={goalOptions}
              value={String(editGoalId)}
              onChange={(e) => setEditGoalId(e.target.value)}
              disabled={isSaving}
              placeholder="None"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-1">
          <button
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
            className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !editTitle.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 text-white text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer flex items-center space-x-1"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = task.completed === 1;

  return (
    <div className={`bg-slate-900/30 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-slate-700/80 transition-all duration-200 group ${
      isCompleted ? 'bg-slate-950/20 border-slate-900/60' : ''
    }`}>
      <div className="flex items-center space-x-3.5 flex-1 min-w-0">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`w-5.5 h-5.5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-60 shrink-0 ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-600 hover:border-indigo-500 bg-slate-950/80'
          }`}
        >
          {isCompleted && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Text and badges */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm font-medium line-through-anim truncate leading-snug cursor-pointer select-none ${
                isCompleted ? 'text-slate-500 completed' : 'text-slate-200'
              }`}
              onClick={handleToggle}
            >
              {task.title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            {/* Priority Badge */}
            <span className={`px-2 py-0.5 rounded-md border font-semibold tracking-wide uppercase ${getPriorityBadgeStyles(task.priority)}`}>
              {task.priority || 'medium'}
            </span>

            {/* Date Badge */}
            {dateLabel && (
              <span className={`px-2 py-0.5 rounded-md border font-semibold flex items-center space-x-1 ${getDateBadgeStyles(dateLabel.status)}`}>
                {dateLabel.status === 'overdue' && (
                  <svg className="w-3 h-3 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                <span>{dateLabel.text}</span>
              </span>
            )}

            {/* Goal link Badge */}
            {task.goalId && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 font-semibold truncate max-w-[150px]" title={`Goal: ${task.goalTitle}`}>
                🎯 {task.goalTitle || 'Linked Goal'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => {
            setEditTitle(task.title);
            setEditPriority(task.priority || 'medium');
            setEditDueDate(task.dueDate || '');
            setEditGoalId(task.goalId || '');
            setIsEditing(true);
          }}
          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
          title="Edit Task"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
          title="Delete Task"
        >
          {isDeleting ? (
            <svg className="animate-spin h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
