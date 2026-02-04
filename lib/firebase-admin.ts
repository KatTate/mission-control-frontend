import admin from 'firebase-admin';

/**
 * IMPORTANT: Do NOT validate env vars or init Firebase Admin at module import-time.
 * Next.js will import modules during build/static generation, and we don't want noisy
 * logs (or failures) when secrets are not present yet.
 */

let initAttempted = false;

function initFirebaseAdmin(): void {
  if (admin.apps.length) return;
  if (initAttempted) return;
  initAttempted = true;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    // Don't warn at build-time; API handlers can return 503 if db is unavailable.
    return;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson) as {
      project_id?: string;
      [key: string]: unknown;
    };

    admin.initializeApp({
      // firebase-admin expects a ServiceAccount-ish object; cert() accepts broad shapes.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      credential: admin.credential.cert(serviceAccount as any),
      projectId: serviceAccount.project_id,
    });
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error);
  }
}

export function getDb(): FirebaseFirestore.Firestore | null {
  initFirebaseAdmin();
  return admin.apps.length ? admin.firestore() : null;
}

export { admin };
