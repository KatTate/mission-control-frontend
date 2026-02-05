'use client';

import { useMemo } from 'react';
import type { Task } from '@/components/TaskList';
import { formatAgo } from '@/lib/utils';

type TaskStatus = Task['status'];

const colMeta: Array<{ key: TaskStatus; label: string; pill: string }> = [
  { key: 'todo', label: 'To Do', pill: 'bg-gray-100 text-gray-800 border-gray-300' },
  { key: 'in_progress', label: 'In Progress', pill: 'bg-blue-100 text-blue-800 border-blue-300' },
  { key: 'blocked', label: 'Blocked', pill: 'bg-red-100 text-red-800 border-red-300' },
  { key: 'done', label: 'Done', pill: 'bg-green-100 text-green-800 border-green-300' },
];

interface MissionQueueProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  filterByAgentId?: string | null;
}

export default function MissionQueue({
  tasks,
  loading,
  error,
  selectedTaskId,
  onSelectTask,
  filterByAgentId,
}: MissionQueueProps) {
  const filteredTasks = useMemo(() => {
    if (!filterByAgentId) return tasks;
    return tasks.filter(t => t.assignedTo === filterByAgentId);
  }, [tasks, filterByAgentId]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {
      todo: [],
      in_progress: [],
      blocked: [],
      done: [],
    };
    for (const t of filteredTasks) {
      grouped[t.status]?.push(t);
    }
    return grouped as Record<TaskStatus, Task[]>;
  }, [filteredTasks]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-zinc-200 rounded w-1/4 dark:bg-zinc-700" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-zinc-200 rounded dark:bg-zinc-700" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">Error: {error}</div>
    );
  }

  return (
    <div className="p-4">
      {/* Queue header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          {filterByAgentId ? `${filterByAgentId.toUpperCase()}'S TASKS` : 'MISSION QUEUE'}
        </h2>
        <div className="text-xs text-zinc-500">
          {filteredTasks.length} tasks
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {colMeta.map((col) => (
          <div key={col.key} className="bg-zinc-100/50 dark:bg-zinc-900/50 rounded-lg p-3">
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${col.key === 'todo' ? 'bg-gray-400' : col.key === 'in_progress' ? 'bg-blue-500' : col.key === 'blocked' ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{col.label}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${col.pill}`}>
                {tasksByStatus[col.key].length}
              </span>
            </div>

            {/* Task cards */}
            <div className="space-y-2">
              {tasksByStatus[col.key].map((task) => (
                <button
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className={`w-full text-left rounded-lg border p-3 transition-all ${
                    selectedTaskId === task.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 shadow-sm'
                      : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 hover:shadow-md hover:border-zinc-300'
                  }`}
                >
                  {/* Task title */}
                  <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-snug mb-2">
                    {task.title}
                  </div>

                  {/* Task meta */}
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-mono">
                      {task.assignedTo ? `@${task.assignedTo}` : 'Unassigned'}
                    </span>
                    <span>{formatAgo(task.updatedAt)}</span>
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] text-zinc-600 dark:text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Approval badge */}
                  {task.approvedToExecute && (
                    <div className="mt-2 text-xs text-green-600 font-medium">
                      ✅ Approved
                    </div>
                  )}
                </button>
              ))}

              {tasksByStatus[col.key].length === 0 && (
                <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-4 text-center text-xs text-zinc-400">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
