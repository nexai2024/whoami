# Security Guidelines for the "whoami" Application

## 1. Introduction
This document defines security principles and best practices tailored to the **whoami** full-stack Next.js application. It embeds security considerations from design through deployment, ensuring the platform remains robust against evolving threats.

## 2. Security by Design & Core Principles
- **Embed Security Early:** Integrate threat modeling into feature design (e.g., page builder, checkout flows). 
- **Least Privilege:** Grant services, database roles, and API routes only the minimal permissions required. 
- **Defense in Depth:** Layer controls—network, application, data—so a single control failure does not compromise the system.  
- **Secure Defaults:** Configure new pages, APIs, and storage buckets (e.g., Cloudflare R2) with deny-by-default policies.
- **Fail Securely:** On errors (e.g., database timeouts), return generic messages; log details internally without leaking stack traces or PII.

## 3. Authentication & Access Control
- **Stack Auth Hardening:**  
  - Enforce strong password policies (≥12 characters, mixed types, regular rotation).  
  - Store passwords with Argon2 or bcrypt + unique salts.  
  - Protect against brute-force (rate limiting, account lockout).  
- **Session Management:**  
  - Generate unpredictable session IDs, store them server-side or in secure, HttpOnly, SameSite cookies.  
  - Enforce idle (e.g., 15 min) and absolute (e.g., 24 hr) timeouts.  
  - Provide explicit logout endpoints to revoke sessions.
- **Role-Based Access Control (RBAC):**  
  - Define roles (Admin, Coach, Creator, Visitor) and scope permissions per route.  
  - Validate authorizations server-side on every Next.js Route Handler (`route.ts`).
- **Multi-Factor Authentication (MFA):**  
  - Offer optional TOTP or SMS-based MFA, especially for admin and coaches.

## 4. Input Handling & Processing
- **Server-Side Validation:**  
  - Use schema validation (e.g., Zod) for all API payloads and Server Actions.  
  - Reject or sanitize unexpected fields.
- **Prevent Injection:**  
  - Use Prisma ORM’s parameterized queries for database access.  
  - Never interpolate raw user input into SQL or file paths.  
- **Secure File Uploads:**  
  - Validate file types, MIME types, size limits before uploading to R2.  
  - Generate random object keys, store uploads outside webroot.  
  - Scan for malware using a virus-scanning service on upload.
- **Cross-Site Scripting (XSS):**  
  - Escape or sanitize dynamic content in pages (`@tiptap/react` output).  
  - Apply a strict Content Security Policy (CSP) that restricts inline scripts and styles.
- **Redirect Validation:**  
  - Whitelist allowed domains/paths for redirects after authentication or form submissions.

## 5. Data Protection & Privacy
- **Encryption:**  
  - TLS 1.2+ for all external communication (Next.js server, Stripe, SVIX webhooks).  
  - AES-256 encryption for at-rest PII (e.g., email preferences, billing details).  
- **Secrets Management:**  
  - Store keys (Stripe, SVIX, Cloudflare) in a dedicated vault (e.g., AWS Secrets Manager).  
  - Reload secrets at runtime; avoid hardcoding in code or `.env` files in VCS.
- **Data Minimization:**  
  - Return only necessary fields in API responses (avoid leaking internal flags or identifiers).  
  - Mask or truncate PII in logs and dashboards (e.g., show “j***@domain.com”).

## 6. API & Service Security
- **HTTPS Enforcement:**  
  - Redirect all HTTP → HTTPS; enable HSTS with a long max-age.  
- **Rate Limiting & Throttling:**  
  - Implement per-IP and per-user limits on login, signup, and webhook endpoints.  
- **CORS Configuration:**  
  - Restrict origins to known frontend domains; avoid using `*`.  
- **Webhook Verification:**  
  - Leverage SVIX signature validation on incoming webhooks before processing.
- **API Versioning:**  
  - Prefix Route Handler paths with `/api/v1/…` to enable safe, backward-compatible changes.

## 7. Web Application Security Hygiene
- **CSRF Protection:**  
  - Use synchronizer tokens (Next.js `csrf` middleware or custom token validation) for state-changing POST/PUT/DELETE requests.  
- **Security Headers:**  
  - `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.  
- **Secure Cookies:**  
  - Set `HttpOnly`, `Secure`, and `SameSite=Lax` attributes on all session/auth cookies.  
- **Subresource Integrity (SRI):**  
  - Apply integrity checks for any third-party scripts or styles loaded via CDN.

## 8. Infrastructure & Configuration Management
- **Server Hardening:**  
  - Disable unused ports/services; apply OS-level security patches promptly.  
  - Run the Next.js server under a non-root, dedicated user.  
- **Cloudflare R2 Policies:**  
  - Restrict R2 bucket permissions to the application identity only.  
  - Enable Object Lock or versioning to prevent accidental deletions.
- **TLS Configuration:**  
  - Use strong cipher suites (e.g., ECDHE with AES-GCM).  
  - Disable deprecated protocols (SSLv3, TLS 1.0/1.1).
- **Disable Debug in Prod:**  
  - Ensure `next.config.js` disallows `reactStrictMode` sensitive logging in production environments.

## 9. Dependency & Supply Chain Management
- **Secure Dependencies:**  
  - Vet all libraries (Next.js, Prisma, Tailwind, SVIX) for known vulnerabilities.  
- **Automated Scanning:**  
  - Integrate SCA tools (Dependabot, Snyk) into CI to detect CVEs in direct and transitive dependencies.  
- **Lockfiles & Pinning:**  
  - Commit `package-lock.json` and audit regularly; avoid loose version ranges (e.g., `^`).

## 10. Testing, Monitoring & Incident Response
- **Security Testing:**  
  - Include static analysis (ESLint security plugins) and dynamic tests (Postman/Newman, Pen-testing) in CI.  
- **Logging & Alerting:**  
  - Centralize logs (e.g., ELK, Papertrail) for authentication failures, rate-limit events, and webhook errors.  
  - Configure real-time alerts for repeated failures or anomalous patterns.
- **Incident Response Plan:**  
  - Define procedures for key compromise, data breaches, or widespread service outages.  
  - Conduct periodic drills and update contact lists.

---
These guidelines must be enforced and reviewed continuously as **whoami** evolves. When in doubt, incorporate additional validation, seek peer review, or escalate to security leads to maintain a rigorously protected platform.