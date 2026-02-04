#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Add test activity data to Firestore
 * Run: node scripts/add-test-data.js
 */

const admin = require('firebase-admin');
const { readFileSync } = require('fs');
const { join } = require('path');

// Initialize Firebase Admin
const serviceAccountPath = join(process.env.HOME, '.openclaw/credentials/googlechat-service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Test activities
const testActivities = [
  {
    type: 'heartbeat',
    agentId: 'k3rnel',
    message: 'K3RNEL online - checking calendar and email',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: { status: 'active' }
  },
  {
    type: 'task_complete',
    agentId: 'd4mon',
    taskId: 'task-001',
    message: 'Mission Control frontend Phase 1 complete - GitHub repo created',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: { phase: 1, repo: 'mission-control-frontend' }
  },
  {
    type: 'heartbeat',
    agentId: 'n3wton',
    message: 'N3wton standing by - monitoring social channels',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: { status: 'standby' }
  },
  {
    type: 'task_started',
    agentId: 'd4mon',
    taskId: 'task-002',
    message: 'Starting Phase 2: Firebase testing and Agent Cards',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: { phase: 2 }
  },
];

async function addTestData() {
  console.log('Adding test activities to Firestore...');
  
  try {
    const batch = db.batch();
    
    testActivities.forEach((activity) => {
      const ref = db.collection('activities').doc();
      batch.set(ref, activity);
    });
    
    await batch.commit();
    console.log(`✅ Successfully added ${testActivities.length} test activities`);
    
    // Verify
    const snapshot = await db.collection('activities').limit(5).get();
    console.log(`\n📊 Total activities in Firestore: ${snapshot.size}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test data:', error);
    process.exit(1);
  }
}

addTestData();
