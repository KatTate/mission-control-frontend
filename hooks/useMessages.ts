'use client';

import { useCallback, useEffect, useState } from 'react';

export interface Message {
  id: string;
  taskId: string;
  content: string;
  createdAt?: any; // Firestore Timestamp | ISO
  author?: string | null;
  type?: string;
}

export default function useMessages(taskId: string | null, options?: { limit?: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indexFallback, setIndexFallback] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!taskId) {
      setMessages([]);
      setError(null);
      setIndexFallback(false);
      return;
    }

    setLoading(true);
    try {
      const limit = options?.limit ?? 50;
      const res = await fetch(`/api/messages?taskId=${encodeURIComponent(taskId)}&limit=${limit}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setMessages(data.messages || []);
      setIndexFallback(data.indexFallback === true);
      setError(null);
    } catch (e) {
      console.error('Failed to fetch messages:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [taskId, options?.limit]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  return { messages, loading, error, indexFallback, refetch: fetchMessages };
}
