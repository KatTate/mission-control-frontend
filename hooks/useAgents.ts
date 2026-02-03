import { useEffect, useState } from 'react';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'offline';
  lastSeen?: string;
  currentTask?: string;
  tasksCompleted?: number;
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        const data = await response.json();
        
        if (response.ok) {
          setAgents(data.agents);
          setLoading(false);
        } else {
          throw new Error(data.error || 'Failed to fetch agents');
        }
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchAgents();

    // Poll every 10 seconds
    const interval = setInterval(fetchAgents, 10000);

    return () => clearInterval(interval);
  }, []);

  return { agents, loading, error };
}
