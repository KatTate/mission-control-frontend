#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Add test tasks to Firebase for Mission Control frontend testing
 * Usage: node scripts/add-test-tasks.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
  path.join(process.env.HOME, '.openclaw/credentials/googlechat-service-account.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'gen-lang-client-0308019863',
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Sample tasks with realistic data
const testTasks = [
  {
    title: 'Build Task Detail Modal',
    description: 'Create a modal component to display full task details, including description, metadata, and message thread',
    status: 'todo',
    priority: 'high',
    assignedTo: 'd4mon',
    createdBy: 'k3rnel',
    createdAt: new Date('2026-02-03T15:00:00Z').toISOString(),
    updatedAt: new Date('2026-02-03T15:00:00Z').toISOString(),
    tags: ['frontend', 'react', 'ui'],
    messageCount: 0,
  },
  {
    title: 'Implement Message Threading',
    description: 'Add comment/reply system for tasks. Agents can discuss task details, share updates, and coordinate work',
    status: 'todo',
    priority: 'medium',
    assignedTo: 'd4mon',
    createdBy: 'k3rnel',
    createdAt: new Date('2026-02-03T14:30:00Z').toISOString(),
    updatedAt: new Date('2026-02-03T14:30:00Z').toISOString(),
    dueDate: new Date('2026-02-05T00:00:00Z').toISOString(),
    tags: ['backend', 'firebase', 'messaging'],
    messageCount: 0,
  },
  {
    title: 'Deploy K3RNEL + D4MON to Google Chat',
    description: 'Complete Google Chat integration plan and deploy both agents as Chat bots. Replace Telegram as primary interface',
    status: 'in_progress',
    priority: 'urgent',
    assignedTo: 'k3rnel',
    createdBy: 'tate',
    createdAt: new Date('2026-02-02T20:00:00Z').toISOString(),
    updatedAt: new Date('2026-02-03T14:00:00Z').toISOString(),
    dueDate: new Date('2026-02-07T00:00:00Z').toISOString(),
    tags: ['integration', 'google-chat', 'deployment'],
    messageCount: 3,
  },
  {
    title: 'Test Activity Feed Real-time Updates',
    description: 'Verify that Activity Feed component updates in real-time when new activities are added to Firebase',
    status: 'done',
    priority: 'medium',
    assignedTo: 'd4mon',
    createdBy: 'd4mon',
    createdAt: new Date('2026-02-03T13:00:00Z').toISOString(),
    updatedAt: new Date('2026-02-03T14:45:00Z').toISOString(),
    tags: ['testing', 'qa', 'firebase'],
    messageCount: 1,
  },
  {
    title: 'Research Kanban Drag-and-Drop Libraries',
    description: 'Evaluate react-beautiful-dnd, dnd-kit, and other drag-drop libraries for Kanban board implementation',
    status: 'blocked',
    priority: 'low',
    assignedTo: 'd4mon',
    createdBy: 'k3rnel',
    createdAt: new Date('2026-02-03T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-02-03T13:30:00Z').toISOString(),
    tags: ['research', 'ui', 'libraries'],
    messageCount: 2,
  },
  {
    title: 'Create Task CRUD Forms',
    description: 'Build forms for creating, editing, and deleting tasks. Include validation and error handling',
    status: 'todo',
    priority: 'high',
    assignedTo: 'd4mon',
    createdBy: 'k3rnel',
    createdAt: new Date('2026-02-03T15:15:00Z').toISOString(),
    updatedAt: new Date('2026-02-03T15:15:00Z').toISOString(),
    dueDate: new Date('2026-02-04T00:00:00Z').toISOString(),
    tags: ['frontend', 'forms', 'crud'],
    messageCount: 0,
  },
];

async function addTestTasks() {
  try {
    console.log(`\n🔄 Adding ${testTasks.length} test tasks to Firebase...`);

    const batch = db.batch();
    const tasksRef = db.collection('tasks');

    for (const task of testTasks) {
      const docRef = tasksRef.doc();
      batch.set(docRef, task);
      console.log(`  ✓ ${task.title} (${task.status})`);
    }

    await batch.commit();
    console.log(`\n✅ Successfully added ${testTasks.length} test tasks to Firestore`);
    console.log('\nTask summary:');
    console.log(`  - Todo: ${testTasks.filter(t => t.status === 'todo').length}`);
    console.log(`  - In Progress: ${testTasks.filter(t => t.status === 'in_progress').length}`);
    console.log(`  - Blocked: ${testTasks.filter(t => t.status === 'blocked').length}`);
    console.log(`  - Done: ${testTasks.filter(t => t.status === 'done').length}`);

  } catch (error) {
    console.error('\n❌ Error adding test tasks:', error.message);
    process.exit(1);
  }
}

// Run the script
addTestTasks()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
