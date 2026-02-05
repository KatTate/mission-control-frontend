# Mission Control Frontend

## Overview
A Next.js 16 frontend application with TypeScript and Tailwind CSS. Uses Firebase for backend services. This is a real-time agent coordination dashboard with a professional three-panel layout.

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
  - `/app/command` - Main command center page
- `/components` - React components
  - `Header.tsx` - Top bar with stats, clock, action buttons
  - `AgentSidebar.tsx` - Left sidebar with agent list, role badges
  - `DashboardLayout.tsx` - Main layout wrapper
  - `MissionQueue.tsx` - Kanban board with task columns
  - `LiveFeed.tsx` - Activity feed with filter tabs
  - `TaskDetailDrawer.tsx` - Slide-out task details panel
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and shared code
  - `utils.ts` - Shared utilities (formatAgo, classNames)
- `/docs` - Documentation
  - `chat-system-prd.md` - Chat system design document
- `/public` - Static assets
- `/scripts` - Build/utility scripts

## UI Layout
The dashboard uses a three-panel layout:
1. **Header** - Project name, live stats (agents active, tasks in queue), clock, action buttons (Chat, Broadcast, Docs), online status
2. **Agent Sidebar** (left) - List of agents with role badges (LEAD/INT/SPC), WORKING status indicators, "All Agents" filter option
3. **Mission Queue** (center) - Kanban board with columns: To Do, In Progress, Blocked, Done
4. **Live Feed** (right, XL screens) - Activity stream with filter tabs (All/Tasks/Comments/Status)
5. **Task Detail Drawer** - Full-screen slide-out panel accessible from any screen size

## Configuration Required
This project requires a Firebase service account credential stored as a Replit Secret.

## Security Model (MVP)
- **Client uses API routes only** (`/api/*`).
- API routes use **firebase-admin** (service account) to access Firestore.
- Because of this, **Firestore rules can be locked down** (deny all client reads/writes).
- Avoid client-side Firestore SDK unless we explicitly choose to add it.

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

## Recent Changes (Feb 2026)
- Major UI restructure to match professional reference design
- Added Header component with live stats and clock
- Added AgentSidebar with role badges and WORKING status
- Converted task view from cards to Kanban board
- Added LiveFeed with filter tabs
- Created TaskDetailDrawer for mobile-responsive task details
- Consolidated shared utilities in lib/utils.ts
- Created chat system PRD (docs/chat-system-prd.md)
