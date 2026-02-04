'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/components/TaskList';

export default function useTasks(options?: { includeArchived?: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const includeArchived = options?.includeArchived === true;
      const url = includeArchived ? '/api/tasks?includeArchived=true' : '/api/tasks';
      const response = await fetch(url); // archived hidden by default server-side
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTasks(data.tasks || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options?.includeArchived]);

  useEffect(() => {
    fetchTasks();

    // Poll for updates every 5 seconds (real-time via polling)
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
}
