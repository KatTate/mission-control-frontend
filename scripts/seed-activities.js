/*
 * Seed Firestore with a sample activity doc.
 *
 * Usage:
 *   node scripts/seed-activities.js
 *
 * Expects service account JSON at:
 *   ~/.openclaw/credentials/googlechat-service-account.json
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const admin = require('firebase-admin');

async function main() {
  // Credentials resolution order:
  // 1) FIREBASE_SERVICE_ACCOUNT (full JSON string)
  // 2) FIREBASE_SERVICE_ACCOUNT_FILE (path to JSON)
  // 3) Default OpenClaw cred path
  const envJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_FILE ||
    path.join(os.homedir(), '.openclaw', 'credentials', 'googlechat-service-account.json');

  if (!envJson && !fs.existsSync(filePath)) {
    throw new Error(`Service account file not found: ${filePath}`);
  }

  const serviceAccount = envJson
    ? JSON.parse(envJson)
    : JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }

  const db = admin.firestore();

  const doc = {
    type: 'heartbeat',
    agentId: 'd4mon',
    message: `Seeded activity @ ${new Date().toISOString()}`,
    createdAt: admin.firestore.Timestamp.now(),
    metadata: {
      source: 'seed-activities.js',
      env: process.env.NODE_ENV || 'unknown',
    },
  };

  const ref = await db.collection('activities').add(doc);
  const readBack = await ref.get();

  console.log('✅ Wrote activity:', ref.id);
  console.log(JSON.stringify({ id: ref.id, ...readBack.data() }, null, 2));
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
