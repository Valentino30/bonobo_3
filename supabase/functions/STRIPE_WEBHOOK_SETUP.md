# Stripe Webhook Setup Guide

This guide explains how to set up the Stripe webhook to properly handle payment confirmations and create entitlements in the database.

## Why Webhooks?

The payment flow now works as follows:

1. **Client creates payment intent** → `create-payment-intent` Edge Function
2. **User completes payment** → Stripe processes payment
3. **Stripe sends webhook** → `stripe-webhook` Edge Function
4. **Webhook creates entitlement** → User gets access

This ensures entitlements are only created AFTER successful payment, not before.

## Setup Steps

### 1. Deploy the Webhook Function

First, deploy the webhook function to Supabase:

```bash
supabase functions deploy stripe-webhook
```

### 2. Get Your Webhook URL

The webhook URL will be:
```
https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook
```

Replace `<your-project-ref>` with your actual Supabase project reference.

### 3. Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen to:
   - `payment_intent.succeeded` ✅ (Required)
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_...`)

### 4. Add Webhook Secret to Supabase

Add the webhook signing secret to your Supabase environment variables:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

Or in the Supabase Dashboard:
1. Go to Project Settings → Edge Functions
2. Add secret: `STRIPE_WEBHOOK_SECRET` with value `whsec_your_secret_here`

### 5. Verify Required Environment Variables

Make sure all these secrets are set in Supabase:

- `STRIPE_SECRET_KEY` - Your Stripe secret key (sk_...)
- `STRIPE_WEBHOOK_SECRET` - Your webhook signing secret (whsec_...)
- `SUPABASE_URL` - Auto-provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase

## Testing the Webhook

### Local Testing with Stripe CLI

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks to your local function:
   ```bash
   stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
   ```
4. Make a test payment
5. Check the logs to verify webhook received

### Production Testing

1. Use Stripe's "Send test webhook" button in the dashboard
2. Or make a real test payment using a [test card](https://stripe.com/docs/testing)
3. Check Supabase logs to verify:
   ```bash
   supabase functions logs stripe-webhook
   ```

## What the Webhook Does

When a payment succeeds, the webhook:

1. ✅ Verifies the webhook signature for security
2. ✅ Extracts payment details from the event
3. ✅ Calculates expiration dates based on plan type
4. ✅ Creates an entitlement in the `user_entitlements` table
5. ✅ Links the entitlement to the device_id

## Troubleshooting

### "No signature" error
- Make sure you're sending requests from Stripe, not manually
- Check that the `stripe-signature` header is present

### "Signature verification failed"
- Double-check your `STRIPE_WEBHOOK_SECRET` is correct
- Make sure you're using the signing secret from the correct webhook endpoint

### "Missing planId or deviceId in metadata"
- This means the payment intent wasn't created with proper metadata
- Check that `create-payment-intent` function is passing both `planId` and `deviceId` in metadata

### Entitlement not created
- Check Supabase logs: `supabase functions logs stripe-webhook`
- Verify the `user_entitlements` table exists and has proper permissions
- Check for database errors in the logs

## Migration Note

**Old behavior** (incorrect):
- Entitlement created immediately when payment intent is created
- User gets access even if payment fails ❌

**New behavior** (correct):
- Entitlement created only when payment succeeds ✅
- User gets access only after paying ✅

Make sure to clean up any test entitlements created by the old flow.
