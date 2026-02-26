import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

export default function Column({ id, title, color, tasks, onAddTask, onEditTask }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col w-72 min-w-[288px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h2 className="font-medium text-accent text-sm">{title}</h2>
          <span className="text-xs text-gray-500">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          title="Add task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent mb-3" />

      {/* Column Body */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 rounded-2xl space-y-3 min-h-[200px] transition-all duration-200 ${
          isOver 
            ? 'bg-white/10 ring-1 ring-accent/50' 
            : 'bg-white/[0.02]'
        }`}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onEditTask(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-gray-600 text-xs">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}
