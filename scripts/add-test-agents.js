#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Add test agent data to Firestore
 * Run: node scripts/add-test-agents.js
 */

const admin = require('firebase-admin');
const { readFileSync } = require('fs');
const { join } = require('path');

// Firebase Admin should already be initialized, but check
if (!admin.apps.length) {
  const serviceAccountPath = join(process.env.HOME, '.openclaw/credentials/googlechat-service-account.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Test agents
const testAgents = [
  {
    id: 'k3rnel',
    name: 'K3RNEL',
    role: 'Chief of Staff',
    status: 'active',
    lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    currentTask: 'Monitoring email and calendar',
    tasksCompleted: 42,
  },
  {
    id: 'd4mon',
    name: 'D4MON',
    role: 'Product & QA Lead',
    status: 'active',
    lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    currentTask: 'Building Mission Control frontend',
    tasksCompleted: 15,
  },
  {
    id: 'n3wton',
    name: 'N3wton',
    role: 'Social Media Manager',
    status: 'idle',
    lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    currentTask: null,
    tasksCompleted: 8,
  },
];

async function addTestAgents() {
  console.log('Adding test agents to Firestore...');
  
  try {
    const batch = db.batch();
    
    testAgents.forEach((agent) => {
      const ref = db.collection('agents').doc(agent.id);
      batch.set(ref, agent, { merge: true });
    });
    
    await batch.commit();
    console.log(`✅ Successfully added ${testAgents.length} test agents`);
    
    // Verify
    const snapshot = await db.collection('agents').get();
    console.log(`\n📊 Total agents in Firestore: ${snapshot.size}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test agents:', error);
    process.exit(1);
  }
}

addTestAgents();
