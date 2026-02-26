import { useState, useEffect, useMemo } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { fetchBoards, fetchTasks, createTask, updateTask, deleteTask } from './api';
import BoardTabs from './components/BoardTabs';
import Column from './components/Column';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'bg-gray-400' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-status-orange' },
  { id: 'review', title: 'Review', color: 'bg-status-purple' },
  { id: 'done', title: 'Done', color: 'bg-status-green' },
];

function StatsBar({ tasks }) {
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const thisWeek = tasks.filter(t => {
      const created = new Date(t.created_at);
      return created >= weekAgo;
    }).length;
    const completion = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, done, inProgress, thisWeek, completion };
  }, [tasks]);

  return (
    <div className="mx-6 my-4 px-6 py-4 rounded-2xl bg-accent/[0.15] border border-accent/30 inline-flex items-center gap-8 w-fit">
      <StatItem value={stats.thisWeek} label="this week" color="text-status-blue" />
      <StatItem value={stats.inProgress} label="in progress" color="text-status-orange" />
      <StatItem value={stats.total} label="total" color="text-white" />
      <StatItem value={`${stats.completion}%`} label="completion" color="text-status-green" />
    </div>
  );
}

function StatItem({ value, label, color }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={`text-2xl font-semibold ${color}`}>{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}

export default function App() {
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [modalTask, setModalTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Load boards on mount
  useEffect(() => {
    fetchBoards().then((data) => {
      setBoards(data);
      if (data.length > 0) setActiveBoard(data[0]);
    });
  }, []);

  // Load tasks when board changes
  useEffect(() => {
    if (!activeBoard) return;
    setLoading(true);
    fetchTasks(activeBoard.id)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [activeBoard]);

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine target column
    let targetColumn = over.id;
    
    // If dropped on another task, get that task's column
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask) {
      targetColumn = overTask.status;
    }

    // Validate column
    if (!COLUMNS.find((c) => c.id === targetColumn)) return;

    if (task.status !== targetColumn) {
      // Optimistic update
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, status: targetColumn } : t
      );
      setTasks(updatedTasks);

      try {
        await updateTask(taskId, { status: targetColumn });
      } catch (err) {
        // Revert on error
        setTasks(tasks);
        console.error('Failed to update task:', err);
      }
    }
  };

  const handleAddTask = (columnId) => {
    setModalTask({
      board_id: activeBoard.id,
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      due_date: '',
      status: columnId,
    });
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setModalTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        const updated = await updateTask(taskData.id, taskData);
        setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await createTask(taskData);
        setTasks([...tasks, created]);
      }
      setIsModalOpen(false);
      setModalTask(null);
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      setIsModalOpen(false);
      setModalTask(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const getTasksByColumn = (columnId) => {
    return tasks.filter((t) => t.status === columnId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h1 className="text-xl font-semibold text-accent tracking-tight">
            Mission Control
          </h1>
          <button
            onClick={() => handleAddTask('backlog')}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl transition-all duration-200"
          >
            New Task
          </button>
        </div>
        
        {/* Stats Bar */}
        <StatsBar tasks={tasks} />
        
        {/* Board Tabs */}
        <BoardTabs
          boards={boards}
          activeBoard={activeBoard}
          onSelect={setActiveBoard}
        />
      </header>

      {/* Board */}
      <main className="flex-1 p-6 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent border-t-transparent"></div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-5">
              {COLUMNS.map((column) => (
                <Column
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  color={column.color}
                  tasks={getTasksByColumn(column.id)}
                  onAddTask={() => handleAddTask(column.id)}
                  onEditTask={handleEditTask}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          task={modalTask}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={() => {
            setIsModalOpen(false);
            setModalTask(null);
          }}
        />
      )}
    </div>
  );
}
