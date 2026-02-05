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

