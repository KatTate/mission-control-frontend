import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin (singleton)
if (!admin.apps.length) {
  const serviceAccountPath = join(process.env.HOME || '', '.openclaw/credentials/googlechat-service-account.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

export async function GET() {
  try {
    const snapshot = await db.collection('activities')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to ISO string for JSON serialization
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
    }));
    
    return NextResponse.json({ activities });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
