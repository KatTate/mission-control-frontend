# Security Model (MVP)

## TL;DR
- **Client uses API routes only** (`/api/*`).
- **Firestore is accessed server-side only** via **firebase-admin** using a service account.
- Because of this, **Firestore rules can be locked down** (deny all client reads/writes).

## Why this matters
This keeps the MVP simple and reduces risk:
- No client Firebase auth required.
- No client-side Firestore SDK needed.
- All data access and validation lives in Next.js API routes.

## Required Runtime Secret (Replit)
Set this in Replit **Secrets**:
- Key: `FIREBASE_SERVICE_ACCOUNT`
- Value: the full JSON contents of the Firebase/Google service account for project `gen-lang-client-0308019863`

If this secret is missing, API routes will fail with “Firebase not configured”.

## Source of truth: `agents`
The `agents` collection is treated as **canonical for the dashboard UI**, but should be **written by OpenClaw heartbeats** (upsert `agents/{agentId}` + append to `activities`).
