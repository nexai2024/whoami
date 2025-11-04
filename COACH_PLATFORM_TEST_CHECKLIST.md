# Coach Platform Test Checklist

## Prerequisites
- [ ] Database migration completed (`npx prisma migrate dev --name add_coach_platform`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Dev server running (`npm run dev`)
- [ ] SMTP configured (for email testing) - check `.env` for `SMTP_*` variables

## Phase 1: Coach Profile Setup

### 1.1 Enable Coach Features
- [ ] Navigate to user profile/settings
- [ ] Enable `isCoach: true` (may need to update via database or API)
- [ ] Set a `coachSlug` (e.g., "johndoe")
- [ ] Enable `bookingEnabled: true`
- [ ] Enable `productsEnabled: true`

**API Test:**
```bash
# Update profile via API (requires authentication)
PATCH /api/profiles/{userId}
{
  "isCoach": true,
  "coachSlug": "johndoe",
  "bookingEnabled": true,
  "productsEnabled": true
}
```

### 1.2 Create Coach Profile Data
- [ ] Set `displayName` (e.g., "John Doe")
- [ ] Set `bio` (e.g., "Experienced life coach")
- [ ] Set `avatar` (optional image URL)

## Phase 2: Availability Management

### 2.1 Create Availability Windows
**API Test:**
```bash
POST /api/availability/windows
Headers: { "x-user-id": "<coach-user-id>" }
{
  "dayOfWeek": 1,  // Monday (0=Sunday, 1=Monday, ...)
  "startTime": "09:00",
  "endTime": "17:00",
  "timezone": "America/New_York"
}
```

- [ ] Create availability for Monday (dayOfWeek: 1)
- [ ] Create availability for Tuesday (dayOfWeek: 2)
- [ ] Create availability for Wednesday (dayOfWeek: 3)
- [ ] Verify windows are listed: `GET /api/availability/windows?userId=<coach-user-id>`

### 2.2 Update Availability Window
**API Test:**
```bash
PATCH /api/availability/windows/{windowId}
{
  "startTime": "10:00",
  "isActive": true
}
```

- [ ] Update an existing window
- [ ] Verify changes are saved

### 2.3 Create Blackout Date
**API Test:**
```bash
POST /api/availability/blackouts
Headers: { "x-user-id": "<coach-user-id>" }
{
  "startDate": "2024-12-25T00:00:00Z",
  "endDate": "2024-12-25T23:59:59Z",
  "reason": "Holiday"
}
```

- [ ] Create a blackout date
- [ ] Verify blackout prevents bookings

### 2.4 Get Available Slots
**API Test:**
```bash
GET /api/availability/slots?userId=<coach-user-id>&date=2024-12-01&duration=60
```

- [ ] Request slots for a date within availability window
- [ ] Verify slots are returned
- [ ] Request slots for a blackout date
- [ ] Verify no slots are returned

## Phase 3: Public Coach Bio Page

### 3.1 View Coach Profile
- [ ] Navigate to `/{coachSlug}` (e.g., `/johndoe`)
- [ ] Verify coach profile displays correctly
- [ ] Verify "Book a Session" button shows (if `bookingEnabled: true`)
- [ ] Verify "View Products" button shows (if `productsEnabled: true`)

**API Test:**
```bash
GET /api/coaches/{coachSlug}
```

- [ ] Verify coach data is returned
- [ ] Verify products array is included
- [ ] Verify courses array is included

### 3.2 Test Product Display
- [ ] Create a product via Product CRUD
- [ ] Verify product appears on coach bio page
- [ ] Click "Buy Now" button
- [ ] Verify redirects to checkout

## Phase 4: Booking Flow

### 4.1 Access Booking Page
- [ ] Navigate to `/book/{coachSlug}` (e.g., `/book/johndoe`)
- [ ] Verify page loads correctly
- [ ] Verify date picker is displayed
- [ ] Verify time slots are displayed for selected date

### 4.2 Create Booking
**API Test:**
```bash
POST /api/bookings
{
  "coachUserId": "<coach-user-id>",
  "customerEmail": "customer@example.com",
  "customerName": "Jane Customer",
  "startTime": "2024-12-01T10:00:00Z",
  "duration": 60,
  "notes": "Initial consultation"
}
```

**UI Test:**
- [ ] Select a date
- [ ] Select an available time slot
- [ ] Fill in customer name
- [ ] Fill in customer email
- [ ] Add optional notes
- [ ] Submit booking form
- [ ] Verify success message
- [ ] Verify booking is created in database

### 4.3 Booking Validation
- [ ] Try to book in the past → Should fail
- [ ] Try to book outside availability windows → Should fail
- [ ] Try to book during blackout date → Should fail
- [ ] Try to double-book same time slot → Should fail (409 conflict)

## Phase 5: Email Notifications

### 5.1 Booking Confirmation Email
- [ ] Create a booking
- [ ] Check customer email inbox
- [ ] Verify booking confirmation email received
- [ ] Verify email contains:
  - [ ] Coach name
  - [ ] Booking date and time
  - [ ] Duration
  - [ ] Booking ID

### 5.2 Coach Notification Email
- [ ] Create a booking
- [ ] Check coach email inbox
- [ ] Verify booking notification email received
- [ ] Verify email contains:
  - [ ] Customer name and email
  - [ ] Booking date and time
  - [ ] Duration
  - [ ] Booking ID

### 5.3 Purchase Confirmation Email
- [ ] Complete a product purchase (via Stripe checkout)
- [ ] Verify purchase confirmation email sent
- [ ] Verify email contains product name and amount

**Note:** Email sending requires SMTP configuration. If emails are not being sent:
- Check `.env` for `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`
- Check server logs for email errors
- Emails may fail silently (logged but don't break booking creation)

## Phase 6: API Endpoints

### 6.1 Availability Windows API
- [ ] `GET /api/availability/windows` - List windows
- [ ] `POST /api/availability/windows` - Create window
- [ ] `GET /api/availability/windows/{id}` - Get specific window
- [ ] `PATCH /api/availability/windows/{id}` - Update window
- [ ] `DELETE /api/availability/windows/{id}` - Delete window

### 6.2 Blackout Dates API
- [ ] `GET /api/availability/blackouts` - List blackouts
- [ ] `POST /api/availability/blackouts` - Create blackout
- [ ] `DELETE /api/availability/blackouts/{id}` - Delete blackout

### 6.3 Slots API
- [ ] `GET /api/availability/slots?userId=X&date=Y&duration=Z` - Get available slots

### 6.4 Bookings API
- [ ] `GET /api/bookings?userId=X` - List bookings
- [ ] `POST /api/bookings` - Create booking
- [ ] Verify conflict checking works
- [ ] Verify availability validation works

### 6.5 Coach API
- [ ] `GET /api/coaches/{coachSlug}` - Get public coach profile
- [ ] Verify 404 for non-existent coach
- [ ] Verify products and courses are included

## Common Issues & Solutions

### Issue: "Coach not found" on bio page
- **Solution:** Ensure `coachSlug` is set on Profile and matches URL slug

### Issue: No available slots shown
- **Solution:** 
  - Verify availability windows are created for the selected day
  - Verify windows are `isActive: true`
  - Check timezone settings
  - Verify no blackout dates conflict

### Issue: Booking creation fails with 409
- **Solution:** Time slot is already booked. Try a different time.

### Issue: Emails not sending
- **Solution:**
  - Verify SMTP configuration in `.env`
  - Check server logs for email errors
  - Email failures don't break booking creation (designed to fail gracefully)

### Issue: Database errors
- **Solution:**
  - Run `npx prisma generate`
  - Run `npx prisma migrate dev`
  - Check database connection in `.env`

## Testing Scripts

### Quick Test Script (Node.js)
```javascript
// test-coach-platform.js
const BASE_URL = 'http://localhost:3000';

async function testCoachPlatform() {
  const coachUserId = 'YOUR_COACH_USER_ID';
  const coachSlug = 'johndoe';

  // 1. Create availability window
  const windowRes = await fetch(`${BASE_URL}/api/availability/windows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': coachUserId,
    },
    body: JSON.stringify({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'America/New_York',
    }),
  });
  console.log('Availability window created:', await windowRes.json());

  // 2. Get available slots
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const slotsRes = await fetch(
    `${BASE_URL}/api/availability/slots?userId=${coachUserId}&date=${tomorrow.toISOString().split('T')[0]}&duration=60`
  );
  console.log('Available slots:', await slotsRes.json());

  // 3. Create booking
  const bookingRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coachUserId,
      customerEmail: 'test@example.com',
      customerName: 'Test Customer',
      startTime: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
      duration: 60,
    }),
  });
  console.log('Booking created:', await bookingRes.json());

  // 4. Get coach profile
  const coachRes = await fetch(`${BASE_URL}/api/coaches/${coachSlug}`);
  console.log('Coach profile:', await coachRes.json());
}

testCoachPlatform().catch(console.error);
```

## Next Steps After Testing

1. Fix any bugs found during testing
2. Test edge cases (timezone handling, date boundaries, etc.)
3. Performance testing (multiple concurrent bookings)
4. Implement Phase 3 features (packages, analytics, reminders)
