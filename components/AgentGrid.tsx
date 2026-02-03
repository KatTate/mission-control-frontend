'use client';

import AgentCard, { type Agent } from './AgentCard';
import { useAgents } from '@/hooks/useAgents';

export default function AgentGrid() {
  const { agents, loading, error } = useAgents();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading agents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-semibold">Error loading agents</p>
        <p className="text-red-600 text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-600">No agents registered</p>
        <p className="text-gray-500 text-sm mt-2">Agents will appear as they come online</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Agent Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
