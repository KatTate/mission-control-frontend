'use client';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'offline';
  lastSeen?: string; // ISO timestamp
  currentTask?: string;
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
  const timeSince = agent.lastSeen 
    ? formatTimeSince(new Date(agent.lastSeen))
    : 'Unknown';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header: Name + Status */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
            {agent.id}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{agent.role}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[agent.status]} animate-pulse`} />
          <span className="text-sm font-semibold text-gray-700">
            {statusLabels[agent.status]}
          </span>
        </div>
      </div>

      {/* Current Task (if active) */}
      {agent.currentTask && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm font-semibold text-blue-900">Current Task:</p>
          <p className="text-sm text-blue-700 mt-1">{agent.currentTask}</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
        <div>
          <span className="font-semibold">{agent.tasksCompleted || 0}</span> tasks completed
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">Last seen:</span>
          <br />
          <span className="font-medium">{timeSince}</span>
        </div>
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
