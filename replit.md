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
This project requires a Google Cloud/Firebase service account credentials file:
- Path: `~/.openclaw/credentials/googlechat-service-account.json`
- The API routes will return 500 errors until this file is configured

## Development
- Dev server runs on port 5000 (host: 0.0.0.0)
- Command: `npm run dev`

## Deployment
- Build: `npm run build`
- Start: `npm run start` (port 5000)
