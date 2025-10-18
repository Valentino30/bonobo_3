# Deployment Notes

## Supabase Edge Functions

### Stripe Webhook Function

**Important:** The stripe-webhook function MUST be deployed with the `--no-verify-jwt` flag to allow unauthenticated requests from Stripe.

```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

**Why?** 
- Stripe webhooks are unauthenticated HTTP requests from Stripe's servers
- They use webhook signature verification instead of JWT auth
- Without `--no-verify-jwt`, Supabase will reject requests with 401 Unauthorized

**Configuration:**
- `supabase/functions/stripe-webhook/deno.json` has `"verify_jwt": false`
- The CLI flag ensures this is applied during deployment

### Other Functions

Regular functions (create-payment-intent, verify-payment) should use standard JWT authentication and can be deployed normally:

```bash
supabase functions deploy create-payment-intent
supabase functions deploy verify-payment
```

## Testing Webhooks

After deployment, test with Stripe CLI:
```bash
stripe listen --forward-to https://eozthwbsbkpdkbdvcgyi.supabase.co/functions/v1/stripe-webhook
```

Or trigger test events from Stripe Dashboard to verify 200 OK responses.
