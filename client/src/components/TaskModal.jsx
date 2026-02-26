import { useState, useEffect } from 'react';

export default function TaskModal({ task, onSave, onDelete, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    due_date: '',
    status: 'backlog',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        due_date: task.due_date || '',
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isEditing = !!task?.id;

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all duration-200";
  const labelClasses = "block text-sm font-medium text-gray-400 mb-2";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className={labelClasses}>
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={inputClasses}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClasses}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`${inputClasses} resize-none`}
              placeholder="Add more details..."
            />
          </div>

          {/* Assignee & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                Assignee
              </label>
              <input
                type="text"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Who?"
              />
            </div>
            <div>
              <label className={labelClasses}>
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="backlog">Backlog</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {isEditing ? (
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
              >
                Delete
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-all duration-200"
              >
                {isEditing ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
