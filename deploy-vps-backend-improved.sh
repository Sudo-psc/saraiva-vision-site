#!/bin/bash

# =============================================================================
# Saraiva Vision VPS Backend Deployment Script (Improved)
# Secure, robust deployment with proper error handling and validation
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Default configuration (can be overridden by environment variables or config file)
VPS_IP="${VPS_IP:-}"
VPS_USER="${VPS_USER:-root}"
VPS_PORT="${VPS_PORT:-22}"
LOCAL_DIR="$(pwd)"
REMOTE_DIR="${REMOTE_DIR:-/root}"
SSH_KEY="${SSH_KEY:-}"

# Deployment options
DRY_RUN=false
SKIP_TESTS=false
VERBOSE=false
FORCE_DEPLOY=false

# Global variables
DEPLOYMENT_ID="backend-deploy-$(date +%Y%m%d-%H%M%S)"
TEMP_FILES=""
CONFIG_FILE=".deploy-config"

# =============================================================================
# LOGGING AND UTILITY FUNCTIONS
# =============================================================================

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        "INFO")     echo -e "${BLUE}[${timestamp}] INFO: ${message}${NC}" ;;
        "SUCCESS")  echo -e "${GREEN}[${timestamp}] SUCCESS: ${message}${NC}" ;;
        "WARNING")  echo -e "${YELLOW}[${timestamp}] WARNING: ${message}${NC}" ;;
        "ERROR")    echo -e "${RED}[${timestamp}] ERROR: ${message}${NC}" ;;
        "HEADER")   echo -e "${MAGENTA}[${timestamp}] ${message}${NC}" ;;
        "VERBOSE")
            if [[ "$VERBOSE" = true ]]; then
                echo -e "${BLUE}[${timestamp}] VERBOSE: ${message}${NC}"
            fi
            ;;
    esac
}

load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        log "INFO" "Loading configuration from $CONFIG_FILE"
        source "$CONFIG_FILE"
        log "SUCCESS" "Configuration loaded"
    else
        log "INFO" "No configuration file found, using defaults/environment variables"
    fi
}

validate_config() {
    log "HEADER" "🔍 Validating Configuration..."

    # Validate VPS IP
    if [[ -z "$VPS_IP" ]]; then
        log "ERROR" "VPS_IP is required. Set via environment variable or config file."
        return 1
    fi

    # Validate IP format
    if ! [[ "$VPS_IP" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        log "ERROR" "Invalid IP address format: $VPS_IP"
        return 1
    fi

    # Validate SSH key if provided
    if [[ -n "$SSH_KEY" ]] && [[ ! -f "$SSH_KEY" ]]; then
        log "ERROR" "SSH key file not found: $SSH_KEY"
        return 1
    fi

    log "SUCCESS" "Configuration validation passed"
    log "VERBOSE" "VPS: $VPS_USER@$VPS_IP:$VPS_PORT"
}

test_ssh_connection() {
    log "HEADER" "🔐 Testing SSH Connection..."

    local ssh_opts="-o ConnectTimeout=10 -o BatchMode=yes -o StrictHostKeyChecking=no"

    if [[ -n "$SSH_KEY" ]]; then
        ssh_opts="$ssh_opts -i $SSH_KEY"
    fi

    if [[ "$VPS_PORT" != "22" ]]; then
        ssh_opts="$ssh_opts -p $VPS_PORT"
    fi

    log "VERBOSE" "SSH command: ssh $ssh_opts $VPS_USER@$VPS_IP"

    if ssh $ssh_opts $VPS_USER@$VPS_IP "echo 'SSH connection successful'" 2>/dev/null; then
        log "SUCCESS" "SSH connection established"
        return 0
    else
        log "ERROR" "Failed to connect to VPS"
        log "INFO" "Troubleshooting steps:"
        log "INFO" "  1. Check if VPS is running: ping $VPS_IP"
        log "INFO" "  2. Verify SSH service: nc -zv $VPS_IP $VPS_PORT"
        log "INFO" "  3. Check SSH key permissions: ls -la $SSH_KEY"
        log "INFO" "  4. Test manual SSH: ssh $VPS_USER@$VPS_IP"
        return 1
    fi
}

check_prerequisites() {
    log "HEADER" "📋 Checking Prerequisites..."

    # Check required files
    local required_files=("vps-backend-setup.sh")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log "ERROR" "Required file missing: $file"
            log "INFO" "Make sure you're running this from the project root directory"
            return 1
        fi
    done

    # Check SSH client
    if ! command -v ssh &> /dev/null; then
        log "ERROR" "SSH client not found"
        return 1
    fi

    # Check SCP
    if ! command -v scp &> /dev/null; then
        log "ERROR" "SCP not found"
        return 1
    fi

    log "SUCCESS" "Prerequisites check passed"
}

create_env_template() {
    log "HEADER" "📝 Creating Environment Template..."

    local env_template="vps-env-template-$DEPLOYMENT_ID.txt"
    TEMP_FILES="$TEMP_FILES $env_template"

    cat > "$env_template" << EOF
# =============================================================================
# Saraiva Vision Backend Environment Configuration
# Generated on $(date)
# Deployment ID: $DEPLOYMENT_ID
# =============================================================================

# Database Configuration
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32 2>/dev/null || echo "PLEASE_CHANGE_THIS_PASSWORD")
WORDPRESS_DB_PASSWORD=$(openssl rand -base64 24 2>/dev/null || echo "PLEASE_CHANGE_THIS_PASSWORD")
REDIS_PASSWORD=$(openssl rand -base64 16 2>/dev/null || echo "PLEASE_CHANGE_THIS_PASSWORD")

# API Configuration
NODE_ENV=production
PORT=3001
JWT_SECRET=$(openssl rand -base64 64 2>/dev/null || echo "PLEASE_CHANGE_THIS_JWT_SECRET")
API_VERSION=v1

# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
DOCTOR_EMAIL=philipe_cruz@outlook.com
CONTACT_EMAIL_FROM=noreply@saraivavision.com.br
SMTP_HOST=smtp.resend.com
SMTP_PORT=587

# ReCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# WordPress Configuration
WORDPRESS_URL=https://saraivavision.com.br
WORDPRESS_API_URL=http://localhost:8083/wp-json

# Security Configuration
CORS_ORIGIN=https://saraivavision.com.br,https://www.saraivavision.com.br
TRUSTED_PROXIES=127.0.0.1,::1

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=5
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=true

# Monitoring
HEALTH_CHECK_ENDPOINT=/health
LOG_LEVEL=info
LOG_FORMAT=combined

# Cache Configuration
CACHE_TTL=300
REDIS_URL=redis://localhost:6379
REDIS_DB=0

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/uploads
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx

EOF

    log "SUCCESS" "Environment template created: $env_template"
    echo "$env_template"
}

deploy_setup_script() {
    if [[ "$DRY_RUN" = true ]]; then
        log "INFO" "DRY RUN: Would deploy setup script to VPS"
        return 0
    fi

    log "HEADER" "📤 Deploying Setup Script..."

    local ssh_opts="-o ConnectTimeout=30 -o StrictHostKeyChecking=no"
    local scp_opts="-o ConnectTimeout=30 -o StrictHostKeyChecking=no"

    if [[ -n "$SSH_KEY" ]]; then
        ssh_opts="$ssh_opts -i $SSH_KEY"
        scp_opts="$scp_opts -i $SSH_KEY"
    fi

    if [[ "$VPS_PORT" != "22" ]]; then
        ssh_opts="$ssh_opts -p $VPS_PORT"
        scp_opts="$scp_opts -P $VPS_PORT"
    fi

    # Copy setup script
    if scp $scp_opts vps-backend-setup.sh $VPS_USER@$VPS_IP:$REMOTE_DIR/; then
        log "SUCCESS" "Setup script deployed"
    else
        log "ERROR" "Failed to deploy setup script"
        return 1
    fi

    # Copy API endpoints if available
    if [[ -d "api" ]]; then
        log "INFO" "Deploying API endpoints..."
        if ssh $ssh_opts $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR/temp-api"; then
            if scp $scp_opts -r api/* $VPS_USER@$VPS_IP:$REMOTE_DIR/temp-api/; then
                log "SUCCESS" "API endpoints deployed"
            else
                log "WARNING" "Failed to deploy API endpoints, will use defaults"
            fi
        fi
    else
        log "INFO" "No API directory found, using default endpoints"
    fi
}

execute_remote_setup() {
    if [[ "$DRY_RUN" = true ]]; then
        log "INFO" "DRY RUN: Would execute remote setup on VPS"
        return 0
    fi

    log "HEADER" "🚀 Executing Remote Setup..."

    local ssh_opts="-o ConnectTimeout=60 -o StrictHostKeyChecking=no"

    if [[ -n "$SSH_KEY" ]]; then
        ssh_opts="$ssh_opts -i $SSH_KEY"
    fi

    if [[ "$VPS_PORT" != "22" ]]; then
        ssh_opts="$ssh_opts -p $VPS_PORT"
    fi

    # Execute setup with proper error handling
    if ssh $ssh_opts $VPS_USER@$VPS_IP << 'REMOTE_SCRIPT'
set -e

cd /root

# Check if setup script exists
if [[ ! -f "vps-backend-setup.sh" ]]; then
    echo "ERROR: Setup script not found"
    exit 1
fi

# Make executable
chmod +x vps-backend-setup.sh

# Execute setup
echo "Starting backend setup..."
if ./vps-backend-setup.sh; then
    echo "Setup script executed successfully"
else
    echo "Setup script failed"
    exit 1
fi

# Copy API endpoints if available
if [[ -d "temp-api" ]]; then
    echo "Installing API endpoints..."
    if [[ -d "/var/www/saraiva-vision-backend/api/src/routes" ]]; then
        cp -r temp-api/* /var/www/saraiva-vision-backend/api/src/routes/ || true
        rm -rf temp-api
        echo "API endpoints installed"
    else
        echo "Backend directory structure not found, skipping API copy"
    fi
fi

echo "Remote setup completed successfully"
REMOTE_SCRIPT
    then
        log "SUCCESS" "Remote setup completed"
    else
        log "ERROR" "Remote setup failed"
        return 1
    fi
}

verify_deployment() {
    log "HEADER" "✅ Verifying Deployment..."

    local ssh_opts="-o ConnectTimeout=30 -o StrictHostKeyChecking=no"

    if [[ -n "$SSH_KEY" ]]; then
        ssh_opts="$ssh_opts -i $SSH_KEY"
    fi

    if [[ "$VPS_PORT" != "22" ]]; then
        ssh_opts="$ssh_opts -p $VPS_PORT"
    fi

    # Check backend directory structure
    if ssh $ssh_opts $VPS_USER@$VPS_IP << 'VERIFY_SCRIPT'
echo "Checking backend deployment..."

# Check main directory
if [[ -d "/var/www/saraiva-vision-backend" ]]; then
    echo "✅ Backend directory exists"
else
    echo "❌ Backend directory missing"
    exit 1
fi

# Check essential files
essential_files=(
    "/var/www/saraiva-vision-backend/package.json"
    "/var/www/saraiva-vision-backend/server.js"
    "/var/www/saraiva-vision-backend/.env.example"
)

for file in "${essential_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check services
services=("nginx" "mysql" "redis-server")
for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        echo "✅ $service is running"
    else
        echo "⚠️  $service is not running (may need manual start)"
    fi
done

echo "Verification completed"
VERIFY_SCRIPT
    then
        log "SUCCESS" "Deployment verification passed"
    else
        log "WARNING" "Deployment verification had issues"
        if [[ "$FORCE_DEPLOY" = false ]]; then
            return 1
        fi
    fi
}

cleanup() {
    log "INFO" "Cleaning up temporary files..."
    if [[ -n "$TEMP_FILES" ]]; then
        rm -f $TEMP_FILES
    fi
}

# =============================================================================
# MAIN DEPLOYMENT FLOW
# =============================================================================

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

VPS Backend Deployment Script for Saraiva Vision

Options:
  --config FILE         Load configuration from file
  --vps-ip IP          VPS IP address
  --vps-user USER      VPS user (default: root)
  --vps-port PORT      SSH port (default: 22)
  --ssh-key FILE       SSH private key file
  --dry-run           Show what would be done
  --skip-tests        Skip connection tests
  --verbose           Enable verbose output
  --force             Force deployment despite warnings
  --help              Show this help message

Configuration File Format (.deploy-config):
  VPS_IP=31.97.129.78
  VPS_USER=root
  VPS_PORT=22
  SSH_KEY=/path/to/key

Examples:
  $0 --vps-ip 31.97.129.78                    # Basic deployment
  $0 --config production.config --verbose      # Use config file
  $0 --dry-run --vps-ip 31.97.129.78          # Preview deployment
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        --vps-ip)
            VPS_IP="$2"
            shift 2
            ;;
        --vps-user)
            VPS_USER="$2"
            shift 2
            ;;
        --vps-port)
            VPS_PORT="$2"
            shift 2
            ;;
        --ssh-key)
            SSH_KEY="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Trap for cleanup
trap cleanup EXIT

# Main deployment function
main() {
    log "HEADER" "🚀 Saraiva Vision VPS Backend Deployment"
    log "INFO" "Deployment ID: $DEPLOYMENT_ID"

    if [[ "$DRY_RUN" = true ]]; then
        log "INFO" "DRY RUN MODE - No changes will be made"
    fi

    # Load and validate configuration
    load_config
    validate_config || exit 1

    # Execute deployment steps
    check_prerequisites || exit 1

    if [[ "$SKIP_TESTS" = false ]]; then
        test_ssh_connection || exit 1
    fi

    local env_template
    env_template=$(create_env_template)

    deploy_setup_script || exit 1
    execute_remote_setup || exit 1
    verify_deployment || exit 1

    log "SUCCESS" "🎉 Backend deployment completed successfully!"

    echo ""
    echo "📋 Deployment Summary:"
    echo "   ✅ Setup script executed on VPS: $VPS_IP"
    echo "   ✅ Backend services installed and configured"
    echo "   ✅ Environment template created: $env_template"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. SSH to VPS: ssh $VPS_USER@$VPS_IP"
    echo "   2. Configure environment:"
    echo "      cd /var/www/saraiva-vision-backend"
    echo "      cp .env.example .env"
    echo "      nano .env  # Use values from $env_template"
    echo "   3. Start services:"
    echo "      ./start-backend.sh"
    echo "   4. Monitor deployment:"
    echo "      ./monitor.sh"
    echo ""
    echo "⚠️  Important:"
    echo "   - Replace generated passwords in .env with secure values"
    echo "   - Configure SSL certificates for production"
    echo "   - Set up firewall rules and security policies"
    echo "   - Configure domain DNS settings"
    echo "   - Test all API endpoints after configuration"
    echo ""
    echo "📚 Documentation: See VPS_BACKEND_GUIDE.md"
    echo "🔧 Environment template: $env_template"
}

# Execute main function
main "$@"