'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import QuickInput from '@/components/QuickInput';
import { CheckSquare, Square, Clock, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { reminders as initialReminders, Reminder } from '@/lib/mockData';

export default function PersonalPage() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);

  const handleToggleReminder = (id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, completed: !reminder.completed }
          : reminder
      )
    );
  };

  const handleAddReminder = (title: string) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title,
      completed: false,
      priority: 'medium',
    };
    setReminders(prev => [newReminder, ...prev]);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'low':
        return <Clock className="h-4 w-4 text-green-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Due today', isOverdue: false };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', isOverdue: false };
    } else {
      return { text: `Due in ${diffDays} days`, isOverdue: false };
    }
  };

  const completedCount = reminders.filter(r => r.completed).length;
  const pendingCount = reminders.filter(r => !r.completed).length;
  const overdueCount = reminders.filter(r => {
    if (!r.dueDate || r.completed) return false;
    return new Date(r.dueDate) < new Date();
  }).length;

  return (
    <div className="flex-1">
      <Header 
        title="Personal" 
        subtitle="Manage your reminders and personal tasks"
      />
      
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-4">
            <h3 className="text-sm text-muted">Total Items</h3>
            <p className="text-2xl font-semibold text-white">{reminders.length}</p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm text-muted">Pending</h3>
            <p className="text-2xl font-semibold text-yellow-400">{pendingCount}</p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm text-muted">Completed</h3>
            <p className="text-2xl font-semibold text-green-400">{completedCount}</p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm text-muted">Overdue</h3>
            <p className="text-2xl font-semibold text-red-400">{overdueCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Add */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Quick Add</h2>
            <QuickInput
              placeholder="Add a reminder or to-do..."
              onSubmit={handleAddReminder}
            />
          </div>

          {/* Today's Focus */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Today&apos;s Focus</h2>
            <div className="card p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckSquare className="h-5 w-5 text-accent" />
                  <span className="text-white">Complete quarterly review</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Square className="h-5 w-5 text-muted" />
                  <span className="text-muted">Review Dubai property docs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Square className="h-5 w-5 text-muted" />
                  <span className="text-muted">Schedule health checkup</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reminders List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-6">All Reminders</h2>
          <div className="space-y-3">
            {reminders.map(reminder => {
              const dueDateInfo = reminder.dueDate ? formatDueDate(reminder.dueDate) : null;
              
              return (
                <div
                  key={reminder.id}
                  className={clsx(
                    'card p-4 flex items-center space-x-4',
                    reminder.completed && 'opacity-50'
                  )}
                >
                  <button
                    onClick={() => handleToggleReminder(reminder.id)}
                    className="flex-shrink-0"
                  >
                    {reminder.completed ? (
                      <CheckSquare className="h-5 w-5 text-green-400" />
                    ) : (
                      <Square className="h-5 w-5 text-muted hover:text-white transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={clsx(
                      'font-medium',
                      reminder.completed ? 'line-through text-muted' : 'text-white'
                    )}>
                      {reminder.title}
                    </p>
                    {dueDateInfo && (
                      <p className={clsx(
                        'text-xs mt-1',
                        dueDateInfo.isOverdue ? 'text-red-400' : 'text-muted'
                      )}>
                        {dueDateInfo.text}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {getPriorityIcon(reminder.priority)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}