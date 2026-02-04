'use client';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'offline';
  lastHeartbeat?: string; // ISO timestamp
  currentTaskId?: string;
  tasksCompleted?: number;
}

interface AgentCardProps {
  agent: Agent;
}

const statusColors = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

const statusLabels = {
  active: 'Active',
  idle: 'Idle',
  offline: 'Offline',
};

export default function AgentCard({ agent }: AgentCardProps) {
  const heartbeatRelative = agent.lastHeartbeat
    ? formatTimeSince(new Date(agent.lastHeartbeat))
    : 'Unknown';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header: Name + Status */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
            {agent.name || agent.id}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{agent.role}</p>
          <p className="text-xs text-gray-500 mt-1 font-mono">id: {agent.id}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[agent.status]} animate-pulse`} />
          <span className="text-sm font-semibold text-gray-700">
            {statusLabels[agent.status]}
          </span>
        </div>
      </div>

      {/* Required fields: lastHeartbeat + status + currentTaskId */}
      <div className="mb-4 rounded-md border border-zinc-200 bg-zinc-50 p-3">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <Row label="lastHeartbeat" value={agent.lastHeartbeat ? `${heartbeatRelative} (${agent.lastHeartbeat})` : 'null'} />
          <Row label="status" value={agent.status} />
          <Row label="currentTaskId" value={agent.currentTaskId || 'null'} />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
        <div>
          <span className="font-semibold">{agent.tasksCompleted || 0}</span> tasks completed
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">Heartbeat:</span>
          <br />
          <span className="font-medium">{heartbeatRelative}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="text-right font-mono text-xs text-zinc-800 break-all">
        {value}
      </div>
    </div>
  );
}

// Helper: Format time since last activity
function formatTimeSince(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
