# PostPageTemplate - Quick Start Guide

## 🚀 5-Minute Integration

### Step 1: Import CSS (One-Time Setup)

Add to `src/main.jsx` or `src/App.jsx`:

```jsx
import './styles/glass-effects.css';
```

### Step 2: Update BlogPage.jsx

Replace single post rendering with the new template:

```jsx
// At the top with other imports
import PostPageTemplate from '../components/blog/PostPageTemplate';

// Inside BlogPage component, replace the single post view section
const BlogPage = () => {
  const { slug } = useParams();
  const currentPost = slug ? getPostBySlug(slug) : null;

  // Replace entire "if (currentPost)" block with:
  if (currentPost) {
    return <PostPageTemplate slug={slug} />;
  }

  // ... rest of blog listing code stays the same
};
```

### Step 3: Test

```bash
npm run dev
```

Visit: `http://localhost:3002/blog/your-post-slug`

---

## ✨ What You Get

### Visual Features
- ✅ Parallax hero image
- ✅ Reading progress bar
- ✅ Sticky table of contents
- ✅ 3D glassmorphism effects
- ✅ Floating action buttons
- ✅ Social share menu
- ✅ Print functionality

### Technical Features
- ✅ Full SEO optimization
- ✅ WCAG 2.1 AA accessibility
- ✅ Mobile responsive
- ✅ Performance optimized
- ✅ Analytics tracking

---

## 🎨 Customization Cheat Sheet

### Change Color Scheme

**Default: Blue → Purple**
```jsx
className="bg-gradient-to-r from-blue-600 to-purple-600"
```

**To Green → Teal:**
```jsx
className="bg-gradient-to-r from-green-600 to-teal-600"
```

**To Orange → Red:**
```jsx
className="bg-gradient-to-r from-orange-600 to-red-600"
```

### Adjust Glass Opacity

**More transparent:**
```jsx
className="bg-white/50 backdrop-blur-lg"
```

**More opaque:**
```jsx
className="bg-white/90 backdrop-blur-2xl"
```

### Change Parallax Speed

Find in PostPageTemplate.jsx:
```jsx
const heroY = useTransform(scrollY, [0, 300], [0, 100]);
// Change [0, 100] to [0, 150] for faster parallax
// Change [0, 100] to [0, 50] for slower parallax
```

---

## 🐛 Common Issues

### Glass effect not visible?

**Check:** Is there content behind the glass element?

Glass needs a background to show the blur effect.

### Parallax not working?

**Check:** Is Framer Motion installed?

```bash
npm install framer-motion
```

### TOC not highlighting?

**Check:** Do your H2 elements have content?

TOC auto-generates from H2 headings in the post content.

### Share buttons not working?

**Check:** Is analytics utility imported?

Verify `src/utils/analytics.js` exports `trackBlogInteraction`.

---

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px (single column)
- **Tablet**: 768px - 1023px (adjusted padding)
- **Desktop**: 1024px+ (two-column layout)

---

## ♿ Accessibility Features

- ✅ Semantic HTML5 structure
- ✅ ARIA labels and landmarks
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ High contrast ratios

---

## 🎯 Performance Metrics

Target Core Web Vitals:
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

Tips:
- Images lazy load automatically
- Animations GPU-accelerated
- Scroll handlers debounced

---

## 📚 Related Documentation

- **Full Integration Guide**: `POST_PAGE_TEMPLATE_INTEGRATION.md`
- **Tailwind Config**: `TAILWIND_GLASS_CONFIG.md`
- **CSS Utilities**: `src/styles/glass-effects.css`

---

## 🆘 Support

Issues? Check:
1. Browser DevTools Console for errors
2. Network tab for failed requests
3. React DevTools for component state
4. This quick start guide
5. Full integration documentation

---

## 🎉 Next Steps

1. Test on different devices
2. Customize colors to match brand
3. Add custom content sections
4. Configure analytics tracking
5. Optimize images for production

---

**Happy Coding! 🚀**

Built with ❤️ for Saraiva Vision by Claude Code
