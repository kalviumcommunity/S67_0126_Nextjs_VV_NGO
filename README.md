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

