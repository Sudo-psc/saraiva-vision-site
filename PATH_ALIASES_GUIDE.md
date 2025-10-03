# TypeScript Path Aliases Configuration Guide

## ✅ Configuration Complete

The Next.js project is now configured with TypeScript path aliases that allow you to import modules using the `@/` prefix instead of relative paths.

## 📁 Configured Path Aliases

| Alias | Resolves To | Example Import |
|-------|-------------|----------------|
| `@/*` | `./*` (project root) | `import { config } from '@/config'` |
| `@/components/*` | `components/*` or `src/components/*` | `import Hero from '@/components/Hero'` |
| `@/lib/*` | `lib/*` or `src/lib/*` | `import { stripe } from '@/lib/stripe'` |
| `@/types/*` | `types/*` or `src/types/*` | `import type { ProfileType } from '@/types/components'` |
| `@/hooks/*` | `src/hooks/*` | `import { useProfileDetector } from '@/hooks/useProfileDetector'` |
| `@/styles/*` | `src/styles/*` or `styles/*` | `import '@/styles/globals.css'` |
| `@/utils/*` | `src/utils/*` | `import { formatDate } from '@/utils/dateHelpers'` |
| `@/services/*` | `src/services/*` | `import { api } from '@/services/api'` |
| `@/config/*` | `src/config/*` | `import { siteConfig } from '@/config/site'` |
| `@/app/*` | `app/*` | `import Layout from '@/app/layout'` |

## 🔧 Updated Configuration Files

### tsconfig.json
- Added specific path mappings for all major directories
- Supports multiple resolution paths (e.g., both `components/` and `src/components/`)
- Uses `baseUrl: "."` for root-relative imports

### next.config.js
- Removed redundant webpack alias configuration
- Next.js automatically reads path aliases from `tsconfig.json`
- No additional configuration needed

## ✨ Example Usage

### Before (Relative Paths)
```typescript
import ProfileSelector from '../../../components/ProfileSelector';
import { useProfileDetector } from '../../hooks/useProfileDetector';
import type { ProfileType } from '../../../types/components';
```

### After (Path Aliases)
```typescript
import ProfileSelector from '@/components/ProfileSelector';
import { useProfileDetector } from '@/hooks/useProfileDetector';
import type { ProfileType } from '@/types/components';
```

## 🧪 Verification Steps

1. **Check TypeScript compilation:**
   ```bash
   npx next build
   ```
   The build should complete successfully with path aliases resolving correctly.

2. **Test in your IDE:**
   - TypeScript/VS Code should provide autocomplete for `@/` imports
   - CMD/CTRL + Click should navigate to the correct file
   - No red underlines for valid imports

3. **Verify specific imports:**
   ```typescript
   // Components
   import Hero from '@/components/Hero';
   import Footer from '@/components/Footer';
   import ProfileSelector from '@/components/ProfileSelector';
   
   // Types
   import type { ProfileType } from '@/types/components';
   import type { SubscriptionPlan } from '@/types/subscription';
   
   // Lib
   import { stripe } from '@/lib/stripe';
   import { contactFormSchema } from '@/lib/validations/api';
   
   // Hooks (from src/hooks/)
   import { useProfileDetector } from '@/hooks/useProfileDetector';
   ```

## 📝 Common Import Patterns

### Root-level Components
```typescript
import ProfileSelector from '@/components/ProfileSelector';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
```

### Nested Components (automatically resolves from both locations)
```typescript
// Will check: components/ui/Button.tsx, then src/components/ui/Button.tsx
import Button from '@/components/ui/Button';
```

### Type Imports
```typescript
import type { ProfileType } from '@/types/components';
import type { ApiResponse } from '@/types/api';
```

### Utility Functions
```typescript
import { formatDate } from '@/utils/dateHelpers';
import { cn } from '@/utils/classNames';
```

### Configuration
```typescript
import { siteConfig } from '@/config/site';
import { stripe } from '@/lib/stripe';
```

## ⚠️ Important Notes

1. **File Extensions:** Do not include file extensions in imports (`.ts`, `.tsx`, `.js`, `.jsx`)
   - ✅ `import Hero from '@/components/Hero'`
   - ❌ `import Hero from '@/components/Hero.tsx'`

2. **Multiple Resolutions:** Some paths support multiple locations:
   - `@/components/*` checks both `components/*` and `src/components/*`
   - `@/lib/*` checks both `lib/*` and `src/lib/*`
   - TypeScript will use the first match found

3. **Case Sensitivity:** File names are case-sensitive on Linux/macOS
   - ✅ `import Hero from '@/components/Hero'` (matches Hero.tsx)
   - ❌ `import Hero from '@/components/hero'` (will fail)

4. **IDE Support:** Restart your IDE/TypeScript server after configuration changes:
   - VS Code: CMD/CTRL + Shift + P → "TypeScript: Restart TS Server"

## 🐛 Troubleshooting

### Import Not Found
- Verify the file exists in the expected directory
- Check file name case sensitivity
- Restart TypeScript server in your IDE

### Autocomplete Not Working
- Ensure `tsconfig.json` is in project root
- Restart IDE or TypeScript server
- Check that the file is included in `tsconfig.json` include paths

### Build Errors
- Run `npm run build` to verify configuration
- Check Next.js build output for specific errors
- Ensure all imported files exist

## ✅ Verification Checklist

- [x] `tsconfig.json` updated with path mappings
- [x] Next.js automatically reads from `tsconfig.json`
- [x] All major directories have path aliases configured
- [x] Build completes without path resolution errors
- [x] Existing `@/` imports in codebase work correctly

