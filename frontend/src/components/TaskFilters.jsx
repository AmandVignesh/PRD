import React from 'react';

export default function TaskFilters({ activeFilter, onFilterChange, counts = { all: 0, active: 0, completed: 0 } }) {
  const filters = [
    { id: 'all', label: 'All Tasks', count: counts.all },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="flex space-x-1.5 p-1 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl max-w-md">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span>{filter.label}</span>
            <span
              className={`flex items-center justify-center text-xs px-2 py-0.5 rounded-full font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-900 text-slate-400 group-hover:bg-slate-800'
              }`}
            >
              {filter.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
