# whoami Tech Stack Document

This document explains the technology choices behind **whoami**, a full-stack “link-in-bio” and personal branding platform. It’s written in plain language for non-technical readers, so you can understand why each technology was chosen and how it helps the application.

## 1. Frontend Technologies

These are the tools and libraries that power everything you see and interact with in your browser:

- **Next.js (App Router)**
  • A React framework that handles page routing, server-side rendering (SSR), and static site generation (SSG) out of the box.
  • Makes pages load quickly and improves search engine visibility.

- **React & TypeScript**
  • React lets us build reusable UI components (buttons, forms, dashboards).
  • TypeScript adds type checking to JavaScript, catching errors early and making the codebase more maintainable.

- **Tailwind CSS & PostCSS**
  • Tailwind provides ready-made utility classes (e.g., `bg-blue-500`, `p-4`) for rapid styling.
  • PostCSS processes and optimizes the final CSS files.

- **Framer Motion**
  • A library for smooth animations and transitions, enhancing the feel of interactive elements like the page builder.

- **React Hook Form**
  • Simplifies building and validating forms (sign-up forms, settings pages) with minimal code.

- **@tiptap/react (Tiptap)**
  • A rich text editor for creating and editing course content, blog posts, and lead magnets with formatting tools.

- **Zustand**
  • A lightweight state management library that keeps track of things like user preferences and builder settings across components.

- **Vitest**
  • A testing framework for unit and integration tests, ensuring frontend components behave as expected.

## 2. Backend Technologies

These components power the server, handle data, and implement the business logic:

- **Node.js & Next.js API Routes**
  • The server runs on Node.js, using Next.js route handlers (`/api` folders) to manage backend operations.

- **PostgreSQL**
  • A reliable relational database for storing user profiles, pages, products, subscriptions, analytics data, and more.

- **Prisma ORM**
  • An Object-Relational Mapper that provides a type-safe way to read and write database records, plus simple migrations for schema changes.

- **Stack Auth**
  • A full-featured authentication library managing user sign-up, login, password resets, and social logins.

- **SVIX**
  • A secure webhook framework that verifies and processes events (for example, Stripe payment events).

- **Custom Business Logic Services** (`lib/services/`)
  • Encapsulate functionality like `emailService` (sending notifications), `customDomain` management, and `campaignService` (marketing workflows).

## 3. Infrastructure and Deployment

This section covers how the application is hosted, how code gets deployed, and how environments are managed:

- **Version Control: Git & GitHub**
  • All code changes are tracked in Git, with GitHub as the repository host.

- **Continuous Integration & Deployment (CI/CD)**
  • Automated pipelines (e.g., GitHub Actions) run tests and deploy to the hosting platform whenever code is merged.

- **Hosting Platform: Vercel** (or similar)
  • Optimized for Next.js apps, handling serverless functions, global content distribution, and automatic SSL.

- **Database Hosting: Managed PostgreSQL**
  • A cloud-based Postgres service (AWS RDS, DigitalOcean, etc.) offering backups, scaling, and high availability.

- **Object Storage: Cloudflare R2**
  • Stores user uploads (images, files) and static assets cost-effectively, with high durability and fast global delivery.

- **Environment Management**
  • Environment variables (API keys, database URLs) are securely stored and injected during build/deploy.

## 4. Third-Party Integrations

Several external services are plugged into whoami to extend its features:

- **Stripe**
  • Handles payment processing and subscription management, providing checkout workflows and billing dashboards.

- **Email Provider (e.g., SendGrid, SES)**
  • Integrated via `emailService` for transactional emails—password resets, notifications, and campaign messages.

- **SVIX**
  • Manages and secures incoming webhooks (for example, confirming Stripe payment events).

- **Cloudflare R2**
  • Beyond storage, Cloudflare accelerates delivery of images and assets worldwide.

## 5. Security and Performance Considerations

We’ve implemented measures to keep data safe and the user experience smooth:

- **Authentication & Authorization**
  • Stack Auth protects routes, enforces password policies, and supports social login.
  • Feature gating ensures only subscribed users can access premium features.

- **Data Protection**
  • Sensitive data is encrypted in transit (HTTPS) and at rest (database encryption).
  • Regular database backups guard against data loss.

- **Performance Optimizations**
  • **Server-Side Rendering (SSR)** and **Static Generation (SSG)**: Pages load faster and reduce the time to first meaningful paint.
  • **Image Optimization**: Next.js automatically resizes and serves images in modern formats.
  • **Code Splitting & Lazy Loading**: Only necessary JavaScript is sent to the user, improving initial load times.
  • **Caching**: Both CDN caching (Vercel/Cloudflare) and in-application caching (Prisma query caching, HTTP caching headers).

- **Testing & Monitoring**
  • Vitest for frontend tests; end-to-end and integration tests ensure critical flows remain stable.
  • Logging and error tracking (ErrorBoundary, global error context) help detect and resolve issues quickly.

## 6. Conclusion and Overall Tech Stack Summary

In summary, **whoami** combines proven, modern technologies to deliver a fast, secure, and scalable personal branding platform:

- Frontend built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS** for a responsive and customizable user interface.
- Backend powered by **Node.js**, **Next.js API routes**, **PostgreSQL**, and **Prisma** for robust data management.
- Infrastructure managed via **GitHub/Git**, **Vercel**, **Cloudflare R2**, and CI/CD pipelines to ensure reliable, automated deployments.
- Key integrations like **Stripe** for payments, **SVIX** for secure webhooks, and an email provider for communications.
- Security and performance best practices—SSR/SSG, caching, encryption, and automated testing—keep the application fast and protected.

These carefully chosen tools and services align with whoami’s goals of enabling users to create beautiful, personalized pages, manage content and commerce, automate marketing, and grow their brand with confidence.