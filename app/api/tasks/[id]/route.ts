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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const body = await request.json();

    // Check if task exists
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Build update object (only include provided fields)
    const updates: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.assignedTo !== undefined) updates.assignedTo = body.assignedTo;
    if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
    if (body.tags !== undefined) updates.tags = body.tags;

    // Update the task
    await taskRef.update(updates);

    // Get the updated document
    const updatedDoc = await taskRef.get();
    const updatedTask = {
      id: taskId,
      ...updatedDoc.data(),
    };

    return NextResponse.json({
      task: updatedTask,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const taskRef = db.collection('tasks').doc(taskId);
    
    // Check if task exists
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete the task
    await taskRef.delete();

    return NextResponse.json({
      message: 'Task deleted successfully',
      id: taskId
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
