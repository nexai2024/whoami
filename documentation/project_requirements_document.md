# Project Requirements Document for “whoami” Link-in-Bio Platform

## 1. Project Overview

“whoami” is a full-stack web application that lets individuals and small businesses build a single, shareable “link-in-bio” page to showcase their personal brand, sell digital products, and capture leads. Users can drag and drop or choose from prebuilt templates to design a custom landing page that aggregates social links, courses, lead magnets, and payment widgets—all without writing code.

We’re building this platform to solve the problem of fragmented online presences and complex e-commerce setups. Instead of juggling multiple URLs, users get one hub that they can customize, monetize, and track. Success means a user can sign up, design a page, connect a payment method, and publish within minutes—while seeing basic analytics and being able to upgrade to paid subscription tiers as they grow.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)
- **User Authentication & Profiles**: Sign up / log in via email, password reset, basic profile settings.
- **Page Builder**: Drag-and-drop interface + template gallery to create a public “link-in-bio” page.
- **Content Management**: Rich text editor for adding sections like About, Courses, Lead Magnets.
- **E-commerce Integration**: Stripe checkout for selling digital products and subscriptions.
- **Basic Analytics**: Track page views, click events, and basic funnel conversions.
- **Custom Domains**: Connect user-owned domains or subdomains via Cloudflare R2 integration.
- **Subscription Management**: Billing dashboard showing plan details, invoices, upgrade/downgrade flows.
- **Admin Console**: Platform-level user management and feature-gating based on subscription.

### Out-of-Scope (Future Phases)
- **Email Campaign Automation**: Multi-step campaigns and drip workflows.
- **Advanced Marketing Wizards**: Guided campaign builders and content repurposing tools.
- **Coach-Specific Modules**: Session scheduling, client portals, feedback loops.
- **Full Funnel Builder**: Visual funnel mapping and branching logic.
- **Offline PWA Features**: Caching pages for offline editing.
- **Third-party Integrations beyond Stripe** (e.g., PayPal, Mailchimp).

## 3. User Flow

A new user arrives at the marketing landing page, clicks “Get Started,” and is guided through an email/password sign-up flow. After verifying their email, they land on a blank dashboard that prompts them to select a page template or start from scratch. The left sidebar offers navigation to Builder, Content, Analytics, Billing, and Settings.

From the Builder screen, the user drags text blocks, image components, and buttons onto a canvas. On the right side, a panel lets them configure styles—colors, fonts, and link destinations. Hitting “Save & Publish” pushes the page live at a default subdomain (e.g., username.whoami.app). Under Analytics, they see real-time view counts and click metrics. In Billing, they can connect Stripe, choose a subscription plan, and enable product checkouts on their page.

## 4. Core Features

- **Authentication Module**: Secure sign-up, login, password reset, and social login snippets via Stack Auth.  
- **Drag-and-Drop Page Builder**: Real-time canvas editing, section templates, undo/redo, and responsive previews.  
- **Template Library**: A set of pre-designed page layouts for quick starts.  
- **Rich Text Editor**: Tiptap-powered WYSIWYG editor for creating blog posts, course descriptions, and lead magnets.  
- **Stripe Checkout & Subscriptions**: One-time and recurring payment flows, secure PCI-compliant checkout, webhook handling via SVIX.  
- **Analytics Dashboard**: Page views, button/link click tracking, simple funnel step counts.  
- **Custom Domain Setup**: Guided flow to add DNS records, SSL certificate provisioning, and domain verification.  
- **Billing & Plan Management**: View current plan, change subscription tier, see invoices, and payment history.  
- **Admin Interface**: List and manage users, feature-gate toggles, system logs.  

## 5. Tech Stack & Tools

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, PostCSS, Framer Motion (animations)  
- **Backend**: Next.js API Route Handlers, Node.js (v16+), TypeScript  
- **Database & ORM**: PostgreSQL, Prisma (schema, migrations, type-safe queries)  
- **Authentication**: Stack Auth (session management, OAuth support)  
- **State Management**: Zustand for client-side state, React Context for global errors/auth  
- **Payments & Webhooks**: Stripe SDK, SVIX for webhook verification  
- **Storage**: Cloudflare R2 for user file uploads and static assets  
- **Forms & Validation**: React Hook Form, Zod (planned) for schema validation  
- **Rich Text**: @tiptap/react  
- **Testing**: Vitest for unit/integration tests  
- **CI/CD & IDE**: GitHub Actions (CI), ESLint & Prettier, VS Code with recommended extensions  

## 6. Non-Functional Requirements

- **Performance**:  
  - Page load (Time To First Byte) < 300ms  
  - API response < 200ms for common routes  
- **Security & Compliance**:  
  - TLS everywhere, OWASP Top 10 mitigation  
  - PCI-DSS compliance via Stripe  
  - GDPR/CCPA data handling (user consent for tracking)  
- **Scalability**:  
  - Horizontal scaling on serverless/Vercel or container clusters  
  - Database connection pooling, read replicas for heavy analytics  
- **Usability & Accessibility**:  
  - WCAG 2.1 AA compliance  
  - Mobile-first responsive design  
- **Availability**:  
  - 99.9% uptime SLA  
  - Automatic retries on transient failures (e.g., network blips)  

## 7. Constraints & Assumptions

- Rely on third-party services (Stripe, Cloudflare R2, SVIX) with their rate limits and SLAs.  
- Deploy to an environment supporting Node.js v16+, Next.js SSR, and Server Actions (e.g., Vercel, AWS Lambda).  
- Assume users have basic DNS knowledge when configuring custom domains.  
- Pricing plans and feature gates are pre-defined and loaded from a configuration service.  
- No real-time collaboration in the builder (single-user editing).  

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: Stripe or R2 limits may throttle requests. Mitigation: implement exponential back-off and bulk/batched operations for analytics.  
- **Domain Propagation Delays**: DNS record changes can take hours. Mitigation: show clear user messaging and status polling.  
- **Large Media Uploads**: Big files could slow down the builder. Mitigation: enforce file size limits, client-side compression.  
- **State Mismatch in Builder**: Rapid edits can cause stale previews. Mitigation: debounce input updates, ensure state consistency.  
- **Testing Gaps**: Complex flows like Stripe webhooks need end-to-end tests. Mitigation: add mock server tests and CI integration.  

---

This document serves as the single source of truth for the initial “whoami” platform. All subsequent technical designs—component guidelines, database schemas, API specs—will reference the scope, features, and constraints detailed here.