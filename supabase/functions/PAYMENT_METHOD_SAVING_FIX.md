# Payment Method Saving Fix

## Problem

The "Save payment details to Bonobo Chat Analysis for future purchases" checkbox in Stripe payment sheet was not working because:

1. ❌ A new Stripe customer was created for **every payment**
2. ❌ Saved payment methods were stored on old customers
3. ❌ Next payment created a new customer with no saved methods
4. ❌ Payment intent wasn't configured to save payment methods

## Solution

Updated the payment flow to properly retrieve and reuse existing Stripe customers.

## Changes Made

### 1. **Updated create-payment-intent Edge Function** ([create-payment-intent/index.ts](create-payment-intent/index.ts))

**Added Supabase client** (lines 10, 18-23):
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const supabase = createClient(supabaseUrl, supabaseServiceKey)
```

**Retrieve/Create Customer Logic** (lines 58-97):
- Query `user_entitlements` table for existing `stripe_customer_id` by `device_id`
- Verify customer still exists in Stripe
- Reuse existing customer OR create new one
- Log all customer operations for debugging

**Enable Setup Future Usage** (line 120):
```typescript
setup_future_usage: 'off_session',
```

This tells Stripe to save the payment method for future off-session payments.

### 2. **Updated Stripe Service** ([stripe-service.ts](../utils/stripe-service.ts))

**Added Return URL** (line 60):
```typescript
returnURL: 'bonobo://payment-complete',
```

This is required for proper payment method saving flow.

## How It Works Now

### First Payment
1. User makes payment
2. No existing customer found
3. **New Stripe customer created** with metadata: `{ deviceId, planId }`
4. Customer ID stored in `user_entitlements.stripe_customer_id`
5. Payment method saved to customer (if checkbox checked)
6. Webhook creates entitlement

### Second Payment (Same Device/User)
1. User makes payment
2. **Existing customer found** in `user_entitlements` by `device_id`
3. Customer verified in Stripe
4. **Reuse existing customer**
5. Stripe shows saved payment methods
6. User can select saved method or add new one
7. Webhook creates entitlement

## Database Schema

The `user_entitlements` table already has the `stripe_customer_id` column:

```sql
CREATE TABLE user_entitlements (
  id UUID PRIMARY KEY,
  device_id TEXT NOT NULL,
  stripe_customer_id TEXT,  -- Stores Stripe customer ID
  stripe_payment_intent_id TEXT UNIQUE,
  plan_id TEXT NOT NULL,
  -- ... other fields
);
```

## Testing

1. **First Payment**:
   - Make a payment
   - Check "Save payment details" checkbox
   - Complete payment
   - Verify in Stripe Dashboard → Customers that a customer was created
   - Note the customer ID

2. **Second Payment (Same Device)**:
   - Make another payment
   - Should see saved payment method in payment sheet
   - Can select saved method or add new one
   - Check logs to verify customer was reused:
     ```
     Found existing customer ID: cus_xxxxx
     ✅ Customer verified in Stripe
     ✅ Using existing customer: cus_xxxxx
     ```

3. **Verify in Database**:
   ```sql
   SELECT device_id, stripe_customer_id, COUNT(*)
   FROM user_entitlements
   GROUP BY device_id, stripe_customer_id
   ORDER BY device_id;
   ```
   - Same device should have same `stripe_customer_id` across multiple entitlements

## Edge Cases Handled

1. **Customer deleted in Stripe**: If customer ID exists in DB but not in Stripe, creates new customer
2. **Multiple devices**: Each device gets its own Stripe customer
3. **User authentication**: When device data migrates to user account, customer follows via `device_id` → `user_id` migration

## Debugging

Check Edge Function logs:
```bash
supabase functions logs create-payment-intent --tail
```

Look for:
- `Creating new Stripe customer for device: xxx`
- `Found existing customer ID: cus_xxx`
- `✅ Customer verified in Stripe`
- `✅ Using existing customer: cus_xxx`

## Important Notes

- `setup_future_usage: 'off_session'` tells Stripe to save payment method for future use
- Customer ID is stored on first successful payment
- All subsequent payments for same device reuse the customer
- Payment methods are automatically shown in Stripe payment sheet when customer has saved methods
- The "Save payment details" checkbox is controlled by Stripe, not the app

## Deployment

After deploying these changes:

```bash
# Deploy the updated Edge Function
supabase functions deploy create-payment-intent

# No database migration needed - stripe_customer_id column already exists
```

## Verification

After deployment, verify the fix works:

1. Clear app data to test as new user
2. Make first payment with "Save payment details" checked
3. Make second payment
4. Confirm saved payment method appears
5. Check Supabase logs to verify customer reuse
