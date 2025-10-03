# Migration Utilities - Quick Reference

## Files Created

### 1. `/lib/utils.ts` 
**ClassName utility for Tailwind CSS merging**

```typescript
import { cn } from '@/lib/utils'

// Merge classes with conflict resolution
cn('text-red-500', 'text-blue-500') // => 'text-blue-500'

// Conditional classes
cn('base', isActive && 'active', className)

// Component usage
<div className={cn('p-4 rounded', className, error && 'border-red-500')} />
```

### 2. `/components/ui/social-links.tsx`
**Accessible social media links component**

```typescript
import { SocialLinks } from '@/components/ui/social-links'

const socials = [
  { name: 'Facebook', href: 'https://...', image: '/icons/facebook.png' },
  { name: 'Instagram', href: 'https://...', image: '/icons/instagram.png' }
]

<SocialLinks socials={socials} className="gap-4" />
```

## Dependencies Status

✅ **All dependencies already installed:**
- `clsx`: ^2.1.1
- `tailwind-merge`: ^1.14.0  
- `framer-motion`: ^12.23.19

**No npm install required.**

## Usage in Migrated Components

### Footer.tsx
```typescript
import { SocialLinks } from '@/components/ui/social-links'
import { cn } from '@/lib/utils'

// Uses both utilities ✅
<div className={cn('footer-section', className)}>
  <SocialLinks socials={socialsForLinks} />
</div>
```

### Button Component
```typescript
import { cn } from '@/lib/utils'

<button className={cn('btn-base', variant === 'primary' && 'btn-primary', className)}>
```

### Card Component  
```typescript
import { cn } from '@/lib/utils'

<div className={cn('card-base', size === 'lg' && 'card-lg', className)}>
```

## Features

### `cn()` Utility
- ✅ Tailwind CSS conflict resolution
- ✅ Conditional class support
- ✅ Object/array syntax
- ✅ TypeScript types
- ✅ Lightweight (~1KB)

### `SocialLinks` Component
- ✅ Framer Motion animations
- ✅ Hover state management
- ✅ WCAG AAA accessibility
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Lazy loading images
- ✅ TypeScript types
- ✅ 'use client' directive

## Testing

```typescript
// Test cn()
import { cn } from '@/lib/utils'
expect(cn('foo', 'bar')).toBe('foo bar')

// Test SocialLinks
import { SocialLinks } from '@/components/ui/social-links'
render(<SocialLinks socials={mockSocials} />)
```

## File Locations

```
/home/saraiva-vision-site/
├── lib/utils.ts                          ← NEW
├── components/ui/social-links.tsx        ← NEW
├── components/Footer.tsx                 ← USES BOTH
├── components/Hero.tsx                   ← CAN USE cn()
└── components/Services.tsx               ← CAN USE cn()
```

## Common Patterns

```typescript
// 1. Conditional styling
<div className={cn('base', condition && 'conditional', className)} />

// 2. Variant styling
<div className={cn('base', {
  'variant-a': variant === 'a',
  'variant-b': variant === 'b'
}, className)} />

// 3. State styling
<div className={cn('base', {
  'hover:scale-105': !disabled,
  'opacity-50 cursor-not-allowed': disabled
})} />

// 4. Responsive styling
<div className={cn(
  'grid gap-4',
  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  className
)} />
```

## Migration Checklist

- [x] Create `lib/utils.ts`
- [x] Create `components/ui/social-links.tsx`
- [x] Verify dependencies in package.json
- [x] Add TypeScript types
- [x] Add accessibility features
- [x] Test in Footer component
- [x] Create documentation

## Next Steps

1. Replace manual className concatenation with `cn()`
2. Use `SocialLinks` in all components needing social icons
3. Update tests to use new utilities
4. Run `npm run lint` to verify
5. Run `npm run test:run` to verify functionality

## Documentation

See `UTILITY_MODULES.md` for comprehensive documentation including:
- Detailed API reference
- Advanced examples
- Testing strategies
- Troubleshooting guide
- Accessibility features
- Performance notes
