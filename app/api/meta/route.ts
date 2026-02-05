import { NextResponse } from 'next/server';

function getGitSha() {
  const envSha =
    process.env.GIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.REPLIT_GIT_COMMIT_SHA ||
    process.env.REPL_ID ||
    process.env.COMMIT_SHA;

  if (!envSha) return null;
  return envSha;
}

function getFirebaseProjectId() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) return null;

  try {
    const sa = JSON.parse(serviceAccountJson) as { project_id?: string };
    return sa.project_id || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const sha = getGitSha();
  const firebaseProjectId = getFirebaseProjectId();

  return NextResponse.json({
    gitSha: sha,
    gitShaShort: sha ? sha.slice(0, 7) : null,
    firebaseProjectId,
    serverTime: new Date().toISOString(),
  });
}
