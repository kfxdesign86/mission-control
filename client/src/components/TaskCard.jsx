import { useDraggable } from '@dnd-kit/core';

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

export default function TaskCard({ task, onClick, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = () => {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`glass glass-hover rounded-xl p-4 cursor-pointer transition-all duration-200 ${
        isDragging ? 'opacity-80 scale-105 ring-1 ring-accent' : ''
      }`}
    >
      {/* Priority indicator & Title */}
      <div className="flex items-start gap-3 mb-2">
        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${priorityColors[task.priority]}`} />
        <h3 className="font-medium text-white text-sm leading-relaxed flex-1">{task.title}</h3>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-gray-500 text-xs mb-3 line-clamp-2 ml-4">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between ml-4">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{task.assignee}</span>
            </div>
          )}
        </div>
        {task.due_date && (
          <div
            className={`flex items-center gap-1.5 text-xs ${
              isOverdue() ? 'text-red-400' : 'text-gray-500'
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(task.due_date)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
