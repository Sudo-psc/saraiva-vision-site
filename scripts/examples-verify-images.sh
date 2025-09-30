#!/bin/bash

# Examples of using the blog image verification script
# Usage: ./scripts/examples-verify-images.sh [example_number]

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Blog Image Verification - Usage Examples${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Example 1: Basic Verification
example_1() {
    echo -e "${GREEN}Example 1: Basic Verification${NC}"
    echo "Verify all blog images and generate report"
    echo ""
    echo -e "${YELLOW}Command:${NC}"
    echo "npm run verify:blog-images"
    echo ""
    npm run verify:blog-images
}

# Example 2: JSON Report Analysis
example_2() {
    echo -e "${GREEN}Example 2: Analyze JSON Report${NC}"
    echo "Extract specific data from verification report"
    echo ""

    if [ ! -f "blog-image-verification-report.json" ]; then
        echo "Running verification first..."
        npm run verify:blog-images > /dev/null
    fi

    echo -e "${YELLOW}Summary:${NC}"
    cat blog-image-verification-report.json | jq '.summary'

    echo ""
    echo -e "${YELLOW}First 3 images needing variants:${NC}"
    cat blog-image-verification-report.json | jq '.missingModernVariants[0:3] | .[] | .image.filename'

    echo ""
    echo -e "${YELLOW}Total unused images:${NC}"
    cat blog-image-verification-report.json | jq '.unusedImages | length'
}

# Example 3: Check Specific Image
example_3() {
    echo -e "${GREEN}Example 3: Check Specific Image${NC}"
    echo "Verify if a specific image is referenced"
    echo ""

    if [ ! -f "blog-image-verification-report.json" ]; then
        echo "Running verification first..."
        npm run verify:blog-images > /dev/null
    fi

    IMAGE_NAME="${1:-olhinho.png}"

    echo -e "${YELLOW}Checking: ${IMAGE_NAME}${NC}"
    echo ""

    # Check if image exists in available images
    echo "Available in filesystem:"
    cat blog-image-verification-report.json | jq --arg img "$IMAGE_NAME" '.availableImages[] | select(.filename == $img)'

    echo ""
    echo "Referenced in blogPosts.js:"
    cat blog-image-verification-report.json | jq --arg img "$IMAGE_NAME" '.imageReferences[] | select(.filename == $img)'

    echo ""
    echo "Missing modern variants:"
    cat blog-image-verification-report.json | jq --arg img "$IMAGE_NAME" '.missingModernVariants[] | select(.image.filename == $img) | .missingFormats'
}

# Example 4: Find Unused Images
example_4() {
    echo -e "${GREEN}Example 4: List All Unused Images${NC}"
    echo "Show images not referenced in blogPosts.js"
    echo ""

    if [ ! -f "blog-image-verification-report.json" ]; then
        echo "Running verification first..."
        npm run verify:blog-images > /dev/null
    fi

    echo -e "${YELLOW}Unused images (first 10):${NC}"
    cat blog-image-verification-report.json | jq -r '.unusedImages[0:10] | .[] | .filename'

    echo ""
    TOTAL=$(cat blog-image-verification-report.json | jq '.unusedImages | length')
    echo "Total unused: $TOTAL images"
}

# Example 5: Pre-Deployment Check
example_5() {
    echo -e "${GREEN}Example 5: Pre-Deployment Verification${NC}"
    echo "Run full verification before deploying"
    echo ""

    echo -e "${YELLOW}Step 1: Verify images${NC}"
    if npm run verify:blog-images; then
        echo -e "${GREEN}✓ Image verification passed${NC}"
    else
        echo -e "${YELLOW}⚠ Issues found - review report${NC}"
        exit 1
    fi

    echo ""
    echo -e "${YELLOW}Step 2: Check for critical issues${NC}"
    MISSING=$(cat blog-image-verification-report.json | jq '.summary.missingImages')
    TYPOS=$(cat blog-image-verification-report.json | jq '.summary.extensionTypos')

    if [ "$MISSING" -gt 0 ] || [ "$TYPOS" -gt 0 ]; then
        echo -e "${YELLOW}⚠ Critical issues found:${NC}"
        echo "  - Missing images: $MISSING"
        echo "  - Extension typos: $TYPOS"
        echo ""
        echo "Fix these before deploying!"
        exit 1
    else
        echo -e "${GREEN}✓ No critical issues${NC}"
    fi

    echo ""
    echo -e "${YELLOW}Step 3: Optional optimizations${NC}"
    VARIANTS=$(cat blog-image-verification-report.json | jq '.summary.imagesNeedingVariants')
    echo "  - Images needing modern variants: $VARIANTS"

    if [ "$VARIANTS" -gt 0 ]; then
        echo ""
        echo "Consider running: npm run optimize:images"
    fi

    echo ""
    echo -e "${GREEN}✓ Ready for deployment${NC}"
}

# Example 6: Generate Modern Variants List
example_6() {
    echo -e "${GREEN}Example 6: Generate Optimization List${NC}"
    echo "List all images that need modern format variants"
    echo ""

    if [ ! -f "blog-image-verification-report.json" ]; then
        echo "Running verification first..."
        npm run verify:blog-images > /dev/null
    fi

    echo -e "${YELLOW}Images to optimize:${NC}"
    cat blog-image-verification-report.json | jq -r '.missingModernVariants | .[] | .image.filename' | sort | uniq

    echo ""
    echo -e "${YELLOW}Suggested command:${NC}"
    echo "npm run optimize:images"
}

# Main menu
if [ -z "$1" ]; then
    echo "Available examples:"
    echo "  1 - Basic verification"
    echo "  2 - JSON report analysis"
    echo "  3 - Check specific image (usage: $0 3 [image_name])"
    echo "  4 - List unused images"
    echo "  5 - Pre-deployment check"
    echo "  6 - Generate optimization list"
    echo ""
    echo "Usage: $0 [example_number]"
    echo "Example: $0 1"
    exit 0
fi

case "$1" in
    1) example_1 ;;
    2) example_2 ;;
    3) example_3 "$2" ;;
    4) example_4 ;;
    5) example_5 ;;
    6) example_6 ;;
    *)
        echo "Invalid example number. Use 1-6."
        exit 1
        ;;
esac
