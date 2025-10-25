# Supabase Edge Functions

This directory contains Supabase Edge Functions for the Bonobo Chat application.

> **📖 For production deployment and environment setup, see [DEPLOYMENT.md](../../DEPLOYMENT.md)**

## Environment Variables

Edge Function environment variables **MUST** be set in the Supabase Dashboard, NOT in your local `.env` file.

### Quick Setup

```bash
# Development (use Stripe test keys)
supabase secrets set STRIPE_SECRET_KEY="sk_test_..." --project-ref eozthwbsbkpdkbdvcgyi
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..." --project-ref eozthwbsbkpdkbdvcgyi
supabase secrets set ALLOWED_ORIGINS="http://localhost:*" --project-ref eozthwbsbkpdkbdvcgyi

# Production (use Stripe live keys)
supabase secrets set STRIPE_SECRET_KEY="sk_live_..." --project-ref [PROD_REF]
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..." --project-ref [PROD_REF]
supabase secrets set ALLOWED_ORIGINS="https://yourdomain.com" --project-ref [PROD_REF]
```

See [DEPLOYMENT.md](../../DEPLOYMENT.md) for detailed instructions.

## Functions

| Function | Description | Auth Required |
|----------|-------------|---------------|
| `create-payment-intent` | Creates Stripe payment intent | No |
| `stripe-webhook` | Handles Stripe webhook events | No (verified by signature) |
| `verify-payment` | Manual payment verification | No |
| `get-stripe-prices` | Fetches product prices from Stripe | No |

## Deployment

```bash
# Deploy single function
supabase functions deploy [FUNCTION_NAME] --project-ref [PROJECT_REF]

# Deploy all functions
supabase functions deploy --project-ref [PROJECT_REF]
```