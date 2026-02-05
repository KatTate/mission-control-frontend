'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@/components/TaskList';
import useMessages from '@/hooks/useMessages';
import { formatAgo } from '@/lib/utils';

interface Message {
  id: string;
  author?: string;
  content: string;
  createdAt?: string | Date;
}

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetailDrawer({ task, isOpen, onClose }: TaskDetailDrawerProps) {
  const { messages, loading: messagesLoading, error: messagesError } = useMessages(task?.id ?? null);
  const [nextAction, setNextAction] = useState(task?.nextAction ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNextAction(task?.nextAction ?? '');
  }, [task?.id, task?.nextAction]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const saveNextAction = async () => {
    if (!task) return;
    setSaving(true);
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextAction: nextAction.trim() || null }),
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zinc-950 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back
          </button>
          <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 uppercase">
            {task.status.replace('_', ' ')}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {task.title}
            </h2>
            {task.description && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {task.description}
              </p>
            )}
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Assigned To</div>
              <div className="font-semibold font-mono">{task.assignedTo ? `@${task.assignedTo}` : '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Priority</div>
              <div className="font-semibold capitalize">{task.priority}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Updated</div>
              <div className="font-semibold">{formatAgo(task.updatedAt)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Created</div>
              <div className="font-semibold">{formatAgo(task.createdAt)}</div>
            </div>
          </div>

          {/* Approval status */}
          {task.approvedToExecute && (
            <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-sm font-semibold text-green-800 dark:text-green-400">
                ✅ Approved to Execute
              </div>
              <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                by @{task.approvedBy ?? '—'} • {formatAgo(task.approvedAt)}
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Tags</div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next Action */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Next Action</div>
            <textarea
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              rows={3}
              placeholder="What happens next?"
              className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-2 text-sm resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={saveNextAction}
                disabled={saving}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Thread */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
              Thread ({messages.length})
            </div>
            {messagesLoading ? (
              <div className="text-sm text-zinc-400">Loading...</div>
            ) : messagesError ? (
              <div className="text-sm text-red-500">{messagesError}</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-zinc-400">No messages yet.</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(messages as Message[]).map((msg) => (
                  <div key={msg.id} className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded text-sm">
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                      <span className="font-mono">@{msg.author || '—'}</span>
                      <span>{formatAgo(msg.createdAt)}</span>
                    </div>
                    <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
