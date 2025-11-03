# Profile Sync Fix for Stack Auth Users

## Problem
The Stack Auth webhook was attempting to create Prisma `User` records, but:
1. Prisma User model requires a `password` field
2. Stack Auth doesn't provide passwords (it manages auth separately)
3. Prisma User fields don't match Stack Auth data structure
4. The application needs `Profile` records for user data, not Prisma User records

## Solution
Modified `/app/api/webhooks/stack/user/sync/route.ts` to:
1. **Create/Update Profile records** instead of User records
2. **Generate unique usernames** from email or display name
3. **Handle profile updates** when Stack Auth user data changes
4. **Clean up profiles** when users are deleted
5. **Use Stack Auth userId** as the foreign key to link profiles

## Features

### User Creation (`user.created` event):
- Generates username from email/display name
- Ensures username uniqueness by appending numbers if needed
- Creates Profile with default plan (FREE)
- Stores displayName and avatar from Stack Auth

### User Updates (`user.updated` event):
- Updates existing profile's displayName and avatar
- Gracefully handles missing profiles

### User Deletion (`user.deleted` event):
- Deletes profile record
- Uses cascade delete for related data
- Handles missing profile gracefully

## Username Generation Logic:
1. If displayName exists: sanitize to lowercase alphanumeric (max 20 chars)
2. If email exists: use part before @ symbol (max 20 chars)
3. Fallback: use `user_` + first 8 chars of userId

## Example Data Flow:

### New User Signs Up:
```
Stack Auth: user.created event
  ↓
Webhook generates: username = "johndoe"
  ↓
Creates Profile:
  - userId: "stack_user_123"
  - username: "johndoe"
  - displayName: "John Doe"
  - avatar: "https://..."
  - plan: "FREE"
```

### User Updates Profile:
```
Stack Auth: user.updated event
  ↓
Webhook updates Profile:
  - displayName: "John Updated"
  - avatar: "https://new-avatar.png"
```

### User Deletes Account:
```
Stack Auth: user.deleted event
  ↓
Webhook deletes Profile:
  - All related data cascaded
```

## Testing Checklist:
- [ ] Test user sign up creates profile
- [ ] Test username collision handling
- [ ] Test profile update on Stack Auth changes
- [ ] Test profile deletion on account deletion
- [ ] Verify cascade deletes work correctly
- [ ] Check for linter errors (✅ No errors)

## Files Modified:
- `app/api/webhooks/stack/user/sync/route.ts` - Complete rewrite of webhook logic

## Related Systems:
- Stack Auth manages authentication
- Prisma Profile stores user data
- Course LMS uses userId from Stack Auth
- My Courses dashboard uses Profile data

