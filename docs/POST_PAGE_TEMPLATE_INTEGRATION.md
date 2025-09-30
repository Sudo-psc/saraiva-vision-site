# PostPageTemplate Integration Guide

## Overview

`PostPageTemplate.jsx` is a premium blog post template component featuring 3D glassmorphism design, parallax effects, sticky table of contents, and comprehensive SEO optimization.

---

## Key Features

### 🎨 Design Elements
- **3D Glassmorphism**: Liquid glass effects with backdrop blur and gradient overlays
- **Parallax Hero**: Image moves at different speed than scroll for depth effect
- **Floating Actions**: Share, print, and scroll-to-top buttons with 3D hover effects
- **Sticky Sidebar**: TOC and widgets remain visible during scroll
- **Reading Progress Bar**: Visual indicator at top of page

### 📱 Responsive Layout
- **Desktop**: Two-column layout (8/4 grid) with sticky sidebar
- **Tablet**: Adjusted padding and font sizes
- **Mobile**: Single column, collapsible TOC (future enhancement)

### ♿ Accessibility
- WCAG 2.1 AA compliant
- Semantic HTML5 structure
- ARIA labels and landmarks
- Keyboard navigation support
- Screen reader optimized
- Focus indicators

### 🔍 SEO Optimization
- Complete meta tags (OpenGraph, Twitter Cards)
- Schema.org MedicalWebPage markup
- Semantic heading hierarchy (H1 → H6)
- Optimized images with alt text
- Breadcrumb navigation
- Reading time calculation

### 🚀 Performance
- Lazy loading for images
- Code splitting ready
- Optimized animations (GPU-accelerated)
- Debounced scroll handlers
- Efficient re-renders with React hooks

---

## Integration Steps

### 1. Import the Component

In `BlogPage.jsx`, add the import:

```jsx
import PostPageTemplate from '../components/blog/PostPageTemplate';
```

### 2. Replace Existing Post Rendering

**Current Code (lines 116-373):**
```jsx
// Render single post view
if (currentPost) {
  const enrichment = getPostEnrichment(currentPost.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 relative">
      {/* ... existing single post rendering ... */}
    </div>
  );
}
```

**Replace with:**
```jsx
// Render single post view
if (currentPost) {
  return <PostPageTemplate slug={slug} />;
}
```

### 3. Complete Integration Example

```jsx
// src/pages/BlogPage.jsx

import React from 'react';
import { useParams } from 'react-router-dom';
import PostPageTemplate from '../components/blog/PostPageTemplate';
import { getPostBySlug } from '../data/blogPosts';
// ... other imports

const BlogPage = () => {
  const { slug } = useParams();

  // Check if viewing single post
  const currentPost = slug ? getPostBySlug(slug) : null;

  // Render single post view
  if (currentPost) {
    return <PostPageTemplate slug={slug} />;
  }

  // ... rest of blog listing code
};

export default BlogPage;
```

---

## Component Props

### `PostPageTemplate`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | Yes | Blog post slug for data fetching |

**Note**: The component internally fetches post data using `getPostBySlug(slug)` and enrichment data using `getPostEnrichment(post.id)`.

---

## Features Breakdown

### 1. Hero Section with Parallax

- **Parallax Effect**: Image moves slower than scroll (Framer Motion `useTransform`)
- **Gradient Overlay**: Dark gradient from bottom for text readability
- **Meta Badges**: Author, date, reading time, views (glass pills)
- **Category Badge**: With glass effect backdrop

```jsx
// Parallax implementation
const { scrollY } = useScroll();
const heroY = useTransform(scrollY, [0, 300], [0, 100]);
const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
```

### 2. Reading Progress Bar

Fixed top bar showing scroll progress:

```jsx
const { scrollYProgress } = useScroll();
const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
```

### 3. Sticky Table of Contents

- Auto-generates from H2 headings in content
- Highlights active section during scroll
- Smooth scroll to sections on click
- Glass effect with 3D shadow

**Scroll Spy Logic:**
```jsx
const handleScroll = () => {
  const scrollPosition = window.scrollY + 200;
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.getElementById(`section-${i}`);
    if (section && section.offsetTop <= scrollPosition) {
      setActiveSection(`section-${i}`);
      break;
    }
  }
};
```

### 4. Floating Action Buttons

Three floating buttons (bottom-right):
- **Scroll to Top**: Appears after 500px scroll
- **Share Menu**: Opens dropdown with social platforms
- **Print**: Triggers browser print dialog

Each has 3D glow effect:
```jsx
<div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
```

### 5. Social Share Integration

Supports:
- Twitter
- Facebook
- LinkedIn
- WhatsApp
- Copy Link (with confirmation feedback)

Tracks shares via analytics:
```jsx
trackBlogInteraction('share', currentPost.slug, { method: platform });
```

### 6. Content Styling

Comprehensive Tailwind prose utilities:
- Custom H2/H3/H4 styles with borders
- Styled blockquotes with glass effect
- Code blocks with syntax highlighting ready
- Responsive images with rounded corners
- Link hover effects

### 7. Related Content

- Learning summary (if enrichment data exists)
- Info boxes/warnings
- Tags with glass pills
- Related podcasts with Spotify embeds
- FAQ accordion
- Related posts carousel

---

## Customization Guide

### Color Schemes

Primary gradient (blue → purple):
```jsx
className="bg-gradient-to-r from-blue-600 to-purple-600"
```

To change to different colors:
```jsx
// Example: Green to teal
className="bg-gradient-to-r from-green-600 to-teal-600"
```

### Glass Effect Intensity

Adjust backdrop blur and opacity:

```jsx
// Current: 70% opacity, extra large blur
className="bg-white/70 backdrop-blur-xl"

// More transparent
className="bg-white/50 backdrop-blur-lg"

// More opaque
className="bg-white/90 backdrop-blur-2xl"
```

### Parallax Speed

Adjust movement range:

```jsx
// Current: 0-100px movement
const heroY = useTransform(scrollY, [0, 300], [0, 100]);

// Faster parallax
const heroY = useTransform(scrollY, [0, 300], [0, 150]);

// Slower parallax
const heroY = useTransform(scrollY, [0, 300], [0, 50]);
```

### TOC Scroll Offset

Adjust scroll position for active section:

```jsx
// Current: 200px offset
const scrollPosition = window.scrollY + 200;

// Less offset
const scrollPosition = window.scrollY + 100;
```

---

## CSS Utilities (Tailwind Extensions)

### Glassmorphism Utilities

Add to `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        'xs': '2px',
        'xl': '20px',
        '2xl': '40px',
        '3xl': '64px',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'liquid-glass': 'linear-gradient(to bottom right, rgba(59,130,246,0.05), rgba(168,85,247,0.05), rgba(236,72,153,0.05))',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-xl': '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
        '3d': '0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)',
        '3d-hover': '0 30px 80px rgba(0, 0, 0, 0.4), 0 15px 30px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
```

### Custom Glass Component Classes

```css
/* Add to src/styles/glass-effects.css */

.glass-card {
  @apply bg-white/70 backdrop-blur-xl rounded-3xl shadow-glass border-2 border-white/50;
}

.glass-card-hover {
  @apply transition-all duration-300 hover:shadow-glass-lg hover:border-white/80;
}

.liquid-overlay {
  @apply absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl pointer-events-none;
}

.glow-3d {
  @apply absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity;
}

.glass-pill {
  @apply bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-lg;
}

.prose-glass h2 {
  @apply relative pb-3 border-b-2 border-blue-200;
}

.prose-glass h2::before {
  content: '';
  @apply absolute left-0 bottom-0 w-20 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600;
}
```

---

## Performance Optimizations

### 1. Lazy Loading

Images already use `OptimizedImage` component with lazy loading:

```jsx
<OptimizedImage
  loading="lazy"
  aspectRatio="16/9"
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

### 2. Debounced Scroll

Scroll handlers are optimized:

```jsx
useEffect(() => {
  const handleScroll = () => {
    // Throttled scroll logic
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### 3. Animation Performance

Use GPU-accelerated properties:

```jsx
// Good: transforms and opacity
style={{ transform: `translateY(${heroY}px)`, opacity: heroOpacity }}

// Avoid: layout properties (top, left, width, height)
```

### 4. Code Splitting

Component is ready for lazy loading:

```jsx
// In BlogPage.jsx
const PostPageTemplate = React.lazy(() => import('../components/blog/PostPageTemplate'));

// Usage
<React.Suspense fallback={<LoadingSpinner />}>
  <PostPageTemplate slug={slug} />
</React.Suspense>
```

---

## Testing Checklist

### Visual Testing
- [ ] Hero image parallax works smoothly
- [ ] Glass effects render correctly on all backgrounds
- [ ] 3D shadows visible on hover
- [ ] Reading progress bar updates
- [ ] Floating buttons appear/hide correctly
- [ ] Share menu opens/closes properly
- [ ] TOC highlights active section

### Responsive Testing
- [ ] Mobile (320px-767px): Single column, readable text
- [ ] Tablet (768px-1023px): Adjusted layout
- [ ] Desktop (1024px+): Full two-column layout
- [ ] Sidebar sticks correctly
- [ ] Images scale appropriately

### Accessibility Testing
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader announces sections correctly
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Headings follow logical hierarchy

### Performance Testing
- [ ] Page loads in <3 seconds (3G)
- [ ] Time to Interactive <5 seconds
- [ ] Largest Contentful Paint <2.5s
- [ ] Cumulative Layout Shift <0.1
- [ ] First Input Delay <100ms

### Browser Testing
- [ ] Chrome/Edge (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Mobile Safari (iOS 15+)
- [ ] Chrome Mobile (Android)

---

## Troubleshooting

### Issue: Parallax not smooth

**Solution**: Ensure Framer Motion is installed and `useTransform` is imported correctly.

```bash
npm install framer-motion
```

### Issue: TOC not highlighting

**Solution**: Check that H2 elements have IDs assigned (automatically done in useEffect).

### Issue: Glass effects not visible

**Solution**: Ensure Tailwind backdrop-blur is enabled:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        // ... rest
      }
    }
  }
}
```

### Issue: Share buttons not working

**Solution**: Check analytics tracking is configured:

```js
// src/utils/analytics.js should export:
export const trackBlogInteraction = (action, slug, metadata) => {
  // Implementation
};
```

### Issue: Images not loading

**Solution**: Verify `OptimizedImage` component exists and image paths are correct.

---

## Migration Notes

### From Current BlogPage Implementation

1. **Backup Current Code**: Save lines 116-373 of `BlogPage.jsx`
2. **Replace Rendering Logic**: Use `<PostPageTemplate slug={slug} />`
3. **Test All Features**: Verify no functionality is lost
4. **Update Analytics**: Ensure tracking events match previous implementation

### Breaking Changes

None. Component is drop-in replacement with same data dependencies.

### Enhancements Over Current

- ✅ Parallax hero section
- ✅ Reading progress indicator
- ✅ Sticky table of contents
- ✅ Floating action buttons
- ✅ Enhanced share menu
- ✅ Better glassmorphism effects
- ✅ Improved typography
- ✅ Enhanced SEO markup

---

## Future Enhancements

### Planned Features
- [ ] Mobile bottom sheet TOC
- [ ] Dark mode support
- [ ] Reading position save/resume
- [ ] Print-optimized stylesheet
- [ ] Audio narration integration
- [ ] Comment system integration
- [ ] Related posts recommendations (AI-powered)

### Community Suggestions
- Submit feature requests via GitHub Issues
- Contribute improvements via Pull Requests

---

## Support

For questions or issues:
1. Check this documentation
2. Review existing blog components
3. Check Tailwind CSS documentation
4. Review Framer Motion documentation

---

## License

This component is part of the Saraiva Vision project.

---

**Last Updated**: 2025-09-30
**Component Version**: 1.0.0
**Compatibility**: React 18+, Tailwind CSS 3+, Framer Motion 10+
