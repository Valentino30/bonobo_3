#!/bin/bash

# Script to switch between development and production environments
# Usage: bash scripts/switch-env.sh [development|production]

ENV=${1:-development}

if [ "$ENV" != "development" ] && [ "$ENV" != "production" ]; then
  echo "Error: Invalid environment. Use 'development' or 'production'"
  exit 1
fi

echo "Switching to $ENV environment..."

# Copy the appropriate .env file
if [ -f ".env.$ENV" ]; then
  cp ".env.$ENV" ".env"
  echo "✅ Copied .env.$ENV to .env"
  echo ""
  echo "Current configuration:"
  grep "EXPO_PUBLIC_SUPABASE_URL" .env
  grep "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env
  echo ""
  echo "Remember to restart your Expo dev server!"
else
  echo "❌ .env.$ENV file not found!"
  echo "Please create .env.$ENV based on .env.example"
  exit 1
fi
