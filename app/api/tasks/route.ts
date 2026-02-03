import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin (singleton pattern)
if (!admin.apps.length) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
    '/home/ubuntu/.openclaw/credentials/googlechat-service-account.json';
  
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'gen-lang-client-0308019863',
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

const db = admin.firestore();

export async function GET() {
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
  try {
    const body = await request.json();
    
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
      description: body.description || null,
      status: body.status,
      priority: body.priority,
      assignedTo: body.assignedTo || null,
      createdBy: body.createdBy || 'd4mon', // Default to d4mon for now
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      dueDate: body.dueDate || null,
      tags: body.tags || [],
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
