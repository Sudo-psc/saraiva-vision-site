# Sanity.io Integration - Quick Reference

**Status**: ✅ Fully Integrated | **Tests**: 20/20 Passing | **Posts**: 25/25 Exported

---

## 🚀 Quick Start

### Prerequisites

```bash
# Environment variables configured in .env
SANITY_PROJECT_ID=92ocrdmp
SANITY_DATASET=production
SANITY_TOKEN=sk****** (your token)
```

### Daily Commands

```bash
# Export all blog posts to Sanity
npm run sanity:export

# Validate data before export
npm run sanity:validate

# List existing posts in Sanity
npm run sanity:query

# Delete all posts (use with caution!)
npm run sanity:delete

# Run integration tests
npm run test scripts/sanity/__tests__/sanity-integration.test.js
```

---

## 📂 Files Overview

```
scripts/sanity/
├── export-to-sanity.js        # Main export script
├── sanity-schema.js            # Schema definition
├── README.md                   # This file
└── __tests__/
    └── sanity-integration.test.js  # Test suite (20 tests)
```

---

## 🎯 Common Tasks

### 1. Export Blog Posts

```bash
npm run sanity:export
```

**Output**:
```
✅ [1/25] Exported: Monovisão ou Lentes Multifocais
✅ [2/25] Exported: Tipos de Lentes de Contato
...
✅ Successfully exported: 25
❌ Failed to export: 0
```

### 2. Validate Data

```bash
npm run sanity:validate
```

**Output**:
```
✅ All posts are valid and ready for export!
📊 25 posts validated successfully
```

### 3. Query Posts

```bash
npm run sanity:query
```

**Output**:
```
📊 Found 25 existing posts in Sanity:
   - [27] Monovisão ou Lentes Multifocais (2025-10-13)
   - [26] Tipos de Lentes de Contato (2025-10-10)
   ...
```

### 4. Run Tests

```bash
npx vitest run scripts/sanity/__tests__/sanity-integration.test.js
```

**Output**:
```
✓ 20 tests passed (20)
Duration: ~7s
```

---

## 🔧 Integration Options

### Option A: Hybrid (Recommended)

Keep static files for production, use Sanity for editing.

**Benefits**:
- ✅ Visual content editing
- ✅ Production performance unchanged
- ✅ Easy rollback

**Setup**:
```bash
# Content edited in Sanity Studio
# Build script fetches from Sanity
npm run build:blog --source=sanity
```

### Option B: Real-time Integration

Fetch from Sanity API at runtime.

**Benefits**:
- ✅ Real-time updates
- ✅ No rebuild needed
- ⚠️ Runtime API calls

**Setup**:
```javascript
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '92ocrdmp',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2025-10-25'
})

const posts = await client.fetch('*[_type == "blogPost"] | order(date desc)')
```

### Option C: Static Generation (Next.js)

Generate static pages at build time.

**Benefits**:
- ✅ SEO optimized
- ✅ Fast page loads
- ✅ ISR support

**Setup**:
```javascript
export async function getStaticProps() {
  const posts = await sanityClient.fetch('*[_type == "blogPost"]')
  return {
    props: { posts },
    revalidate: 3600
  }
}
```

---

## 📖 GROQ Query Examples

### Basic Queries

```groq
# All posts ordered by date
*[_type == "blogPost"] | order(date desc)

# Specific fields only (projection)
*[_type == "blogPost"] { _id, title, slug, date }

# First 10 posts (pagination)
*[_type == "blogPost"] | order(date desc) [0...10]
```

### Filtering

```groq
# By category
*[_type == "blogPost" && category == "Dúvidas Frequentes"]

# By tag
*[_type == "blogPost" && "presbiopia" in tags]

# Featured posts only
*[_type == "blogPost" && featured == true]

# By date range
*[_type == "blogPost" && date >= "2025-09-01" && date <= "2025-10-31"]
```

### Search

```groq
# Title search
*[_type == "blogPost" && title match "Presbiopia*"]

# Full-text search
*[_type == "blogPost" && (
  title match "*catarata*" ||
  excerpt match "*catarata*" ||
  content match "*catarata*"
)]
```

---

## 🧪 Test Suite

### Test Coverage

- **Environment**: 2 tests (API connection, credentials)
- **Export**: 6 tests (data validation, integrity)
- **Queries**: 5 tests (filtering, searching, ordering)
- **Data**: 3 tests (integrity, validation)
- **Performance**: 2 tests (speed benchmarks)
- **Logic**: 2 tests (transformation, edge cases)

**Total**: 20 tests | **Status**: ✅ All Passing

### Run Tests

```bash
# Run all tests
npm run test scripts/sanity/__tests__/sanity-integration.test.js

# Watch mode
npx vitest scripts/sanity/__tests__/sanity-integration.test.js

# With coverage
npm run test:coverage scripts/sanity/__tests__/sanity-integration.test.js
```

---

## 🔍 Troubleshooting

### "Missing environment variables"

**Problem**: Script can't find Sanity credentials

**Solution**:
```bash
# Check .env file exists
ls -la .env

# Verify variables are set
cat .env | grep SANITY

# Expected output:
# SANITY_PROJECT_ID=92ocrdmp
# SANITY_DATASET=production
# SANITY_TOKEN=sk******
```

### "Failed to connect to Sanity API"

**Problem**: Network or authentication error

**Solutions**:
1. Check internet connection
2. Verify API token is valid
3. Check project ID is correct
4. Try regenerating token in Sanity dashboard

### "GROQ query parse error"

**Problem**: Invalid GROQ syntax

**Solutions**:
1. Check for HTML entities (`&amp;` → `&&`)
2. Validate query in Vision tool
3. Check quotes and brackets match
4. Refer to GROQ documentation

### Tests failing

**Problem**: Integration tests not passing

**Solutions**:
```bash
# Re-export data
npm run sanity:delete
npm run sanity:export

# Clear test cache
npx vitest --clearCache

# Run tests again
npm run test scripts/sanity/__tests__/sanity-integration.test.js
```

---

## 📚 Documentation

### Main Documentation

- **Integration Report**: `docs/SANITY_INTEGRATION_REPORT.md` (complete results)
- **Migration Guide**: `docs/SANITY_MIGRATION_GUIDE.md` (step-by-step)
- **This README**: Quick reference guide

### External Resources

- **Sanity Docs**: https://www.sanity.io/docs
- **GROQ Reference**: https://www.sanity.io/docs/groq
- **Sanity Studio**: https://saraivavision.sanity.studio
- **Dashboard**: https://www.sanity.io/manage/project/92ocrdmp

---

## 🔐 Security Notes

**API Token**:
- ✅ Stored in `.env` (not committed to git)
- ✅ Editor permissions only
- ✅ Rotate quarterly
- ✅ Separate tokens for dev/prod

**Data Security**:
- ✅ No patient data
- ✅ Public medical information only
- ✅ HTML sanitization enabled
- ✅ LGPD compliant

---

## 📊 Project Statistics

**Integration Status**:
- Posts Exported: 25/25 (100%)
- Tests Passing: 20/20 (100%)
- Data Integrity: ✅ Verified
- Performance: ✅ <2s queries

**Post Distribution**:
- Categories: 6
- Total Tags: 45+ unique
- Featured Posts: 3
- Average Length: ~2,500 words

**Performance**:
- Export time: ~3 seconds
- Query time: <2 seconds
- Test duration: ~7 seconds
- Rate limit usage: <2%

---

## 🎯 Next Steps

### Recommended Path

1. **Choose integration pattern** (Hybrid recommended)
2. **Train content editors** on Sanity Studio
3. **Test editing workflow** with sample post
4. **Deploy when ready** (optional)

### Optional Enhancements

- Configure Sanity Studio (visual editor)
- Set up webhooks (auto-deploy)
- Implement ISR (incremental static regeneration)
- Add preview functionality

---

**Last Updated**: 2025-10-25
**Author**: Dr. Philipe Saraiva Cruz
**Status**: ✅ Production Ready
