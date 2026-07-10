import React, { useState, useEffect } from 'react';
import { parseTaskInput } from '../utils/taskParser';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

export default function TaskInput({ goals, onCreateTask }) {
  const [rawInput, setRawInput] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [goalId, setGoalId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Live NLP parsing preview
  const [nlpPreview, setNlpPreview] = useState(null);

  useEffect(() => {
    if (rawInput.trim()) {
      const parsed = parseTaskInput(rawInput);
      if (parsed.dueDate || parsed.priority) {
        setNlpPreview(parsed);
      } else {
        setNlpPreview(null);
      }
    } else {
      setNlpPreview(null);
    }
  }, [rawInput]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!rawInput.trim()) return;

    setIsSubmitting(true);
    setError('');

    const parsed = parseTaskInput(rawInput);

    const finalTitle = parsed.title || rawInput.trim();
    const finalDueDate = parsed.dueDate || dueDate || null;
    const finalPriority = parsed.priority || priority || 'medium';
    const finalGoalId = goalId ? parseInt(goalId) : null;

    try {
      await onCreateTask({
        title: finalTitle,
        dueDate: finalDueDate,
        priority: finalPriority,
        goalId: finalGoalId
      });
      
      // Reset form
      setRawInput('');
      setPriority('medium');
      setDueDate('');
      setGoalId('');
      setNlpPreview(null);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getPriorityLabel = (p) => {
    switch (p) {
      case 'high': return '🔴 High';
      case 'medium': return '🟡 Medium';
      case 'low': return '🔵 Low';
      default: return p;
    }
  };

  // Convert goals to CustomSelect options format
  const goalOptions = [
    { value: '', label: 'No Associated Goal', icon: '🎯' },
    ...goals.map((g) => ({
      value: String(g.id),
      label: `${g.period === 'week' ? 'Weekly' : 'Monthly'}: ${g.title}`,
      icon: g.period === 'week' ? '📅' : '🗓️'
    }))
  ];

  // Auto-detected or manually chosen priority to highlight in segmented control
  const activePriority = (nlpPreview && nlpPreview.priority) ? nlpPreview.priority : priority;
  const isPriorityLocked = !!(nlpPreview && nlpPreview.priority);

  // Auto-detected or manually chosen due date for calendar pre-fill
  const activeDueDate = (nlpPreview && nlpPreview.dueDate) ? nlpPreview.dueDate : dueDate;
  const isDateLocked = !!(nlpPreview && nlpPreview.dueDate);

  return (
    <div className="relative z-30 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-2xl space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fast capture text input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Type a task and press Enter... (e.g. 'Call dentist friday !high')"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            className="w-full pl-4 pr-12 py-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 text-base transition-all duration-200"
          />
          <button
            type="submit"
            disabled={isSubmitting || !rawInput.trim()}
            className="absolute right-2 top-2 p-2 text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 transition-colors cursor-pointer"
            title="Save Task"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>

        {/* NLP Auto-Detection Preview */}
        {nlpPreview && (
          <div className="flex flex-wrap items-center gap-2 p-2.5 bg-indigo-500/5 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 animate-fadeIn">
            <span className="font-semibold flex items-center space-x-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Auto-detected:</span>
            </span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
              Title: "{nlpPreview.title}"
            </span>
            {nlpPreview.dueDate && (
              <span className="px-2 py-0.5 bg-indigo-950/50 border border-indigo-800/50 rounded font-medium">
                📅 {nlpPreview.dueDate}
              </span>
            )}
            {nlpPreview.priority && (
              <span className="px-2 py-0.5 bg-indigo-950/50 border border-indigo-800/50 rounded font-medium">
                {getPriorityLabel(nlpPreview.priority)}
              </span>
            )}
          </div>
        )}

        {/* Manual Options Drawer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Custom Segmented Control for Priority */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Priority</label>
            <div className="flex bg-slate-950/60 p-1 border border-slate-800 rounded-xl space-x-1">
              {['low', 'medium', 'high'].map((p) => {
                const isCurrent = activePriority === p;
                
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
                    disabled={isSubmitting || isPriorityLocked}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-lg text-center text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${activeColor}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date Custom Calendar Picker */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Due Date</label>
            <CustomDatePicker
              value={activeDueDate}
              onChange={setDueDate}
              disabled={isSubmitting || isDateLocked}
            />
          </div>

          {/* Goal Link Select */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Link to Goal</label>
            <CustomSelect
              options={goalOptions}
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              disabled={isSubmitting}
              placeholder="No Associated Goal"
            />
          </div>
        </div>

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      </form>
    </div>
  );
}
