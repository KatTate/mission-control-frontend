'use client';

import { Agent } from './AgentCard';

interface AgentSidebarProps {
  agents: Agent[];
  loading: boolean;
  error: Error | null;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
}

const tierBadges: Record<string, { label: string; color: string }> = {
  lead: { label: 'LEAD', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  spec: { label: 'SPC', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  specialist: { label: 'SPC', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  intern: { label: 'INT', color: 'bg-blue-100 text-blue-800 border-blue-300' },
};

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

function getTier(agent: Agent): string {
  const tier = (agent.tier || '').toString().toLowerCase().trim();
  if (tier === 'lead') return 'lead';
  if (tier === 'intern') return 'intern';
  if (tier === 'spec' || tier === 'specialist') return 'spec';
  return tier || 'spec';
}

function formatLastSeen(lastHeartbeat?: string): string {
  if (!lastHeartbeat) return '';
  const d = new Date(lastHeartbeat);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AgentSidebar({
  agents,
  loading,
  error,
  selectedAgentId,
  onSelectAgent,
}: AgentSidebarProps) {
  const activeCount = agents.filter(a => a.status === 'active').length;

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-zinc-200 rounded w-1/2 dark:bg-zinc-700" />
          <div className="h-12 bg-zinc-200 rounded dark:bg-zinc-700" />
          <div className="h-12 bg-zinc-200 rounded dark:bg-zinc-700" />
          <div className="h-12 bg-zinc-200 rounded dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Agents</h2>
          <span className="text-sm text-zinc-500">{agents.length}</span>
        </div>
      </div>

      {/* All Agents option */}
      <button
        onClick={() => onSelectAgent(null)}
        className={`flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 transition-colors ${
          selectedAgentId === null
            ? 'bg-zinc-100 dark:bg-zinc-800'
            : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-sm">
            👥
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm">All Agents</div>
            <div className="text-xs text-zinc-500">{agents.length} total</div>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-xs text-green-600">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>{activeCount} ACTIVE</span>
        </div>
      </button>

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto">
        {agents.map((agent) => {
          const tier = getTier(agent);
          const badge = tierBadges[tier] || tierBadges.spec;
          const isWorking = agent.status === 'active' || agent.currentTaskId;
          const displayName = agent.name || agent.id;
          const displayTitle = agent.title || agent.role;

          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`w-full flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 transition-colors text-left ${
                selectedAgentId === agent.id
                  ? 'bg-zinc-100 dark:bg-zinc-800'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center text-white text-xs font-bold">
                    {agent.id.slice(0, 2).toUpperCase()}
                  </div>
                  {/* Status dot */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950 ${statusColors[agent.status] || statusColors.offline}`} />
                </div>

                {/* Name and role */}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm">{displayName}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 truncate max-w-[160px]">{displayTitle}</div>
                  {agent.workingSummary && (
                    <div className="mt-0.5 text-[11px] text-zinc-500 truncate max-w-[160px]">
                      {agent.workingSummary}
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="text-right">
                {isWorking ? (
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>WORKING</span>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400">{formatLastSeen(agent.lastHeartbeat)}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
