import { NextResponse } from 'next/server';
import { getDb, admin } from '@/lib/firebase-admin';

type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

type TaskInput = {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string | null;
  createdBy?: string | null;
  dueDate?: string | null;
  tags?: string[];
};

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: 'Firebase not configured. Please set FIREBASE_SERVICE_ACCOUNT secret.' },
      { status: 503 }
    );
  }

  try {
    const tasksSnapshot = await db.collection('tasks')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ 
      tasks,
      count: tasks.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
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
    const body = (await request.json()) as Partial<TaskInput>;
    
    // Validate required fields
    if (!body.title || !body.status || !body.priority) {
      return NextResponse.json(
        { error: 'Missing required fields: title, status, priority' },
        { status: 400 }
      );
    }

    // Create task document
    const taskData = {
      title: body.title,
      description: body.description ?? null,
      status: body.status,
      priority: body.priority,
      assignedTo: body.assignedTo ?? null,
      createdBy: body.createdBy ?? 'd4mon', // Default to d4mon for now
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      dueDate: body.dueDate ?? null,
      tags: body.tags ?? [],
      messageCount: 0,
    };

    const docRef = await db.collection('tasks').add(taskData);
    
    // Get the created document
    const createdDoc = await docRef.get();
    const createdTask = {
      id: docRef.id,
      ...createdDoc.data(),
    };

    return NextResponse.json({ 
      task: createdTask,
      message: 'Task created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
