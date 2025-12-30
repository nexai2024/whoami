# Backend Structure Document

This document outlines the backend architecture, database design, APIs, hosting, infrastructure, security, and maintenance strategies for the "whoami" link-in-bio platform. It is written in everyday language to ensure clarity.

## 1. Backend Architecture

**Overview:**
The backend is built as a single, cohesive service alongside the Next.js frontend using Route Handlers. It follows a modular design that separates responsibilities into layers:

- **Routing Layer (Next.js API Routes):** Handles incoming HTTP requests, maps them to specific handlers.
- **Service Layer (lib/services):** Contains business logic for features like page building, payments, email campaigns, etc.
- **Data Access Layer (lib/database with Prisma):** Abstracts database queries and migrations, ensuring type safety and consistency.

**Key Design Patterns & Frameworks:**
- **Monolithic Serverless Model:** All backend logic lives in Next.js Route Handlers, deployed to Vercel’s serverless functions.
- **Modular Service Components:** Each feature (e.g., campaigns, checkout, domains) has its own service file for clarity and reuse.
- **ORM Pattern (Prisma):** Simplifies working with PostgreSQL through an object-oriented interface.
- **Middleware & Hooks:** Custom middleware for authentication checks and feature-gating ensures that only authorized users access certain endpoints.

**Scalability, Maintainability & Performance:**
- **Scalability:** Serverless functions auto-scale with demand. Database is hosted on a managed cloud service (AWS RDS) that offers read replicas and auto-scaling storage.
- **Maintainability:** Clear separation of concerns, extensive use of TypeScript interfaces, and Prisma schema migrations keep the codebase understandable and easy to update.
- **Performance:** Edge caching (via Vercel and Cloudflare), incremental static regeneration (ISR), and CDN distribution minimize latency and server load.

---

## 2. Database Management

**Technologies Used:**
- Relational Database: PostgreSQL (managed on AWS RDS)
- ORM: Prisma (for schema definition, migrations, and queries)

**Data Structure & Access:**
- Data is organized into tables for users, pages, products, campaigns, etc.
- Prisma Client provides type-safe queries, reducing runtime errors.
- Migrations are tracked in `prisma/migrations` and applied automatically during deploy.

**Data Management Practices:**
- **Backups & Disaster Recovery:** Automated daily snapshots via RDS.
- **Migrations:** Versioned migrations ensure schema changes are applied in order.
- **Seeding:** `prisma/seed.ts` populates dev/test environments with sample data.
- **Connection Pooling:** Managed by the cloud provider to handle bursts of traffic gracefully.

---

## 3. Database Schema

Below is a human-readable summary of the main tables, followed by a simplified PostgreSQL schema.

### Human-Readable Tables

1. **Users**
   - Stores account details (email, password hash, name)
   - Holds Stripe customer ID and subscription plan
2. **Plans**
   - Defines subscription tiers (features, price, Stripe plan ID)
3. **Pages**
   - Each user can have multiple landing pages
   - Stores layout data in JSON, custom domain settings, and publish status
4. **Blocks**
   - Elements on a page (text, button, image)
   - Positioning and configuration stored as JSON
5. **Products**
   - Digital products or courses sold
   - Price, description, inventory
6. **CheckoutSessions**
   - Tracks Stripe checkout sessions and payment status
7. **Campaigns & Workflows**
   - Marketing campaigns and automated workflows
   - Settings, sequence steps, email templates
8. **AnalyticsEvents**
   - Tracks page views, clicks, funnel steps with timestamps
9. **Domains**
   - Custom domains/subdomains per user
   - Verification and SSL status
10. **Webhooks**
    - Logs incoming events (Stripe, SVIX) for auditing and retries

### PostgreSQL Schema (simplified)
```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  stripe_customer_id TEXT,
  plan_id INT REFERENCES plans(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Plans
CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INT NOT NULL,
  stripe_plan_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pages
CREATE TABLE pages (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title TEXT,
  slug TEXT UNIQUE,
  template TEXT,
  content JSONB,
  custom_domain TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Blocks
CREATE TABLE blocks (
  id SERIAL PRIMARY KEY,
  page_id INT REFERENCES pages(id),
  type TEXT,
  props JSONB,
  sort_order INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL,
  inventory INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Checkout Sessions
CREATE TABLE checkout_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  product_id INT REFERENCES products(id),
  stripe_session_id TEXT NOT NULL,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name TEXT,
  settings JSONB,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workflows
CREATE TABLE workflows (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name TEXT,
  triggers JSONB,
  actions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  page_id INT REFERENCES pages(id),
  user_id INT REFERENCES users(id),
  event_type TEXT,
  event_data JSONB,
  occurred_at TIMESTAMP DEFAULT NOW()
);

-- Domains
CREATE TABLE domains (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  domain_name TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  ssl_status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Webhook Logs
CREATE TABLE webhook_logs (
  id SERIAL PRIMARY KEY,
  source TEXT,
  payload JSONB,
  received_at TIMESTAMP DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);
```

---

## 4. API Design and Endpoints

**Approach:** RESTful APIs using Next.js Route Handlers. JSON is the standard request/response format.

**Key Endpoints:**

- **Authentication & User**
  - `POST /api/auth/signup` — Create a new user
  - `POST /api/auth/login` — User login, returns JWT/session cookie
  - `POST /api/auth/logout` — Invalidate session
  - `GET /api/user/profile` — Fetch current user’s profile
  - `PUT /api/user/settings` — Update user preferences (name, plan)

- **Page Builder**
  - `GET /api/pages` — List user pages
  - `POST /api/pages` — Create a new page
  - `GET /api/pages/:id` — Fetch page details
  - `PUT /api/pages/:id` — Update page content/layout
  - `DELETE /api/pages/:id` — Remove a page

- **Blocks**
  - `POST /api/pages/:pageId/blocks` — Add a block
  - `PATCH /api/blocks/:id` — Update block props/order
  - `DELETE /api/blocks/:id` — Remove a block

- **E-Commerce & Billing**
  - `POST /api/checkout/create-session` — Create Stripe checkout session
  - `POST /api/webhooks/stripe` — Stripe webhook listener (secured)
  - `GET /api/products` — List products/courses
  - `POST /api/products` — Add a new product

- **Marketing & Automation**
  - `GET /api/campaigns` — List campaigns
  - `POST /api/campaigns` — Create campaign
  - `PATCH /api/campaigns/:id` — Update campaign
  - `GET /api/workflows` — List workflows
  - `POST /api/workflows` — Create workflow

- **Analytics**
  - `POST /api/analytics/track` — Record page view or click event
  - `GET /api/analytics/reports` — Fetch aggregated analytics

- **Domain Management**
  - `POST /api/domains` — Add a custom domain
  - `GET /api/domains` — List domains
  - `POST /api/domains/:id/verify` — Trigger DNS/SSL verification

- **Webhooks**
  - `POST /api/webhooks/svix` — Incoming webhook verification and processing

All endpoints enforce authentication and, where applicable, feature-gating based on subscription plan.

---

## 5. Hosting Solutions

**Platform:** Vercel (serverless) for Next.js Route Handlers and static assets.

**Database:** AWS RDS for PostgreSQL (multi-AZ, automatic backups).

**Object Storage:** Cloudflare R2 for file uploads (images, media) with S3-compatible API.

**CDN:** Cloudflare CDN in front of Vercel and R2 to serve static content globally.

**Benefits:**
- **Reliability:** Vercel and RDS offer SLA-backed uptime.
- **Auto-Scaling:** Serverless functions and managed DB scale with traffic.
- **Cost-Effectiveness:** Pay-as-you-go pricing for serverless functions and R2 storage.

---

## 6. Infrastructure Components

- **Load Balancer & Edge Network:** Managed by Vercel and Cloudflare, routes requests to nearest serverless region.
- **Caching Mechanisms:**
  - **Edge Cache:** Static assets and ISR pages cached at CDN edge.
  - **In-Memory Cache (optional):** Redis via a managed provider for session data or heavy-read queries.
- **Content Delivery Network (CDN):** Cloudflare for fast global delivery of assets and API responses.
- **Webhooks Queue:** Incoming webhooks are logged to a database table for retry and auditing.

These pieces work together to minimize latency, handle traffic spikes, and ensure a smooth user experience.

---

## 7. Security Measures

- **Authentication & Authorization:**
  - Stack Auth for secure sign-in flows, session management, and social login.
  - JWT or encrypted session cookies for authenticating API requests.
  - Role-based access checks and feature-gating at the service layer.
- **Data Encryption:**
  - TLS (HTTPS) everywhere for data in transit.
  - Data at rest encrypted by RDS and Cloudflare R2.
- **Input Validation & Sanitization:**
  - Prisma parameterized queries prevent SQL injection.
  - Validation libraries (e.g., Zod) can be used to enforce request schemas.
- **Webhook Verification:**
  - SVIX library verifies signatures on incoming webhooks (Stripe, custom events).
- **Rate Limiting & DDOS Protection:**
  - Configured at the CDN/edge layer (Cloudflare) to block abusive traffic.

---

## 8. Monitoring and Maintenance

- **Performance Monitoring:**
  - Vercel Analytics for function latency and error rates.
  - Cloudflare Analytics for CDN cache hit/miss and bandwidth.
- **Error Tracking:**
  - Sentry (or similar) captures runtime exceptions in serverless functions.
- **Logging:**
  - Structured logs emitted by API routes, collected via Vercel Logs or a logging service.
- **Maintenance Strategies:**
  - **CI/CD Pipeline:** GitHub Actions (or Vercel Git integration) runs tests and deployments on each PR.
  - **Database Migrations:** Automated via Prisma during deploy.
  - **Dependency Updates:** Regular upgrades using Dependabot and quarterly audits.

---

## 9. Conclusion and Overall Backend Summary

The `whoami` backend is a serverless, Next.js-based monolith designed for scale, reliability, and rapid feature delivery. By leveraging managed services—PostgreSQL on RDS, Cloudflare R2, Vercel serverless functions—and adhering to clear layering (routes → services → data), we achieve:

- **Scalable Performance:** Automatic function and database scaling.
- **Maintainable Codebase:** Modular services, strong typing, and clear folder structure.
- **Solid Security Posture:** End-to-end encryption, verified webhooks, and robust auth.
- **Cost Efficiency:** Pay-per-use serverless model and modern CDN.

This setup aligns with the project’s goals of empowering users to build, manage, and monetize personal pages while ensuring backend operations remain secure, performant, and easy to evolve.