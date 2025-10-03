# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Start dev server (Turbopack):
  - npm run dev
- Build (Turbopack):
  - npm run build
- Start production server:
  - npm run start
- Lint the codebase (ESLint v9 flat config via eslint.config.mjs):
  - npm run lint
  - Lint a specific file or directory:
    - npx eslint app/page.tsx
    - npx eslint components/
- Prisma (if you modify the schema or need to refresh the client):
  - npx prisma migrate dev
  - npx prisma generate

Notes:
- Next.js version is 15.x; use Node.js 18+ to satisfy dependencies and SWC binaries.

## High-level Architecture

This is a Next.js App Router project (TypeScript-first, with some .jsx/.js files) bootstrapped via create-next-app. Key layers and data flow are:

- Routing (app/)
  - File-based routes under app/. Each route typically provides page.tsx and can include layout.tsx and loading.tsx.
  - API endpoints implemented as Route Handlers under app/api/**/route.(ts|js), exporting HTTP verbs (e.g., GET, POST).
- UI Composition (components/)
  - Feature-level React components live in components/ (e.g., Dashboard.jsx, PageBuilder.jsx, Settings.jsx).
  - UI primitives live in components/ui/ (e.g., button.tsx, dialog.tsx) and are consumed by feature components/pages.
  - Auth-related components in components/auth/.
- Core Logic and Utilities (lib/)
  - Database access helpers under lib/database/ (analytics.js, pages.js, products.js).
  - Service layer under lib/services/ (customDomain.js, fileUpload.js) that is invoked by API routes to perform domain-specific work.
  - Authentication context/provider at lib/auth/AuthContext.jsx for cross-app auth state.
  - Shared utilities in lib/utils.ts and lib/utils/ (logger.js, slug.js).
  - Rate limiting helper at lib/rate-limit.ts to protect API endpoints.
  - Prisma client bootstrap in lib/prisma.js to centralize database client usage.
- Data model (prisma/)
  - Prisma schema at prisma/schema.prisma defines the database models used by lib/database/* and API routes.
- Configuration
  - TypeScript config at tsconfig.json uses path alias @/* -> ./* and enables the Next plugin.
  - Next.js config at next.config.ts.
  - ESLint flat config at eslint.config.mjs is used by npm run lint.

Interaction pattern
- Pages (app/) render UI by composing components/.
- API route handlers (app/api/**/route.*) call into lib/services/* and lib/database/* to execute business logic and data access.
- Shared concerns (auth context, logging, utilities, rate limiting) are imported from lib/.

## Incorporated Guidance from Existing Docs

From README.md
- Primary dev workflow is Next.js: use npm run dev, open http://localhost:3000, and edit app/page.tsx. Fonts are handled via next/font.

From .github/copilot-instructions.md
- Structure and conventions:
  - API routes under app/api/ using Route Handlers (export GET/POST/etc.).
  - UI and logic split across components/ and components/ui/; auth in components/auth/.
  - Prisma schema in prisma/schema.prisma; DB helpers in lib/database/; services in lib/services/.
  - TypeScript is predominant with some legacy .js files.
  - Onboarding, dashboard, and builder flows are under app/(main)/…

## Repo-specific Tips for Warp

- Use the TypeScript path alias @/* when generating imports that refer to project-root files.
- Prefer placing cross-cutting utilities in lib/utils.* and import them from API routes and components to keep logic centralized.
- When adding new API endpoints, implement app/api/<feature>/route.ts and invoke lib/services/* and/or lib/database/* rather than embedding logic directly in the handler.
