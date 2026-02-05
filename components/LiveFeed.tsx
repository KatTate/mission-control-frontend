'use client';

import { useState } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { formatAgo } from '@/lib/utils';

type FilterTab = 'all' | 'tasks' | 'comments' | 'status';

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'comments', label: 'Comments' },
  { key: 'status', label: 'Status' },
];

interface LiveFeedProps {
  filterByAgentIds?: string[];
}

export default function LiveFeed({ filterByAgentIds }: LiveFeedProps) {
  const { activities, loading, error } = useActivities(50);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredActivities = activities.filter((activity) => {
    if (filterByAgentIds && filterByAgentIds.length > 0) {
      if (!filterByAgentIds.includes(activity.agentId)) return false;
    }
    if (activeTab === 'all') return true;
    if (activeTab === 'tasks') return activity.type?.includes('task');
    if (activeTab === 'comments') return activity.type?.includes('comment') || activity.type?.includes('message');
    if (activeTab === 'status') return activity.type?.includes('status') || activity.type?.includes('heartbeat');
    return true;
  });

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-zinc-200 rounded w-1/3 dark:bg-zinc-700" />
          <div className="h-16 bg-zinc-200 rounded dark:bg-zinc-700" />
          <div className="h-16 bg-zinc-200 rounded dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 text-sm">Error: {error.message}</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">Live Feed</h2>
        
        {/* Filter tabs */}
        <div className="flex space-x-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="text-center text-sm text-zinc-400 py-8">
            No activities to show
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-amber-700 dark:text-amber-500">
                      {activity.agentId}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {activity.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 break-words">
                    {activity.message}
                  </p>
                  {activity.taskId && (
                    <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                      Task: {activity.taskId}
                    </div>
                  )}
                </div>
                <div className="text-xs text-zinc-400 ml-2 whitespace-nowrap">
                  {formatAgo(activity.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
