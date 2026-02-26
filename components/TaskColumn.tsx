'use client';

import { Task } from '@/lib/mockData';
import TaskCard from './TaskCard';
import { clsx } from 'clsx';

interface TaskColumnProps {
  title: string;
  status: 'open' | 'in-progress' | 'done';
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function TaskColumn({ title, status, tasks, onTaskClick }: TaskColumnProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'in-progress':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'done':
        return 'border-green-500/50 bg-green-500/10';
      default:
        return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const getHeaderColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-blue-400';
      case 'in-progress':
        return 'text-yellow-400';
      case 'done':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <h3 className={clsx('font-medium text-sm', getHeaderColor(status))}>
            {title}
          </h3>
          <span className="text-xs text-muted bg-gray-700 px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div className={clsx(
        'flex-1 p-4 min-h-96 rounded-lg border-2 border-dashed m-4',
        getStatusColor(status)
      )}>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center text-muted py-8">
              <p className="text-sm">No tasks in this column</p>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}