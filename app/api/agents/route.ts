import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: 'Firebase not configured. Please set FIREBASE_SERVICE_ACCOUNT secret.' },
      { status: 503 }
    );
  }

  try {
    const snapshot = await db.collection('agents')
      .orderBy('id', 'asc')
      .get();
    
    const agents = snapshot.docs.map(doc => {
      const data = doc.data();

      // Allow schema evolution without breaking UI.
      const lastHeartbeat =
        data.lastHeartbeat?.toDate?.()?.toISOString?.() ||
        data.lastSeen?.toDate?.()?.toISOString?.() ||
        null;

      const currentTaskId = data.currentTaskId || data.currentTask || null;

      return {
        id: doc.id,
        name: data.name || doc.id,
        role: data.role || 'Agent',
        status: data.status || 'offline',
        lastHeartbeat,
        currentTaskId,
        tasksCompleted: data.tasksCompleted || 0,
      };
    });
    
    return NextResponse.json({ agents });
  } catch (error: unknown) {
    console.error('Error fetching agents:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch agents';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
