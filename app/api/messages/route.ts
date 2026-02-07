import { NextResponse } from 'next/server';
import { getDb, admin } from '@/lib/firebase-admin';

type MessageInput = {
  taskId: string;
  text: string;
  authorId?: string | null;
  authorName?: string | null;
  kind?: 'comment' | 'note' | 'system';
};

export async function GET(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: 'Firebase not configured. Please set FIREBASE_SERVICE_ACCOUNT secret.' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  const limitParam = Number(searchParams.get('limit') ?? '50');
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;

  if (!taskId) {
    return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
  }

  try {
    // Preferred query (requires composite index in many Firestore setups):
    // where(taskId) + orderBy(createdAt)
    const snap = await db
      .collection('messages')
      .where('taskId', '==', taskId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({
      taskId,
      messages,
      count: messages.length,
      indexFallback: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Graceful fallback for missing composite index.
    console.warn('Messages indexed query failed; falling back to unordered fetch:', error);

    try {
      const snap = await db
        .collection('messages')
        .where('taskId', '==', taskId)
        .limit(limit)
        .get();

      const messages = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        // Sort client-side best-effort (createdAt Timestamp/ISO)
        .sort((a: any, b: any) => {
          const aSec = a?.createdAt?.seconds ?? 0;
          const bSec = b?.createdAt?.seconds ?? 0;
          if (aSec && bSec) return bSec - aSec;
          const aMs = typeof a?.createdAt === 'string' ? Date.parse(a.createdAt) : 0;
          const bMs = typeof b?.createdAt === 'string' ? Date.parse(b.createdAt) : 0;
          return (bMs || 0) - (aMs || 0);
        });

      return NextResponse.json({
        taskId,
        messages,
        count: messages.length,
        indexFallback: true,
        indexHelp:
          'Firestore composite index likely required for messages where taskId==X orderBy createdAt desc',
        timestamp: new Date().toISOString(),
      });
    } catch (fallbackError) {
      console.error('Messages fallback fetch failed:', fallbackError);
      return NextResponse.json(
        {
          error: 'Failed to fetch messages',
          details: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: 'Firebase not configured. Please set FIREBASE_SERVICE_ACCOUNT secret.' },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as Partial<MessageInput>;
    const taskId = body.taskId?.trim();
    const text = body.text?.trim();

    if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
    if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });

    const authorId = (body.authorId ?? 'human')?.toString();
    const authorName = body.authorName ?? null;
    const kind = body.kind ?? 'comment';

    const now = admin.firestore.FieldValue.serverTimestamp();

    const messageData = {
      taskId,
      text,
      kind,
      authorId,
      authorName,
      createdAt: now,
    };

    const docRef = await db.collection('messages').add(messageData);

    await db.collection('tasks').doc(taskId).set(
      {
        messageCount: admin.firestore.FieldValue.increment(1),
        updatedAt: now,
      },
      { merge: true }
    );

    await db.collection('activities').add({
      type: 'message_sent',
      taskId,
      summary: `${authorName || authorId} commented on task`,
      createdAt: now,
    });

    return NextResponse.json(
      { message: { id: docRef.id, ...messageData }, timestamp: new Date().toISOString() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
