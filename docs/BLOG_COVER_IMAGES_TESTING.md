# Blog Cover Images Testing

This document describes how to test and validate blog post cover images in the Saraiva Vision website.

## Overview

Two testing tools are available for validating blog cover images:

1. **Unit Test** (`src/__tests__/blog-cover-images.test.js`) - For automated testing in CI/CD
2. **CLI Script** (`scripts/test-cover-images.js`) - For manual validation and detailed reporting

## Usage

### Running Tests

#### Unit Tests (Vitest)
```bash
# Run all cover image tests
npm run test:cover-images

# Run with verbose output
npm run test:run src/__tests__/blog-cover-images.test.js

# Run in watch mode during development
npm run test:watch src/__tests__/blog-cover-images.test.js
```

#### CLI Script (Standalone)
```bash
# Run comprehensive validation
npm run test:blog-covers

# Or run directly
node scripts/test-cover-images.js
```

### Integration with CI/CD

Add the following to your CI pipeline:

```yaml
# Example GitHub Actions step
- name: Test blog cover images
  run: |
    npm run test:cover-images
    npm run test:blog-covers
```

## Test Coverage

### ✅ Validation Checks

1. **Existence Verification**
   - Every blog post has a cover image defined
   - All referenced image files exist in `public/Blog/`

2. **Format Validation**
   - Valid image extensions (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.avif`, `.svg`, `.tiff`)
   - No placeholder or temporary images

3. **Naming Conventions**
   - Lowercase filenames
   - No spaces (use hyphens)
   - No special characters (except hyphens and underscores)

4. **Quality Standards**
   - File size limits (max 5MB for cover images)
   - Modern format availability (WebP/AVIF)
   - Descriptive filenames

5. **SEO & Accessibility**
   - Appropriate file sizes
   - Descriptive naming
   - Modern format variants for performance

## Test Results

### Success Criteria
- ✅ All cover images exist and are properly referenced
- ✅ Valid image extensions only
- ✅ No placeholder images
- ✅ Appropriate file sizes
- ✅ Descriptive filenames

### Warnings (Non-blocking)
- ⚠️ Missing modern format variants (WebP/AVIF)
- ⚠️ Naming convention issues
- ⚠️ Large file sizes

### Failures (Blocking)
- ❌ Missing image files
- ❌ Invalid image formats
- ❌ Placeholder images detected
- ❌ Corrupted or unreadable files

## Statistics Output

The test provides detailed statistics including:

- Total blog posts vs. available images
- Image format distribution
- Modern format coverage (WebP/AVIF)
- Size analysis
- Naming compliance

## Recommendations

### Common Fixes

1. **Missing Modern Formats**
   ```bash
   npm run optimize:images
   ```

2. **Large Images**
   ```bash
   # Optimize manually with external tools
   # Or re-run optimization with different settings
   ```

3. **Naming Issues**
   ```bash
   # Rename files following conventions:
   # - Use lowercase
   # - Use hyphens instead of spaces
   # - Be descriptive
   ```

4. **Missing Images**
   ```bash
   # Add missing images to public/Blog/
   # Or update blogPosts.js with correct paths
   ```

## File Structure

```
saraiva-vision-site/
├── src/
│   ├── __tests__/
│   │   └── blog-cover-images.test.js  # Unit tests
│   └── data/
│       └── blogPosts.js               # Blog posts data
├── scripts/
│   └── test-cover-images.js           # CLI script
├── public/
│   └── Blog/                          # Cover images directory
└── docs/
    └── BLOG_COVER_IMAGES_TESTING.md   # This documentation
```

## Configuration

### Test Settings

```javascript
// In test files
const MAX_IMAGE_SIZE_MB = 5;           // Maximum file size
const VALID_EXTENSIONS = [             // Allowed formats
  '.png', '.jpg', '.jpeg', '.gif',
  '.webp', '.avif', '.svg', '.tiff'
];
const PLACEHOLDER_PATTERNS = [         // Patterns to detect placeholders
  /placeholder/i, /temp/i, /test/i,
  /sample/i, /default/i, /lorem/i, /blank/i
];
```

### Customization

To modify test thresholds or add new validations:

1. Edit `src/__tests__/blog-cover-images.test.js` for unit tests
2. Edit `scripts/test-cover-images.js` for CLI script
3. Update configuration constants as needed

## Troubleshooting

### Common Issues

1. **Tests Fail to Load Blog Posts**
   - Check `src/data/blogPosts.js` exists and is valid JavaScript
   - Verify export format: `export const blogPosts = [...]`

2. **Images Not Found**
   - Verify `public/Blog/` directory exists
   - Check file permissions
   - Ensure image paths in blogPosts.js are correct

3. **Large Test Output**
   - Tests are designed to show warnings for improvement opportunities
   - Focus on ❌ failures first, then ⚠️ warnings

### Debug Mode

For detailed debugging, modify the test files to add more console.log statements or run with:

```bash
# Verbose Vitest output
npm run test:run -- --reporter=verbose src/__tests__/blog-cover-images.test.js

# Debug Node script
DEBUG=* node scripts/test-cover-images.js
```

## Integration with Other Tools

### Image Optimization

```bash
# Generate modern formats
npm run optimize:images

# Verify all images
npm run verify:blog-images

# Test cover images specifically
npm run test:blog-covers
```

### Build Process

```bash
# Full validation before deployment
npm run test:comprehensive
npm run test:blog-covers
npm run build
```

## Contributing

When adding new blog posts:

1. Add appropriate cover images to `public/Blog/`
2. Update `src/data/blogPosts.js` with correct image paths
3. Run tests: `npm run test:blog-covers`
4. Fix any issues before committing
5. Consider running `npm run optimize:images` for modern formats

## Support

For issues with the image testing tools:

1. Check this documentation first
2. Review test output for specific error messages
3. Verify file structure and permissions
4. Test with individual files first