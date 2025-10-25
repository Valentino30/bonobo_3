#!/bin/bash

# Script to help set up Supabase Edge Function environment variables
# Run this script with: bash scripts/setup-edge-functions.sh

echo "======================================================"
echo "Supabase Edge Functions Environment Variables Setup"
echo "======================================================"
echo ""

# Get project ref from user or use the one we know
PROJECT_REF="${1:-eozthwbsbkpdkbdvcgyi}"

echo "Project Reference: $PROJECT_REF"
echo ""

# Check current secrets
echo "Current secrets:"
echo "----------------"
supabase secrets list --project-ref $PROJECT_REF 2>/dev/null || echo "Failed to list secrets"
echo ""

echo "To set or update environment variables, use these commands:"
echo ""

echo "1. Stripe Secret Key (required for payments):"
echo "   supabase secrets set STRIPE_SECRET_KEY=\"sk_live_YOUR_KEY\" --project-ref $PROJECT_REF"
echo ""

echo "2. Stripe Webhook Secret (required for webhook verification):"
echo "   supabase secrets set STRIPE_WEBHOOK_SECRET=\"whsec_YOUR_SECRET\" --project-ref $PROJECT_REF"
echo ""

echo "3. Allowed Origins (for CORS - update with your domains):"
echo "   # For development:"
echo "   supabase secrets set ALLOWED_ORIGINS=\"http://localhost:*\" --project-ref $PROJECT_REF"
echo ""
echo "   # For production (replace with your actual domain):"
echo "   supabase secrets set ALLOWED_ORIGINS=\"https://yourdomain.com,https://www.yourdomain.com\" --project-ref $PROJECT_REF"
echo ""

echo "4. Optional - Stripe Product IDs (if you want to use specific products):"
echo "   supabase secrets set STRIPE_PRODUCT_ONE_TIME=\"prod_YOUR_ID\" --project-ref $PROJECT_REF"
echo "   supabase secrets set STRIPE_PRODUCT_WEEKLY=\"prod_YOUR_ID\" --project-ref $PROJECT_REF"
echo "   supabase secrets set STRIPE_PRODUCT_MONTHLY=\"prod_YOUR_ID\" --project-ref $PROJECT_REF"
echo ""

echo "Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically set by Supabase."
echo ""

echo "======================================================"
echo "To verify your Edge Functions are working:"
echo "======================================================"
echo ""
echo "1. Check function logs:"
echo "   supabase functions logs create-payment-intent --project-ref $PROJECT_REF"
echo ""
echo "2. Check function list:"
echo "   supabase functions list --project-ref $PROJECT_REF"
echo ""
echo "3. Deploy functions after changes:"
echo "   supabase functions deploy create-payment-intent --project-ref $PROJECT_REF"
echo ""