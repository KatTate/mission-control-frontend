import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: 'Firebase not configured. Please set FIREBASE_SERVICE_ACCOUNT secret.' },
      { status: 503 }
    );
  }

  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = Math.min(
      200,
      Math.max(1, Number.parseInt(limitParam || '50', 10) || 50)
    );

    const snapshot = await db.collection('activities')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to ISO string for JSON serialization
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
    
    return NextResponse.json({ activities });
  } catch (error: unknown) {
    console.error('Error fetching activities:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch activities';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
