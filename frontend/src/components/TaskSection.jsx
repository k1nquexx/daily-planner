import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  Flame,
  Zap,
  Coffee,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

const CATEGORIES = [
  { id: 'GENERAL', label: 'Общее', color: 'bg-slate-700 text-slate-200' },
  { id: 'WORK', label: 'Работа', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  { id: 'STUDY', label: 'Учеба', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  { id: 'HEALTH', label: 'Спорт / Здоровье', color: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
  { id: 'PERSONAL', label: 'Личное', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
];

export default function TaskSection({
  tasks,
  selectedDate,
  onTasksChanged,
  yesterdayIncompleteCount,
  onRolloverYesterday,
}) {
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('GENERAL');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [expandedSubtasks, setExpandedSubtasks] = useState({});
  const [subtaskInputs, setSubtaskInputs] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createTask({
        title: newTitle.trim(),
        priority,
        category,
        targetDate: selectedDate,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
        subtasks: [],
      });
      setNewTitle('');
      setEstimatedMinutes('');
      onTasksChanged();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const willBeCompleted = !task.completed;
      await api.toggleTask(task.id);
      onTasksChanged();

      // If completing task and it was the last active one, fire confetti!
      if (willBeCompleted) {
        const remaining = tasks.filter((t) => t.id !== task.id && !t.completed);
        if (remaining.length === 0) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleToggleSubtask = async (taskId, subtaskId) => {
    try {
      await api.toggleSubtask(taskId, subtaskId);
      onTasksChanged();
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      onTasksChanged();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleAddSubtask = async (task) => {
    const text = subtaskInputs[task.id];
    if (!text || !text.trim()) return;

    const currentSubtasks = task.subtasks || [];
    const updated = [
      ...currentSubtasks.map((s) => ({ title: s.title, completed: s.completed })),
      { title: text.trim(), completed: false },
    ];

    try {
      await api.updateTask(task.id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        targetDate: task.targetDate,
        estimatedMinutes: task.estimatedMinutes,
        subtasks: updated,
      });
      setSubtaskInputs((prev) => ({ ...prev, [task.id]: '' }));
      onTasksChanged();
    } catch (err) {
      console.error('Failed to add subtask:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ACTIVE') return !t.completed;
    if (filter === 'COMPLETED') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Rollover Banner if previous day had leftover tasks */}
      {yesterdayIncompleteCount > 0 && (
        <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Остались незавершенные задачи с прошлого дня ({yesterdayIncompleteCount})
              </p>
              <p className="text-xs text-indigo-300/80">
                Перенести их на сегодня, чтобы ничего не потерять?
              </p>
            </div>
          </div>
          <button
            onClick={onRolloverYesterday}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-md shadow-indigo-600/30"
          >
            <span>Перенести на сегодня</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Quick Add Bar */}
      <form onSubmit={handleCreateTask} className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Что нужно сделать сегодня?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-500 px-3 py-2 border-b border-slate-700/60 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!newTitle.trim() || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/30 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>

        {/* Priority, Time & Category Options */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          {/* Priority toggles */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 mr-1 hidden sm:inline">Приоритет:</span>
            <button
              type="button"
              onClick={() => setPriority('HIGH')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                priority === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Flame className="h-3 w-3" />
              <span>Главное</span>
            </button>
            <button
              type="button"
              onClick={() => setPriority('MEDIUM')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                priority === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Zap className="h-3 w-3" />
              <span>Важно</span>
            </button>
            <button
              type="button"
              onClick={() => setPriority('LOW')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                priority === 'LOW'
                  ? 'bg-slate-700 text-slate-200 border border-slate-600 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Coffee className="h-3 w-3" />
              <span>Рутина</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Category selection */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Time estimate */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-slate-400">
              <Clock className="h-3 w-3" />
              <input
                type="number"
                placeholder="мин"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-10 bg-transparent text-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Progress & Filters Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-white tracking-tight">Список дел</h3>
          <span className="text-xs text-slate-400">
            {completedCount} из {tasks.length} выполнено ({progressPercent}%)
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-2xl p-1 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
              filter === 'ALL' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Все ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
              filter === 'ACTIVE'
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            В процессе ({tasks.length - completedCount})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
              filter === 'COMPLETED'
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Готово ({completedCount})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 p-8 text-center">
            <p className="text-sm text-slate-500">
              {tasks.length === 0
                ? 'План на этот день пуст. Запланируйте пару важных дел выше!'
                : 'Нет задач под выбранный фильтр.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = !!expandedSubtasks[task.id];
            const subtasks = task.subtasks || [];
            const subCompleted = subtasks.filter((s) => s.completed).length;

            return (
              <div
                key={task.id}
                className={`group rounded-2xl border transition-all duration-200 overflow-hidden ${
                  task.completed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700/80 shadow-md'
                }`}
              >
                <div className="p-3.5 flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task)}
                    className="mt-0.5 text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-600 hover:text-indigo-400" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-medium transition-all break-words ${
                          task.completed
                            ? 'line-through text-slate-500'
                            : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority Tag */}
                      {task.priority === 'HIGH' && (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold">
                          <Flame className="h-2.5 w-2.5" />
                          <span>Фокус</span>
                        </span>
                      )}
                      {task.priority === 'MEDIUM' && (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                          <Zap className="h-2.5 w-2.5" />
                          <span>Важно</span>
                        </span>
                      )}

                      {/* Category Tag */}
                      {task.category && task.category !== 'GENERAL' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                          {task.category}
                        </span>
                      )}

                      {/* Estimated time */}
                      {task.estimatedMinutes && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {task.estimatedMinutes} мин
                        </span>
                      )}
                    </div>

                    {/* Subtasks trigger */}
                    {(subtasks.length > 0 || isExpanded) && (
                      <button
                        onClick={() =>
                          setExpandedSubtasks((prev) => ({
                            ...prev,
                            [task.id]: !prev[task.id],
                          }))
                        }
                        className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <span>
                          Подзадачи ({subCompleted}/{subtasks.length})
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        setExpandedSubtasks((prev) => ({
                          ...prev,
                          [task.id]: !prev[task.id],
                        }))
                      }
                      title="Добавить подзадачи"
                      className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      title="Удалить задачу"
                      className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subtasks Accordion */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-slate-950/40 px-4 py-3 space-y-2">
                    {subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => handleToggleSubtask(task.id, sub.id)}
                        className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none py-1"
                      >
                        {sub.completed ? (
                          <CheckSquare className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-600" />
                        )}
                        <span className={sub.completed ? 'line-through text-slate-500' : ''}>
                          {sub.title}
                        </span>
                      </div>
                    ))}

                    {/* New Subtask Input */}
                    <div className="flex items-center gap-2 pt-1.5">
                      <input
                        type="text"
                        placeholder="Добавить подпункт..."
                        value={subtaskInputs[task.id] || ''}
                        onChange={(e) =>
                          setSubtaskInputs((prev) => ({
                            ...prev,
                            [task.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubtask(task);
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSubtask(task)}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        ОК
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
