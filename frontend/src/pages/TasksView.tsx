import React from 'react';
import { Lead } from '../types';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  date?: string;
}

interface TasksViewProps {
  leads: Lead[];
  customTasks: Task[];
  newTaskText: string;
  newTaskDate: string;
  onNewTaskTextChange: (value: string) => void;
  onNewTaskDateChange: (value: string) => void;
  onAddTask: (e: React.FormEvent) => void;
  onToggleTask: (id: string) => void;
}

const TasksView: React.FC<TasksViewProps> = ({
  leads,
  customTasks,
  newTaskText,
  newTaskDate,
  onNewTaskTextChange,
  onNewTaskDateChange,
  onAddTask,
  onToggleTask,
}) => {
  const leadTasks: Task[] = leads
    .filter(l => l.nextAction)
    .map(l => ({
      id: `lead-${l._id}`,
      text: `${l.company || l.name}: ${l.nextAction}`,
      completed: false,
      date: l.lastContactedAt
        ? new Date(l.lastContactedAt).toLocaleDateString()
        : undefined,
    }));

  const allTasks: Task[] = [...customTasks, ...leadTasks];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-gray-200">
      {/* Quick Add Task Form */}
      <div className="bg-white dark:bg-[#131929]/40 border border-slate-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-none">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">
          Add Custom Task
        </h3>
        <form onSubmit={onAddTask} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            required
            placeholder="e.g. Schedule meeting, send pricing proposal..."
            value={newTaskText}
            onChange={e => onNewTaskTextChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
          <input
            type="date"
            value={newTaskDate}
            onChange={e => onNewTaskDateChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm whitespace-nowrap cursor-pointer"
          >
            Create Task
          </button>
        </form>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-[#131929]/40 border border-slate-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-none space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
          Active Tasks &amp; Scheduled Actions
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {allTasks.map(task => (
            <div key={task.id} className="flex items-center gap-3.5 py-3 first:pt-1 last:pb-1">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                disabled={task.id.startsWith('lead-')}
                className="w-4 h-4 rounded border-slate-350 text-brand-600 focus:ring-brand-500 dark:border-white/10 dark:bg-slate-950 disabled:opacity-40 cursor-pointer"
                title={
                  task.id.startsWith('lead-')
                    ? 'Next Action can be modified by updating the lead next action'
                    : 'Complete task'
                }
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-semibold truncate ${
                    task.completed
                      ? 'line-through text-slate-400 dark:text-gray-500'
                      : 'text-slate-800 dark:text-gray-200'
                  }`}
                >
                  {task.text}
                </p>
                {task.date && (
                  <span className="text-[9px] text-slate-400 dark:text-gray-500 font-mono mt-0.5 block">
                    📅 Due: {task.date}
                  </span>
                )}
              </div>
              {task.id.startsWith('lead-') && (
                <span className="text-[9px] bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full font-bold">
                  Scheduled action
                </span>
              )}
            </div>
          ))}
          {allTasks.length === 0 && (
            <div className="text-center py-6 text-xs text-gray-500 italic">
              No tasks created.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksView;
