# Copilot Instructions for `whoami` (Next.js Project)

## Project Overview
- **Framework:** Next.js (App Router, TypeScript)
- **Structure:**
  - `app/` — Main app routes, layouts, and API endpoints (RESTful, under `app/api/`)
  - `components/` — React components (UI, pages, auth, etc.)
  - `lib/` — Utilities, database, and service logic
  - `prisma/` — Prisma schema for database
  - `public/` — Static assets

## Key Patterns & Conventions
- **API Routes:**
  - Located in `app/api/` (e.g., `app/api/usage/route.ts`)
  - Use Next.js Route Handlers (export `GET`, `POST`, etc.)
- **Pages & Layouts:**
  - Use file-based routing under `app/`
  - Each route can have its own `layout.tsx`, `page.tsx`, and `loading.tsx`
- **Components:**
  - UI and logic split into `components/` (general) and `components/ui/` (UI primitives)
  - Auth-related components in `components/auth/`
- **Database:**
  - Prisma ORM, schema in `prisma/schema.prisma`
  - DB logic in `lib/database/`
- **Services:**
  - Service logic in `lib/services/` (e.g., `customDomain.js`, `fileUpload.js`)
- **Utilities:**
  - Shared helpers in `lib/utils.ts` and `lib/utils/`

## Developer Workflows
- **Start Dev Server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Prisma:**
  - Migrate: `npx prisma migrate dev`
  - Generate: `npx prisma generate`

## Integration & Data Flow
- **API endpoints** call service/database logic from `lib/`
- **Pages** import components from `components/`
- **Cross-component communication** via props/context (see `lib/auth/AuthContext.jsx`)

## Project-Specific Notes
- **TypeScript** is used throughout (except some legacy `.js` files)
- **Custom UI primitives** in `components/ui/`
- **Onboarding, dashboard, and builder flows** have dedicated subfolders in `app/(main)/`
- **Enhanced components** (e.g., `Enhanced404.jsx`) extend base functionality

## Examples
- To add a new API route: create `app/api/feature/route.ts` and export HTTP methods
- To add a new page: add `page.tsx` under the desired route in `app/`
- To add a new service: add to `lib/services/` and import in API route

## References
- See `README.md` for Next.js basics
- Prisma schema: `prisma/schema.prisma`
- Auth context: `lib/auth/AuthContext.jsx`

---
_Keep instructions concise and up-to-date. Update this file if project structure or conventions change._
