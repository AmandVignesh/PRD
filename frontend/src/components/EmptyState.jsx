import React from 'react';

export default function EmptyState({ activeFilter, onResetFilter }) {
  const getMessage = () => {
    switch (activeFilter) {
      case 'completed':
        return {
          title: 'No completed tasks yet',
          subtitle: 'Keep working! Once you finish a task, check it off to see it here.',
          icon: (
            <svg className="w-16 h-16 text-slate-600 mb-4 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'active':
        return {
          title: 'All caught up!',
          subtitle: 'No active tasks found. Enjoy the peace, or write down a new task above.',
          icon: (
            <svg className="w-16 h-16 text-emerald-500/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      default:
        return {
          title: 'Your focus dashboard is empty',
          subtitle: 'Start by typing a task above. You can say things like "Write reports tomorrow !high".',
          icon: (
            <svg className="w-16 h-16 text-indigo-500/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
        };
    }
  };

  const content = getMessage();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-2xl">
      {content.icon}
      <h3 className="text-xl font-semibold text-slate-200 mb-2">{content.title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{content.subtitle}</p>
      {activeFilter !== 'all' && (
        <button
          onClick={onResetFilter}
          className="px-4 py-2 text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-all duration-200"
        >
          Show All Tasks
        </button>
      )}
    </div>
  );
}
