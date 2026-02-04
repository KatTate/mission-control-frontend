import { useEffect, useState } from 'react';

export interface Activity {
  id: string;
  type: string;
  agentId: string;
  taskId?: string;
  message: string;
  createdAt: string; // ISO string from API
  metadata?: Record<string, unknown>;
}

export function useActivities(maxResults = 50) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities');
        const data = await response.json();
        
        if (response.ok) {
          setActivities(data.activities);
          setLoading(false);
        } else {
          throw new Error(data.error || 'Failed to fetch activities');
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchActivities();

    // Poll for updates every 5 seconds (simulates real-time)
    const interval = setInterval(fetchActivities, 5000);

    return () => clearInterval(interval);
  }, [maxResults]);

  return { activities, loading, error };
}
