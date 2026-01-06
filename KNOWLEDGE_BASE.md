# WhoAmI Platform - Complete Knowledge Base

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Core Features & Functionality](#core-features--functionality)
4. [Database Schema & Data Models](#database-schema--data-models)
5. [API Architecture](#api-architecture)
6. [User Workflows & User Journeys](#user-workflows--user-journeys)
7. [Integration Guide](#integration-guide)
8. [Developer Guide](#developer-guide)
9. [Deployment & Configuration](#deployment--configuration)
10. [Best Practices & Guidelines](#best-practices--guidelines)

---

## Platform Overview

WhoAmI is a comprehensive link-in-bio and personal brand marketing platform that transforms digital presence into an intelligent hub for content, community, and commerce. The platform empowers creators, coaches, entrepreneurs, and businesses to build beautiful, functional landing pages without coding knowledge while providing advanced features for monetization, engagement, and analytics.

### Core Value Proposition

WhoAmI combines three critical pillars of digital success:

1. **Content Hub**: Drag-and-drop page builder with 30+ block types, enabling users to create stunning landing pages that serve as their digital headquarters.
2. **Community Building**: Advanced engagement tools including AMA blocks, gated content, email capture, lead magnets, and automated workflows to build and nurture audiences.
3. **Commerce Engine**: Native e-commerce capabilities including digital product sales, course/LMS system, booking management, tip collection, and subscription services.

### Target Users

- **Content Creators**: Bloggers, YouTubers, podcasters, and social media influencers seeking to monetize their audience.
- **Coaches & Consultants**: Life coaches, business consultants, and trainers offering services and courses.
- **Entrepreneurs**: Small business owners and solopreneurs needing an all-in-one marketing and sales platform.
- **Creatives**: Artists, photographers, musicians, and designers showcasing portfolios and selling digital products.

### Platform Statistics

- **95+ Fully Implemented Features**: Comprehensive feature set covering all aspects of digital presence management.
- **30+ Block Types**: Flexible content blocks for every use case.
- **Multi-Platform Support**: Custom domains, subdomains, and native integrations.
- **Enterprise-Ready**: Scalable architecture built on Next.js, Prisma, and PostgreSQL.

---

## Architecture & Technology Stack

### Frontend Architecture

WhoAmI is built using **Next.js 16** with the App Router, providing server-side rendering, static generation, and API routes in a unified framework.

**Key Frontend Technologies:**
- **React 19**: Modern React with concurrent features and improved performance.
- **TypeScript**: Type-safe development across the entire codebase.
- **Tailwind CSS 4**: Utility-first CSS framework for rapid UI development.
- **Framer Motion**: Animation library for smooth, professional transitions.
- **TipTap**: Rich text editor for content creation.
- **dnd-kit**: Drag-and-drop functionality for page builder.

**Component Architecture:**
```
components/
├── ui/                    # Reusable UI primitives (buttons, dialogs, inputs)
├── auth/                  # Authentication components
├── lead-management/       # Lead management Kanban/list views
├── courses/               # Course builder and learning interfaces
├── marketing/             # Campaign and automation components
└── ...                    # Feature-specific components
```

### Backend Architecture

**Server Framework:**
- **Next.js API Routes**: RESTful API endpoints under `app/api/`
- **Route Handlers**: Modern Next.js 16 route handler pattern with TypeScript

**Database Layer:**
- **PostgreSQL**: Primary relational database
- **Prisma 7**: Next-generation ORM with type-safe database access
- **Prisma Accelerate**: Edge-compatible database connection pooling
- **Database Migrations**: Version-controlled schema changes

**Key Backend Technologies:**
- **Node.js**: Runtime environment
- **Stripe**: Payment processing and subscription management
- **Nodemailer**: Email delivery system
- **UploadThing**: File upload and management
- **Cloudflare R2**: Object storage for media files

### Authentication & Authorization

**Stack Auth Integration:**
- **Stack Auth (@stackframe/stack)**: Complete authentication solution
- **User Management**: Profile management, username system, onboarding
- **Protected Routes**: Middleware-based route protection
- **Role-Based Access**: Admin, coach, and user role distinctions

### Third-Party Integrations

- **Stripe**: Payments, subscriptions, Connect for creators
- **Stack Auth**: Authentication and user management
- **UploadThing**: File uploads
- **OpenAI**: AI-powered features (campaign generation, content optimization)
- **ZenoAssist**: Customer support widget

### File Structure

```
whoami/
├── app/                    # Next.js App Router
│   ├── (main)/            # Main application routes (protected)
│   ├── api/               # API endpoints
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/                   # Utilities and services
│   ├── services/         # Business logic services
│   ├── database/         # Database helpers
│   ├── utils/            # Shared utilities
│   └── auth/             # Authentication logic
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── package.json          # Dependencies
```

---

## Core Features & Functionality

### 1. Page Builder System

The page builder is the heart of WhoAmI, enabling users to create professional landing pages through an intuitive drag-and-drop interface.

**Enhanced Page Builder Features:**
- **Drag-and-Drop Interface**: Visual block arrangement with real-time preview
- **Block Reordering**: Seamless position management with automatic persistence
- **30+ Block Types**: Comprehensive content options from simple links to complex integrations
- **Live Preview**: Real-time rendering of changes before publishing
- **Responsive Design**: Automatic mobile optimization
- **Custom Styling**: Colors, fonts, borders, backgrounds per block
- **SEO Optimization**: Built-in meta tags, Open Graph, and structured data

**Supported Block Types:**
- **Content Blocks**: LINK, TEXT_BLOCK, IMAGE_GALLERY, VIDEO_EMBED, DIVIDER
- **E-commerce**: PRODUCT, TIP_JAR, DISCOUNT
- **Engagement**: EMAIL_CAPTURE, CONTACT_FORM, AMA_BLOCK, SOCIAL_FEED
- **Educational**: COURSE, GATED_CONTENT
- **Marketing**: PROMO, NEWSLETTER, WAITLIST, SOCIAL_SHARE
- **Advanced**: ANALYTICS, RSS_FEED, PORTFOLIO, FUNNEL, BOOKING_CALENDAR

### 2. E-Commerce & Payments

WhoAmI includes a fully integrated e-commerce engine powered by Stripe.

**Product Management:**
- **Digital Products**: Upload and sell digital files with download limits
- **Product Catalog**: Full CRUD operations for product management
- **Product Blocks**: Embed products directly in pages
- **Checkout Flow**: Secure Stripe Elements checkout integration
- **Sales Tracking**: Complete transaction history and analytics

**Payment Processing:**
- **Stripe Integration**: Full payment processing via Stripe
- **One-Time Payments**: Product purchases, tips, one-off services
- **Subscription Management**: Recurring billing for premium features
- **Stripe Connect**: Creator account onboarding for revenue sharing
- **Webhook Handling**: Automated event processing for payments and subscriptions

**Revenue Features:**
- **Creator Earnings**: Track and manage creator payouts
- **Multiple Revenue Streams**: Products, courses, bookings, subscriptions
- **Invoice Management**: Automatic invoice generation and tracking

### 3. Course/LMS System

A complete Learning Management System (LMS) for selling and delivering online courses.

**Course Creation:**
- **Course Builder**: Visual course creation interface
- **Multi-Format Lessons**: Text, video, audio, PDF, embedded content, mixed media
- **Lesson Resources**: Downloadable files per lesson (PDFs, worksheets, templates)
- **Quiz System**: Assessment creation and tracking
- **Drip Content**: Scheduled content release (day-based or lesson-based)
- **Access Control**: FREE, PAID, EMAIL_GATE, MEMBERSHIP access types

**Student Experience:**
- **Public Marketplace**: Browse and discover courses
- **Guest Enrollment**: Email-only enrollment without account creation
- **Token-Based Access**: Secure 90-day access tokens for guest users
- **Progress Tracking**: Per-lesson and overall course completion tracking
- **Learning Interface**: Clean, distraction-free learning environment
- **Certificate Generation**: Automatic certificate creation upon completion

**Course Management:**
- **Course Analytics**: Enrollment, completion rates, revenue tracking
- **Review System**: Student reviews and ratings
- **Course Blocks**: Embed courses directly in pages
- **Enrollment Emails**: Automated notifications for students and instructors

### 4. Lead Management System

Comprehensive CRM functionality for managing prospects and customers.

**Lead Pipeline:**
- **Kanban View**: Visual drag-and-drop lead management
- **List View**: Table-based lead organization
- **Lead Stages**: NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST
- **Lead Filtering**: Advanced filtering by stage, source, tags, date ranges
- **Lead Details**: Comprehensive lead information modal

**Lead Features:**
- **Source Tracking**: UTM parameters, referral sources, campaign attribution
- **Tags System**: Flexible tagging for organization
- **Notes & Activity**: Complete interaction history
- **Estimated Value**: Revenue potential tracking
- **Lead Context Menu**: Quick actions (edit, delete, change stage)

### 5. Lead Magnets

Capture leads with valuable downloadable content and automated delivery.

**Lead Magnet Types:**
- **Multiple Formats**: PDF, eBook, template, checklist, workbook, video course
- **Multi-Asset Courses**: Drip-fed course content via email
- **Template Library**: Pre-built lead magnet templates

**Delivery Methods:**
- **Instant Download**: Immediate access after opt-in
- **Email Delivery**: Automated email with download link
- **Gated Content**: Require email for access
- **Drip Course Delivery**: Scheduled asset release over time
- **Hybrid**: Combination of instant and email delivery

**Features:**
- **Opt-In Forms**: Customizable copy and design
- **Secure Tokens**: Time-limited download links
- **Download Tracking**: Analytics on downloads and conversions
- **Performance Metrics**: Views, opt-ins, conversion rates

### 6. Marketing Automation

AI-powered marketing tools for content creation and distribution.

**Campaign Management:**
- **AI Campaign Generation**: Automated campaign creation with OpenAI
- **Multi-Platform Assets**: Generate content for multiple social platforms
- **Campaign Templates**: Pre-built campaign templates
- **Asset Library**: Organize and manage marketing assets

**Content Repurposing:**
- **Cross-Platform Adaptation**: Repurpose content for different platforms
- **AI Optimization**: Improve content for specific audiences
- **Repurpose Tracking**: Performance analytics across platforms

**Social Media Scheduling:**
- **Post Scheduling**: Schedule posts across platforms
- **Optimal Time Analysis**: AI-powered best posting time suggestions
- **Bulk Scheduling**: Schedule multiple posts at once
- **Post Templates**: Reusable post templates

### 7. Workflow Automation

Visual workflow builder for automating business processes.

**Workflow Builder:**
- **Visual Interface**: Drag-and-drop workflow creation
- **Multiple Triggers**: Email subscription, course enrollment, lesson completion, webhooks
- **Action Steps**: Email sending, tag management, course enrollment, webhook calls
- **Conditional Logic**: Branch workflows based on conditions
- **Delay Steps**: Schedule actions with time delays

**Workflow Execution:**
- **Automatic Triggering**: Event-driven workflow execution
- **Execution Logging**: Complete audit trail
- **Error Handling**: Robust error recovery
- **Testing Tools**: Test workflows before activation

**Use Cases:**
- Welcome email sequences
- Course onboarding automation
- Lead nurturing workflows
- Tag-based segmentation
- Re-engagement campaigns

### 8. Conversion Funnels

Build multi-step conversion funnels to guide users through complex journeys.

**Funnel Types:**
- **Landing Pages**: High-converting landing pages
- **Lead Capture**: Email and information collection
- **Sales Funnels**: Product sales with upsells/downsells
- **Order Pages**: Checkout and payment collection
- **Thank You Pages**: Post-purchase confirmation

**Funnel Features:**
- **Step Management**: Multiple step types and configurations
- **Progress Tracking**: User journey analytics
- **Conversion Analytics**: Step-by-step conversion rates
- **UTM Tracking**: Complete attribution tracking
- **Form Submission**: Capture form data within funnels
- **Interaction Tracking**: User behavior analytics

### 9. Coach Platform

Dedicated features for coaches, consultants, and service providers.

**Booking System:**
- **Availability Windows**: Set weekly availability patterns
- **Blackout Dates**: Block specific dates (holidays, vacations)
- **Time Slot Generation**: Automatic available slot calculation
- **Booking Management**: View, edit, and cancel bookings
- **Booking Reminders**: Automated 24-hour reminder emails
- **Cancellation Flow**: Customer and coach cancellation options

**Coach Profile:**
- **Public Bio Page**: Customizable coach landing page
- **Slug-Based Routing**: `/coach/[coachSlug]` public pages
- **Product Display**: Showcase products and services
- **Course Display**: Highlight educational offerings
- **Book/Buy CTAs**: Clear call-to-action buttons

**Packages:**
- **Package Products**: Bundle multiple products/services
- **Package Checkout**: Specialized checkout flow
- **Revenue Tracking**: Package-specific analytics

**Coach Analytics:**
- **Revenue Metrics**: Total revenue, product sales, course enrollments
- **Booking Analytics**: Booking volume, cancellation rates
- **Performance Dashboard**: Comprehensive coach-specific insights

### 10. Analytics & Insights

Comprehensive analytics across all platform features.

**Page Analytics:**
- **View Tracking**: Page views with device breakdown (mobile, desktop, tablet)
- **Click Tracking**: Block-level click analytics
- **Traffic Sources**: Direct, social, search, referral tracking
- **UTM Parameter Tracking**: Complete campaign attribution
- **Geographic Data**: Country and city-level analytics
- **Top Blocks**: Most-clicked content identification

**Business Analytics:**
- **Revenue Analytics**: Sales, subscriptions, course revenue
- **Conversion Metrics**: Opt-in rates, course completion, purchase funnels
- **User Analytics**: Per-user activity aggregation
- **Campaign Performance**: Marketing campaign effectiveness

**Visualization:**
- **Interactive Dashboards**: Chart-based data visualization
- **Export Capabilities**: Data export for external analysis
- **Real-Time Updates**: Live analytics updates

### 11. Domain & Subdomain Management

Professional domain management for branded experiences.

**Custom Domains:**
- **Domain Setup**: Connect custom domains to pages
- **DNS Verification**: Real-time DNS lookup (CNAME and TXT records)
- **Status Tracking**: PENDING, VERIFIED, FAILED status monitoring
- **Multiple Domains**: Manage multiple domains per user

**Subdomains:**
- **Subdomain Creation**: Create branded subdomains (e.g., username.whoami.com)
- **Uniqueness Checking**: Automatic duplicate prevention
- **Database Routing**: Middleware-based subdomain routing
- **Subdomain API**: Full CRUD operations for subdomains

**Routing:**
- **Middleware-Based**: Database-driven routing system
- **Page Mapping**: Map domains/subdomains to specific pages
- **SSL Management**: Automatic SSL certificate provisioning (pending)

### 12. Billing & Subscriptions

Flexible subscription management with feature-based access.

**Subscription Plans:**
- **Plan Tiers**: Multiple plan levels with different features
- **Feature Definitions**: Granular feature tracking
- **Plan Features**: Plan-to-feature mapping
- **Usage Tracking**: Feature usage records and quotas

**Stripe Integration:**
- **Subscription Checkout**: Complete checkout flow
- **Webhook Processing**: All subscription events handled
- **Customer Portal**: Self-service subscription management
- **Invoice Management**: Automatic invoice generation

**Usage Management:**
- **Feature Gates**: UI blocking based on plan features
- **Usage Records**: Track feature usage per user
- **Quota Enforcement**: Limit enforcement (pending implementation)

---

## Database Schema & Data Models

WhoAmI uses Prisma as its ORM, providing type-safe database access with a comprehensive schema covering all platform features.

### Core Models

**User & Authentication:**
- **User**: Core user accounts (managed by Stack Auth)
- **Profile**: Extended user profile information
- **Onboarding**: User onboarding state tracking

**Content Management:**
- **Page**: Main landing pages with metadata, SEO, analytics
- **Block**: Individual content blocks with type, position, data
- **PageTemplate**: Reusable page templates

**E-Commerce:**
- **Product**: Digital products with pricing, files, download limits
- **Sale**: Transaction records with Stripe integration
- **Subscription**: User subscription records
- **Plan**: Subscription plan definitions
- **Feature**: Feature definitions for access control
- **PlanFeature**: Many-to-many plan-feature relationships

**Education:**
- **Course**: Course definitions with metadata, access types
- **CourseLesson**: Individual lessons with content types
- **LessonResource**: Downloadable resources per lesson
- **CourseEnrollment**: Student enrollments with progress tracking
- **CourseLessonProgress**: Per-lesson completion tracking
- **CourseReview**: Student reviews and ratings

**Marketing:**
- **LeadMagnet**: Lead magnet definitions
- **LeadMagnetAsset**: Assets within lead magnets
- **LeadMagnetDelivery**: Delivery tracking with tokens
- **Campaign**: Marketing campaign definitions
- **CampaignAsset**: Multi-platform campaign assets
- **ScheduledPost**: Social media post scheduling

**Automation:**
- **Workflow**: Workflow definitions
- **WorkflowTrigger**: Trigger configurations
- **WorkflowStep**: Action steps within workflows
- **WorkflowExecution**: Execution records and logging

**Coaching:**
- **AvailabilityWindow**: Weekly availability patterns
- **BlackoutDate**: Date-based unavailability
- **Booking**: Appointment bookings with status tracking

**Analytics:**
- **Analytics**: Page view and click tracking
- **Click**: Individual click records
- **Lead**: Lead records with pipeline management

**Integration:**
- **Integration**: Third-party integrations
- **Webhook**: Webhook endpoints
- **ErrorLog**: Error tracking
- **AuditLog**: Audit trail

### Key Relationships

- **User → Pages**: One-to-many (users create multiple pages)
- **Page → Blocks**: One-to-many (pages contain multiple blocks)
- **User → Products**: One-to-many (users create products)
- **User → Courses**: One-to-many (instructors create courses)
- **Course → Lessons**: One-to-many (courses contain lessons)
- **Course → Enrollments**: One-to-many (courses have multiple enrollments)
- **User → Subscriptions**: One-to-one (users have one active subscription)
- **Subscription → Plan**: Many-to-one (subscriptions reference plans)

### Database Indexing

Prisma schema includes strategic indexes for performance:
- User lookups by email, username
- Page lookups by slug, subdomain, domain
- Course lookups by slug
- Analytics queries by date ranges
- Lead filtering by stage, source, tags

---

## API Architecture

WhoAmI follows RESTful API principles with Next.js Route Handlers.

### API Route Structure

All API routes are located in `app/api/` following Next.js conventions:

```
app/api/
├── pages/              # Page CRUD operations
├── blocks/             # Block management
├── products/           # Product management
├── courses/            # Course and LMS operations
├── lead-magnets/       # Lead magnet management
├── campaigns/          # Marketing campaign APIs
├── workflows/          # Workflow automation APIs
├── bookings/           # Booking management
├── subscriptions/      # Subscription management
├── webhooks/           # Webhook handlers
└── ...                 # Feature-specific endpoints
```

### Request/Response Patterns

**Standard GET Request:**
```typescript
export async function GET(request: NextRequest) {
  // Authentication check
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Business logic
  const data = await prisma.model.findMany({ where: { userId } });
  
  // Response
  return NextResponse.json({ data });
}
```

**Standard POST Request:**
```typescript
export async function POST(request: NextRequest) {
  // Authentication
  const userId = request.headers.get('x-user-id');
  
  // Body parsing
  const body = await request.json();
  
  // Validation
  // ... validation logic
  
  // Database operation
  const result = await prisma.model.create({ data: { ...body, userId } });
  
  // Response
  return NextResponse.json({ result }, { status: 201 });
}
```

### Authentication

API endpoints use header-based authentication:
- **x-user-id**: User ID from authenticated session
- **Stack Auth**: Server-side user verification via `stackServerApp.getUser()`
- **Rate Limiting**: Protection against abuse via `lib/rate-limit.ts`

### Error Handling

Standardized error responses:
```typescript
{
  error: "Error message",
  status: 400 | 401 | 403 | 404 | 500
}
```

### Webhook Endpoints

**Stripe Webhooks** (`/api/webhooks/route.ts`):
- Payment events (payment_intent, checkout.session)
- Subscription events (created, updated, deleted)
- Invoice events (paid, payment_failed)
- Customer events (created)

**Workflow Triggers**:
- Email subscription triggers
- Course enrollment triggers
- Lesson completion triggers
- Custom webhook triggers

### Rate Limiting

API protection via rate limiting service:
- Configurable limits per endpoint
- IP-based and user-based limiting
- Automatic rate limit headers in responses

---

## User Workflows & User Journeys

### New User Onboarding

1. **Account Creation**: User signs up via Stack Auth
2. **Onboarding Flow**: Guided tour through key features
3. **Profile Setup**: Username, display name, bio, avatar
4. **First Page Creation**: Template selection or blank page
5. **Feature Discovery**: Tooltips and help buttons

### Creating a Landing Page

1. **Page Creation**: Click "New Page" → Enter title and description
2. **Template Selection**: Choose from template library or start blank
3. **Block Addition**: Drag blocks from sidebar onto page
4. **Content Editing**: Click blocks to edit content, styles
5. **Block Reordering**: Drag blocks to rearrange
6. **Preview**: Real-time preview of public page
7. **Publishing**: Publish page → Get public URL

### Selling a Digital Product

1. **Product Creation**: Marketing → Products → New Product
2. **Upload File**: Upload digital product file (PDF, video, etc.)
3. **Set Price**: Configure pricing and download limits
4. **Add to Page**: Use PRODUCT block to embed on page
5. **Customer Purchase**: Customer clicks product → Stripe checkout
6. **Delivery**: Automatic file delivery after payment
7. **Analytics**: Track sales in Products dashboard

### Creating and Selling a Course

1. **Course Creation**: Courses → New Course
2. **Course Details**: Title, description, price, access type
3. **Add Lessons**: Create lessons with content (video, text, etc.)
4. **Add Resources**: Upload downloadable resources per lesson
5. **Configure Drip**: Set up content release schedule (optional)
6. **Publish Course**: Make course available in marketplace
7. **Student Enrollment**: Students enroll (free or paid)
8. **Content Delivery**: Students access lessons based on progress
9. **Certificate**: Automatic certificate upon completion

### Lead Generation Workflow

1. **Create Lead Magnet**: Marketing → Lead Magnets → New
2. **Upload Content**: Upload PDF, eBook, or course files
3. **Configure Delivery**: Choose delivery method (instant, email, drip)
4. **Create Opt-In Form**: Customize email capture form
5. **Add to Page**: Embed lead magnet block on page
6. **Lead Capture**: Visitors opt-in with email
7. **Automated Delivery**: System sends content via configured method
8. **Lead Management**: Leads appear in Leads dashboard
9. **Nurture Workflow**: Automate follow-up via workflows

### Booking Management (Coach)

1. **Set Availability**: Coach → Availability → Configure windows
2. **Set Blackout Dates**: Block unavailable dates
3. **Public Booking Page**: Share `/book/[coachSlug]` URL
4. **Customer Books**: Customer selects time slot, fills form
5. **Confirmation**: Automatic confirmation email to both parties
6. **Reminder**: 24-hour reminder email sent automatically
7. **Booking Management**: View/edit bookings in Coach → Bookings
8. **Cancellation**: Either party can cancel with email notifications

### Marketing Campaign Creation

1. **Campaign Creation**: Marketing → Campaigns → New Campaign
2. **AI Generation**: Option to use AI for campaign ideas
3. **Asset Creation**: Create posts for multiple platforms
4. **Scheduling**: Schedule posts via Schedule tab
5. **Optimal Times**: AI suggests best posting times
6. **Content Repurposing**: Repurpose content for different platforms
7. **Performance Tracking**: Monitor campaign analytics

---

## Integration Guide

### Stripe Integration

**Setup:**
1. Obtain Stripe API keys (publishable and secret)
2. Configure webhook endpoint: `https://yourdomain.com/api/webhooks`
3. Subscribe to events: payment_intent, checkout.session, subscription.*, invoice.*

**Implementation:**
- Payment processing via Stripe Elements
- Subscription management via Stripe Subscriptions API
- Webhook handling in `/api/webhooks/route.ts`
- Creator payouts via Stripe Connect

**Key Files:**
- `lib/stripe.ts`: Stripe client initialization
- `lib/actions/stripe.ts`: Server actions for Stripe
- `app/api/webhooks/route.ts`: Webhook handler

### Stack Auth Integration

**Setup:**
1. Configure Stack Auth project
2. Set environment variables for Stack keys
3. Configure callback URLs

**Implementation:**
- Client-side: `@stackframe/stack` package
- Server-side: `stackServerApp.getUser()` for authentication
- Protected routes via middleware

**Key Files:**
- `lib/auth/serverAuth.ts`: Server-side auth utilities
- `app/(main)/layout.tsx`: Stack provider wrapper
- `components/auth/`: Authentication UI components

### File Upload Integration

**UploadThing:**
- Configured for general file uploads
- Used for product files, course content, lead magnets

**Cloudflare R2:**
- Object storage for media files
- Pre-signed URLs for secure downloads

**Key Files:**
- `lib/services/storageService.ts`: Storage abstraction
- `app/api/upload/route.ts`: Upload endpoint

### Email Integration

**Nodemailer:**
- SMTP configuration for email delivery
- Template-based emails for notifications
- Automated email sequences

**Email Types:**
- Course enrollment confirmations
- Booking confirmations and reminders
- Lead magnet deliveries
- Workflow automation emails

**Key Files:**
- `lib/services/emailService.ts`: Email service

### OpenAI Integration

**Use Cases:**
- Campaign generation
- Content repurposing
- SEO optimization suggestions
- Optimal posting time analysis

**Key Files:**
- `lib/services/aiService.ts`: AI service wrapper

---

## Developer Guide

### Getting Started

**Prerequisites:**
- Node.js 18+
- PostgreSQL database
- npm or yarn

**Installation:**
```bash
# Clone repository
git clone <repository-url>
cd whoami

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

### Development Workflow

**Running Locally:**
```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

**Database Operations:**
```bash
npx prisma migrate dev    # Create and apply migration
npx prisma generate       # Generate Prisma Client
npx prisma studio         # Open Prisma Studio GUI
```

### Adding a New Feature

**1. Create Database Models:**
Edit `prisma/schema.prisma`:
```prisma
model NewFeature {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  // ... fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**2. Create API Endpoint:**
Create `app/api/new-feature/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Implementation
}

export async function POST(request: NextRequest) {
  // Implementation
}
```

**3. Create UI Components:**
Create components in `components/new-feature/`

**4. Create Page:**
Create `app/(main)/new-feature/page.tsx`

### Code Style Guidelines

**TypeScript:**
- Use TypeScript for all new files
- Avoid `any` types; use proper typing
- Use Prisma-generated types where possible

**Component Patterns:**
- Use functional components with hooks
- Separate logic from presentation
- Use custom hooks for reusable logic

**API Patterns:**
- Always check authentication
- Validate input data
- Handle errors gracefully
- Return consistent response formats

### Testing

**Unit Tests:**
- Use Vitest for unit testing
- Test services and utilities
- Mock external dependencies

**Integration Tests:**
- Test API endpoints
- Test database operations
- Test authentication flows

### Common Patterns

**Database Access:**
```typescript
import prisma from '@/lib/prisma';

const data = await prisma.model.findMany({
  where: { userId },
  include: { relatedModel: true }
});
```

**Authentication:**
```typescript
import { stackServerApp } from '@/stack/server';

const user = await stackServerApp.getUser();
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Error Handling:**
```typescript
try {
  // Operation
} catch (error) {
  logger.error('Operation failed:', error);
  return NextResponse.json(
    { error: 'Operation failed' },
    { status: 500 }
  );
}
```

---

## Deployment & Configuration

### Environment Variables

**Required Variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/whoami

# Authentication
STACK_PROJECT_ID=your-stack-project-id
STACK_SERVER_SECRET=your-stack-server-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# File Storage
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# Cloudflare R2 (optional)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# Prisma Accelerate (optional)
PRISMA_ACCELERATE_URL=prisma://...
```

### Deployment Checklist

**Pre-Deployment:**
- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Generate Prisma Client
- [ ] Run build locally to verify
- [ ] Run linting and fix errors

**Deployment:**
- [ ] Deploy to hosting platform (Vercel recommended)
- [ ] Configure environment variables in hosting dashboard
- [ ] Set up database (managed PostgreSQL recommended)
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Configure webhook endpoints

**Post-Deployment:**
- [ ] Verify database connection
- [ ] Test authentication flow
- [ ] Verify Stripe webhooks are receiving events
- [ ] Test file uploads
- [ ] Verify email delivery
- [ ] Monitor error logs

### Vercel Deployment

**Recommended Platform:** Vercel (optimized for Next.js)

**Steps:**
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Deploy

**Vercel-Specific:**
- Automatic SSL certificates
- Edge network distribution
- Built-in analytics
- Preview deployments for PRs

### Database Setup

**Recommended:** Managed PostgreSQL (Vercel Postgres, Supabase, Neon)

**Migration Strategy:**
1. Run migrations in development
2. Test migrations on staging
3. Run migrations in production
4. Always backup before migrations

### Monitoring & Logging

**Error Tracking:**
- ErrorLog model for application errors
- Error console for admin viewing
- External service integration (optional)

**Analytics:**
- Vercel Analytics integration
- Custom analytics tracking
- Performance monitoring

---

## Best Practices & Guidelines

### Security Best Practices

**Authentication:**
- Always verify user authentication on API routes
- Use server-side authentication checks
- Never trust client-side authentication alone

**Data Validation:**
- Validate all user input
- Use Zod for schema validation
- Sanitize user-generated content

**Database:**
- Use parameterized queries (Prisma handles this)
- Never expose database credentials
- Use connection pooling (Prisma Accelerate)

**Payment Processing:**
- Never store credit card information
- Use Stripe's secure payment methods
- Verify webhook signatures
- Handle payment failures gracefully

### Performance Optimization

**Database:**
- Use database indexes strategically
- Implement pagination for large datasets
- Use `select` to limit returned fields
- Cache frequently accessed data

**API:**
- Implement rate limiting
- Use efficient database queries
- Return only necessary data
- Use HTTP caching where appropriate

**Frontend:**
- Code split with Next.js automatic splitting
- Lazy load images and components
- Optimize bundle size
- Use Next.js Image component

### Code Organization

**File Structure:**
- Keep related code together
- Use feature-based organization
- Separate concerns (UI, logic, data)

**Naming Conventions:**
- Use descriptive names
- Follow TypeScript/JavaScript conventions
- Use consistent patterns across codebase

**Component Design:**
- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic to hooks
- Use TypeScript interfaces for props

### Error Handling

**API Errors:**
- Return appropriate HTTP status codes
- Provide clear error messages
- Log errors for debugging
- Don't expose sensitive information

**User-Facing Errors:**
- Show user-friendly messages
- Provide actionable guidance
- Use toast notifications for feedback
- Implement error boundaries

### Documentation

**Code Documentation:**
- Document complex logic
- Use JSDoc for functions
- Comment database schema decisions
- Maintain this knowledge base

**API Documentation:**
- Document endpoint parameters
- Provide example requests/responses
- Document authentication requirements
- Keep documentation up to date

---

## Conclusion

WhoAmI is a powerful, feature-rich platform that combines content creation, community building, and commerce in a single, unified system. This knowledge base provides comprehensive documentation of the platform's architecture, features, and development guidelines.

For additional support:
- Review the feature inventory (`FEATURE_INVENTORY.md`)
- Check implementation summaries for specific features
- Consult the codebase for implementation details
- Reach out to the development team for assistance

**Last Updated:** Current date
**Platform Version:** 0.1.0 (Beta)
**Next.js Version:** 16.0.7
**Prisma Version:** 7.2.0

---

*This knowledge base is a living document and will be updated as the platform evolves.*

