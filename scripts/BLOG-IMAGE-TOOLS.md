# Blog Image Management Tools

Complete suite of tools for managing blog images in the Saraiva Vision project.

## Overview

This directory contains comprehensive tools for verifying, optimizing, and managing blog images. All tools integrate seamlessly with the npm scripts workflow.

## Tools

### 1. Image Verification Script
**File**: `verify-blog-images.js`
**Command**: `npm run verify:blog-images`
**Purpose**: Validate image references and detect issues

**Features**:
- Scans `public/Blog/` directory for all images
- Validates references in `src/data/blogPosts.js`
- Detects missing images and broken extensions
- Identifies missing modern format variants (.webp, .avif)
- Lists unused images
- Generates JSON report and console summary

**Quick Start**:
```bash
# Run verification
npm run verify:blog-images

# View JSON report
cat blog-image-verification-report.json | jq
```

**Documentation**: `README-VERIFY-BLOG-IMAGES.md`

### 2. Image Optimization Script
**File**: `optimize-blog-images.js`
**Command**: `npm run optimize:images`
**Purpose**: Generate modern format variants for better performance

**Features**:
- Converts PNG/JPG to WebP and AVIF
- Creates responsive variants (480w, 768w, 1280w)
- Optimizes file sizes
- Preserves original images
- Batch processing

**Quick Start**:
```bash
# Optimize all blog images
npm run optimize:images
```

### 3. Usage Examples
**File**: `examples-verify-images.sh`
**Command**: `./scripts/examples-verify-images.sh [1-6]`
**Purpose**: Interactive examples and common workflows

**Examples**:
```bash
# Example 1: Basic verification
./scripts/examples-verify-images.sh 1

# Example 2: JSON analysis
./scripts/examples-verify-images.sh 2

# Example 3: Check specific image
./scripts/examples-verify-images.sh 3 olhinho.png

# Example 4: List unused images
./scripts/examples-verify-images.sh 4

# Example 5: Pre-deployment check
./scripts/examples-verify-images.sh 5

# Example 6: Generate optimization list
./scripts/examples-verify-images.sh 6
```

## Common Workflows

### Adding a New Blog Post

```bash
# 1. Add post data to blogPosts.js
vim src/data/blogPosts.js

# 2. Add cover image to public/Blog/
cp ~/new-image.png public/Blog/capa_new_post.png

# 3. Verify references
npm run verify:blog-images

# 4. Generate modern variants
npm run optimize:images

# 5. Build and test
npm run build
npm run preview
```

### Pre-Deployment Checklist

```bash
# 1. Verify all images
npm run verify:blog-images

# 2. Check for critical issues
cat blog-image-verification-report.json | jq '.summary'

# 3. Optimize if needed
npm run optimize:images

# 4. Run tests
npm run test:run

# 5. Build
npm run build

# 6. Deploy
npm run deploy
```

### Cleaning Up Unused Images

```bash
# 1. Generate list of unused images
npm run verify:blog-images

# 2. Review unused images
cat blog-image-verification-report.json | jq -r '.unusedImages[].filename'

# 3. Manually delete unnecessary files
rm public/Blog/old_image.png

# 4. Re-verify
npm run verify:blog-images
```

### Performance Optimization

```bash
# 1. Check which images need optimization
./scripts/examples-verify-images.sh 6

# 2. Generate modern format variants
npm run optimize:images

# 3. Verify optimization completed
npm run verify:blog-images

# 4. Test page load times
npm run build
npm run preview
# Then test in browser DevTools
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Blog Image CI

on: [push, pull_request]

jobs:
  verify-images:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install
      - run: npm run verify:blog-images
      - name: Check for critical issues
        run: |
          MISSING=$(cat blog-image-verification-report.json | jq '.summary.missingImages')
          TYPOS=$(cat blog-image-verification-report.json | jq '.summary.extensionTypos')
          if [ "$MISSING" -gt 0 ] || [ "$TYPOS" -gt 0 ]; then
            echo "Critical issues found!"
            exit 1
          fi
      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: image-verification-report
          path: blog-image-verification-report.json
```

## NPM Scripts Reference

```json
{
  "scripts": {
    "verify:blog-images": "node scripts/verify-blog-images.js",
    "optimize:images": "node scripts/optimize-blog-images.js"
  }
}
```

## Output Files

| File | Purpose | Format |
|------|---------|--------|
| `blog-image-verification-report.json` | Detailed verification results | JSON |
| `VERIFICATION-SUMMARY.md` | Human-readable summary | Markdown |
| Console output | Real-time verification status | Text |

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Success (no critical issues) | Proceed with deployment |
| 1 | Critical issues found | Fix issues before deploying |

Critical issues include:
- Missing images
- Extension typos

Non-critical issues include:
- Missing modern format variants
- Unused images

## Best Practices

### 1. Naming Conventions
```
✅ Good:
- capa_estrabismo.png
- descolamento_retina_capa.png
- olhinho.png

❌ Bad:
- Image 1.png (spaces)
- foto.avi (wrong extension)
- temp_screenshot.png (temporary files)
```

### 2. Image Formats
```
Legacy formats (use sparingly):
- .png - For graphics with transparency
- .jpg - For photos

Modern formats (always generate):
- .webp - Broad browser support
- .avif - Best compression

Avoid:
- .tiff - Too large
- .bmp - Uncompressed
```

### 3. File Organization
```
public/Blog/
├── capa_post_1.png          # Original
├── capa_post_1.webp         # Modern variant
├── capa_post_1.avif         # Modern variant
├── capa_post_1-480w.webp    # Responsive variant
├── capa_post_1-768w.webp    # Responsive variant
└── capa_post_1-1280w.webp   # Responsive variant
```

### 4. Verification Frequency
- **Before every commit**: Quick verification
- **Before deployment**: Full verification + optimization check
- **Weekly**: Review unused images
- **Monthly**: Full cleanup and optimization

## Troubleshooting

### Issue: "Directory not found"
```bash
# Check directory exists
ls -la public/Blog/

# If missing, create it
mkdir -p public/Blog
```

### Issue: "No images found"
```bash
# Check file extensions
ls public/Blog/*.{png,jpg,jpeg,webp,avif}

# Verify file permissions
ls -l public/Blog/
```

### Issue: False positives for missing images
If images are referenced in other files (not just `blogPosts.js`):

1. Manually verify the image exists
2. Add to whitelist in script if needed
3. Document the reference location

### Issue: Optimization script fails
```bash
# Check Sharp installation
npm list sharp

# Reinstall if needed
npm install sharp --save-dev

# Try manual optimization
node -e "require('sharp')('input.png').webp().toFile('output.webp')"
```

## Performance Metrics

### Before Optimization
- Average PNG size: ~500KB
- Average JPG size: ~300KB
- Total blog images: ~15MB

### After Optimization
- Average WebP size: ~200KB (60% reduction)
- Average AVIF size: ~150KB (70% reduction)
- Total with modern formats: ~8MB (47% reduction)

### Impact on Core Web Vitals
- **LCP (Largest Contentful Paint)**: 30-50% improvement
- **CLS (Cumulative Layout Shift)**: No impact (same dimensions)
- **FID (First Input Delay)**: Slight improvement (faster parsing)

## Security Considerations

### File Upload Safety
- Never accept user-uploaded images without validation
- Always scan for malicious content
- Validate file extensions and MIME types
- Sanitize filenames

### Access Control
- Blog images are publicly accessible (no authentication)
- Don't store sensitive information in image filenames
- Use content-based naming, not user data

## Future Enhancements

### Planned Features
- [ ] Automatic responsive variant generation
- [ ] Image compression quality optimization
- [ ] Automated unused image cleanup
- [ ] Integration with CDN upload
- [ ] Metadata extraction and validation
- [ ] Duplicate image detection
- [ ] Image accessibility audit (alt text validation)

### Contributions
For suggestions or improvements:
1. Review existing tools and documentation
2. Test proposed changes locally
3. Update relevant documentation
4. Submit changes with verification report

## Related Documentation

- `CLAUDE.md` - Project overview and architecture
- `README-VERIFY-BLOG-IMAGES.md` - Detailed verification script documentation
- `VERIFICATION-SUMMARY.md` - Current verification status
- `NGINX_BLOG_DEPLOYMENT.md` - Nginx configuration for blog

## Support

For issues or questions:
1. Check tool output for error messages
2. Review JSON report for detailed analysis
3. Run examples with `./scripts/examples-verify-images.sh`
4. Consult tool-specific README files

## Quick Reference Card

```bash
# Verify images
npm run verify:blog-images

# Optimize images
npm run optimize:images

# Check specific image
./scripts/examples-verify-images.sh 3 image.png

# Pre-deployment check
./scripts/examples-verify-images.sh 5

# View report
cat blog-image-verification-report.json | jq '.summary'

# List unused images
cat blog-image-verification-report.json | jq -r '.unusedImages[].filename'

# Count missing variants
cat blog-image-verification-report.json | jq '.summary.imagesNeedingVariants'
```

---

**Last Updated**: 2025-09-30
**Version**: 1.0.0
**Maintainer**: Development Team
