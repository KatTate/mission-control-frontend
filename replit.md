# Mission Control Frontend

## Overview
A Next.js 16 frontend application with TypeScript and Tailwind CSS. Uses Firebase for backend services. This is a real-time agent coordination dashboard.

## Tech Stack
- Next.js 16.1.6 with Turbopack
- React 19
- TypeScript
- Tailwind CSS 4
- Firebase Admin SDK (Firestore)

## Project Structure
- `/app` - Next.js App Router pages and API routes
  - `/app/api/agents` - Agents API endpoint
  - `/app/api/tasks` - Tasks API endpoint
  - `/app/api/activities` - Activities API endpoint
- `/components` - React components
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and shared code
- `/public` - Static assets
- `/scripts` - Build/utility scripts

## Configuration Required
This project requires a Firebase service account credential stored as a Replit Secret.

### Setup Instructions
1. Get the Firebase service account JSON file from the project owner (project: `gen-lang-client-0308019863`)
2. In Replit, go to **Secrets** (lock icon in the left sidebar)
3. Add a new secret:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** Paste the entire contents of the JSON file
4. Restart the dev server

The API routes will show "Firebase not configured" errors until this secret is set.

## Development
- Dev server runs on port 5000 (host: 0.0.0.0)
- Command: `npm run dev`

## Deployment
- Build: `npm run build`
- Start: `npm run start` (port 5000)
