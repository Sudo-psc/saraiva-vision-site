# Error Pages - Quick Reference Guide

## 📁 Files Created

```
app/
├── not-found.tsx          # 404 page
├── error.tsx             # Runtime error boundary
├── loading.tsx           # Loading/suspense UI
└── global-error.tsx      # Root layout error boundary

lib/
└── error-utils.ts        # Error utilities & custom classes

docs/
├── ERROR_PAGES.md        # Complete documentation
└── ERROR_PAGES_QUICK_REFERENCE.md  # This file
```

## 🚀 Quick Start

### 1. Testing Error Pages

```bash
# Start dev server
npm run dev

# Test 404 page - visit any non-existent page
http://localhost:3000/this-page-does-not-exist

# Test error boundary - create a component that throws
// In any component:
throw new Error('Test error');

# Test loading state - use Suspense
// Already works with Next.js async components
```

### 2. Using Error Utils in Your Code

```typescript
// Import error classes
import { NotFoundError, ValidationError } from '@/lib/error-utils';

// In Server Components or API routes
export async function getPost(id: string) {
  const post = await db.post.findUnique({ where: { id } });
  
  if (!post) {
    throw new NotFoundError('Post', { id });
  }
  
  return post;
}

// In form validation
if (!email.includes('@')) {
  throw new ValidationError('Email inválido', { email });
}
```

### 3. API Route Error Handling

```typescript
// app/api/example/route.ts
import { handleApiError } from '@/lib/error-utils';

export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return Response.json(data);
  } catch (error) {
    const { message, statusCode, code } = handleApiError(error);
    return Response.json(
      { error: message, code },
      { status: statusCode }
    );
  }
}
```

### 4. Manual 404 Triggering

```typescript
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  
  if (!post) {
    notFound(); // Triggers not-found.tsx
  }
  
  return <div>{post.title}</div>;
}
```

## 🎨 Design Tokens Used

```css
/* Colors */
primary-600: #1E4D4C        /* Azul Petróleo */
bg-primary: #F6F7F5         /* Off-white base */
text-primary: #0B0E0F       /* Quase preto */
error-DEFAULT: #EF4444      /* Error red */

/* Shadows */
shadow-glass-lg             /* Glass morphism effect */
shadow-soft                 /* Subtle shadow */

/* Animations */
animate-pulse               /* Breathing effect */
animate-bounce              /* Loading dots */
animate-ping                /* Expanding circles */
animate-shimmer             /* Progress bar sweep */
```

## 📝 Customization Guide

### Modify 404 Links

Edit `app/not-found.tsx`:

```typescript
const quickLinks = [
  { href: '/', label: 'Página Inicial', icon: Home },
  { href: '/contato', label: 'Contato', icon: Phone },
  { href: '/blog', label: 'Blog', icon: Search },
  // Add your own links here
];

const popularServices = [
  { name: 'Consulta Oftalmológica', href: '/#servicos' },
  // Add your services here
];
```

### Customize Contact Information

Update phone number and contact details in all error pages:

```typescript
// Find and replace:
(33) 3229-1000  →  Your phone number
/contato         →  Your contact page
```

### Add Analytics Tracking

```typescript
// In error.tsx or not-found.tsx
useEffect(() => {
  // Track 404s
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_not_found', {
      page_path: window.location.pathname,
    });
  }
}, []);
```

## 🧪 Testing Checklist

- [ ] 404 page renders correctly
- [ ] All links on 404 page work
- [ ] Error boundary catches runtime errors
- [ ] "Try Again" button works on error page
- [ ] Loading page shows during async operations
- [ ] Global error catches root layout errors
- [ ] Error utils work in API routes
- [ ] Mobile responsive design
- [ ] Keyboard navigation works
- [ ] Screen reader accessible

## 🔧 Troubleshooting

### Error page not showing

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Custom error not triggering

```typescript
// Make sure you're throwing the error correctly
import { NotFoundError } from '@/lib/error-utils';

// ✅ Correct
throw new NotFoundError('Resource');

// ❌ Wrong
return new NotFoundError('Resource');
```

### Loading page not appearing

```typescript
// Make sure you have async Server Components
export default async function Page() {
  const data = await fetchData(); // This triggers loading.tsx
  return <div>{data}</div>;
}
```

## 📊 Performance Metrics

Target metrics for error pages:
- **Bundle Size:** ~5KB (gzipped)
- **First Paint:** <500ms
- **Interactive:** <1s
- **CLS:** 0 (no layout shift)

## 🔗 Related Documentation

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [AGENTS.md](/AGENTS.md) - Build & test commands
- [CLAUDE.md](/CLAUDE.md) - Project context
- [ERROR_PAGES.md](/docs/ERROR_PAGES.md) - Full documentation

## 💡 Common Patterns

### Protected Route with 404

```typescript
export default async function ProtectedPage({ params }: Props) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  const data = await getData(params.id);
  
  if (!data) {
    notFound(); // Shows custom 404
  }
  
  return <div>{data}</div>;
}
```

### API Error with Logging

```typescript
import { logError, handleApiError } from '@/lib/error-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await processData(body);
    return Response.json(result);
  } catch (error) {
    logError(error, { endpoint: '/api/example', method: 'POST' });
    
    const { message, statusCode, code } = handleApiError(error);
    return Response.json(
      { error: message, code },
      { status: statusCode }
    );
  }
}
```

### Graceful Degradation

```typescript
// Component with error boundary
export default function FeatureComponent() {
  return (
    <ErrorBoundary fallback={<FeatureFallback />}>
      <Feature />
    </ErrorBoundary>
  );
}

function FeatureFallback() {
  return (
    <div className="p-4 bg-yellow-50 rounded-lg">
      <p>Esta funcionalidade está temporariamente indisponível.</p>
      <button onClick={() => window.location.reload()}>
        Tentar Novamente
      </button>
    </div>
  );
}
```

## 🎯 Best Practices

1. **Always log errors in production**
   ```typescript
   if (process.env.NODE_ENV === 'production') {
     logError(error, context);
   }
   ```

2. **Provide actionable error messages**
   ```typescript
   // ✅ Good
   throw new ValidationError('Email deve conter @', { email });
   
   // ❌ Bad
   throw new Error('Invalid input');
   ```

3. **Use appropriate error types**
   ```typescript
   // 404 - Not Found
   throw new NotFoundError('Post');
   
   // 400 - Bad Request
   throw new ValidationError('Invalid email');
   
   // 401 - Unauthorized
   throw new UnauthorizedError('Login required');
   
   // 403 - Forbidden
   throw new ForbiddenError('Admin only');
   ```

4. **Always provide fallback UI**
   - Never show blank pages
   - Always offer way to recover
   - Provide contact information

---

**Need Help?** Check the [full documentation](/docs/ERROR_PAGES.md) or contact the development team.
