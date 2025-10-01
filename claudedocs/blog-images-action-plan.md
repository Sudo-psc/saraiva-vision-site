# Blog Images - Action Plan

**Generated**: 2025-10-01
**Status**: ✅ All images functional, minor improvements needed

## Current Status

### ✅ Production Verification
- **Total Images**: 20 unique images
- **Status**: 100% (20/20) loading correctly in production
- **Average Size**: 1.5 MB
- **Formats**: PNG only (no AVIF yet)

### ⚠️ Issues Identified

#### 1. Duplicate Images (2 cases)

**Issue**: Same image used for different post topics

| Image | Posts Using It | Impact |
|-------|---------------|--------|
| `capa-ductolacrimal.png` | 1. Obstrução Ducto Lacrimal (✅ correct)<br>2. Cuidados Visuais Esportes (❌ mismatch) | Low - both are prevention category |
| `capa-lentes-premium-catarata.png` | 1. Lentes Premium Catarata (✅ correct)<br>2. Sensibilidade à Luz (❌ mismatch) | Medium - different topics |

#### 2. Missing AVIF Versions

**Issue**: No modern image format optimization

- Current: PNG only (~1.5MB average)
- Target: PNG + AVIF (~300KB average for AVIF)
- Potential Savings: ~75% bandwidth reduction
- Impact on Core Web Vitals: Significant LCP improvement

## Action Items

### Priority 1: Generate Unique Covers (Manual)

**Posts needing new covers:**

1. **Post #17**: Cuidados Visuais em Esportes
   - Current: `capa-ductolacrimal.png` (incorrect)
   - Needed: `capa-cuidados-visuais-esportes.png`
   - Prompt: "Professional medical illustration showing athlete wearing protective sports eyewear, dynamic sports environment, blue/green colors, 16:9 landscape, high-quality medical photography style"

2. **Post #7**: Sensibilidade à Luz (Fotofobia)
   - Current: `capa-lentes-premium-catarata.png` (incorrect)
   - Needed: `capa-sensibilidade-luz-fotofobia.png`
   - Prompt: "Professional medical illustration showing person shielding eyes from bright light, bright environment with light rays, yellow/white/blue colors, 16:9 landscape, high-quality medical photography style"

**Generation Options:**

A. **Via Gemini Imagen 4 API** (Recommended)
   ```bash
   # Set API key
   export GOOGLE_GEMINI_API_KEY='your-key-here'

   # Generate using existing script (needs adaptation)
   python3 /tmp/generate-missing-covers.py
   ```

B. **Via DALL-E 3 / Midjourney** (Alternative)
   - Use prompts above
   - Download at 1600x900 or higher
   - Save as PNG in `public/Blog/`

C. **Manual Design** (Fallback)
   - Use Canva Pro or Figma
   - Follow style guide from existing covers
   - Export as PNG 1600x900

### Priority 2: Generate AVIF Versions

**Command:**
```bash
npm run optimize:images
```

**Or manual:**
```bash
for img in public/Blog/*.png; do
  npx sharp-cli -i "$img" -o "${img%.png}.avif" -f avif -q 85
done
```

**Expected Results:**
- 22 new `.avif` files
- ~75% size reduction
- Faster page loads
- Better Core Web Vitals

### Priority 3: Update Post Frontmatter

**After generating new images**, update these files:

```bash
# Post #17
sed -i 's|image: /Blog/capa-ductolacrimal.png|image: /Blog/capa-cuidados-visuais-esportes.png|' \
  src/content/blog/cuidados-visuais-esportes-caratinga.md

# Post #7
sed -i 's|image: /Blog/capa-lentes-premium-catarata.png|image: /Blog/capa-sensibilidade-luz-fotofobia.png|' \
  src/content/blog/sensibilidade-a-luz-causas-tratamentos-caratinga-mg.md
```

### Priority 4: Implement Responsive Images

**Update OptimizedImage component:**

```jsx
<picture>
  <source
    srcSet={`${image}.avif`}
    type="image/avif"
  />
  <img
    src={`${image}.png`}
    alt={alt}
    loading={featured ? 'eager' : 'lazy'}
  />
</picture>
```

## Timeline

| Task | Effort | Priority | Status |
|------|--------|----------|--------|
| Generate 2 unique covers | 30min | High | ⏳ Pending |
| Generate AVIF versions (all 22) | 10min | High | ⏳ Pending |
| Update post frontmatter | 5min | High | ⏳ Pending |
| Implement responsive images | 1h | Medium | ⏳ Pending |
| Deploy to production | 15min | High | ⏳ Pending |

**Total Estimated Time**: 2 hours

## Success Metrics

- ✅ All 22 posts have unique, relevant cover images
- ✅ AVIF versions available for all images
- ✅ Average image size reduced from 1.5MB to ~300KB (AVIF)
- ✅ LCP score improvement (target: <2.5s)
- ✅ Zero 404s for blog images

## Commands Summary

```bash
# 1. Audit current state
bash /tmp/audit-images.sh

# 2. Generate missing covers (manual step)
# Use Gemini Imagen, DALL-E, or design tool

# 3. Optimize all images
npm run optimize:images

# 4. Update frontmatter
# Edit files manually or use sed commands above

# 5. Build and deploy
npm run build
sudo cp -r dist/* /var/www/html/

# 6. Verify in production
curl -I https://saraivavision.com.br/Blog/capa-cuidados-visuais-esportes.png
curl -I https://saraivavision.com.br/Blog/capa-sensibilidade-luz-fotofobia.png
```

## Notes

- All 20 existing unique images are working perfectly in production
- Duplication issue is minor and doesn't break functionality
- AVIF optimization will have largest performance impact
- Consider implementing this during low-traffic period

## References

- Image audit report: `claudedocs/blog-images-audit.md`
- Gemini generation guide: `GENERATE_COVERS_GUIDE.md`
- Production URL: `https://saraivavision.com.br/blog`
