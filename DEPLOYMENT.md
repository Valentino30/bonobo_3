# Deployment Guide

This guide explains how to deploy Bonobo Chat to production with proper environment separation.

## Architecture

```
Development                      Production
├── Supabase Dev Project        ├── Supabase Prod Project
│   └── Test Stripe Keys        │   └── Live Stripe Keys
├── .env.development            ├── .env.production
└── Local testing               └── Live app
```

## Environment Setup

### 1. Development Environment (Current)

**Supabase Project:** `eozthwbsbkpdkbdvcgyi`

**Client-side (.env.development):**
```bash
EXPO_PUBLIC_SUPABASE_URL=https://eozthwbsbkpdkbdvcgyi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_dev_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key
```

**Server-side (Supabase Secrets):**
```bash
# Set these in Supabase Dashboard or via CLI:
supabase secrets set STRIPE_SECRET_KEY="sk_test_YOUR_KEY" --project-ref eozthwbsbkpdkbdvcgyi
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_YOUR_DEV_WEBHOOK" --project-ref eozthwbsbkpdkbdvcgyi
supabase secrets set ALLOWED_ORIGINS="http://localhost:*,http://192.168.*:*" --project-ref eozthwbsbkpdkbdvcgyi
```

### 2. Production Environment (To Be Created)

**Step 1: Create Production Supabase Project**
1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Name it "bonobo-chat-production"
4. Save the project ref (e.g., `abc123xyz`)

**Step 2: Set up production database**
```bash
# Apply migrations to production
supabase db push --project-ref [PROD_PROJECT_REF]
```

**Step 3: Configure production client (.env.production):**
```bash
EXPO_PUBLIC_SUPABASE_URL=https://[PROD_PROJECT_REF].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key
```

**Step 4: Set production server secrets:**
```bash
supabase secrets set STRIPE_SECRET_KEY="sk_live_YOUR_LIVE_KEY" --project-ref [PROD_PROJECT_REF]
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_YOUR_PROD_WEBHOOK" --project-ref [PROD_PROJECT_REF]
supabase secrets set ALLOWED_ORIGINS="https://yourdomain.com" --project-ref [PROD_PROJECT_REF]
```

**Step 5: Deploy Edge Functions to production:**
```bash
supabase functions deploy --project-ref [PROD_PROJECT_REF]
```

## Switching Environments Locally

Use the helper script to switch between dev and prod environments:

```bash
# Switch to development
bash scripts/switch-env.sh development

# Switch to production (for testing production builds locally)
bash scripts/switch-env.sh production
```

This copies the appropriate `.env.{environment}` file to `.env`.

## Stripe Configuration

### Development (Test Mode)
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **test** keys:
   - Publishable key: `pk_test_...` → `.env.development`
   - Secret key: `sk_test_...` → Supabase dev secrets
3. Set up test webhook:
   - URL: `https://eozthwbsbkpdkbdvcgyi.supabase.co/functions/v1/stripe-webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret: `whsec_...` → Supabase dev secrets

### Production (Live Mode)
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **live** keys:
   - Publishable key: `pk_live_...` → `.env.production`
   - Secret key: `sk_live_...` → Supabase prod secrets
3. Set up production webhook:
   - URL: `https://[PROD_PROJECT_REF].supabase.co/functions/v1/stripe-webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret: `whsec_...` → Supabase prod secrets

## Building for Production

### iOS
```bash
# Switch to production environment
bash scripts/switch-env.sh production

# Build production app
eas build --platform ios --profile production
```

### Android
```bash
# Switch to production environment
bash scripts/switch-env.sh production

# Build production app
eas build --platform android --profile production
```

## Verifying Edge Functions

Test your Edge Functions are working correctly:

```bash
# Test get-stripe-prices
curl https://[PROJECT_REF].supabase.co/functions/v1/get-stripe-prices

# Test create-payment-intent (will fail with validation error, which is good)
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Security Checklist

Before going to production:

- [ ] Created separate production Supabase project
- [ ] Set ALLOWED_ORIGINS to your actual domain (not `*`)
- [ ] Using Stripe live keys (not test keys)
- [ ] Webhook secret configured for production endpoint
- [ ] Database migrations applied to production
- [ ] Edge Functions deployed to production project
- [ ] Tested payment flow end-to-end in test mode
- [ ] All secrets set in Supabase Dashboard (never in .env files)
- [ ] `.env.development` and `.env.production` added to `.gitignore`

## Troubleshooting

### Edge Function errors
Check logs:
```bash
# View real-time logs (if supported by your CLI version)
supabase functions logs [FUNCTION_NAME] --project-ref [PROJECT_REF]

# Or check in dashboard:
https://supabase.com/dashboard/project/[PROJECT_REF]/functions
```

### Stripe webhook not working
1. Check webhook is pointing to correct URL
2. Verify webhook secret matches in Supabase secrets
3. Check Stripe dashboard → Webhooks → [Your webhook] → "Events" tab for failures

### CORS errors
1. Verify `ALLOWED_ORIGINS` includes your domain
2. Check domain format (include protocol: `https://`)
3. For localhost: Use `http://localhost:*` pattern