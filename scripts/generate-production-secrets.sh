#!/bin/bash

# Generate Production Secrets Script for Saraiva Vision
# Generates secure random strings for production environment variables

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to generate secure random string
generate_secret() {
    local length=${1:-32}
    openssl rand -hex $length
}

# Function to generate base64 secret
generate_base64_secret() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

print_status "🔐 Generating production secrets for Saraiva Vision..."

# Create secrets file
SECRETS_FILE="/tmp/saraiva-production-secrets.env"

cat > "$SECRETS_FILE" << EOF
# Generated Production Secrets for Saraiva Vision
# Generated on: $(date)
#
# IMPORTANT: Copy these values to your production .env file
# DO NOT commit this file to version control

# ==============================================================================
# SESSION AND AUTHENTICATION SECRETS
# ==============================================================================
WP_REVALIDATE_SECRET=$(generate_secret 32)
WP_WEBHOOK_SECRET=$(generate_secret 32)
SESSION_SECRET=$(generate_secret 64)
JWT_SECRET=$(generate_secret 64)
COOKIE_SECRET=$(generate_secret 32)

# ==============================================================================
# ENCRYPTION KEYS
# ==============================================================================
GOOGLE_BUSINESS_ENCRYPTION_KEY=$(generate_base64_secret 32)

# ==============================================================================
# DATABASE PASSWORDS (Generate your own or use these)
# ==============================================================================
MYSQL_PASSWORD=$(generate_base64_secret 16)
REDIS_PASSWORD=$(generate_base64_secret 16)
WORDPRESS_DB_PASSWORD=$(generate_base64_secret 16)

# ==============================================================================
# BACKUP SECRETS (if using S3 for backups)
# ==============================================================================
BACKUP_S3_ACCESS_KEY=your_s3_access_key_here
BACKUP_S3_SECRET_KEY=$(generate_secret 20)

# ==============================================================================
# INSTRUCTIONS
# ==============================================================================
# 1. Copy these values to your .env.production file
# 2. Replace the placeholder values in .env.production with these secrets
# 3. Set up external service API keys (Supabase, Google, Resend, etc.)
# 4. Delete this file after copying the secrets: rm $SECRETS_FILE
# 5. Never commit actual secrets to version control

EOF

print_success "✅ Secrets generated successfully!"
print_warning "📁 Secrets saved to: $SECRETS_FILE"
print_warning "🔒 This file contains sensitive information!"

echo ""
echo "================================================"
echo "🔐 GENERATED PRODUCTION SECRETS"
echo "================================================"
echo ""
echo "📋 Next steps:"
echo "1. Copy secrets from: $SECRETS_FILE"
echo "2. Update .env.production with these values"
echo "3. Configure external service API keys"
echo "4. Delete the secrets file: rm $SECRETS_FILE"
echo ""

# Show secrets (with warning)
print_warning "⚠️  Displaying secrets (secure this terminal session):"
echo ""
cat "$SECRETS_FILE"
echo ""

# Instructions for updating .env.production
echo "================================================"
echo "🔧 UPDATE .ENV.PRODUCTION"
echo "================================================"
echo ""
echo "Replace these placeholders in .env.production:"
echo ""
echo "WP_REVALIDATE_SECRET=REPLACE_WITH_SECURE_RANDOM_STRING"
echo "WP_WEBHOOK_SECRET=REPLACE_WITH_SECURE_RANDOM_STRING"
echo "SESSION_SECRET=REPLACE_WITH_SECURE_RANDOM_STRING"
echo "JWT_SECRET=REPLACE_WITH_SECURE_RANDOM_STRING"
echo "COOKIE_SECRET=REPLACE_WITH_SECURE_RANDOM_STRING"
echo "GOOGLE_BUSINESS_ENCRYPTION_KEY=your_32_character_encryption_key_here"
echo ""

# External services checklist
echo "================================================"
echo "🌐 EXTERNAL SERVICES TO CONFIGURE"
echo "================================================"
echo ""
echo "□ Supabase: Get production project URL and API keys"
echo "□ Resend: Get production API key for email"
echo "□ Google Maps: Enable production API key"
echo "□ Google Business: Configure OAuth and get tokens"
echo "□ Zenvia: Get SMS API token (if using SMS)"
echo "□ PostHog: Get production analytics key"
echo "□ reCAPTCHA: Get site and secret keys"
echo "□ Sentry: Get production DSN for error tracking"
echo ""

# Security reminders
echo "================================================"
echo "🛡️  SECURITY REMINDERS"
echo "================================================"
echo ""
echo "✅ Generate unique secrets for production (don't reuse dev secrets)"
echo "✅ Use environment variables, never hardcode secrets"
echo "✅ Set up proper CORS origins for production domains"
echo "✅ Enable rate limiting and security headers"
echo "✅ Configure SSL certificates before deployment"
echo "✅ Set up monitoring and error tracking"
echo "✅ Test all integrations in staging first"
echo "✅ Have backup and recovery procedures ready"
echo ""

print_warning "🗑️  Remember to delete secrets file after use: rm $SECRETS_FILE"