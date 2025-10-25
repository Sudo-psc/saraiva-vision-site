#!/bin/bash
# Quick validation script for CI/CD environments
# This is a lighter version of pre-deploy-validation.sh for quick checks

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              QUICK VALIDATION CHECK                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

OVERALL_STATUS=0

echo -e "${YELLOW}[1/3]${NC} Running Linting..."
if npm run lint 2>&1 | grep -q "error"; then
    echo -e "${RED}✗ Linting failed${NC}"
    OVERALL_STATUS=1
else
    echo -e "${GREEN}✓ Linting passed${NC}"
fi

echo ""
echo -e "${YELLOW}[2/3]${NC} Validating API..."
if npm run validate:api 2>&1; then
    echo -e "${GREEN}✓ API validation passed${NC}"
else
    echo -e "${RED}✗ API validation failed${NC}"
    OVERALL_STATUS=1
fi

echo ""
echo -e "${YELLOW}[3/3]${NC} Building..."
if npm run build:vite 2>&1 | tail -5; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    OVERALL_STATUS=1
fi

echo ""
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✅ QUICK VALIDATION PASSED                           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Note: For comprehensive validation including E2E tests, run:${NC}"
    echo -e "${BLUE}  npm run validate:pre-deploy${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║           ❌ QUICK VALIDATION FAILED                           ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
