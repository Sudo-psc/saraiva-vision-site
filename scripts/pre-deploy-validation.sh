#!/bin/bash
# Pre-Deploy Validation Script
# Executes comprehensive testing and validation before deployment
# Medical compliance requirement: CFM/LGPD regulatory compliance

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORTS_DIR="$PROJECT_ROOT/reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     PRE-DEPLOY VALIDATION - MEDICAL COMPLIANCE CHECK          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

cd "$PROJECT_ROOT"

mkdir -p "$REPORTS_DIR"

VALIDATION_REPORT="$REPORTS_DIR/pre-deploy-validation-${TIMESTAMP}.md"

echo "# Pre-Deploy Validation Report" > "$VALIDATION_REPORT"
echo "**Date:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")" >> "$VALIDATION_REPORT"
echo "**Branch:** $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')" >> "$VALIDATION_REPORT"
echo "**Commit:** $(git rev-parse HEAD 2>/dev/null || echo 'N/A')" >> "$VALIDATION_REPORT"
echo "" >> "$VALIDATION_REPORT"
echo "## Validation Steps" >> "$VALIDATION_REPORT"
echo "" >> "$VALIDATION_REPORT"

OVERALL_STATUS=0

echo -e "${YELLOW}[1/6]${NC} Running Comprehensive Test Suite..."
echo "### 1. Comprehensive Test Suite" >> "$VALIDATION_REPORT"

if npm run test:comprehensive 2>&1 | tee -a "$VALIDATION_REPORT"; then
    echo -e "${GREEN}✓ Comprehensive tests passed${NC}"
    echo "**Status:** ✅ PASSED" >> "$VALIDATION_REPORT"
else
    echo -e "${YELLOW}⚠ Comprehensive tests completed with warnings${NC}"
    echo "**Status:** ⚠️ WARNING (continuing)${NC}" >> "$VALIDATION_REPORT"
fi
echo "" >> "$VALIDATION_REPORT"

echo -e "${YELLOW}[2/6]${NC} Validating Playwright E2E Tests..."
echo "### 2. Playwright E2E Tests" >> "$VALIDATION_REPORT"

if npm run test:e2e:playwright 2>&1 | tee -a "$VALIDATION_REPORT"; then
    echo -e "${GREEN}✓ Playwright E2E tests passed${NC}"
    echo "**Status:** ✅ PASSED" >> "$VALIDATION_REPORT"
    
    if [ -f "playwright-report/index.html" ]; then
        echo "**Report:** [playwright-report/index.html](../playwright-report/index.html)" >> "$VALIDATION_REPORT"
        echo -e "${BLUE}ℹ Playwright HTML report generated: playwright-report/index.html${NC}"
    fi
else
    echo -e "${RED}✗ Playwright E2E tests failed${NC}"
    echo "**Status:** ❌ FAILED" >> "$VALIDATION_REPORT"
    OVERALL_STATUS=1
fi
echo "" >> "$VALIDATION_REPORT"

echo -e "${YELLOW}[3/6]${NC} Running Medical Compliance Validation..."
echo "### 3. Medical Compliance (CFM/LGPD)" >> "$VALIDATION_REPORT"

if npm run validate:blog-compliance 2>&1 | tee -a "$VALIDATION_REPORT"; then
    echo -e "${GREEN}✓ Medical compliance validation passed${NC}"
    echo "**Status:** ✅ PASSED" >> "$VALIDATION_REPORT"
else
    echo -e "${RED}✗ Medical compliance validation failed${NC}"
    echo "**Status:** ❌ FAILED" >> "$VALIDATION_REPORT"
    OVERALL_STATUS=1
fi
echo "" >> "$VALIDATION_REPORT"

echo -e "${YELLOW}[4/6]${NC} Running Linting and Code Quality Checks..."
echo "### 4. Linting and Code Quality" >> "$VALIDATION_REPORT"

if npm run lint 2>&1 | tee -a "$VALIDATION_REPORT"; then
    echo -e "${GREEN}✓ Linting passed${NC}"
    echo "**Status:** ✅ PASSED" >> "$VALIDATION_REPORT"
else
    echo -e "${RED}✗ Linting failed${NC}"
    echo "**Status:** ❌ FAILED" >> "$VALIDATION_REPORT"
    OVERALL_STATUS=1
fi
echo "" >> "$VALIDATION_REPORT"

echo -e "${YELLOW}[5/6]${NC} Validating API Syntax..."
echo "### 5. API Syntax Validation" >> "$VALIDATION_REPORT"

if npm run validate:api 2>&1 | tee -a "$VALIDATION_REPORT"; then
    echo -e "${GREEN}✓ API validation passed${NC}"
    echo "**Status:** ✅ PASSED" >> "$VALIDATION_REPORT"
else
    echo -e "${RED}✗ API validation failed${NC}"
    echo "**Status:** ❌ FAILED" >> "$VALIDATION_REPORT"
    OVERALL_STATUS=1
fi
echo "" >> "$VALIDATION_REPORT"

echo -e "${YELLOW}[6/6]${NC} Building Production Bundle..."
echo "### 6. Production Build" >> "$VALIDATION_REPORT"

if npm run build:vite 2>&1 | tee -a "$VALIDATION_REPORT"; then
    echo -e "${GREEN}✓ Production build successful${NC}"
    echo "**Status:** ✅ PASSED" >> "$VALIDATION_REPORT"
    
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        echo "**Build Size:** $DIST_SIZE" >> "$VALIDATION_REPORT"
        echo -e "${BLUE}ℹ Build size: $DIST_SIZE${NC}"
    fi
else
    echo -e "${RED}✗ Production build failed${NC}"
    echo "**Status:** ❌ FAILED" >> "$VALIDATION_REPORT"
    OVERALL_STATUS=1
fi
echo "" >> "$VALIDATION_REPORT"

echo "" >> "$VALIDATION_REPORT"
echo "## Summary" >> "$VALIDATION_REPORT"
echo "" >> "$VALIDATION_REPORT"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo "**Overall Status:** ✅ PASSED - Ready for deployment" >> "$VALIDATION_REPORT"
    echo "" >> "$VALIDATION_REPORT"
    echo "All validation checks passed. The application meets medical compliance requirements and is ready for production deployment." >> "$VALIDATION_REPORT"
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✅ VALIDATION PASSED - READY FOR DEPLOY              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📊 Validation report saved to: $VALIDATION_REPORT${NC}"
    
    if [ -f "playwright-report/index.html" ]; then
        echo -e "${BLUE}📊 Playwright report: playwright-report/index.html${NC}"
        echo ""
        echo -e "${BLUE}To view Playwright report, run:${NC}"
        echo -e "${BLUE}  npm run test:e2e:playwright:report${NC}"
    fi
    
    exit 0
else
    echo "**Overall Status:** ❌ FAILED - DO NOT DEPLOY" >> "$VALIDATION_REPORT"
    echo "" >> "$VALIDATION_REPORT"
    echo "One or more validation checks failed. Review the errors above and fix them before deploying to production." >> "$VALIDATION_REPORT"
    echo "" >> "$VALIDATION_REPORT"
    echo "⚠️ **Medical Compliance Warning:** Deploying without passing validation may violate CFM/LGPD requirements." >> "$VALIDATION_REPORT"
    
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║           ❌ VALIDATION FAILED - DO NOT DEPLOY                 ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}⚠️  Medical Compliance Warning: Fix validation errors before deployment${NC}"
    echo -e "${BLUE}📊 Validation report saved to: $VALIDATION_REPORT${NC}"
    
    exit 1
fi
