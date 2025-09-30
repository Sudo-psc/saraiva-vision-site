# Tailwind CSS Configuration for Glassmorphism

## Overview

This document provides the Tailwind CSS configuration extensions needed to support the glassmorphism design system in the PostPageTemplate component.

---

## Installation

Add these extensions to your existing `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // ============================================
      // GLASSMORPHISM EXTENSIONS
      // ============================================

      // Backdrop Blur Extensions
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '20px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // Background Images for Glass Effects
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'liquid-glass': 'linear-gradient(to bottom right, rgba(59,130,246,0.05), rgba(168,85,247,0.05), rgba(236,72,153,0.05))',
        'glass-shine': 'linear-gradient(to top left, rgba(255,255,255,0.2), transparent 50%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },

      // Box Shadows for Glass Effects
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.05)',
        'glass-md': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-xl': '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
        '3d': '0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)',
        '3d-sm': '0 10px 30px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.15)',
        '3d-lg': '0 30px 80px rgba(0, 0, 0, 0.4), 0 15px 30px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2)',
      },

      // Border Radius Extensions
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },

      // Animation Extensions
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'liquid-flow': 'liquid-flow 10s ease-in-out infinite',
      },

      // Keyframes for Animations
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'scale-in': {
          'from': {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'liquid-flow': {
          '0%, 100%': {
            transform: 'translate(0%, 0%) scale(1)',
          },
          '33%': {
            transform: 'translate(30%, -20%) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20%, 30%) scale(0.9)',
          },
        },
      },

      // Typography Extensions
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.gray.700'),
            h2: {
              color: theme('colors.gray.900'),
              fontWeight: '700',
              fontSize: '1.875rem',
              marginTop: '2.5rem',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: `2px solid ${theme('colors.blue.200')}`,
              position: 'relative',
            },
            h3: {
              color: theme('colors.gray.900'),
              fontWeight: '700',
              fontSize: '1.5rem',
              marginTop: '2rem',
              marginBottom: '1rem',
            },
            h4: {
              color: theme('colors.gray.900'),
              fontWeight: '700',
              fontSize: '1.25rem',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
            },
            p: {
              marginBottom: '1.5rem',
              lineHeight: '1.75',
            },
            a: {
              color: theme('colors.blue.600'),
              fontWeight: '600',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            blockquote: {
              borderLeftColor: theme('colors.blue.500'),
              borderLeftWidth: '4px',
              paddingLeft: '1.5rem',
              fontStyle: 'italic',
              color: theme('colors.gray.600'),
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              padding: '1rem 1.5rem',
              borderRadius: '0 0.75rem 0.75rem 0',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            code: {
              backgroundColor: theme('colors.gray.100'),
              color: theme('colors.pink.600'),
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: theme('colors.gray.900'),
              color: theme('colors.gray.100'),
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: theme('boxShadow.lg'),
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            img: {
              borderRadius: '0.75rem',
              boxShadow: theme('boxShadow.lg'),
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            ul: {
              paddingLeft: '1.5rem',
              marginBottom: '1.5rem',
            },
            ol: {
              paddingLeft: '1.5rem',
              marginBottom: '1.5rem',
            },
            li: {
              marginBottom: '0.5rem',
            },
          },
        },
      }),

      // Spacing Extensions
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      // Z-Index Extensions
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // Scale Extensions
      scale: {
        '102': '1.02',
        '103': '1.03',
        '98': '0.98',
        '97': '0.97',
      },
    },
  },
  plugins: [
    // Add if you want to use @tailwindcss/typography
    // require('@tailwindcss/typography'),
  ],
}
```

---

## Required Tailwind Plugins

### @tailwindcss/typography (Optional but Recommended)

For better prose styling in blog content:

```bash
npm install -D @tailwindcss/typography
```

Then add to plugins:

```js
plugins: [
  require('@tailwindcss/typography'),
],
```

---

## Usage Examples

### Glass Card

```jsx
<div className="glass-card glass-card-hover">
  <h3 className="glass-heading">Premium Card</h3>
  <p className="glass-text">Beautiful glassmorphism effect</p>
</div>
```

Equivalent Tailwind classes:
```jsx
<div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-glass border-2 border-white/50 hover:shadow-glass-lg hover:border-white/80 hover:scale-[1.02] transition-all duration-300">
  <h3 className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent drop-shadow-sm font-extrabold">
    Premium Card
  </h3>
  <p className="text-gray-700 drop-shadow-sm">
    Beautiful glassmorphism effect
  </p>
</div>
```

### Glass Pill Badge

```jsx
<span className="glass-pill glass-pill-hover">
  <Calendar className="w-4 h-4" />
  <span>Published Today</span>
</span>
```

Equivalent Tailwind:
```jsx
<span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-lg hover:bg-white/30 hover:shadow-xl hover:scale-105 transition-all duration-300">
  <Calendar className="w-4 h-4" />
  <span>Published Today</span>
</span>
```

### 3D Shadow Button

```jsx
<button className="relative group">
  <div className="glow-3d" />
  <span className="relative z-10">Click Me</span>
</button>
```

Equivalent Tailwind:
```jsx
<button className="relative group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-3d hover:shadow-3d-lg transition-all">
  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity" />
  <span className="relative z-10">Click Me</span>
</button>
```

### Liquid Overlay Container

```jsx
<div className="relative glass-card">
  <div className="liquid-overlay" />
  <div className="relative z-10">
    Content here
  </div>
</div>
```

---

## Color Palette Reference

### Primary Colors (Blue)
- `primary-50`: #f0f9ff (lightest)
- `primary-100`: #e0f2fe
- `primary-500`: #0ea5e9 (base)
- `primary-600`: #0284c7
- `primary-700`: #0369a1
- `primary-900`: #0c4a6e (darkest)

### Glassmorphism Recommended Combinations

#### Light Glass
```jsx
bg-white/50 backdrop-blur-lg border border-white/40
```

#### Medium Glass
```jsx
bg-white/70 backdrop-blur-xl border-2 border-white/50
```

#### Strong Glass
```jsx
bg-white/80 backdrop-blur-2xl border-2 border-white/60
```

#### Colored Glass (Blue)
```jsx
bg-blue-500/10 backdrop-blur-xl border-2 border-blue-200/50
```

---

## Responsive Design

### Breakpoints

Tailwind default breakpoints (no changes needed):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Glass Classes

```jsx
<div className="
  glass-card
  p-4 md:p-6 lg:p-8
  rounded-2xl lg:rounded-3xl
  backdrop-blur-lg lg:backdrop-blur-xl
">
  Responsive glass card
</div>
```

---

## Performance Considerations

### Will-Change Property

For elements with frequent animations, add `will-change`:

```jsx
className="will-change-transform transform-gpu"
```

### GPU Acceleration

Force GPU acceleration for smooth animations:

```jsx
className="transform-gpu translate-z-0"
```

### Reduce Motion

Respect user preferences:

```jsx
// In your CSS or Tailwind config
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Browser Support

### Backdrop Filter Support

Glassmorphism relies on `backdrop-filter`. Check support:

- ✅ Chrome 76+
- ✅ Safari 9+ (with -webkit prefix)
- ✅ Firefox 103+
- ✅ Edge 79+

### Fallback for Older Browsers

```jsx
<div className="
  bg-white backdrop-blur-xl
  supports-[backdrop-filter]:bg-white/70
">
  Content
</div>
```

Or use CSS:

```css
.glass-card {
  background-color: white;
}

@supports (backdrop-filter: blur(20px)) {
  .glass-card {
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
  }
}
```

---

## Debugging Tips

### Check Backdrop Blur

If glass effect not visible, ensure:

1. **Parent has background**: Glass needs something behind it
2. **Z-index correct**: Element should be above background
3. **Browser supports backdrop-filter**: Check DevTools
4. **No conflicting styles**: Check computed styles

### Inspect Glass Layers

Use Chrome DevTools:
1. Right-click element → Inspect
2. Check "Computed" tab
3. Look for `backdrop-filter`
4. Verify opacity values

---

## Migration from Existing Styles

### Converting Shadow Classes

Old:
```jsx
className="shadow-lg"
```

New (glass):
```jsx
className="shadow-glass-lg"
```

### Converting Blur Classes

Old:
```jsx
className="backdrop-blur-sm"
```

New (enhanced):
```jsx
className="backdrop-blur-xl"
```

---

## Testing Checklist

- [ ] Glass effects visible on different backgrounds
- [ ] Hover states working correctly
- [ ] 3D shadows rendering
- [ ] Animations smooth (60fps)
- [ ] Responsive on all breakpoints
- [ ] Works in Safari (webkit prefix)
- [ ] Fallbacks for unsupported browsers
- [ ] Accessible (contrast ratios meet WCAG)

---

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Glassmorphism Design Trend](https://hype4.academy/articles/design/glassmorphism-in-user-interfaces)
- [MDN: backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [Can I Use: backdrop-filter](https://caniuse.com/css-backdrop-filter)

---

**Last Updated**: 2025-09-30
**Tailwind CSS Version**: 3.x
**Compatibility**: All modern browsers with backdrop-filter support
