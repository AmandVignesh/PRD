import React, { useState } from 'react';
import CustomSelect from './CustomSelect';

export default function GoalSection({ goals, onCreateGoal, onDeleteGoal, loading }) {
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('week');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      await onCreateGoal({ title: title.trim(), period });
      setTitle('');
    } catch (err) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group goals by period
  const weeklyGoals = goals.filter(g => g.period === 'week');
  const monthlyGoals = goals.filter(g => g.period === 'month');

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-2xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Focus Goals</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Set big picture targets and track associated tasks</p>
      </div>

      {/* Goal Creator Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Add a new goal..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 text-sm transition-all duration-200"
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <CustomSelect
              options={[
                { value: 'week', label: 'Weekly Goal', icon: '📅' },
                { value: 'month', label: 'Monthly Goal', icon: '🗓️' }
              ]}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              disabled={isSubmitting}
              placeholder="Select Period"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 disabled:text-slate-500 text-white font-semibold rounded-xl text-xs transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <span>Add Goal</span>
            )}
          </button>
        </div>
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      </form>

      {/* Goal Lists */}
      <div className="space-y-6">
        {/* Weekly Goals Section */}
        <div>
          <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Weekly Goals</h3>
          {weeklyGoals.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-950/20 border border-slate-900 rounded-xl">No weekly goals set.</p>
          ) : (
            <div className="space-y-3">
              {weeklyGoals.map(goal => (
                <GoalCard key={goal.id} goal={goal} onDelete={onDeleteGoal} />
              ))}
            </div>
          )}
        </div>

        {/* Monthly Goals Section */}
        <div>
          <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Monthly Goals</h3>
          {monthlyGoals.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-950/20 border border-slate-900 rounded-xl">No monthly goals set.</p>
          ) : (
            <div className="space-y-3">
              {monthlyGoals.map(goal => (
                <GoalCard key={goal.id} goal={goal} onDelete={onDeleteGoal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GoalCard({ goal, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(goal.id);
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  const getProgressColor = (percent) => {
    if (percent === 100) return 'from-emerald-500 to-teal-500';
    if (percent >= 50) return 'from-indigo-500 to-purple-500';
    if (percent > 0) return 'from-blue-500 to-indigo-500';
    return 'from-slate-700 to-slate-600';
  };

  return (
    <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 hover:border-slate-700/80 transition-all duration-200 group">
      <div className="flex justify-between items-start gap-4 mb-2">
        <h4 className="text-sm font-semibold text-slate-200 line-clamp-2 leading-snug">{goal.title}</h4>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-900 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
          title="Delete Goal"
        >
          {isDeleting ? (
            <svg className="animate-spin h-3.5 w-3.5 text-rose-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Progress info */}
      <div className="flex justify-between items-center text-xs text-slate-400 mt-2 mb-1.5 font-medium">
        <span>
          {goal.totalTasks > 0 ? (
            `${goal.completedTasks} / ${goal.totalTasks} completed`
          ) : (
            'No tasks attached'
          )}
        </span>
        <span className={goal.progress === 100 ? 'text-emerald-400 font-bold' : ''}>
          {goal.progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor(goal.progress)} transition-all duration-500 ease-out`}
          style={{ width: `${goal.progress}%` }}
        />
      </div>
    </div>
  );
}
