import React from 'react';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

export default function TaskList({ tasks, goals, activeFilter, onToggleComplete, onUpdateTask, onDeleteTask, onResetFilter }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        activeFilter={activeFilter}
        onResetFilter={onResetFilter}
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          goals={goals}
          onToggleComplete={onToggleComplete}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
}
