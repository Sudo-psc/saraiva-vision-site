# Blog Image Verification Script

Comprehensive Node.js script for verifying blog image integrity and references.

## Overview

The `verify-blog-images.js` script scans your blog's image directory and validates all image references in `blogPosts.js`, ensuring:

- All referenced images exist
- No broken file extension typos
- Modern format variants (.webp, .avif) are available
- No orphaned/unused images
- Comprehensive reporting with actionable fixes

## Quick Start

```bash
# Run verification
npm run verify:blog-images

# Or directly
node scripts/verify-blog-images.js
```

## Features

### 1. Image Scanning
- Scans `public/Blog/` directory for all image files
- Supports: PNG, JPG, JPEG, GIF, WebP, AVIF, SVG, TIFF
- Catalogs available images with extensions and basenames

### 2. Reference Extraction
- Extracts image references from `src/data/blogPosts.js`
- Detects multiple reference patterns:
  - `coverImage: '/Blog/image.png'`
  - `image: 'image.png'`
  - `src: '/Blog/image.png'`
  - Inline references in content

### 3. Validation Checks

#### Missing Images
Identifies images referenced in code but not present in filesystem:
```
❌ MISSING IMAGES
  • missing_image.png
    Referenced at line 123: "coverImage: 'missing_image.png'"
```

#### Extension Typos
Detects common file extension mistakes:
```
🔤 EXTENSION TYPOS DETECTED
  • image.avi (should be .avif)
  • photo.webpp (should be .webp)
  • diagram.pn (should be .png)
```

#### Missing Modern Format Variants
Flags legacy formats (PNG/JPG) missing modern equivalents:
```
🖼️  MISSING MODERN FORMAT VARIANTS
  • olhinho.png
    → Missing .webp: olhinho.webp
    → Missing .avif: olhinho.avif
```

#### Unused Images
Lists images in directory not referenced in code:
```
🗑️  UNUSED IMAGES
  • old_unused_image.png
  • deprecated_photo.jpg
```

## Output

### Console Report
Human-readable summary with:
- Summary statistics
- Missing images list
- Extension typo detection
- Missing modern variants
- Unused images inventory
- Suggested fixes with commands

### JSON Report
Detailed machine-readable report saved to:
```
/home/saraiva-vision-site/blog-image-verification-report.json
```

#### JSON Structure
```json
{
  "timestamp": "2025-09-30T19:10:34.822Z",
  "summary": {
    "totalImagesAvailable": 116,
    "totalReferences": 22,
    "validReferences": 22,
    "missingImages": 0,
    "extensionTypos": 0,
    "imagesNeedingVariants": 19,
    "unusedImages": 94
  },
  "availableImages": [...],
  "imageReferences": [...],
  "validReferences": [...],
  "missingImages": [...],
  "extensionTypos": [...],
  "missingModernVariants": [...],
  "unusedImages": [...]
}
```

## Common Workflows

### 1. Pre-Deployment Check
```bash
# Verify all images before deploying
npm run verify:blog-images

# If issues found, fix them, then re-verify
npm run verify:blog-images
```

### 2. Adding New Blog Post
```bash
# 1. Add new post to blogPosts.js
# 2. Add cover image to public/Blog/
# 3. Verify references
npm run verify:blog-images

# 4. Generate modern format variants if needed
npm run optimize:images
```

### 3. Cleaning Up Unused Images
```bash
# 1. Run verification
npm run verify:blog-images

# 2. Review unused images list
# 3. Manually delete unnecessary files
rm public/Blog/old_unused_image.png

# 4. Re-verify
npm run verify:blog-images
```

### 4. Generating Modern Format Variants

If the script reports missing .webp or .avif variants:

```bash
# Using Sharp (recommended - already in devDependencies)
node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = fs.readdirSync('public/Blog')
  .filter(f => /\.(png|jpg|jpeg)$/i.test(f));

images.forEach(async (img) => {
  const input = path.join('public/Blog', img);
  const basename = path.parse(img).name;

  // Generate WebP
  await sharp(input)
    .webp({ quality: 85 })
    .toFile(path.join('public/Blog', \`\${basename}.webp\`));

  // Generate AVIF
  await sharp(input)
    .avif({ quality: 80 })
    .toFile(path.join('public/Blog', \`\${basename}.avif\`));

  console.log(\`✓ Generated variants for \${img}\`);
});
"

# Or using @squoosh/cli (alternative)
npx @squoosh/cli --webp auto --avif auto public/Blog/*.{png,jpg,jpeg}
```

## Exit Codes

- **0**: Verification passed (no missing images or typos)
- **1**: Issues detected (missing images or extension typos)

Use in CI/CD pipelines:
```bash
# Will fail build if images are broken
npm run verify:blog-images || exit 1
```

## Configuration

The script uses these paths (configurable in source):

```javascript
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BLOG_IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'Blog');
const BLOG_POSTS_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'blogPosts.js');
```

## Performance

- Scans 100+ images in < 1 second
- Memory efficient (no image loading, only metadata)
- Regex-based reference extraction
- No external dependencies (uses Node.js built-ins)

## Troubleshooting

### "Directory not found" Error
```
Error: Blog images directory not found: /path/to/public/Blog
```

**Solution**: Verify paths in script match your project structure.

### "No images found" Warning
```
Found 0 images
```

**Solution**: Check if images have correct extensions (png, jpg, jpeg, etc.).

### False Positives for Unused Images
Some images might be referenced dynamically or in other files.

**Solution**: Manual review before deleting "unused" images.

### Missing References Not Detected
If images are referenced in JSX components or other files.

**Solution**: This script only checks `blogPosts.js`. Extend regex patterns or scan additional files.

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Blog Image Verification

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
      - name: Upload Report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: image-verification-report
          path: blog-image-verification-report.json
```

## Best Practices

1. **Run Before Every Deploy**
   ```bash
   npm run verify:blog-images && npm run build
   ```

2. **Keep Modern Formats Updated**
   - Always generate .webp and .avif variants
   - Improves page load performance
   - Better browser compatibility

3. **Clean Up Regularly**
   - Review unused images quarterly
   - Remove old/deprecated images
   - Keep directory organized

4. **Naming Conventions**
   - Use descriptive names: `capa_estrabismo.png`
   - Avoid spaces (use underscores or hyphens)
   - Include post number/slug if applicable

5. **Version Control**
   - Commit JSON reports for tracking
   - Document image changes in commits
   - Use `.gitignore` for temporary variants

## Advanced Usage

### Custom Extensions

To add new image formats, edit the script:

```javascript
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.tiff', '.heic'];
```

### Scanning Multiple Directories

Modify to scan additional directories:

```javascript
const BLOG_IMAGES_DIR = [
  path.join(PROJECT_ROOT, 'public', 'Blog'),
  path.join(PROJECT_ROOT, 'public', 'images'),
  path.join(PROJECT_ROOT, 'assets', 'blog')
];
```

### Custom Reference Patterns

Add new regex patterns for different reference styles:

```javascript
const imagePatterns = [
  /coverImage:\s*['"]([^'"]+)['"]/g,
  /backgroundImage:\s*['"]([^'"]+)['"]/g,  // Add custom patterns
  /heroImage:\s*['"]([^'"]+)['"]/g
];
```

## Related Scripts

- `optimize-blog-images.js` - Generates modern format variants
- `deploy.sh` - Deployment script (includes image verification)

## Support

For issues or questions:
- Check script output for detailed error messages
- Review JSON report for programmatic analysis
- Consult CLAUDE.md for project structure details

## Changelog

### v1.0.0 (2025-09-30)
- Initial release
- Complete image scanning and validation
- Extension typo detection
- Modern format variant checking
- JSON and console reporting
- npm script integration
