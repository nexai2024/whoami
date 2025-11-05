# Course Block Workflow Test Plan

## Workflow to Test
1. Coach puts course block on bio page
2. User signs up (email only, optional account creation)
3. Optional payment (if paid course)
4. User and coach get email confirmation
5. User receives link to login to course

---

## Current State Analysis

### ✅ What Works
- Course enrollment API exists (`/api/courses/[courseId]/enroll`)
- Stripe payment integration exists
- Course learning interface exists (`/c/[slug]/learn`)
- Email service infrastructure exists

### ❌ Missing Components

#### 1. Course Block Type
- **Status:** NOT IMPLEMENTED
- **Issue:** No `COURSE` block type in `BlockType` enum
- **Needed:**
  - Add `COURSE` to `BlockType` enum in Prisma schema
  - Update block type mappings
  - Create course block UI in page builder
  - Handle course block clicks to redirect to course or show enrollment

#### 2. Guest Enrollment (No Auth Required)
- **Status:** PARTIALLY WORKING
- **Issue:** Enrollment endpoint requires `userId` in some flows
- **Needed:**
  - Allow enrollment with email only (no auth required)
  - Create temporary access token for course access
  - Handle email-based course access

#### 3. Email Notifications
- **Status:** NOT IMPLEMENTED
- **Issue:** No emails sent on enrollment
- **Needed:**
  - Student enrollment confirmation email with course access link
  - Coach notification email when student enrolls
  - Payment confirmation email (if paid)

#### 4. Course Access Link Generation
- **Status:** NOT IMPLEMENTED
- **Issue:** No tokenized access links for non-authenticated users
- **Needed:**
  - Generate secure access tokens for course access
  - Email links that allow access without full account
  - Optional account creation from access link

#### 5. Block Click Handler
- **Status:** NOT IMPLEMENTED
- **Issue:** No handling for course block clicks on bio pages
- **Needed:**
  - Redirect to course landing page or enrollment flow
  - Pass block/page context for analytics

---

## Implementation Plan

### Step 1: Add Course Block Type
1. Update Prisma schema to add `COURSE` to `BlockType` enum
2. Run migration
3. Update block type mappings
4. Add course block to page builder UI
5. Create course block renderer for public pages

### Step 2: Guest Enrollment Flow
1. Update enrollment API to accept email-only enrollment
2. Generate secure access tokens for course access
3. Store tokens with expiration in enrollment record
4. Create access endpoint that validates tokens

### Step 3: Email System
1. Create `sendCourseEnrollmentConfirmation` email function
2. Create `sendCoachNewEnrollmentNotification` email function
3. Integrate emails into enrollment API
4. Integrate payment confirmation emails

### Step 4: Course Access Links
1. Create token generation utility
2. Create `/api/courses/access/[token]` endpoint
3. Update course learning page to accept token parameter
4. Auto-create account option from access link

### Step 5: Block Click Handler
1. Update block click tracking to handle course blocks
2. Redirect to course enrollment or landing page
3. Pass source tracking (pageId, blockId)

---

## Test Scenarios

### Scenario 1: Free Course Enrollment via Block
1. Coach creates course and adds course block to bio page
2. User clicks course block on coach's bio page
3. User enters email (no account creation)
4. User enrolled → receives email with course access link
5. Coach receives notification email
6. User clicks link → accesses course without login

### Scenario 2: Paid Course Enrollment via Block
1. Coach creates paid course and adds course block to bio page
2. User clicks course block on coach's bio page
3. User enters email and proceeds to Stripe checkout
4. User completes payment
5. Stripe webhook enrolls user → sends confirmation emails
6. User receives email with course access link
7. Coach receives notification email with payment info

### Scenario 3: Authenticated User Enrollment
1. Logged-in user clicks course block
2. User enrolled immediately (no email form)
3. User redirected to course learning page
4. Email confirmations sent to user and coach

---

## Files to Modify/Create

### Database
- `prisma/schema.prisma` - Add `COURSE` to `BlockType` enum
- Migration file

### API Routes
- `app/api/courses/[courseId]/enroll/route.ts` - Add guest enrollment, email sending
- `app/api/courses/access/[token]/route.ts` - NEW - Token-based access
- `app/api/blocks/[blockId]/click/route.ts` - Update for course blocks

### Email Service
- `lib/services/emailService.ts` - Add course enrollment email functions

### Components
- `components/EnhancedPageBuilder.jsx` - Add course block type
- `components/PageRenderer.jsx` or equivalent - Handle course block rendering
- `app/(main)/c/[slug]/page.tsx` - Update for guest enrollment

### Types
- `types/blockData.ts` - Add `CourseBlockData` interface
- `lib/blockTypeMapping.ts` - Add course mapping

---

## Success Criteria
- ✅ Coach can add course block to bio page
- ✅ Guest users can enroll with email only
- ✅ Both user and coach receive email notifications
- ✅ User receives working access link in email
- ✅ Access link works without requiring login
- ✅ Paid courses integrate with Stripe
- ✅ Payment confirmation emails sent
- ✅ Course access tracked and analytics work
