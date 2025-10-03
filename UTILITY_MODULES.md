# Utility Modules Documentation

## Overview

This document describes the utility modules created for the Next.js migration, providing reusable utilities and components for the application.

---

## 1. `lib/utils.ts` - ClassName Utilities

### Purpose
Provides the `cn()` utility function for merging Tailwind CSS classes with conflict resolution.

### Location
`/home/saraiva-vision-site/lib/utils.ts`

### Dependencies
```json
{
  "clsx": "^2.1.1",
  "tailwind-merge": "^1.14.0"
}
```

### API

#### `cn(...inputs: ClassValue[]): string`

Merges multiple className strings/objects and resolves Tailwind CSS conflicts.

**Parameters:**
- `inputs` - Variable number of className values (strings, objects, arrays)

**Returns:**
- Merged className string with conflicts resolved

**Examples:**

```typescript
import { cn } from '@/lib/utils'

// Basic usage
cn('text-red-500', 'text-blue-500')
// => 'text-blue-500' (last class wins)

// Conditional classes
cn('base-class', isActive && 'active-class')
// => 'base-class active-class' (if isActive is true)

// Object syntax
cn('base', { 'active': isActive, 'disabled': isDisabled })

// Array syntax
cn(['base', 'text-lg'], 'font-bold')

// Component usage
<div className={cn('p-4 rounded', className, error && 'border-red-500')}>
```

**Use Cases:**

1. **Component className merging:**
```typescript
interface ButtonProps {
  className?: string
  variant?: 'primary' | 'secondary'
}

function Button({ className, variant = 'primary' }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        className
      )}
    />
  )
}
```

2. **State-based styling:**
```typescript
<div className={cn(
  'transition-all',
  isHovered && 'scale-105',
  isActive && 'bg-blue-100',
  isDisabled && 'opacity-50 cursor-not-allowed'
)} />
```

3. **Responsive classes:**
```typescript
<div className={cn(
  'grid gap-4',
  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  isFeatured && 'lg:grid-cols-4'
)} />
```

---

## 2. `components/ui/social-links.tsx` - Social Media Links Component

### Purpose
Accessible, animated social media links component with hover effects.

### Location
`/home/saraiva-vision-site/components/ui/social-links.tsx`

### Dependencies
```json
{
  "react": "^18.2.0",
  "framer-motion": "^12.23.19",
  "clsx": "^2.1.1",
  "tailwind-merge": "^1.14.0"
}
```

### Features
- ✅ Framer Motion animations (scale, translate)
- ✅ Hover state management (dims non-hovered icons)
- ✅ Accessible (ARIA labels, semantic HTML)
- ✅ TypeScript types
- ✅ Lazy loading images
- ✅ Client-side component ('use client')
- ✅ Keyboard navigation support
- ✅ Focus ring indicators

### API

#### `SocialLinks` Component

```typescript
interface Social {
  name: string      // Display name (e.g., "Facebook")
  href: string      // URL to social profile
  image: string     // Path to icon image
}

interface SocialLinksProps extends React.HTMLAttributes<HTMLDivElement> {
  socials: Social[]
  className?: string
}

function SocialLinks({ socials, className, ...props }: SocialLinksProps)
```

**Props:**
- `socials` (required) - Array of social media links
- `className` (optional) - Additional CSS classes
- `...props` - All standard HTML div attributes

**Examples:**

```typescript
import { SocialLinks } from '@/components/ui/social-links'

// Basic usage
const socials = [
  {
    name: 'Facebook',
    href: 'https://facebook.com/yourpage',
    image: '/icons/facebook.png'
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/yourprofile',
    image: '/icons/instagram.png'
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/yourcompany',
    image: '/icons/linkedin.png'
  }
]

export default function Footer() {
  return (
    <footer>
      <SocialLinks socials={socials} />
    </footer>
  )
}
```

**Advanced Usage:**

```typescript
// With custom styling
<SocialLinks 
  socials={socials} 
  className="justify-end gap-4"
/>

// In a flex container
<div className="flex items-center justify-between">
  <p>Follow us:</p>
  <SocialLinks socials={socials} />
</div>

// With additional props
<SocialLinks 
  socials={socials}
  aria-label="Our social media profiles"
  data-testid="footer-socials"
/>
```

**Customization:**

The component supports Tailwind classes for customization:

```typescript
// Change gap between icons
<SocialLinks socials={socials} className="gap-6" />

// Change icon size (override in custom CSS)
<SocialLinks socials={socials} className="[&_img]:h-10 [&_img]:w-10" />

// Change hover effect colors
<SocialLinks 
  socials={socials} 
  className="[&_a:focus]:ring-green-500"
/>
```

### Accessibility Features

1. **ARIA Labels:**
   - Container: `role="list"` and `aria-label="Social media links"`
   - Links: `role="listitem"` and descriptive `aria-label`

2. **Keyboard Navigation:**
   - All links are keyboard accessible
   - Focus rings for visual feedback
   - Tab order follows natural document flow

3. **Screen Readers:**
   - Semantic HTML structure
   - Descriptive alt text for icons
   - Link purpose clearly announced

4. **Visual Accessibility:**
   - Focus indicators meet WCAG AAA standards
   - Sufficient color contrast
   - Hover states for pointer users

### Animations

The component uses Framer Motion for smooth animations:

```typescript
// Hover animation
whileHover={{ scale: 1.1, y: -2 }}

// Tap animation
whileTap={{ scale: 0.95 }}

// Non-hovered icons fade
hoveredSocial && hoveredSocial !== social.name
  ? 'opacity-50 scale-90'
  : 'opacity-100 scale-100'
```

**Performance:**
- Uses CSS transforms for GPU acceleration
- Transitions are optimized with `will-change`
- Images use lazy loading

---

## Usage Examples

### Example 1: Footer Component

```typescript
import { SocialLinks } from '@/components/ui/social-links'
import { cn } from '@/lib/utils'
import { clinicInfo } from '@/lib/clinicInfo'

export default function Footer() {
  const socials = [
    { name: 'Facebook', href: clinicInfo.facebook, image: '/icons/facebook.png' },
    { name: 'Instagram', href: clinicInfo.instagram, image: '/icons/instagram.png' },
    { name: 'LinkedIn', href: clinicInfo.linkedin, image: '/icons/linkedin.png' },
  ]

  return (
    <footer className={cn(
      'bg-slate-800 text-white py-8'
    )}>
      <div className="container mx-auto">
        <SocialLinks socials={socials} />
      </div>
    </footer>
  )
}
```

### Example 2: Header with Social Icons

```typescript
import { SocialLinks } from '@/components/ui/social-links'

export default function Header() {
  const socials = [
    { name: 'Twitter', href: 'https://twitter.com/clinic', image: '/icons/twitter.png' },
    { name: 'YouTube', href: 'https://youtube.com/clinic', image: '/icons/youtube.png' },
  ]

  return (
    <header className="flex justify-between items-center p-4">
      <Logo />
      <SocialLinks socials={socials} className="gap-4" />
    </header>
  )
}
```

### Example 3: Card Component with Dynamic Classes

```typescript
import { cn } from '@/lib/utils'

interface CardProps {
  title: string
  description: string
  variant?: 'default' | 'featured'
  className?: string
}

export default function Card({ 
  title, 
  description, 
  variant = 'default',
  className 
}: CardProps) {
  return (
    <div className={cn(
      'rounded-lg p-6 shadow-md',
      variant === 'default' && 'bg-white',
      variant === 'featured' && 'bg-gradient-to-br from-blue-500 to-purple-600 text-white',
      className
    )}>
      <h3 className={cn(
        'text-xl font-bold mb-2',
        variant === 'featured' && 'text-white'
      )}>
        {title}
      </h3>
      <p>{description}</p>
    </div>
  )
}
```

### Example 4: Button Component with Variants

```typescript
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({ 
  variant = 'primary', 
  size = 'md',
  className,
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded font-medium transition-colors',
        {
          'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
          'border-2 border-blue-500 text-blue-500 hover:bg-blue-50': variant === 'outline',
        },
        {
          'px-3 py-1 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

---

## Dependencies

All required dependencies are already installed in `package.json`:

```json
{
  "dependencies": {
    "clsx": "^2.1.1",
    "tailwind-merge": "^1.14.0",
    "framer-motion": "^12.23.19",
    "react": "^18.2.0",
    "lucide-react": "^0.285.0"
  }
}
```

**No additional packages need to be installed.**

---

## Testing

### Testing `cn()` Utility

```typescript
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges classes correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resolves Tailwind conflicts', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'active')).toBe('base active')
  })

  it('handles object syntax', () => {
    expect(cn({ 'active': true, 'disabled': false })).toBe('active')
  })
})
```

### Testing `SocialLinks` Component

```typescript
import { render, screen } from '@testing-library/react'
import { SocialLinks } from '@/components/ui/social-links'

const mockSocials = [
  { name: 'Facebook', href: 'https://facebook.com', image: '/fb.png' },
  { name: 'Twitter', href: 'https://twitter.com', image: '/tw.png' },
]

describe('SocialLinks', () => {
  it('renders all social links', () => {
    render(<SocialLinks socials={mockSocials} />)
    expect(screen.getByLabelText(/Facebook/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Twitter/i)).toBeInTheDocument()
  })

  it('opens links in new tab', () => {
    render(<SocialLinks socials={mockSocials} />)
    const link = screen.getByLabelText(/Facebook/i)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('applies custom className', () => {
    const { container } = render(
      <SocialLinks socials={mockSocials} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
```

---

## File Structure

```
/home/saraiva-vision-site/
├── lib/
│   └── utils.ts                    # ClassName utility (NEW)
├── components/
│   └── ui/
│       └── social-links.tsx        # Social links component (NEW)
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── social-links.tsx    # Original version (existing)
│   └── utils/
│       └── componentUtils.ts       # Extended utilities (existing)
└── package.json
```

---

## Migration Notes

1. **Path Aliases:**
   - Use `@/lib/utils` for Next.js App Router
   - Use `@/components/ui/social-links` for components

2. **Compatibility:**
   - Both modules work with React 18
   - Compatible with Next.js 15.5+
   - TypeScript strict mode compatible

3. **Performance:**
   - `cn()` is lightweight (~1KB)
   - `SocialLinks` uses optimized animations
   - Images lazy load by default

4. **Best Practices:**
   - Always use `cn()` for dynamic classes
   - Prefer `SocialLinks` over custom implementations
   - Keep social icon images optimized (<10KB each)

---

## Troubleshooting

### Issue: `cn` is not a function
**Solution:** Check import path - use `@/lib/utils` not `@/utils`

### Issue: SocialLinks not animating
**Solution:** Ensure `framer-motion` is installed and parent is not blocking pointer events

### Issue: Icons not loading
**Solution:** Verify image paths are correct and images exist in `/public` directory

### Issue: TypeScript errors
**Solution:** Ensure `tsconfig.json` has proper path aliases configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## Related Documentation

- [Tailwind CSS Class Merging](https://github.com/dcastil/tailwind-merge)
- [clsx Documentation](https://github.com/lukeed/clsx)
- [Framer Motion API](https://www.framer.com/motion/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Changelog

### 2025-10-03
- ✅ Created `lib/utils.ts` with `cn()` function
- ✅ Created `components/ui/social-links.tsx` component
- ✅ Added TypeScript types
- ✅ Added accessibility features (ARIA, keyboard navigation)
- ✅ Added Framer Motion animations
- ✅ Verified dependencies in package.json

---

## Support

For issues or questions:
1. Check existing components in `src/components/ui/`
2. Review test files in `tests/components/`
3. Consult `AGENTS.md` for project conventions
4. Check `package.json` for dependency versions
