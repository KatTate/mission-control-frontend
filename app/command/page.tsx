'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MissionQueue from '@/components/MissionQueue';
import LiveFeed from '@/components/LiveFeed';
import TaskDetailDrawer from '@/components/TaskDetailDrawer';
import useTasks from '@/hooks/useTasks';

export default function CommandPage() {
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowTaskDetail(true);
  };

  return (
    <DashboardLayout
      selectedAgentId={selectedAgentId}
      onSelectAgent={setSelectedAgentId}
    >
      <div className="flex h-[calc(100vh-64px)]">
        {/* Mission Queue - main area */}
        <div className="flex-1 overflow-auto">
          <MissionQueue
            tasks={tasks}
            loading={tasksLoading}
            error={tasksError}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectTask}
            filterByAgentId={selectedAgentId}
          />
        </div>

        {/* Right panel - Live Feed (desktop only) */}
        <div className="hidden xl:block w-96 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <LiveFeed filterByAgentIds={selectedAgentId ? [selectedAgentId] : undefined} />
        </div>
      </div>

      {/* Task Detail Drawer - works on all screen sizes */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={showTaskDetail}
        onClose={() => setShowTaskDetail(false)}
      />
    </DashboardLayout>
  );
}
