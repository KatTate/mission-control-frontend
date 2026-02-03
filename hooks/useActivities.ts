import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, type DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Activity {
  id: string;
  type: string;
  agentId: string;
  taskId?: string;
  message: string;
  createdAt: any; // Firestore Timestamp
  metadata?: any;
}

export function useActivities(maxResults = 50) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const q = query(
        collection(db, 'activities'),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Activity[];
          setActivities(data);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching activities:', err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up activities listener:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [maxResults]);

  return { activities, loading, error };
}
