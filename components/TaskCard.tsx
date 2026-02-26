'use client';

import { Calendar, User, Tag } from 'lucide-react';
import { clsx } from 'clsx';
import { Task } from '@/lib/mockData';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getProjectColor = (project: string) => {
    switch (project) {
      case 'Tag Markets':
        return 'bg-accent/20 text-accent';
      case 'Bit1':
        return 'bg-blue-500/20 text-blue-400';
      case 'BIX':
        return 'bg-green-500/20 text-green-400';
      case 'Personal':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date();

  return (
    <div 
      className="card p-4 hover:bg-card/80 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={clsx(
          'inline-block px-2 py-1 rounded text-xs font-medium border',
          getPriorityColor(task.priority)
        )}>
          {task.priority.toUpperCase()}
        </span>
        
        <span className={clsx(
          'inline-block px-2 py-1 rounded text-xs font-medium',
          getProjectColor(task.project)
        )}>
          {task.project}
        </span>
      </div>

      {/* Title and Description */}
      <h3 className="font-medium text-white mb-2 group-hover:text-accent transition-colors">
        {task.title}
      </h3>
      <p className="text-sm text-muted mb-4 line-clamp-2">
        {task.description}
      </p>

      {/* Metadata */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs text-muted">
          <User className="h-3 w-3" />
          <span>{task.assignee}</span>
        </div>
        
        <div className={clsx(
          'flex items-center space-x-2 text-xs',
          isOverdue ? 'text-red-400' : 'text-muted'
        )}>
          <Calendar className="h-3 w-3" />
          <span>{formatDate(task.dueDate)}</span>
        </div>

        {task.tags.length > 0 && (
          <div className="flex items-center space-x-1 mt-3">
            <Tag className="h-3 w-3 text-muted" />
            <div className="flex flex-wrap gap-1">
              {task.tags.map(tag => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}