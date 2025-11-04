# Coach Platform Features - Gap Analysis & Implementation Plan

## Overview
Analysis of required features vs existing implementation to identify gaps and create implementation roadmap.

---

## 1. Public Bio Page: /[coachSlug] with "Book" and "Buy" CTAs

### ✅ What Exists
- Public page routing: `/[slug]` routes exist
- `components/PublicPage.jsx` and `components/EnhancedPublicPage.jsx` 
- `app/api/slug/route.ts` - API endpoint for fetching pages by slug
- Profile display with avatar, bio, etc.
- Block-based content system

### ❌ What's Missing
- **Route mismatch**: Uses `/[slug]` not `/[coachSlug]` - need coach-specific routing
- **No "Book" CTA**: No booking-specific call-to-action button
- **No "Buy" CTA**: No product/package purchase call-to-action button
- **Coach-specific data**: No coach profile data structure (vs generic page)
- **CTA logic**: No logic to show Book/Buy buttons based on available services/products

### Implementation Required
1. Create `app/(public)/[coachSlug]/page.tsx` route
2. Create `app/api/coaches/[coachSlug]/route.ts` API endpoint
3. Update Profile model or create Coach model with booking/products enabled flags
4. Add "Book" and "Buy" CTA components to public page
5. Link CTAs to booking flow and product checkout

---

## 2. Product/Package CRUD (Coach Dashboard)

### ✅ What Exists
- **Product CRUD API**: Fully implemented
  - `app/api/products/route.ts` - GET (list), POST (create)
  - `app/api/products/[id]/route.ts` - GET (single), PATCH (update), DELETE
- **Product Dashboard UI**: 
  - `components/products/ProductsDashboard.tsx` - Complete UI with cards/table view
  - `app/(main)/marketing/products/page.tsx` - Dashboard page
- **Database Model**: `Product` model in Prisma schema
- **Stripe Integration**: Product creation links to Stripe products/prices

### ❌ What's Missing
- **Package concept**: Products exist but no "Package" concept (multi-product bundles)
- **Coach-specific filtering**: No distinction between regular products and coach packages
- **Dashboard integration**: Products dashboard not linked from coach dashboard

### Implementation Required
1. Create Package model OR extend Product with `type` field (product | package)
2. Create coach-specific product/package dashboard route
3. Add package bundling logic (multiple products in one package)
4. Link products dashboard to coach settings/dashboard

---

## 3. Checkout Start + Stripe Integration + Webhook Handling

### ✅ What Exists
- **Checkout API**: `app/api/checkout/payment-intent/route.ts` - Creates payment intents
- **Stripe Webhooks**: `app/api/webhooks/stripe/route.ts` - Comprehensive webhook handler
  - Handles: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`
  - Creates `Sale` records on successful payment
- **Stripe Integration**: Products linked to Stripe products/prices
- **Checkout UI**: `components/CheckoutForm.tsx` - Stripe Elements integration
- **Course checkout**: `app/api/courses/[courseId]/checkout/route.ts` - Course-specific checkout

### ❌ What's Missing
- **Package checkout**: No checkout flow for packages (only products/courses)
- **Booking checkout**: No checkout for booking payments
- **Checkout UI routing**: No clear entry point `/checkout/[productId]` route

### Implementation Required
1. Create `app/(public)/checkout/[productId]/page.tsx` - Public checkout page
2. Create `app/api/checkout/packages/[packageId]/route.ts` - Package checkout endpoint
3. Create `app/api/checkout/bookings/[bookingId]/route.ts` - Booking payment endpoint
4. Add webhook handler for booking payments (if different from products)
5. Update webhook to handle package purchases

---

## 4. Availability Engine v1: Weekly Windows + Blackout Dates + Conflict Checks

### ✅ What Exists
- **Block type**: `BOOKING_CALENDAR` block type exists
- **Block data**: `BookingCalendarBlockData` interface with basic fields
  - `duration`, `price`, `calendarIntegration`, `timezone`, `bufferTime`, etc.
- **Calendar integrations**: Support for Calendly, Cal.com, Google Calendar URLs

### ❌ What's Missing
- **No availability model**: No database model for storing availability
- **No weekly windows**: No recurring availability patterns (e.g., "Mondays 9am-5pm")
- **No blackout dates**: No way to mark specific dates/times as unavailable
- **No conflict checking**: No logic to prevent double-booking
- **No booking model**: No `Booking` table to store actual bookings
- **No time slot generation**: No logic to generate available time slots from windows
- **No timezone handling**: Basic timezone field but no conversion logic

### Implementation Required
1. **Database Schema**:
   ```prisma
   model AvailabilityWindow {
     id          String @id @default(cuid())
     userId      String
     dayOfWeek   Int    // 0-6 (Sunday-Saturday)
     startTime   String // "09:00"
     endTime     String // "17:00"
     timezone    String
     isActive    Boolean @default(true)
   }
   
   model BlackoutDate {
     id        String @id @default(cuid())
     userId    String
     startDate DateTime
     endDate   DateTime
     reason    String?
   }
   
   model Booking {
     id            String @id @default(cuid())
     userId        String // Coach
     customerEmail String
     customerName  String?
     startTime     DateTime
     endTime       DateTime
     duration      Int // minutes
     price         Decimal?
     status        BookingStatus
     stripePaymentId String?
   }
   ```

2. **API Endpoints**:
   - `POST /api/availability/windows` - Create availability window
   - `GET /api/availability/windows?userId=xxx` - Get availability windows
   - `POST /api/availability/blackouts` - Add blackout date
   - `GET /api/availability/slots?userId=xxx&date=xxx` - Get available slots
   - `POST /api/bookings` - Create booking
   - `GET /api/bookings?userId=xxx` - List bookings

3. **Conflict Checking Logic**:
   - Function to check if booking conflicts with existing bookings
   - Function to check if time falls within blackout dates
   - Function to validate time falls within availability windows

4. **Time Slot Generation**:
   - Generate available slots from weekly windows
   - Exclude blackout dates
   - Exclude existing bookings
   - Apply buffer times between bookings

---

## 5. Booking UI + Email Automations (Purchase, Booking Confirm, Reminders)

### ✅ What Exists
- **Email service**: `lib/services/emailService.ts` - Basic email sending infrastructure
- **Email templates**: Some templates exist (lead magnet, campaign, drip course)
- **Workflow system**: Workflow model exists with email triggers
- **Booking block**: `BOOKING_CALENDAR` block type in UI

### ❌ What's Missing
- **Booking UI**: No booking calendar widget/component
- **Time slot picker**: No UI to select available time slots
- **Booking confirmation email**: No email template for booking confirmation
- **Purchase confirmation email**: No email for product/package purchase
- **Booking reminder emails**: No automated reminder system
- **Email automation triggers**: No triggers for booking-related emails
- **Booking confirmation page**: No `/booking/confirmed/[bookingId]` page

### Implementation Required
1. **Booking UI Components**:
   - `components/booking/BookingCalendar.tsx` - Calendar with available slots
   - `components/booking/TimeSlotPicker.tsx` - Select time slot
   - `components/booking/BookingForm.tsx` - Customer info form
   - `app/(public)/book/[coachSlug]/page.tsx` - Public booking page

2. **Email Templates**:
   - Booking confirmation email (to customer)
   - Booking notification email (to coach)
   - Purchase confirmation email
   - Booking reminder email (24h before)
   - Booking cancellation email

3. **Email Automation**:
   - Trigger on booking creation
   - Scheduled reminder emails (cron job or queue)
   - Purchase confirmation on webhook

4. **Booking Flow Pages**:
   - `/book/[coachSlug]` - Booking page
   - `/booking/confirm/[bookingId]` - Confirmation page
   - `/booking/cancel/[bookingId]` - Cancellation page

---

## 6. Basic Mini-Course (Lessons, Gated Access)

### ✅ What Exists
- **Course system**: Fully implemented!
  - `Course` model with lessons, enrollments, progress tracking
  - `CourseLesson` model with content types (TEXT, VIDEO, AUDIO, etc.)
  - `CourseEnrollment` model with progress tracking
  - `CourseLessonProgress` model for lesson-by-lesson progress
- **Course API**: 
  - `app/api/courses/route.ts` - List courses
  - `app/api/courses/[courseId]/route.ts` - Course CRUD
  - `app/api/courses/slug/[slug]/route.ts` - Public course by slug
  - `app/api/courses/[courseId]/enroll/route.ts` - Enrollment
  - `app/api/courses/[courseId]/progress/route.ts` - Progress tracking
- **Course UI**:
  - `app/(main)/c/[slug]/page.tsx` - Course landing page
  - `app/(main)/c/[slug]/learn/page.tsx` - Learning interface
  - `components/CourseBuilder.tsx` - Course creation/editing
- **Gated Access**: 
  - Course `accessType` enum: FREE, PAID, EMAIL_GATE, MEMBERSHIP
  - Enrollment required to access lessons
  - Progress tracking per lesson
  - Quiz system with gated progression

### ❌ What's Missing
- **Coach-specific courses**: No link between courses and coaches
- **Course → Booking link**: No way to offer course + booking combo
- **Mini-course template**: Could add starter templates for mini-courses

### Implementation Required (Minimal)
1. Add `coachId` or link courses to coach profile
2. Add course display to coach bio page
3. Optional: Create mini-course templates

---

## 7. Analytics Ingest Endpoint + Simple Dashboard (Views, Checkout, Purchases)

### ✅ What Exists
- **Analytics model**: `Analytics` and `Click` models exist
- **Analytics API**: 
  - `app/api/analytics/clicks` - Record clicks
  - `app/api/analytics/page/[pageId]` - Page analytics
  - `app/api/analytics/user/[userId]` - User analytics
- **Analytics service**: `lib/services/analyticsService.ts` - Client-side service
- **Analytics dashboard**: `components/Analytics.jsx` - Dashboard component
- **Analytics page**: `app/(main)/analytics/page.jsx` - Dashboard route
- **Tracking**: Page views, clicks, device/browser/country breakdown

### ❌ What's Missing
- **Checkout tracking**: No specific event tracking for checkout initiation
- **Purchase tracking**: Sales exist in `Sale` model but not aggregated in analytics
- **Coach-specific analytics**: No analytics dashboard filtered by coach
- **Revenue metrics**: Revenue exists in Analytics model but not well integrated
- **Checkout funnel**: No funnel tracking (view → checkout → purchase)

### Implementation Required
1. **Enhanced Analytics Ingest**:
   - `POST /api/analytics/events` - Generic event tracking endpoint
   - Track events: `page_view`, `checkout_started`, `checkout_completed`, `purchase`, `booking_created`
   - Link events to coach/user

2. **Analytics Aggregation**:
   - Aggregate checkout events
   - Aggregate purchase events from `Sale` model
   - Calculate conversion rates (views → checkout → purchase)

3. **Coach Analytics Dashboard**:
   - `app/(main)/coach/analytics/page.tsx` - Coach-specific dashboard
   - Show: views, checkouts, purchases, bookings, revenue
   - Time range filters

4. **Funnel Visualization**:
   - Views → Checkout → Purchase funnel chart
   - Booking funnel chart

---

## Implementation Priority & Phases

### Phase 1: Core Coach Platform (Week 1)
1. **Public Coach Bio Page** (`/[coachSlug]`)
   - Route + API endpoint
   - Add "Book" and "Buy" CTAs
   - Link to existing products

2. **Availability Engine**
   - Database models
   - API endpoints
   - Conflict checking logic
   - Time slot generation

3. **Basic Booking Flow**
   - Booking UI components
   - Booking creation API
   - Simple booking confirmation email

### Phase 2: Enhanced Booking & Packages (Week 2)
4. **Booking UI**
   - Calendar widget
   - Time slot picker
   - Booking form
   - Confirmation page

5. **Package System**
   - Extend Product model or create Package model
   - Package checkout flow
   - Package management UI

6. **Email Automations**
   - Booking confirmation emails
   - Purchase confirmation emails
   - Reminder system (foundation)

### Phase 3: Analytics & Polish (Week 3)
7. **Enhanced Analytics**
   - Event tracking endpoint
   - Checkout/purchase tracking
   - Coach analytics dashboard
   - Funnel visualization

8. **Reminder System**
   - Automated booking reminders
   - Email queue/job system

---

## Database Schema Changes Required

```prisma
// Add to existing schema

model AvailabilityWindow {
  id          String   @id @default(cuid())
  userId      String
  dayOfWeek   Int      // 0-6 (Sunday-Saturday)
  startTime   String   // "09:00" format
  endTime     String   // "17:00" format
  timezone    String   @default("UTC")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, dayOfWeek])
  @@map("availability_windows")
}

model BlackoutDate {
  id        String   @id @default(cuid())
  userId    String
  startDate DateTime
  endDate   DateTime
  reason    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, startDate, endDate])
  @@map("blackout_dates")
}

model Booking {
  id              String        @id @default(cuid())
  userId          String        // Coach
  customerEmail   String
  customerName    String?
  startTime       DateTime
  endTime         DateTime
  duration        Int           // minutes
  price           Decimal?      @db.Decimal(10, 2)
  currency        String        @default("USD")
  status          BookingStatus @default(PENDING)
  notes           String?       @db.Text
  stripePaymentId String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, startTime])
  @@index([customerEmail])
  @@index([status])
  @@map("bookings")
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

// Extend Profile model
model Profile {
  // ... existing fields
  isCoach        Boolean @default(false)
  coachSlug      String? @unique
  bookingEnabled Boolean @default(false)
  productsEnabled Boolean @default(false)
}

// Extend Product model
model Product {
  // ... existing fields
  type ProductType @default(PRODUCT) // PRODUCT or PACKAGE
  packageProducts String[] // Product IDs if type is PACKAGE
}

enum ProductType {
  PRODUCT
  PACKAGE
}

// Analytics events
model AnalyticsEvent {
  id        String   @id @default(cuid())
  userId    String?  // Coach
  eventType String   // page_view, checkout_started, checkout_completed, purchase, booking_created
  metadata  Json?
  timestamp DateTime @default(now())

  @@index([userId, eventType, timestamp])
  @@map("analytics_events")
}
```

---

## Estimated Implementation Time

- **Phase 1**: ~40 hours (1 week)
- **Phase 2**: ~40 hours (1 week)  
- **Phase 3**: ~24 hours (3 days)

**Total**: ~104 hours (~2.5 weeks)

---

## Notes

- Most infrastructure exists (products, courses, analytics, email)
- Focus should be on coach-specific features and availability engine
- Can leverage existing Stripe integration
- Course system is already complete - just needs coach linkage
- Analytics foundation exists - needs event tracking enhancement
