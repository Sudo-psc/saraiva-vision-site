#!/bin/bash

# Vercel Environment Variables Validation Script
# This script validates that all required environment variables are set in Vercel

echo "🔍 Validating Vercel environment variables..."

# Required variables for production
REQUIRED_VARS=(
  "WORDPRESS_GRAPHQL_ENDPOINT"
  "WORDPRESS_DOMAIN"
  "WP_REVALIDATE_SECRET"
  "WP_WEBHOOK_SECRET"
  "SUPABASE_URL"
  "SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "RESEND_API_KEY"
  "DOCTOR_EMAIL"
  "CONTACT_EMAIL_FROM"
  "ZENVIA_API_TOKEN"
  "ZENVIA_FROM_NUMBER"
  "SPOTIFY_RSS_URL"
  "OPENAI_API_KEY"
  "POSTHOG_KEY"
  "NODE_ENV"
  "TIMEZONE"
  "NEXT_PUBLIC_SITE_URL"
)

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found. Please install it first:"
  echo "npm i -g vercel"
  exit 1
fi

# Check production environment variables
echo "Checking production environment variables..."
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if ! vercel env ls production | grep -q "^$var"; then
    MISSING_VARS+=("$var")
    echo "❌ Missing: $var"
  else
    echo "✅ Found: $var"
  fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
  echo "✅ All required environment variables are configured!"
else
  echo "🚨 Missing ${#MISSING_VARS[@]} required environment variables"
  echo "Please configure the missing variables using:"
  echo "vercel env add <VARIABLE_NAME> production"
  exit 1
fi

echo "🎉 Environment validation completed successfully!"
