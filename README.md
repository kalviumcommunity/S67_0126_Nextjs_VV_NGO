# NGO Project (Sprint 1)

Next.js (TypeScript) starter for the NGO project. This repo establishes a clean, scalable structure that the team will build on in future sprints.

---

## Folder structure

```
src/
├── app/          # Routes & pages (App Router)
├── components/   # Reusable UI components
├── lib/          # Utilities, helpers, configs
```

### Purpose of each folder

- `src/app` — route segments, pages, layouts, and server/client components
- `src/components` — reusable UI building blocks used across routes
- `src/lib` — shared utilities, helper functions, and configuration

### Naming conventions

- Components: `PascalCase` (e.g., `Navbar.tsx`)
- Utilities/helpers: `camelCase` or `kebab-case` (e.g., `api.ts`, `format-date.ts`)
- Routes: folder-based under `app/`

## Setup instructions

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Reflection

This structure separates routes, UI components, and shared logic, which reduces coupling and makes ownership clear. It helps the team scale features without creating large, tangled files or inconsistent patterns.

---

## API Routes

The backend exposes simple RESTful JSON endpoints under `app/api/` for the main entities.

- `GET /api/users` — list users (supports `page`, `limit`, `q` search)
- `POST /api/users` — create user
- `GET /api/users/:id` — get user
- `PUT /api/users/:id` — update user
- `DELETE /api/users/:id` — delete user

- `GET /api/projects` — list projects (supports `page`, `limit`, `q`, `ownerId`)
- `POST /api/projects` — create project
- `GET /api/projects/:id` — get project (includes `pipelines` and `tasks`)
- `PUT /api/projects/:id` — update project
- `DELETE /api/projects/:id` — delete project

- `GET /api/tasks` — list tasks (supports `page`, `limit`, `projectId`, `assigneeId`)
- `POST /api/tasks` — create task
- `GET /api/tasks/:id` — get task
- `PUT /api/tasks/:id` — update task
- `DELETE /api/tasks/:id` — delete task

Sample curl requests:

```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10"

curl -X POST "http://localhost:3000/api/users" -H "Content-Type: application/json" -d '{"name":"Charlie","email":"charlie@example.com"}'

curl -X GET "http://localhost:3000/api/projects?ownerId=USER_ID"

curl -X POST "http://localhost:3000/api/tasks" -H "Content-Type: application/json" -d '{"title":"New task","projectId":"PROJECT_ID"}'
```

Error handling:

- Endpoints return JSON errors with HTTP status codes (400 for bad input, 404 for not found, 500 for server errors).

Pagination:

- Use `page` and `limit` query params; defaults are `page=1`, `limit=10`.

These routes are minimal examples linked to the Prisma models and intended as a starting point for production-ready validation, auth, and input sanitization.

### Standardized Response Format

All API responses follow a consistent envelope using the `sendSuccess` and `sendError` helpers in `src/lib/responseHandler.ts`.

Success JSON:

```json
{
	"success": true,
	"message": "Users fetched",
	"data": { "page": 1, "limit": 10, "total": 2, "items": [] },
	"timestamp": "2026-02-06T12:00:00.000Z"
}
```

Error JSON:

```json
{
	"success": false,
	"message": "Failed to fetch users",
	"error": { "code": "E500", "details": "Database connection failed" },
	"timestamp": "2026-02-06T12:00:00.000Z"
}
```

Usage example in a route (simplified):

```ts
import { sendSuccess, sendError } from '@/lib/responseHandler';

try {
	const items = await prisma.user.findMany();
	return sendSuccess(items, 'Users fetched');
} catch (err) {
	return sendError('Failed to fetch users', 'E500', 500, err.message);
}
```

Using a consistent envelope simplifies frontend error handling and logging, and makes it easier to attach observability metadata (timestamps, error codes) across services.

### Postman collection

A small Postman collection is included at `docs/postman_collection.json` with basic requests for `users`, `projects`, and `tasks` to help testing locally.

## Screenshot

Add a screenshot of the app running locally here:

![Local app running](docs/sprint1-local.png)

---

## PostgreSQL Schema Design

The database schema is defined using Prisma at [database/prisma/schema.prisma](database/prisma/schema.prisma). It models users, projects, pipelines, tasks, and reusable templates.

### Prisma schema excerpt

```
model User {
	id           String    @id @default(cuid())
	email        String    @unique
	name         String
	role         Role
	passwordHash String
	createdAt    DateTime  @default(now())
	updatedAt    DateTime  @updatedAt

	projects     Project[]
	assignments  Task[]    @relation("TaskAssignee")
}

model Project {
	id          String         @id @default(cuid())
	title       String
	description String
	status      ProjectStatus
	tags        String[]
	createdAt   DateTime       @default(now())
	updatedAt   DateTime       @updatedAt

	ownerId     String
	owner       User           @relation(fields: [ownerId], references: [id])

	pipelines   Pipeline[]
	tasks       Task[]
}

model Task {
	id          String     @id @default(cuid())
	title       String
	description String
	status      TaskStatus @default(open)
	tags        String[]
	createdAt   DateTime   @default(now())
	updatedAt   DateTime   @updatedAt

	projectId   String
	project     Project    @relation(fields: [projectId], references: [id])

	pipelineId  String?
	pipeline    Pipeline?  @relation(fields: [pipelineId], references: [id])

	assigneeId  String?
	assignee    User?      @relation("TaskAssignee", fields: [assigneeId], references: [id])
}
```

### Keys, constraints, and relationships

- Primary keys: `id` fields on all models.
- Foreign keys: `Project.ownerId → User.id`, `Task.projectId → Project.id`, `Task.pipelineId → Pipeline.id`, `Task.assigneeId → User.id`.
- Unique constraint: `User.email`.
- NOT NULL: required fields like `title`, `description`, and FK fields where applicable.
- Defaults: timestamps with `now()` and `updatedAt` auto-update.

### Normalization notes

- 1NF: all columns are atomic (no nested objects in rows).
- 2NF: non-key attributes depend on the whole key (single-column PKs).
- 3NF: no transitive dependencies; e.g., user profile data stays in `User`, project data in `Project`.

### Migration & seed evidence

Run migrations and seed data locally (once Prisma is installed and configured):

```
npx prisma migrate dev --name init_schema
npx prisma studio
```

Add screenshots or logs here:

![Prisma migrate](docs/schema-migrate.png)
![Prisma seed](docs/schema-seed.png)

### Reflection

This schema supports scalability by separating concerns across normalized tables and modeling relationships explicitly. Common queries (projects by user, tasks by project, pipeline tasks) are supported through indexed foreign keys and clear relations, keeping read paths efficient as data grows.

---

## Transactions & Query Optimisation

This section shows how to use Prisma transactions to maintain atomic operations and how indexes were added to speed common queries.

### What I changed

- Added indexes in `database/prisma/schema.prisma` for frequently queried fields: `Project.ownerId`, `Project.status`, `Project.title`, `Pipeline.projectId`, `Task.projectId`, `Task.assigneeId`, `Task.status`, and `TemplateTask.templateId`.
- Added a transaction example at `src/lib/transactions.ts` demonstrating `prisma.$transaction()` and rollback handling.

### Transaction example

Use `createProjectWithTask()` to atomically create a project and an initial task. The helper `createProjectThenFail()` demonstrates rollback behavior by intentionally creating invalid data.

File: `src/lib/transactions.ts`

### Migrations

After updating the schema, create and apply a migration that adds indexes:

```bash
npx prisma migrate dev --name add_indexes
```

If you need to reset local DB and reapply migrations + seed:

```bash
npx prisma migrate reset
npx prisma db seed
```

### Query optimisation tips

- Select only needed fields (`select` instead of `include` when possible).
- Use `createMany` for bulk inserts.
- Paginate with `skip`/`take` and use `orderBy` on indexed columns.

### Benchmarking / logs

Enable Prisma query logging to observe executed SQL:

PowerShell:

```powershell
$env:DEBUG = "prisma:query"
npm run dev
```

Unix/macOS:

```bash
DEBUG="prisma:query" npm run dev
```

Compare timings before and after adding indexes using `EXPLAIN` in your Postgres client or by inspecting the Prisma query logs.

### Reflection

Transactions ensure data integrity for multi-step operations; indexes improve read performance for repeated queries. Avoid N+1 patterns by careful `select` usage and use pagination for large result sets.

---

## Prisma ORM Setup & Client Initialization

Prisma provides a type-safe ORM layer for PostgreSQL. It generates a strongly typed client based on the schema at [database/prisma/schema.prisma](database/prisma/schema.prisma).

### Setup steps

```
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

This project keeps the schema in `database/prisma/schema.prisma` and reads the database connection from `DATABASE_URL`.

### Prisma client initialization

The Prisma client singleton is defined at [src/lib/prisma.ts](src/lib/prisma.ts):

```
import { PrismaClient } from "@prisma/client";

type PrismaGlobal = typeof globalThis & { prisma?: PrismaClient };

const globalForPrisma = globalThis as PrismaGlobal;

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: ["query", "info", "warn", "error"],
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
```

### Generate the client

```
npx prisma generate
```

### Evidence

Add screenshots or logs here:

![Prisma generate](docs/prisma-generate.png)
![Prisma query](docs/prisma-query.png)

### Reflection

Prisma improves developer productivity by generating a type-safe client directly from the schema. It reduces runtime query errors, makes refactors safer, and keeps database access consistent across the app.

---

## Prisma Migrations & Seeding

This project uses Prisma migrations to version schema changes and a seed script to insert reproducible starter data.

### Migration workflow

Create and apply the initial migration:

```
npx prisma migrate dev --name init_schema
```

Create a new migration after schema changes:

```
npx prisma migrate dev --name add_project_table
```

Reset and re-apply all migrations (use carefully in non-production environments):

```
npx prisma migrate reset
```

### Seed script

The seed script lives at [database/prisma/seed.ts](database/prisma/seed.ts) and is configured in [package.json](package.json) under the `prisma.seed` field.

Run the seed:

```
npx prisma db seed
```

### Verify

Open Prisma Studio to confirm data:

```
npx prisma studio
```

### Evidence

Add screenshots or logs here:

![Migration success](docs/prisma-migrate-success.png)
![Seed success](docs/prisma-seed-success.png)
![Prisma Studio](docs/prisma-studio.png)

### Reflection

Versioned migrations keep database changes consistent across environments. The seed script provides predictable starter data for development and testing without risking production data, and resets are performed only on local or staging databases after verifying backups.

