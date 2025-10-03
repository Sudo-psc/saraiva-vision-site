# Next.js Migration Quick Reference

## Files Migrated

### ✅ useAutoplayCarousel Hook
```
src/hooks/useAutoplayCarousel.js → hooks/useAutoplayCarousel.ts
```

**Import:**
```tsx
import { useAutoplayCarousel } from '@/hooks/useAutoplayCarousel';
import type { AutoplayConfig, Direction } from '@/hooks/useAutoplayCarousel';
```

**Basic Example:**
```tsx
const { currentIndex, handlers, next, previous } = useAutoplayCarousel({
  totalSlides: 5,
  config: { defaultInterval: 5000 }
});
```

---

### ✅ ServiceIcons Component
```
src/components/icons/ServiceIcons.jsx → components/icons/ServiceIcons.tsx
```

**Import:**
```tsx
import { ConsultationIcon, getServiceIcon } from '@/components/icons/ServiceIcons';
import type { ServiceIconProps } from '@/components/icons/ServiceIcons';
```

**Basic Example:**
```tsx
<ConsultationIcon className="h-12 w-12" />
{getServiceIcon('cirurgias-oftalmologicas', { className: 'h-10 w-10' })}
```

---

### ✅ Shared Types
```
types/carousel.ts (new)
```

**Import:**
```tsx
import type { 
  AutoplayConfig, 
  Direction, 
  CarouselHandlers 
} from '@/types/carousel';
```

---

## Key Changes

1. **Client Directive**: All files now have `'use client'` at the top
2. **Type Safety**: Full TypeScript support with exported types
3. **Import Path**: Use `@/hooks/` and `@/components/icons/` instead of `@/src/`
4. **Type Exports**: Import types separately with `import type { ... }`

---

## Compatibility

- ✅ Next.js 15+
- ✅ React 18+
- ✅ TypeScript 5.9+
- ✅ All original features preserved
- ✅ Reduced motion support
- ✅ i18n support

---

## Documentation

See `docs/HOOK_MIGRATION.md` for complete usage examples and API reference.
