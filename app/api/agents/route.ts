import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
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
      return {
        id: doc.id,
        name: data.name,
        role: data.role,
        status: data.status || 'offline',
        lastSeen: data.lastSeen?.toDate?.()?.toISOString() || null,
        currentTask: data.currentTask,
        tasksCompleted: data.tasksCompleted || 0,
      };
    });
    
    return NextResponse.json({ agents });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
