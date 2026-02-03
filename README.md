# NGO Project

Comprehensive monorepo for an NGO project consisting of a Next.js backend (API + server), a Next.js frontend, Prisma-managed PostgreSQL database schema, and Docker configurations for local development.

---

## Table of contents

- Project overview
- Repo structure
- Requirements
- Local development
  - Backend
  - Frontend
  - Database (Prisma)
- Docker (optional)
- API routes (summary)
- Notable files
- Troubleshooting

---

## Project overview

This repository contains two Next.js apps and a shared database schema:

- `backend` — Next.js app exposing server-side API routes and auth logic. Listens on port `4000` in dev.
- `frontend` — Next.js app serving the user-facing UI. Listens on port `3000` in dev.
- `database/prisma` — Prisma schema for a PostgreSQL database. Contains models for `User`, `Project`, `Pipeline`, `Task`, `Template`, and `TemplateTask`.

The apps use `@prisma/client` for DB access, `ioredis` for Redis, and typical auth helpers in `backend/src/lib`.

## Repo structure (top-level)

- `backend/` — Backend Next.js app
- `frontend/` — Frontend Next.js app
- `database/prisma/` — Prisma schema and migrations
- `docker/` — Dockerfiles and `docker-compose.yml`

## Requirements

- Node.js (recommended 18+)
- npm
- PostgreSQL (or Docker Compose to spin one up)
- Redis (optional; used if running the full stack)

## Local development

General notes:

- Run commands from the repository root or the directory indicated.
- The backend `package.json` scripts are in `backend/package.json`.
- The frontend `package.json` scripts are in `frontend/package.json`.

### Backend (dev)

Install dependencies and run the backend dev server:

```bash
cd backend
npm install
npm run dev
```

This runs `next dev -p 4000` (backend dev server). API routes are under `backend/src/app/api/`.

Prisma commands for the backend (generate client, run migrations) reference the shared schema at `database/prisma/schema.prisma`:

```bash
# from repo root or backend folder
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### Frontend (dev)

Install and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

This runs `next dev -p 3000`.

### Database (Prisma)

The Prisma schema is at `database/prisma/schema.prisma`. It expects an environment variable `DATABASE_URL` pointing to a PostgreSQL database.

Model highlights:

- `User` — identity and role (`NGO` or `CONTRIBUTOR`).
- `Project` — has `owner` (User), `pipelines`, and `tasks`.
- `Pipeline` — ordered grouping for tasks in a `Project`.
- `Task` — can belong to `Project` and `Pipeline`, can be assigned to a `User`.
- `Template` & `TemplateTask` — reusable task templates.

To create the client and apply migrations:

```bash
# from backend folder
npm run prisma:generate
npm run prisma:migrate
```

If using Docker Compose (see below), set `DATABASE_URL` to point to the container DB.

## Docker (optional)

There are Dockerfiles under `docker/` and a `docker-compose.yml` to run the database, redis, and the apps. Typical workflow:

```bash
cd docker
docker compose up --build
```

Adjust environment variables in your compose file or use a `.env` file to set `DATABASE_URL`, `REDIS_URL`, and any JWT secrets used by the backend.

## API routes (summary)

The backend exposes server-side API routes in `backend/src/app/api/`. Key endpoints (folder → route):

- `auth/login/route.js` — login endpoint
- `auth/register/route.js` — register endpoint
- `auth/logout/route.js` — logout endpoint
- `auth/me/route.js` — current user endpoint
- `dashboard/route.js` — dashboard data
- `projects/route.js` — projects listing/create
- `projects/[id]/route.js` — project detail
- `tasks/route.js` — tasks listing/create
- `tasks/[id]/route.js` — task detail/update
- `tasks/similar/route.js` — similar tasks
- `templates/route.js` — templates list/create
- `pipelines/route.js` — pipelines listing/create
- `pipelines/clone/route.js` — clone pipeline

These correspond to filesystem routes under `backend/src/app/api/`.

## Notable files

- Backend auth helpers: `backend/src/lib/auth.js`
- Prisma client wrapper: `backend/src/lib/prisma.js`
- Redis helper: `backend/src/lib/redis.js`
- Backend middleware: `backend/src/middleware.js`
- Frontend API helper: `frontend/src/lib/api.js`
- Frontend auth helper: `frontend/src/lib/auth.js`

## Environment variables

Typical environment variables you will need (examples):

- `DATABASE_URL=postgresql://user:password@localhost:5432/ngo_db`
- `REDIS_URL=redis://localhost:6379`
- `JWT_SECRET=your_jwt_secret`
- `NEXT_PUBLIC_API_BASE=http://localhost:4000` (if frontend needs to call backend API)

Set them in a `.env` file in the appropriate folder or pass into Docker Compose.

## Troubleshooting

- Windows OneDrive / reparse points: you may see errors like `EINVAL: invalid argument, readlink ... .next/server/edge-runtime-webpack.js` when running `next dev`. I patched the local `node_modules/next` helper to be more tolerant of `readlink` failures; if issues persist, consider:
  - Excluding the project folder from OneDrive sync.
  - Running the repo from a non-synced path (e.g., `C:\projects`).
  - Upgrading or downgrading `next` to a version that handles Windows reparse points.

- Prisma errors: ensure `DATABASE_URL` is valid and PostgreSQL is reachable. Run `prisma generate` after changing the schema.

---

