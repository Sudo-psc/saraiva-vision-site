#!/bin/bash

# =============================================================================
# Saraiva Vision Production Deployment Script
# Comprehensive deployment to both Vercel (frontend) and VPS (backend)
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_ID="deploy-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="deployment-${DEPLOYMENT_ID}.log"
START_TIME=$(date +%s)

# Default options
SKIP_TESTS=false
SKIP_SECURITY=false
SKIP_VPS=false
SKIP_VERCEL=false
FORCE_DEPLOY=false
VERBOSE=false

# =============================================================================
# HELPER FUNCTIONS
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
        "STEP")     echo -e "${CYAN}[${timestamp}] STEP: ${message}${NC}" ;;
    esac
    
    # Log to file
    echo "[${timestamp}] [${level}] ${message}" >> "$LOG_FILE"
}

check_prerequisites() {
    log "HEADER" "🔍 Checking Prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log "ERROR" "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$node_version" -lt 22 ]; then
        log "ERROR" "Node.js version must be 22 or higher. Current: $(node -v)"
        exit 1
    fi
    log "SUCCESS" "Node.js version: $(node -v)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log "ERROR" "npm is not installed"
        exit 1
    fi
    log "SUCCESS" "npm version: $(npm -v)"
    
    # Check Vercel CLI if not skipping Vercel
    if [ "$SKIP_VERCEL" = false ]; then
        if ! command -v vercel &> /dev/null; then
            log "WARNING" "Vercel CLI not found. Installing..."
            npm install -g vercel
        fi
        
        # Check Vercel login
        if ! vercel whoami &> /dev/null; then
            log "ERROR" "Not logged in to Vercel. Run: vercel login"
            exit 1
        fi
        log "SUCCESS" "Vercel authenticated as: $(vercel whoami)"
    fi
    
    # Check required files
    local required_files=("package.json" "vercel.json")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log "ERROR" "Required file missing: $file"
            exit 1
        fi
    done
    log "SUCCESS" "All required files present"
}

run_security_audit() {
    if [ "$SKIP_SECURITY" = true ]; then
        log "WARNING" "Skipping security audit"
        return 0
    fi
    
    log "HEADER" "🔒 Running Security Audit..."
    
    # Run npm audit
    log "INFO" "Running npm audit..."
    if npm audit --audit-level=high; then
        log "SUCCESS" "No high-severity vulnerabilities found"
    else
        log "WARNING" "High-severity vulnerabilities found. Review before production deployment."
        if [ "$FORCE_DEPLOY" = false ]; then
            log "ERROR" "Deployment cancelled due to security issues. Use --force to override."
            exit 1
        fi
    fi
    
    # Run custom security script if available
    if [ -f "scripts/security-audit.js" ]; then
        log "INFO" "Running custom security audit..."
        if node scripts/security-audit.js; then
            log "SUCCESS" "Custom security audit passed"
        else
            log "WARNING" "Custom security audit found issues"
        fi
    fi
}

run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        log "WARNING" "Skipping tests"
        return 0
    fi
    
    log "HEADER" "🧪 Running Test Suite..."
    
    # Install dependencies with better error handling
    log "INFO" "Installing dependencies..."
    if ! npm ci --no-audit --prefer-offline; then
        log "WARNING" "npm ci failed, trying with cache clean..."
        npm cache clean --force
        if ! npm ci --no-audit; then
            log "ERROR" "npm ci failed after cache clean"
            if [ "$FORCE_DEPLOY" = false ]; then
                exit 1
            fi
        fi
    fi
    
    # Run tests with proper timeout handling
    log "INFO" "Running unit tests..."
    if npm run test:run 2>&1 | timeout 300 tee test-output.log; then
        log "SUCCESS" "Unit tests passed"
        rm -f test-output.log
    else
        log "ERROR" "Unit tests failed or timed out"
        if [ -f "test-output.log" ]; then
            log "ERROR" "Test output: $(tail -n 10 test-output.log)"
            rm -f test-output.log
        fi
        if [ "$FORCE_DEPLOY" = false ]; then
            exit 1
        fi
    fi
    
    # Run API tests with validation
    if npm run test:api --if-present > /dev/null 2>&1; then
        log "INFO" "Running API tests..."
        if npm run test:api; then
            log "SUCCESS" "API tests passed"
        else
            log "ERROR" "API tests failed"
            if [ "$FORCE_DEPLOY" = false ]; then
                exit 1
            fi
        fi
    else
        log "INFO" "No API tests found, skipping..."
    fi
}

run_production_readiness_check() {
    log "HEADER" "✅ Running Production Readiness Check..."
    
    if [ -f "scripts/production-readiness-check.js" ]; then
        if node scripts/production-readiness-check.js; then
            log "SUCCESS" "Production readiness check passed"
        else
            log "ERROR" "Production readiness check failed"
            if [ "$FORCE_DEPLOY" = false ]; then
                exit 1
            fi
        fi
    else
        log "WARNING" "Production readiness check script not found"
    fi
}

build_application() {
    log "HEADER" "🔨 Building Application..."
    
    # Clean previous builds
    log "INFO" "Cleaning previous builds..."
    rm -rf dist
    
    # Build the application with proper error handling
    log "INFO" "Building React application..."
    export NODE_OPTIONS="--max-old-space-size=4096"
    if npm run build 2>&1 | tee build-output.log; then
        log "SUCCESS" "Build completed successfully"
        rm -f build-output.log
    else
        log "ERROR" "Build failed"
        if [ -f "build-output.log" ]; then
            log "ERROR" "Build output: $(tail -n 20 build-output.log)"
            rm -f build-output.log
        fi
        exit 1
    fi
    
    # Verify build output
    if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
        log "ERROR" "Build output verification failed"
        exit 1
    fi
    log "SUCCESS" "Build output verified"
}

deploy_to_vercel() {
    if [ "$SKIP_VERCEL" = true ]; then
        log "WARNING" "Skipping Vercel deployment"
        return 0
    fi
    
    log "HEADER" "🚀 Deploying to Vercel..."
    
    # Use intelligent deployment if available
    if [ -f "scripts/vercel-intelligent-deploy.js" ]; then
        log "INFO" "Using intelligent deployment strategy..."
        if node scripts/vercel-intelligent-deploy.js; then
            log "SUCCESS" "Vercel intelligent deployment completed"
            return 0
        else
            log "WARNING" "Intelligent deployment failed, falling back to standard deployment"
        fi
    fi
    
    # Standard Vercel deployment
    log "INFO" "Running standard Vercel deployment..."
    if vercel --prod --yes; then
        log "SUCCESS" "Vercel deployment completed"
        
        # Get deployment URL
        local deployment_url=$(vercel ls --scope=$(vercel whoami) | grep "saraiva" | head -n1 | awk '{print $2}')
        if [ -n "$deployment_url" ]; then
            log "SUCCESS" "Deployment URL: https://$deployment_url"
            echo "https://$deployment_url" > "deployment-url-${DEPLOYMENT_ID}.txt"
        fi
    else
        log "ERROR" "Vercel deployment failed"
        return 1
    fi
}

deploy_to_vps() {
    if [ "$SKIP_VPS" = true ]; then
        log "WARNING" "Skipping VPS deployment"
        return 0
    fi
    
    log "HEADER" "🖥️  Deploying to VPS..."
    
    # Check if VPS deployment scripts exist
    if [ -f "deploy-vps.sh" ]; then
        log "INFO" "Running VPS deployment script..."
        if bash deploy-vps.sh; then
            log "SUCCESS" "VPS deployment completed"
        else
            log "ERROR" "VPS deployment failed"
            return 1
        fi
    elif [ -f "vps-backend-setup.sh" ]; then
        log "INFO" "Running VPS backend setup..."
        if bash vps-backend-setup.sh; then
            log "SUCCESS" "VPS backend setup completed"
        else
            log "ERROR" "VPS backend setup failed"
            return 1
        fi
    else
        log "WARNING" "No VPS deployment scripts found"
    fi
}

run_post_deployment_tests() {
    log "HEADER" "🔍 Running Post-deployment Tests..."
    
    # Check if deployment URL file exists
    local url_file="deployment-url-${DEPLOYMENT_ID}.txt"
    if [ -f "$url_file" ]; then
        local deployment_url=$(cat "$url_file")
        log "INFO" "Testing deployment at: $deployment_url"
        
        # Test health endpoint
        log "INFO" "Testing health endpoint..."
        if curl -f -s "${deployment_url}/api/health" > /dev/null; then
            log "SUCCESS" "Health endpoint responding"
        else
            log "WARNING" "Health endpoint not responding"
        fi
        
        # Test main page
        log "INFO" "Testing main page..."
        if curl -f -s "$deployment_url" > /dev/null; then
            log "SUCCESS" "Main page responding"
        else
            log "WARNING" "Main page not responding"
        fi
    else
        log "WARNING" "No deployment URL found for testing"
    fi
}

generate_deployment_report() {
    local end_time=$(date +%s)
    local total_time=$((end_time - START_TIME))
    local total_minutes=$((total_time / 60))
    local total_seconds=$((total_time % 60))
    
    log "HEADER" "📊 Deployment Report"
    echo "" | tee -a "$LOG_FILE"
    echo "=============================================================================" | tee -a "$LOG_FILE"
    echo "Deployment ID: $DEPLOYMENT_ID" | tee -a "$LOG_FILE"
    echo "Total Time: ${total_minutes}m ${total_seconds}s" | tee -a "$LOG_FILE"
    echo "Log File: $LOG_FILE" | tee -a "$LOG_FILE"
    
    # Deployment URLs
    if [ -f "deployment-url-${DEPLOYMENT_ID}.txt" ]; then
        echo "Vercel URL: $(cat deployment-url-${DEPLOYMENT_ID}.txt)" | tee -a "$LOG_FILE"
    fi
    
    echo "" | tee -a "$LOG_FILE"
    echo "Configuration:" | tee -a "$LOG_FILE"
    echo "  - Skip Tests: $SKIP_TESTS" | tee -a "$LOG_FILE"
    echo "  - Skip Security: $SKIP_SECURITY" | tee -a "$LOG_FILE"
    echo "  - Skip VPS: $SKIP_VPS" | tee -a "$LOG_FILE"
    echo "  - Skip Vercel: $SKIP_VERCEL" | tee -a "$LOG_FILE"
    echo "  - Force Deploy: $FORCE_DEPLOY" | tee -a "$LOG_FILE"
    echo "=============================================================================" | tee -a "$LOG_FILE"
    
    log "SUCCESS" "Deployment report generated"
}

cleanup() {
    log "INFO" "Cleaning up temporary files..."
    rm -f test-output.log build-output.log
    if [ -n "$TEMP_FILES" ]; then
        rm -f $TEMP_FILES
    fi
}

# =============================================================================
# MAIN DEPLOYMENT FLOW
# =============================================================================

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Production Deployment Script for Saraiva Vision"
    echo ""
    echo "Options:"
    echo "  --skip-tests          Skip test execution"
    echo "  --skip-security       Skip security audit"
    echo "  --skip-vps           Skip VPS deployment"
    echo "  --skip-vercel        Skip Vercel deployment"
    echo "  --force              Force deployment even with errors"
    echo "  --verbose            Enable verbose output"
    echo "  --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Full deployment"
    echo "  $0 --skip-tests --force      # Quick deployment without tests"
    echo "  $0 --skip-vps               # Deploy only to Vercel"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-security)
            SKIP_SECURITY=true
            shift
            ;;
        --skip-vps)
            SKIP_VPS=true
            shift
            ;;
        --skip-vercel)
            SKIP_VERCEL=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --verbose)
            VERBOSE=true
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

# Trap for cleanup on exit
trap cleanup EXIT

# Main deployment execution
main() {
    log "HEADER" "🚀 Starting Saraiva Vision Production Deployment"
    log "INFO" "Deployment ID: $DEPLOYMENT_ID"
    log "INFO" "Log file: $LOG_FILE"
    
    # Step 1: Prerequisites
    check_prerequisites
    
    # Step 2: Security audit
    run_security_audit
    
    # Step 3: Tests
    run_tests
    
    # Step 4: Production readiness check
    run_production_readiness_check
    
    # Step 5: Build application
    build_application
    
    # Step 6: Deploy to Vercel
    if ! deploy_to_vercel; then
        log "ERROR" "Vercel deployment failed"
        if [ "$FORCE_DEPLOY" = false ]; then
            exit 1
        fi
    fi
    
    # Step 7: Deploy to VPS
    if ! deploy_to_vps; then
        log "WARNING" "VPS deployment had issues"
        if [ "$FORCE_DEPLOY" = false ] && [ "$SKIP_VPS" = false ]; then
            log "ERROR" "VPS deployment failed, but continuing..."
        fi
    fi
    
    # Step 8: Post-deployment tests
    run_post_deployment_tests
    
    # Step 9: Generate report
    generate_deployment_report
    
    log "SUCCESS" "🎉 Production deployment completed successfully!"
    
    # Display next steps
    echo ""
    echo "🌐 Next Steps:"
    echo "  1. Verify the deployment at the URLs listed above"
    echo "  2. Run smoke tests on the deployed application"
    echo "  3. Monitor logs and performance metrics"
    echo "  4. Update DNS if this is a new deployment"
    echo ""
    echo "📋 Useful Commands:"
    echo "  vercel logs --follow           # Monitor Vercel logs"
    echo "  tail -f $LOG_FILE             # Follow deployment log"
    echo "  npm run test:e2e              # Run end-to-end tests"
    echo ""
}

# Execute main function
main "$@"