'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import TaskColumn from '@/components/TaskColumn';
import TaskDetail from '@/components/TaskDetail';
import { tasks as allTasks, Task } from '@/lib/mockData';

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filters = ['All', 'Tag Markets', 'Bit1', 'BIX', 'Personal'];

  // Filter tasks based on active filter
  const filteredTasks = activeFilter === 'All' 
    ? allTasks 
    : allTasks.filter(task => task.project === activeFilter);

  // Group tasks by status
  const openTasks = filteredTasks.filter(task => task.status === 'open');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const doneTasks = filteredTasks.filter(task => task.status === 'done');

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Task Board" 
        subtitle="Manage tasks across all projects and teams"
      />
      
      <div className="flex-1 p-8">
        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg w-fit">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-accent text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {filter}
              {filter !== 'All' && (
                <span className="ml-2 text-xs bg-gray-600 px-1.5 py-0.5 rounded-full">
                  {allTasks.filter(task => task.project === filter).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <div className="bg-card rounded-lg">
            <TaskColumn
              title="Open"
              status="open"
              tasks={openTasks}
              onTaskClick={handleTaskClick}
            />
          </div>
          
          <div className="bg-card rounded-lg">
            <TaskColumn
              title="In Progress"
              status="in-progress"
              tasks={inProgressTasks}
              onTaskClick={handleTaskClick}
            />
          </div>
          
          <div className="bg-card rounded-lg">
            <TaskColumn
              title="Done"
              status="done"
              tasks={doneTasks}
              onTaskClick={handleTaskClick}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg">
            <h3 className="text-sm text-muted">Total Tasks</h3>
            <p className="text-2xl font-semibold text-white">{filteredTasks.length}</p>
          </div>
          <div className="bg-card p-4 rounded-lg">
            <h3 className="text-sm text-muted">Open</h3>
            <p className="text-2xl font-semibold text-blue-400">{openTasks.length}</p>
          </div>
          <div className="bg-card p-4 rounded-lg">
            <h3 className="text-sm text-muted">In Progress</h3>
            <p className="text-2xl font-semibold text-yellow-400">{inProgressTasks.length}</p>
          </div>
          <div className="bg-card p-4 rounded-lg">
            <h3 className="text-sm text-muted">Completed</h3>
            <p className="text-2xl font-semibold text-green-400">{doneTasks.length}</p>
          </div>
        </div>
      </div>

      {/* Task Detail Slide-over */}
      <TaskDetail
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={handleCloseDetail}
      />
    </div>
  );
}