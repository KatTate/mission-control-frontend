'use client';

import { useCallback, useEffect, useState } from 'react';

export type Meta = {
  gitShaShort: string | null;
  firebaseProjectId: string | null;
  serverTime: string;
};

export default function useMeta() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await fetch('/api/meta');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setMeta(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  }, []);

  useEffect(() => {
    fetchMeta();
    const interval = setInterval(fetchMeta, 30000);
    return () => clearInterval(interval);
  }, [fetchMeta]);

  return { meta, error };
}
