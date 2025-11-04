# Subdomain & Custom Domain Implementation - Gap Analysis

## Current State

### ✅ What Exists:

1. **Database Schema:**
   - `Page.customDomain` field (String, nullable)
   - No `subdomain` field in Page model

2. **Middleware (`middleware.ts`):**
   - Basic subdomain routing from static JSON file
   - URL rewriting for subdomains
   - Does NOT check database for custom domains
   - Does NOT map subdomain to Page records

3. **Services:**
   - `CustomDomainService` - Mock implementation with simulated DNS checks
   - No real DNS verification

4. **UI Components:**
   - `CustomDomainSetup.jsx` - UI exists but uses mock service
   - Integrated in `Settings.jsx` but hardcoded pageId

5. **API Endpoints:**
   - `POST /api/add-subdomain` - Adds to JSON file (not database)
   - No API for managing custom domains per page
   - No API for managing subdomains per page

## ❌ Critical Gaps:

### 1. Database Schema Gaps
- [ ] Missing `subdomain` field in `Page` model
- [ ] Missing domain verification status tracking fields:
  - `customDomainStatus` (enum: PENDING, VERIFIED, FAILED)
  - `customDomainVerifiedAt` (DateTime)
  - `customDomainVerificationToken` (String)
  - `subdomain` (String, unique)

### 2. Middleware Gaps
- [ ] Does NOT query database for custom domains
- [ ] Does NOT query database for subdomains
- [ ] Does NOT map domain/subdomain to Page slug
- [ ] Does NOT handle domain verification status
- [ ] Hardcoded allowed domains
- [ ] Does NOT handle custom domain routing (only subdomains)

### 3. API Endpoint Gaps
- [ ] `GET /api/pages/[pageId]/domain` - Get domain config
- [ ] `POST /api/pages/[pageId]/domain` - Set custom domain
- [ ] `PUT /api/pages/[pageId]/domain` - Update domain
- [ ] `DELETE /api/pages/[pageId]/domain` - Remove domain
- [ ] `POST /api/pages/[pageId]/domain/verify` - Trigger verification
- [ ] `GET /api/pages/[pageId]/subdomain` - Get subdomain
- [ ] `POST /api/pages/[pageId]/subdomain` - Set subdomain
- [ ] `DELETE /api/pages/[pageId]/subdomain` - Remove subdomain
- [ ] `GET /api/domains/check` - Check domain availability/status

### 4. DNS Verification Gaps
- [ ] Real DNS lookup implementation (not mocked)
- [ ] TXT record verification
- [ ] CNAME record verification
- [ ] SSL certificate status checking
- [ ] Periodic background verification job

### 5. Service Layer Gaps
- [ ] Real DNS resolver integration (dns/promises or similar)
- [ ] Domain validation (format, blacklist, reserved domains)
- [ ] Uniqueness checking (one domain per page, one page per domain)
- [ ] Subdomain generation logic (if auto-assigning)

### 6. UI Integration Gaps
- [ ] `CustomDomainSetup` needs real API integration
- [ ] Needs to pass real `pageId` from page context
- [ ] Subdomain setup UI missing
- [ ] Domain status polling/auto-refresh
- [ ] Error handling for domain conflicts

### 7. Security & Validation Gaps
- [ ] User authorization (users can only manage their own pages)
- [ ] Domain ownership verification before assignment
- [ ] Rate limiting for domain operations
- [ ] Domain format validation
- [ ] Reserved domain blacklist (admin, api, www, etc.)

### 8. Routing Logic Gaps
- [ ] Custom domain → Page mapping
- [ ] Subdomain → Page mapping (via slug or direct)
- [ ] Fallback to slug-based routing if domain not verified
- [ ] Handle both www and non-www variants
- [ ] Redirect logic (redirect to canonical domain)

## Implementation Priority

### Phase 1: Core Database & API (HIGH)
1. Add `subdomain` field to Page model
2. Add domain verification fields to Page model
3. Create domain management API endpoints
4. Add authorization checks

### Phase 2: Middleware Updates (HIGH)
1. Query database for custom domains
2. Query database for subdomains
3. Map domains to Page records
4. Handle verification status

### Phase 3: DNS Verification (MEDIUM)
1. Real DNS lookup implementation
2. TXT record verification
3. CNAME verification
4. Status polling endpoint

### Phase 4: UI Integration (MEDIUM)
1. Connect CustomDomainSetup to real APIs
2. Add subdomain setup UI
3. Status polling/auto-refresh
4. Error handling

### Phase 5: Advanced Features (LOW)
1. Auto SSL provisioning (if using Vercel/Cloudflare)
2. Domain transfer functionality
3. Bulk domain management
4. Analytics per domain

## Recommended Implementation Order

1. **Database Migration** - Add fields to Page model
2. **API Endpoints** - Domain management APIs with auth
3. **Middleware** - Database-backed routing
4. **DNS Service** - Real DNS verification
5. **UI Updates** - Connect to real APIs
6. **Testing** - End-to-end verification
