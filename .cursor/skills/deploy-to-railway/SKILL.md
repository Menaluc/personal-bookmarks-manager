---
name: deploy-to-railway
description: Use this skill when the user asks to deploy, verify, or troubleshoot Railway deployment for this project.
---

# Deploy to Railway

## When to use
Use this skill when asked to:
- deploy the app to Railway
- verify Railway deployment readiness
- troubleshoot Railway build or runtime issues
- check that production serving works correctly

## Project facts
This repository is a full-stack monorepo with:
- `client/` - React + Vite frontend
- `server/` - Node.js + Express backend

Production runs as a single service:
- the frontend is built from `client/`
- the build output is copied into `server/public`
- the Express server serves both API routes and static frontend files

## Important files
Check these files first:
- `package.json`
- `server/package.json`
- `server/scripts/build-client.js`
- `server/src/app.js`
- `server/src/index.js`
- `server/src/config/env.js`
- `Dockerfile`
- `railway.json`

## Build and start flow
From the project root:
1. Run `npm run build`
2. This triggers the server production build
3. The server build runs `node scripts/build-client.js`
4. The client is built and copied from `client/dist` to `server/public`
5. Run `npm run start` to start the backend server

## Deployment expectations
Before deploying, verify:
- `npm run build` succeeds
- `server/public` is populated from the client build
- the server starts with `npm run start`
- the app listens on `process.env.PORT`
- the API is available under `/api/*`
- static files are served from `server/public`
- production uses a single Railway service

## Database expectations
In production:
- database path should resolve to `/data/bookmarks.db`
- local development uses the server data directory unless `DB_FILE_PATH` is provided

## Verification checklist
After deployment changes, verify:
- `GET /api/health` works
- bookmark routes still work
- tag routes still work
- frontend loads from `/`
- static assets load correctly
- no existing functionality is broken

## Troubleshooting
If build fails, check:
- root, client, and server dependencies
- whether `client/dist` was created
- whether files were copied into `server/public`

If runtime fails, check:
- `process.env.PORT`
- startup command
- static serving configuration
- database path for production

If frontend works but API fails, check:
- frontend API base URL assumptions
- `/api` routing
- localhost-only development configuration

If API works but frontend routes fail, verify:
- static files exist in `server/public`
- production routing for non-API frontend routes works correctly

## Guardrails
- Do not split the app into multiple Railway services unless explicitly requested
- Do not change existing endpoint paths unless explicitly requested
- Do not break current bookmark manager behavior
- Prefer minimal deployment-focused changes