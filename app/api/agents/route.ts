import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Firebase Admin is already initialized in activities/route.ts
const db = admin.firestore();

export async function GET() {
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
