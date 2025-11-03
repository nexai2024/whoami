# Webhook Dual Table Update

## Overview
Updated the Stack Auth webhook to create/update records in **both** Prisma `User` and `Profile` tables when users are synced.

## Changes Made

### Imports Added
```typescript
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
```

### User Creation (`user.created`)
**Creates both User and Profile in a transaction:**

1. **Prisma User**:
   - Uses Stack Auth userId as ID
   - Stores primary email
   - Generates random password (not used for auth)
   - Hashed with bcrypt

2. **Profile**:
   - Links to User via userId
   - Generates unique username
   - Stores displayName and avatar
   - Sets default plan to FREE

**Transaction ensures atomicity** - both records created or neither.

### User Update (`user.updated`)
**Updates both tables if they exist:**

1. **User**: Updates email if changed
2. **Profile**: Updates displayName and avatar

### User Deletion (`user.deleted`)
**Deletes User record**:
- Cascade deletes Profile automatically
- Handles missing records gracefully

## Password Handling

**Important**: The Prisma User password is:
- Randomly generated (64 hex chars)
- Hashed with bcrypt
- **Not used for authentication**
- Stack Auth handles all authentication

This is necessary because:
- Prisma User schema requires `password` field
- Stack Auth provides no password
- We need User records for DB relations

## Example Flow

### New User Signup:
```
Stack Auth: user.created event
  ↓
Webhook:
  1. Generates random password
  2. Hashes password
  3. Creates User:
     - id: "stack_user_123"
     - email: "john@example.com"
     - password: <random_hashed>
  4. Creates Profile:
     - userId: "stack_user_123"
     - username: "johndoe"
     - displayName: "John Doe"
     - avatar: "https://..."
     - plan: "FREE"
```

### User Updates Email:
```
Stack Auth: user.updated event
  ↓
Webhook:
  1. Updates User.email
  2. Updates Profile.displayName
  3. Updates Profile.avatar
```

### User Deletes Account:
```
Stack Auth: user.deleted event
  ↓
Webhook:
  1. Deletes User
  2. Cascade deletes Profile
```

## Error Handling

- Transaction rollback on any failure
- Graceful handling of missing records
- Unique constraint checks for username
- Email uniqueness enforced by Prisma

## Testing Checklist

- [ ] New user signup creates both records
- [ ] Transaction rollback on failure
- [ ] Username collision handling
- [ ] Email update works
- [ ] Profile update works
- [ ] Cascade delete works
- [ ] Missing record handling
- [ ] No linter errors

## Files Modified

- `app/api/webhooks/stack/user/sync/route.ts` - Complete rewrite

## Dependencies

- `bcryptjs` - Password hashing
- `crypto` - Random password generation

