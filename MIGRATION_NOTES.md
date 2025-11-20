# Migration Notes - Feature Completion

## Database Migrations Required

### 1. Package System (Product Model)
**Action Required:** Run migration to add package support to Product model

```bash
npx prisma migrate dev --name add_package_support
npx prisma generate
```

**Changes:**
- Added `ProductType` enum (PRODUCT, PACKAGE)
- Added `type` field to Product model (defaults to PRODUCT)
- Added `packageProducts` field (String array) to Product model

**Note:** Existing products will default to type PRODUCT, so no data migration needed.

---

## New API Endpoints Created

### Course Reviews
- `GET /api/courses/[courseId]/reviews` - Get course reviews
- `POST /api/courses/[courseId]/reviews` - Submit a review

### Course Certificates
- `GET /api/courses/[courseId]/certificate` - Generate certificate
- `POST /api/courses/[courseId]/certificate` - Issue certificate
- `GET /api/courses/[courseId]/certificate/[certificateId]/download` - Download certificate

### Booking Management
- `POST /api/bookings/[id]/cancel` - Cancel a booking

### Booking Reminders
- `POST /api/cron/booking-reminders` - Cron job for 24h reminders (requires CRON_SECRET)

### Package Checkout
- `POST /api/checkout/packages/[packageId]` - Create package checkout session

### Coach Analytics
- `GET /api/coaches/analytics` - Get coach-specific analytics

---

## New UI Components Created

### Course Reviews
- `components/courses/CourseReviews.tsx` - Review submission and display component

### Coach Analytics
- `app/(main)/coach/analytics/page.tsx` - Coach analytics dashboard

### Booking Confirmation
- `app/bookings/[id]/confirm/page.tsx` - Booking confirmation page

---

## Email Functions Added

### Booking Cancellation
- `sendBookingCancellation()` - Sends cancellation emails to customer and coach

### Booking Reminder
- `sendBookingReminder()` - Sends 24-hour reminder emails

---

## Configuration Required

### Environment Variables
Add to `.env`:
```env
# For booking reminder cron job
CRON_SECRET=your-secret-key-here
```

### Cron Job Setup
Set up a cron job to call `/api/cron/booking-reminders` daily:
- **Vercel Cron**: Add to `vercel.json`
- **Other platforms**: Use their cron job scheduler
- **Frequency**: Once per day (recommended: 9 AM UTC)

Example Vercel cron config:
```json
{
  "crons": [{
    "path": "/api/cron/booking-reminders",
    "schedule": "0 9 * * *"
  }]
}
```

---

## Testing Checklist

### Course Reviews
- [ ] Submit a review on a course page
- [ ] View reviews on course landing page
- [ ] Verify review moderation (approved field)
- [ ] Check average rating calculation

### Course Certificates
- [ ] Complete a course
- [ ] Generate certificate
- [ ] Download certificate
- [ ] Verify certificate URL works

### Booking Features
- [ ] Create a booking
- [ ] Cancel a booking (as customer)
- [ ] Cancel a booking (as coach)
- [ ] View booking confirmation page
- [ ] Verify cancellation emails sent

### Package System
- [ ] Create a package product
- [ ] Add products to package
- [ ] Create package checkout session
- [ ] Complete package purchase

### Coach Analytics
- [ ] View coach analytics dashboard
- [ ] Verify revenue calculations
- [ ] Check booking counts
- [ ] Verify enrollment counts

### Domain/Subdomain
- [ ] Set custom domain
- [ ] Verify DNS records
- [ ] Set subdomain
- [ ] Test subdomain routing

---

## Known Limitations

### Course Certificates
- Currently generates HTML certificates
- PDF generation requires additional library (pdfkit, puppeteer, or @react-pdf/renderer)
- Certificate storage: Currently uses URL-based approach, may want to store in R2/S3

### Package System
- Package management UI needs updates in ProductsDashboard
- Package discount calculation not yet implemented (uses sum of product prices)
- Package product selection UI needed

### Booking Reminders
- Requires cron job setup
- No reminder tracking field (could add `reminderSent` to Booking model)

---

## Next Steps

1. **Run database migration** for package support
2. **Set up cron job** for booking reminders
3. **Test all new features** using the checklist above
4. **Update ProductsDashboard** to support package creation UI
5. **Consider PDF library** for certificate generation
6. **Add reminder tracking** to Booking model (optional enhancement)

---

**Last Updated**: After feature completion
**Status**: Ready for testing

