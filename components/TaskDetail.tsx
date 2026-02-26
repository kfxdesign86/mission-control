'use client';

import { X, Calendar, User, Tag, Clock, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { Task } from '@/lib/mockData';

interface TaskDetailProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetail({ task, isOpen, onClose }: TaskDetailProps) {
  if (!isOpen || !task) return null;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'done':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Slide-over Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border z-50 transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-white">Task Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-full pb-20">
          {/* Title */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {task.title}
            </h3>
            <p className="text-muted">
              {task.description}
            </p>
          </div>

          {/* Status and Priority */}
          <div className="flex space-x-3">
            <span className={clsx(
              'inline-block px-3 py-1 rounded-lg text-sm font-medium border',
              getStatusColor(task.status)
            )}>
              {task.status.replace('-', ' ').toUpperCase()}
            </span>
            <span className={clsx(
              'inline-block px-3 py-1 rounded-lg text-sm font-medium border',
              getPriorityColor(task.priority)
            )}>
              {task.priority.toUpperCase()} PRIORITY
            </span>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted" />
              <div>
                <p className="text-sm text-muted">Assigned to</p>
                <p className="font-medium text-white">{task.assignee}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted" />
              <div>
                <p className="text-sm text-muted">Due date</p>
                <p className="font-medium text-white">{formatDate(task.dueDate)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Tag className="h-4 w-4 text-muted" />
              <div>
                <p className="text-sm text-muted">Project</p>
                <p className="font-medium text-white">{task.project}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div>
              <p className="text-sm text-muted mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button className="w-full btn btn-primary">
              Edit Task
            </button>
            <button className="w-full btn btn-secondary">
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Comment
            </button>
          </div>

          {/* Comments Section */}
          <div className="pt-4 border-t border-border">
            <h4 className="font-medium text-white mb-3">Recent Activity</h4>
            <div className="space-y-3">
              <div className="flex space-x-3">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-xs font-medium">
                  JE
                </div>
                <div>
                  <p className="text-sm text-white">
                    <span className="font-medium">Jared Esguerra</span> created this task
                  </p>
                  <p className="text-xs text-muted">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}