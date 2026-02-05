'use client';

import { useState } from 'react';
import Header from './Header';
import AgentSidebar from './AgentSidebar';
import { useAgents } from '@/hooks/useAgents';
import useTasks from '@/hooks/useTasks';

interface DashboardLayoutProps {
  children: React.ReactNode;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
}

export default function DashboardLayout({
  children,
  selectedAgentId,
  onSelectAgent,
}: DashboardLayoutProps) {
  const { agents, loading: agentsLoading, error: agentsError } = useAgents();
  const { tasks } = useTasks();
  const [showMobileAgents, setShowMobileAgents] = useState(false);

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const tasksInQueue = tasks.filter(t => t.status !== 'done').length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
      {/* Header */}
      <Header
        agentsActive={activeAgents}
        agentsTotal={agents.length}
        tasksInQueue={tasksInQueue}
        projectName="SiteGPT"
        onChatClick={() => console.log('Chat clicked')}
        onBroadcastClick={() => console.log('Broadcast clicked')}
        onDocsClick={() => console.log('Docs clicked')}
      />

      {/* Mobile agent toggle */}
      <div className="lg:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <button
          onClick={() => setShowMobileAgents(!showMobileAgents)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold">Agents</span>
            <span className="text-xs text-zinc-500">({agents.length})</span>
          </div>
          <span className="text-zinc-400">{showMobileAgents ? '▲' : '▼'}</span>
        </button>
        {showMobileAgents && (
          <div className="max-h-64 overflow-y-auto border-t border-zinc-200 dark:border-zinc-800">
            <AgentSidebar
              agents={agents}
              loading={agentsLoading}
              error={agentsError}
              selectedAgentId={selectedAgentId}
              onSelectAgent={(id) => {
                onSelectAgent(id);
                setShowMobileAgents(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Agent sidebar - desktop */}
        <aside className="hidden lg:block w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <AgentSidebar
            agents={agents}
            loading={agentsLoading}
            error={agentsError}
            selectedAgentId={selectedAgentId}
            onSelectAgent={onSelectAgent}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
