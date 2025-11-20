# Super Admin Plan Protection

## Overview
Super Admin plans are now protected and can only be seen and assigned by current super admins. They cannot be purchased through normal checkout flows.

## Implementation

### 1. Admin Utilities (`lib/utils/adminUtils.ts`)
Created utility functions to check super admin status:

- **`isSuperAdminPlan(plan)`** - Checks if a plan is a super admin plan by:
  - PlanEnum = 'SUPER_ADMIN'
  - Plan name containing "super admin" (case insensitive)

- **`isSuperAdmin(userId)`** - Checks if a user is currently a super admin:
  - User must have an active subscription
  - Subscription plan must be a super admin plan

- **`isSuperAdminPlanById(planId)`** - Checks if a plan ID corresponds to a super admin plan

### 2. API Filtering (`app/api/plans/route.ts`)
- Plans API now filters out super admin plans for non-super admin users
- Super admins can see all plans, including super admin plans
- Non-authenticated users see no super admin plans

### 3. Checkout Protection (`app/api/subscriptions/checkout/route.ts`)
- Checkout endpoint blocks attempts to purchase super admin plans
- Returns 403 error: "This plan cannot be purchased. It must be assigned by a super admin."

### 4. Subscription Update Protection (`app/api/subscriptions/[id]/route.ts`)
- Prevents non-super admins from upgrading/changing to super admin plans
- Only super admins can update subscriptions to super admin plans
- Returns 403 error if attempted by non-super admin

### 5. Client-Side Protection (`app/(main)/settings/billing/page.tsx`)
- Client-side filtering as defense in depth (already filtered by API)
- Checks if user is super admin based on current subscription
- Hides super admin plans from UI for non-super admins
- Disables upgrade buttons for super admin plans
- Shows "Not Available" instead of "Upgrade" for super admin plans

## How It Works

### Super Admin Plan Detection
A plan is considered a super admin plan if:
1. `planEnum === 'SUPER_ADMIN'` (if PlanEnum includes SUPER_ADMIN)
2. OR plan name contains "super admin" (case insensitive)

### Super Admin User Detection
A user is a super admin if:
1. They have an active subscription
2. Their subscription's plan is a super admin plan

## Security Layers

1. **API Filtering** - Primary protection: Super admin plans never sent to non-super admins
2. **Checkout Protection** - Blocks purchase attempts at checkout
3. **Update Protection** - Prevents subscription changes to super admin plans
4. **Client-Side Filtering** - Defense in depth: UI filtering even if API data somehow includes it

## Assigning Super Admin Plans

Super admin plans can only be assigned by:
1. **Direct Database Updates** - Super admins can directly update the database
2. **Admin API Endpoints** - If admin APIs exist, they can assign plans
3. **Manual Assignment** - Through admin tools or direct database access

To assign a super admin plan:
```sql
-- Example: Assign super admin plan to user
UPDATE subscriptions 
SET planId = '<super-admin-plan-id>', status = 'active'
WHERE userId = '<user-id>';
```

## Testing

### Test Cases

1. **Non-super admin viewing plans**
   - Should NOT see super admin plans in `/api/plans`
   - Should NOT see super admin plans in billing page

2. **Non-super admin attempting checkout**
   - Should receive 403 error when trying to checkout super admin plan
   - Checkout button should be disabled

3. **Non-super admin attempting upgrade**
   - Should receive 403 error when trying to upgrade to super admin plan
   - Upgrade button should show "Not Available"

4. **Super admin viewing plans**
   - SHOULD see all plans including super admin plans
   - Can see super admin plans in billing page

5. **Super admin checkout/upgrade**
   - Can attempt checkout for super admin plan (if allowed by business logic)
   - Can upgrade to super admin plan (if allowed by business logic)

## Notes

- Super admin plan detection is case-insensitive for plan names
- Super admin status is determined by active subscription status
- If a user's subscription becomes inactive, they lose super admin status
- Plan filtering happens at multiple levels for security

## Future Enhancements

1. **Admin API Endpoint** - Create dedicated endpoint for super admins to assign plans
2. **Admin Dashboard** - UI for super admins to manage user subscriptions
3. **Audit Logging** - Log all super admin plan assignments
4. **Role-Based Access** - Separate role system for super admins (beyond plan-based)


