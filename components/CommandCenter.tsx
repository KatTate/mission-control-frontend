'use client';

import { useEffect, useMemo, useState } from 'react';
import useTasks from '@/hooks/useTasks';
import { useAgents } from '@/hooks/useAgents';
import ActivityFeed from '@/components/ActivityFeed';
import type { Task } from '@/components/TaskList';
import useMessages from '@/hooks/useMessages';

type TaskStatus = Task['status'];

const colMeta: Array<{ key: TaskStatus; label: string; pill: string }> = [
  { key: 'todo', label: 'To Do', pill: 'bg-gray-100 text-gray-800 border-gray-300' },
  { key: 'in_progress', label: 'In Progress', pill: 'bg-blue-100 text-blue-800 border-blue-300' },
  { key: 'blocked', label: 'Blocked', pill: 'bg-red-100 text-red-800 border-red-300' },
  { key: 'done', label: 'Done', pill: 'bg-green-100 text-green-800 border-green-300' },
];

function toJsDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value?.toDate === 'function') {
    const d = value.toDate();
    return d instanceof Date && !isNaN(d.getTime()) ? d : null;
  }
  const seconds = value?.seconds ?? value?._seconds;
  if (typeof seconds === 'number') {
    const d = new Date(seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatAgo(value: any): string {
  const d = toJsDate(value);
  if (!d) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

type TaskDetailProps = {
  task: Task;
  messages: any[];
  messagesLoading: boolean;
  messagesError: string | null;
  indexFallback: boolean;
  formatAgo: (value: any) => string;
};

function TaskDetail({ task, messages, messagesLoading, messagesError, indexFallback, formatAgo }: TaskDetailProps) {
  const [nextAction, setNextAction] = useState<string>(task.nextAction ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Keep textarea in sync when selecting a different task
  useEffect(() => {
    setNextAction(task.nextAction ?? '');
    setSaveError(null);
  }, [task.id, task.nextAction]);

  const saveNextAction = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextAction: nextAction.trim() ? nextAction.trim() : null,
          nextActionUpdatedBy: 'd4mon',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update next action');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-bold">{task.title}</div>
        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{task.description || '—'}</div>
        <div className="mt-2 text-xs text-zinc-500">Task ID: {task.id}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">Status</div>
          <div className="font-semibold">{task.status}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">Assigned</div>
          <div className="font-semibold">{task.assignedTo ? `@${task.assignedTo}` : '—'}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">Approval</div>
          {task.approvedToExecute === true ? (
            <div className="font-semibold text-green-700">
              Approved ✅
              <div className="text-xs text-zinc-500">by @{task.approvedBy ?? '—'} • {formatAgo(task.approvedAt)}</div>
            </div>
          ) : (
            <div className="font-semibold">Not approved</div>
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">Updated</div>
          <div className="font-semibold">{formatAgo(task.updatedAt)}</div>
        </div>
      </div>

      <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Next Action</div>
          <div className="text-xs text-zinc-500">
            {task.nextActionUpdatedBy ? `@${task.nextActionUpdatedBy}` : ''}{' '}
            {task.nextActionUpdatedAt ? `• ${formatAgo(task.nextActionUpdatedAt)}` : ''}
          </div>
        </div>
        <textarea
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-zinc-200 bg-white p-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          placeholder="One line: what happens next?"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-red-600">{saveError || ''}</div>
          <button
            onClick={saveNextAction}
            disabled={saving}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-zinc-400"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Thread</div>
          {indexFallback && (
            <div className="text-[11px] text-amber-600">Index pending (using fallback)</div>
          )}
        </div>

        {messagesLoading ? (
          <div className="text-sm text-zinc-500">Loading messages…</div>
        ) : messagesError ? (
          <div className="text-sm text-red-600">{messagesError}</div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-zinc-500">No messages yet.</div>
        ) : (
          <div className="space-y-2">
            {messages.slice(0, 20).map((m: any) => (
              <div key={m.id} className="rounded-md border border-zinc-200 p-2 text-sm dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{m.author ? `@${m.author}` : '—'}</span>
                  <span>{formatAgo(m.createdAt)}</span>
                </div>
                <div className="mt-1 whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommandCenter() {
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { agents, loading: agentsLoading, error: agentsError } = useAgents();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );

  const { messages, loading: messagesLoading, error: messagesError, indexFallback } = useMessages(selectedTaskId);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {
      todo: [],
      in_progress: [],
      blocked: [],
      done: [],
    };
    for (const t of tasks) {
      grouped[t.status]?.push(t);
    }
    return grouped as Record<TaskStatus, Task[]>;
  }, [tasks]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr_360px]">
      {/* Agents rail */}
      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Agents</h2>
        </div>
        {agentsLoading ? (
          <div className="text-sm text-zinc-500">Loading agents…</div>
        ) : agentsError ? (
          <div className="text-sm text-red-600">Error: {agentsError.message}</div>
        ) : (
          <div className="space-y-2">
            {agents.map((a) => (
              <div key={a.id} className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-xs text-zinc-500">{a.status}</div>
                </div>
                <div className="mt-1 text-xs text-zinc-500">{a.role}</div>
                <div className="mt-1 text-xs text-zinc-500">Last: {formatAgo(a.lastHeartbeat)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Kanban queue */}
      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Queue</h2>
          <div className="text-xs text-zinc-500">Kanban (v0)</div>
        </div>

        {tasksLoading ? (
          <div className="text-sm text-zinc-500">Loading tasks…</div>
        ) : tasksError ? (
          <div className="text-sm text-red-600">Error: {tasksError}</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {colMeta.map((c) => (
              <div key={c.key} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold">{c.label}</div>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${c.pill}`}>
                    {tasksByStatus[c.key].length}
                  </span>
                </div>

                <div className="space-y-2">
                  {tasksByStatus[c.key].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className={
                        selectedTaskId === t.id
                          ? 'w-full rounded-md border border-blue-300 bg-blue-50 p-2 text-left text-sm dark:border-blue-800 dark:bg-blue-950'
                          : 'w-full rounded-md border border-zinc-200 bg-white p-2 text-left text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900'
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold leading-snug">{t.title}</div>
                        {t.approvedToExecute === true && (
                          <span
                            className="shrink-0 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-green-50 text-green-700 border-green-200"
                            title={`Approved by ${t.approvedBy ?? '—'} • ${formatAgo(t.approvedAt)}`}
                          >
                            Approved ✅
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                        <span>{t.assignedTo ? `@${t.assignedTo}` : 'Unassigned'}</span>
                        <span>{formatAgo(t.updatedAt)}</span>
                      </div>
                    </button>
                  ))}
                  {tasksByStatus[c.key].length === 0 && (
                    <div className="rounded-md border border-dashed border-zinc-200 p-3 text-xs text-zinc-500 dark:border-zinc-800">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Live feed + detail drawer */}
      <section className="space-y-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Live Feed</h2>
          <ActivityFeed />
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Task Detail</h2>
          {!selectedTask ? (
            <div className="text-sm text-zinc-500">Select a task from the queue.</div>
          ) : (
            <TaskDetail
              task={selectedTask}
              messages={messages}
              messagesLoading={messagesLoading}
              messagesError={messagesError}
              indexFallback={indexFallback}
              formatAgo={formatAgo}
            />
          )}
        </div>
      </section>
    </div>
  );
}
