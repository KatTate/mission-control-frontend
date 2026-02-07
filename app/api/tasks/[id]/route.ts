import { NextResponse } from 'next/server';
import { getDb, admin } from '@/lib/firebase-admin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: 'Firebase not configured. Please set FIREBASE_SERVICE_ACCOUNT secret.' },
      { status: 503 }
    );
  }

  try {
    const { id: taskId } = await params;
    const body = await request.json();

    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.assignedTo !== undefined) updates.assignedTo = body.assignedTo;
    if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
    if (body.tags !== undefined) updates.tags = body.tags;

    // Next Action (operational one-liner)
    if (body.nextAction !== undefined) {
      updates.nextAction = body.nextAction;
      updates.nextActionUpdatedAt = admin.firestore.FieldValue.serverTimestamp();
      updates.nextActionUpdatedBy = body.nextActionUpdatedBy ?? 'd4mon';
    }

    // Approval audit trail
    if (body.approvedToExecute !== undefined) {
      const approved = Boolean(body.approvedToExecute);
      updates.approvedToExecute = approved;

      if (approved) {
        updates.approvedBy = body.approvedBy ?? body.agentId ?? 'tate';
        updates.approvedAt = admin.firestore.FieldValue.serverTimestamp();
      } else {
        updates.approvedBy = null;
        updates.approvedAt = null;
      }
    }

    await taskRef.update(updates);

    // Activity log (best-effort)
    try {
      const agentId = body.agentId ?? body.approvedBy ?? body.nextActionUpdatedBy ?? 'system';
      const type = body.approvedToExecute === true
        ? 'task_approved'
        : body.approvedToExecute === false
          ? 'task_unapproved'
          : 'task_updated';

      let message = `Updated task: ${taskDoc.data()?.title ?? taskId}`;
      if (body.approvedToExecute === true) message = `Approved to execute: ${taskDoc.data()?.title ?? taskId}`;
      if (body.approvedToExecute === false) message = `Unapproved: ${taskDoc.data()?.title ?? taskId}`;
      if (body.nextAction !== undefined) message = `Next action updated: ${taskDoc.data()?.title ?? taskId}`;

      await db.collection('activities').add({
        agentId,
        type,
        message,
        taskId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch {
      // ignore activity write failures
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: 'Firebase not configured. Please set FIREBASE_SERVICE_ACCOUNT secret.' },
      { status: 503 }
    );
  }

  try {
    const { id: taskId } = await params;
    const taskRef = db.collection('tasks').doc(taskId);
    
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

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
