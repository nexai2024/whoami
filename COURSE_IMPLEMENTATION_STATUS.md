# Course Block Workflow & Public Marketplace Implementation Status

## ✅ Completed

### Database Schema
- [x] Added `COURSE` to `BlockType` enum
- [x] Added `accessToken` and `accessTokenExpiresAt` fields to `CourseEnrollment` model
- [x] Added index on `accessToken` for fast lookups

**⚠️ REQUIRED: Run migration before testing**
```bash
npx prisma migrate dev --name add_course_block_and_access_tokens
npx prisma generate
```

### Email Service
- [x] `sendCourseEnrollmentConfirmation` - Student enrollment confirmation
- [x] `sendCoachNewEnrollmentNotification` - Coach notification on new enrollment
- [x] Both functions include HTML and text versions

### Enrollment API
- [x] Token generation for guest users
- [x] Email sending to student and coach
- [x] Access URL generation in enrollment response
- [x] Guest enrollment support (email-only, no auth required)

### Course Access API
- [x] `/api/courses/access/[token]` - Token validation endpoint
- [x] Token expiration checking
- [x] Access revocation checking
- [x] Last accessed timestamp update

### Public Course Marketplace
- [x] `/api/courses/public` - Public course listing API
- [x] Search, filter, and sort functionality
- [x] Pagination support
- [x] `/courses/marketplace` - Public marketplace page
- [x] Course cards with images, ratings, instructor info
- [x] Filter by category, level, access type
- [x] Sort by newest, popular, rating, price

---

## 🚧 In Progress / TODO

### Course Landing Page Updates
- [ ] Update `/c/[slug]/page.tsx` for guest enrollment
  - Allow email-only enrollment (no login required)
  - Show enrollment form for non-authenticated users
  - Handle token-based redirects after enrollment

### Course Learning Page Updates
- [ ] Update `/c/[slug]/learn/page.tsx` for token access
  - Accept `?token=xxx` query parameter
  - Validate token via `/api/courses/access/[token]`
  - Allow access without authentication if valid token
  - Show "create account" option for token-based users

### Course Block Type
- [ ] Add `COURSE` to block type mappings (`lib/blockTypeMapping.ts`)
- [ ] Add course block to page builder UI (`components/EnhancedPageBuilder.jsx`)
- [ ] Create course block data interface (`types/blockData.ts`)
- [ ] Handle course block rendering on public pages
- [ ] Handle course block clicks (redirect to course or enrollment)

### Block Click Handler
- [ ] Update block click tracking to handle course blocks
- [ ] Pass source tracking (pageId, blockId) to enrollment API

---

## 📋 Testing Checklist

### Workflow 1: Free Course Enrollment via Block
- [ ] Coach creates course
- [ ] Coach adds course block to bio page
- [ ] User clicks course block
- [ ] User enters email (no account creation)
- [ ] User enrolled → receives email with course access link
- [ ] Coach receives notification email
- [ ] User clicks link → accesses course without login

### Workflow 2: Paid Course Enrollment via Block
- [ ] Coach creates paid course
- [ ] Coach adds course block to bio page
- [ ] User clicks course block
- [ ] User enters email and proceeds to Stripe checkout
- [ ] User completes payment
- [ ] Stripe webhook enrolls user → sends confirmation emails
- [ ] User receives email with course access link
- [ ] Coach receives notification email with payment info

### Workflow 3: Public Marketplace
- [ ] Visit `/courses/marketplace`
- [ ] Browse published courses
- [ ] Filter by category, level, access type
- [ ] Search for courses
- [ ] Click course card → navigate to course landing page
- [ ] Enroll in course from marketplace

### Workflow 4: Authenticated User Enrollment
- [ ] Logged-in user clicks course block or visits course page
- [ ] User enrolled immediately (no email form)
- [ ] User redirected to course learning page
- [ ] Email confirmations sent to user and coach

---

## 🔧 Configuration Needed

### Environment Variables
Ensure these are set:
```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com  # or NEXT_PUBLIC_APP_URL
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...
```

---

## 📝 Notes

1. **Migration Required**: Database migration must be run before testing
2. **Email Service**: Make sure SMTP is configured for emails to send
3. **Token Expiration**: Access tokens expire after 90 days
4. **Guest Access**: Token-based access allows course viewing without full account
5. **Public Marketplace**: Fully functional, accessible at `/courses/marketplace`

---

## 🚀 Next Steps

1. **Run migration** (see above)
2. **Test email sending** - Ensure SMTP is configured
3. **Complete course landing page** - Add guest enrollment UI
4. **Complete course learning page** - Add token-based access
5. **Add course block type** - Enable course blocks in page builder
6. **Test end-to-end workflow** - Follow testing checklist
