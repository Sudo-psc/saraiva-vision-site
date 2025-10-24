# Saraiva Vision - Comprehensive Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Integration](#backend-integration)
5. [Recent Improvements & Fixes](#recent-improvements--fixes)
6. [Component System](#component-system)
7. [API Integration Patterns](#api-integration-patterns)
8. [Development Workflows](#development-workflows)
9. [Deployment Guide](#deployment-guide)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance & Monitoring](#maintenance--monitoring)

---

## Project Overview

**Saraiva Vision** is a modern medical clinic website specialized in ophthalmology services, serving patients in Caratinga, Minas Gerais, Brazil. The project represents a comprehensive digital healthcare platform featuring patient management, appointment scheduling, medical content distribution, and compliance with Brazilian medical regulations.

### Business Context

- **Industry**: Medical/Healthcare (Ophthalmology)
- **Target Market**: Brazilian patients seeking eye care services
- **Compliance**: CFM (Brazilian Medical Council), LGPD (Brazilian GDPR)
- **Languages**: Portuguese (primary), English (secondary)
- **Location**: Caratinga, Minas Gerais, Brazil

### Key Features

- **Patient Portal**: Registration, profile management, appointment booking
- **Medical Content**: Blog articles, podcast episodes, educational resources
- **Communication**: Multi-channel patient contact (email, SMS, WhatsApp)
- **Social Integration**: Instagram feed, Google Reviews, testimonials
- **Compliance Systems**: CFM medical regulations, LGPD data protection
- **Accessibility**: WCAG 2.1 AA compliance for inclusive healthcare access

---

## Architecture & Technology Stack

### Overall Architecture Philosophy

The Saraiva Vision project uses a **hybrid architecture** optimized for the Brazilian market:

- **Frontend**: React SPA deployed on VPS for maximum control
- **Backend**: Node.js API services running natively on VPS
- **Database**: Unified MySQL for application data + Redis (caching, sessions, real-time)
- **Blog**: Static blog posts stored in src/data/blogPosts.js (no external CMS)
- **Deployment**: Native VPS deployment without Docker for optimal performance

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS Ubuntu Server                        │
│                     31.97.129.78                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Nginx    │  │   Node.js   │  │   MySQL     │        │
│  │   (native)  │  │  (systemd)  │  │  (native)   │        │
│  │ Port 80/443 │  │  Port 3001  │  │  Port 3306  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Redis    │  │ Static Blog │  │ React SPA   │        │
│  │   (native)  │  │blogPosts.js │  │/var/www/html│        │
│  │ Port 6379   │  │  src/data/  │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Overview

#### Frontend Stack
- **React 18.2.0** - Modern React with concurrent features
- **TypeScript 5.9.2** - Type safety and enhanced DX
- **Vite 7.1.7** - Fast build tool and dev server
- **Tailwind CSS 3.3.3** - Utility-first styling
- **Framer Motion 12.23.19** - Advanced animations
- **React Router 6.16.0** - Client-side routing with lazy loading

#### Backend Stack
- **Node.js 22+** - ES modules with modern JavaScript features
- **Express.js** - RESTful API framework
- **MySQL** - Primary database for all application data
- **Redis** - Session management, caching, and real-time features
- **JWT** - Authentication and authorization

#### UI/Component Libraries
- **Radix UI** - Accessible component primitives
- **Lucide React** - Modern icon system
- **React Helmet Async** - SEO and meta management
- **React Testing Library** - Component testing

#### Development Tools
- **Vitest 3.2.4** - Modern testing framework
- **ESLint 9.36.0** - Code quality and consistency
- **PostCSS & Autoprefixer** - CSS processing

---

## Frontend Architecture

### Application Structure

The frontend follows a well-organized, scalable structure optimized for medical industry requirements:

```
src/
├── components/          # React components
│   ├── ui/             # Design system components
│   ├── blog/           # Blog-related components
│   ├── compliance/     # CFM compliance components
│   └── __tests__/      # Component tests
├── pages/              # Route-level page components
├── hooks/              # Custom React hooks
├── lib/                # Core utilities and configurations
├── contexts/           # React context providers
├── utils/              # Helper functions
├── services/           # External service integrations
├── config/             # Configuration files
├── data/               # Static data files
│   └── blogPosts.js   # Static blog posts (no CMS)
├── workers/            # Web Workers
└── styles/             # Global CSS files
```

### Key Architectural Patterns

#### 1. Component Organization
- **Page Components**: Handle routing and layout (`src/pages/`)
- **UI Components**: Reusable design system elements (`src/components/ui/`)
- **Feature Components**: Domain-specific components (`src/components/blog/`, `src/components/compliance/`)
- **Shared Components**: Cross-cutting components (`src/components/`)

#### 2. State Management Strategy
- **React Context**: Global state (Auth, Analytics, Widgets)
- **Custom Hooks**: Shared stateful logic abstraction
- **Local Component State**: UI-specific interactions
- **Redis Pub/Sub**: Live data synchronization and real-time features

#### 3. Performance Optimizations
- **Code Splitting**: Lazy loading for all route components
- **Image Optimization**: Multiple fallback strategies and lazy loading
- **Bundle Optimization**: Strategic chunk splitting by vendor
- **Service Worker**: Development-only caching strategy

### React 18 Features Implementation

#### Concurrent Features
```jsx
// Lazy loading with Suspense
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/blog" element={<BlogPage />} />
      </Routes>
    </Suspense>
  );
}
```

#### Error Boundaries
```jsx
// Comprehensive error handling
<ErrorBoundary fallback={<ErrorDisplay />}>
  <Routes>
    {/* Application routes */}
  </Routes>
</ErrorBoundary>
```

### TypeScript Integration

#### Strict Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### Type-Safe Database Operations
```typescript
// Comprehensive MySQL types
interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  status: 'pending' | 'processed' | 'failed';
}

// Type-safe API calls using custom database client
const messages = await db.query(
  'SELECT * FROM contact_messages WHERE status = ?',
  ['pending']
);
```

### Accessibility Implementation

#### WCAG 2.1 AA Compliance
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Screen reader optimization
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: High contrast ratios for medical readability
- **Focus Management**: Logical focus flow and indicators

```jsx
// Accessible component example
function AccessibleButton({ children, ...props }) {
  return (
    <button
      className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
      aria-label={props['aria-label']}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## Backend Integration

### API Architecture

The backend uses a **unified approach** with MySQL for all application data and Redis for caching and real-time features:

```
api/
├── contact/            # Contact form and communication
├── appointments/       # Booking and management
├── podcast/           # Content management
├── analytics/         # Performance tracking
├── monitoring/        # Health checks
├── security/          # Authentication and authorization
├── webhooks/          # External integrations
└── utils/             # Shared utilities
```

### Database Schema

#### MySQL Tables
```sql
-- Contact messages with comprehensive tracking
CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  subject VARCHAR(255),
  status contact_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Appointment booking system
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20),
  service_type VARCHAR(100) NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message queue for async operations
CREATE TABLE message_outbox (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type message_type NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  status queue_status DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);
```

#### Static Blog Data Structure
```javascript
// src/data/blogPosts.js - Static blog posts
export const blogPosts = [
  {
    id: 1,
    slug: 'post-slug',
    title: 'Post Title',
    excerpt: 'Brief summary',
    content: 'Full HTML content',
    author: 'Dr. Name',
    date: '2025-01-01',
    category: 'Category Name',
    tags: ['tag1', 'tag2'],
    image: '/images/post-image.jpg',
    featured: true,
    seo: {
      metaTitle: 'SEO Title',
      metaDescription: 'SEO Description',
      keywords: ['keyword1', 'keyword2']
    }
  },
  // ... more posts
];
```

### API Integration Patterns

#### 1. Static Blog Data Pattern
```javascript
// Service for accessing static blog posts
import { blogPosts } from '@/data/blogPosts.js';

export class BlogService {
  getAllPosts(filters = {}) {
    let posts = [...blogPosts];
    
    // Apply category filter
    if (filters.category) {
      posts = posts.filter(post => post.category === filters.category);
    }
    
    // Apply tag filter
    if (filters.tag) {
      posts = posts.filter(post => post.tags.includes(filters.tag));
    }
    
    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return posts;
  }
  
  getPostBySlug(slug) {
    return blogPosts.find(post => post.slug === slug);
  }
  
  getFeaturedPosts() {
    return blogPosts.filter(post => post.featured);
  }
}
```

#### 2. Error Handling Pattern
```javascript
// Comprehensive error handling with fallbacks
export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);

    // Return fallback data structure
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};
```

#### 3. Caching Strategy
```javascript
// Redis-based caching with medical data compliance
class CacheManager {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.defaultTTL = 3600; // 1 hour
  }

  async get(key, fallbackFn) {
    try {
      const cached = await this.redis.get(key);
      if (cached) return JSON.parse(cached);

      const data = await fallbackFn();
      await this.set(key, data);
      return data;
    } catch (error) {
      console.error('Cache error:', error);
      return await fallbackFn();
    }
  }

  async set(key, data, ttl = this.defaultTTL) {
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }
}
```

---

## Recent Improvements & Fixes

### Major Achievement: VPS Deployment Optimization

The project recently underwent a **complete migration from Vercel to native VPS deployment**, resolving critical architectural limitations and providing full control over the infrastructure.

#### 1. ReferenceError Resolution

**Problem**: ES module compatibility issues causing `ReferenceError: require is not defined`

**Solution**: Complete conversion to ES modules throughout the codebase
```javascript
// Before (CommonJS causing errors)
const { workboxVitePlugin } = require('./src/utils/workbox-vite-plugin')

// After (ES modules)
import { workboxVitePlugin } from './src/utils/workbox-vite-plugin.js'
```

**Impact**: Eliminated build failures and runtime errors in production

#### 2. Blog Architecture Simplification

**Achievement**: Migrated from external WordPress CMS to static blog data

**Solution**: Complete removal of WordPress dependencies
```javascript
// Static blog posts in src/data/blogPosts.js
export const blogPosts = [
  {
    id: 1,
    slug: 'post-slug',
    title: 'Post Title',
    content: 'Full HTML content',
    // ... complete post structure
  }
];

// Blog service for filtering and retrieval
export class BlogService {
  getAllPosts() { return blogPosts; }
  getPostBySlug(slug) { return blogPosts.find(p => p.slug === slug); }
}
```

**Benefits**:
- Zero external dependencies for blog content
- Maximum performance (no database queries)
- Version-controlled content
- Simplified deployment and maintenance
- Complete control over content structure

#### 3. Build System Optimization

**Problem**: Qt display errors and workbox conflicts in VPS environment

**Solution**: Conditional plugin loading and environment-specific configuration
```javascript
// vite.config.js - Optimized for VPS deployment
const plugins = [react({
  jsxRuntime: 'automatic',
  include: '**/*.{jsx,tsx}',
  jsxImportSource: 'react'
})]

// Workbox disabled for stable VPS deployment
// Conditional loading prevents Qt display issues
```

**Results**:
- Stable builds in all environments
- Eliminated Qt display warnings
- Consistent deployment process
- Improved build performance

#### 4. Dependency Cleanup

**Removed External Dependencies**:
- `WordPress` CMS and related plugins
- `PHP-FPM` server
- External database queries for blog content
- GraphQL client libraries for blog
- WordPress-specific configuration files

**Added Simplifications**:
- Static blog data in version control
- Direct JavaScript imports for blog content
- Eliminated CMS deployment and maintenance
- Comprehensive blog data structure in code

### Performance Improvements

#### Bundle Optimization
```javascript
// Strategic chunk splitting for medical content
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('react')) return 'vendor'
    if (id.includes('@radix-ui')) return 'ui'
    if (id.includes('framer-motion')) return 'animation'
    return 'vendor'
  }
}
```

#### Image Optimization
```jsx
// Multi-fallback image strategy for medical imagery
function OptimizedImage({ src, alt, className }) {
  return (
    <picture>
      <source srcSet={`${src}.webp`} type="image/webp" />
      <source srcSet={`${src}.avif`} type="image/avif" />
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
```

### Security Enhancements

#### 1. Input Validation
```javascript
// Comprehensive input validation for medical forms
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/),
  message: z.string().min(10).max(1000)
});
```

#### 2. Rate Limiting
```javascript
// Medical-grade rate limiting for patient data
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 contact form submissions
  message: 'Too many submissions, please try again later'
});
```

#### 3. CORS Configuration
```javascript
// Secure CORS for medical data transmission
const corsOptions = {
  origin: ['https://saraivavision.com.br', 'https://www.saraivavision.com.br'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

---

## Component System

### Design System Architecture

The component system follows **atomic design principles** with medical industry considerations:

#### 1. Atomic Components (`src/components/ui/`)
```jsx
// Base button with medical accessibility requirements
function Button({ variant = 'primary', size = 'md', children, ...props }) {
  return (
    <button
      className={cn(
        'font-medium rounded-lg transition-colors',
        'focus:ring-2 focus:ring-offset-2 focus:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
        },
        {
          'px-3 py-2 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        }
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### 2. Molecular Components
```jsx
// Medical card component for service information
function MedicalCard({ title, description, icon: Icon, onClick }) {
  return (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-center leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
```

#### 3. Organism Components
```jsx
// Services grid with medical specialization filtering
function ServicesGrid({ services, selectedCategory, onCategoryChange }) {
  const filteredServices = useMemo(() => {
    if (!selectedCategory) return services;
    return services.filter(service => service.category === selectedCategory);
  }, [services, selectedCategory]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nossos Serviços Especializados
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Oferecemos cuidados oftalmológicos abrangentes com tecnologia de ponta
          </p>
        </div>

        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onChange={onCategoryChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {filteredServices.map((service) => (
            <MedicalCard
              key={service.id}
              title={service.name}
              description={service.description}
              icon={service.icon}
              onClick={() => navigateToService(service.slug)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Medical Compliance Components

#### CFM Compliance System
```jsx
// Real-time CFM compliance validation
function CFMCompliance({ content, onComplianceChange }) {
  const { complianceScore, warnings, recommendations } = useCFMCompliance(content);

  useEffect(() => {
    onComplianceChange({
      isCompliant: complianceScore >= 80,
      score: complianceScore,
      issues: warnings
    });
  }, [complianceScore, warnings, onComplianceChange]);

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-blue-600" />
        Conformidade CFM
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Pontuação de Conformidade:</span>
          <Badge variant={complianceScore >= 80 ? 'success' : 'warning'}>
            {complianceScore}%
          </Badge>
        </div>

        {warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Avisos:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="font-medium text-blue-800 mb-2">Recomendações:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index}>• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Accessibility Features

#### Focus Management
```jsx
// Accessible modal with proper focus management
function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      modalRef.current?.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-xl font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div id="modal-description">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## API Integration Patterns

### 1. Static Blog Integration

The blog uses a simple static data structure for maximum performance and simplicity:

#### Blog Data Structure
```javascript
// src/data/blogPosts.js - Static blog posts
export const blogPosts = [
  {
    id: 1,
    slug: 'post-slug',
    title: 'Post Title',
    excerpt: 'Brief summary',
    content: 'Full HTML content',
    author: 'Dr. Philipe Saraiva Cruz',
    date: '2025-01-01',
    category: 'Category Name',
    tags: ['tag1', 'tag2'],
    image: '/images/blog/post-image.jpg',
    featured: true,
    seo: {
      metaTitle: 'SEO optimized title',
      metaDescription: 'SEO description',
      keywords: ['keyword1', 'keyword2']
    }
  }
  // ... more posts
];
```

#### Blog Service Implementation
```javascript
// src/lib/blogService.js - Blog data access
import { blogPosts } from '@/data/blogPosts.js';

export class BlogService {
  getAllPosts(filters = {}) {
    let posts = [...blogPosts];
    
    if (filters.category) {
      posts = posts.filter(post => post.category === filters.category);
    }
    
    if (filters.tag) {
      posts = posts.filter(post => post.tags.includes(filters.tag));
    }
    
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return posts;
  }
  
  getPostBySlug(slug) {
    return blogPosts.find(post => post.slug === slug);
  }
  
  getFeaturedPosts() {
    return blogPosts.filter(post => post.featured);
  }
  
  getCategories() {
    return [...new Set(blogPosts.map(post => post.category))];
  }
}
```

### 2. MySQL Integration Patterns

#### Type-Safe Database Operations
```typescript
// database.ts - Complete type definitions
export interface Database {
  contact_messages: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    subject: string | null;
    status: 'pending' | 'processed' | 'failed';
    created_at: string;
    updated_at: string;
  };
  appointments: {
    id: number;
    patient_name: string;
    patient_email: string;
    patient_phone: string | null;
    service_type: string;
    preferred_date: string;
    preferred_time: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    created_at: string;
  };
}

// MySQL database client
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'saraiva_vision',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Type-safe database operations
export async function getContactMessages(): Promise<Database['contact_messages'][]> {
  const [rows] = await db.query(
    'SELECT * FROM contact_messages ORDER BY created_at DESC'
  );
  return rows as Database['contact_messages'][];
}

export async function createContactMessage(
  data: Omit<Database['contact_messages'], 'id' | 'created_at' | 'updated_at'>
): Promise<Database['contact_messages']> {
  const [result] = await db.query(
    'INSERT INTO contact_messages (name, email, phone, message, subject, status) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, data.email, data.phone, data.message, data.subject, data.status || 'pending']
  );

  return {
    id: (result as any).insertId,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
```

#### Real-time Subscriptions
```javascript
// Real-time appointment updates using Redis Pub/Sub
function useAppointmentUpdates(appointmentId) {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch from API
    const fetchAppointment = async () => {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      const data = await response.json();

      if (data.success) setAppointment(data.data);
      setLoading(false);
    };

    fetchAppointment();

    // Redis Pub/Sub subscription
    const eventSource = new EventSource(`/api/appointments/${appointmentId}/updates`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'appointment_updated') {
        setAppointment(data.appointment);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [appointmentId]);

  return { appointment, loading };
}
```

### 3. External Service Integrations

#### Google Maps Integration
```javascript
// loadGoogleMaps.js - Optimized Google Maps loading
export class GoogleMapsLoader {
  constructor(apiKey, libraries = ['places']) {
    this.apiKey = apiKey;
    this.libraries = libraries;
    this.isLoaded = false;
    this.loadPromise = null;
  }

  async load() {
    if (this.isLoaded) return window.google;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        this.isLoaded = true;
        resolve(window.google);
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=${this.libraries.join(',')}&loading=async`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        resolve(window.google);
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  async initializeMap(containerId, options = {}) {
    const google = await this.load();

    const defaultOptions = {
      center: { lat: -19.7417, lng: -42.1369 }, // Caratinga, MG
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    };

    const map = new google.maps.Map(
      document.getElementById(containerId),
      { ...defaultOptions, ...options }
    );

    return { map, google };
  }
}
```

#### Instagram Feed Integration
```javascript
// instagramService.js - Secure Instagram integration
export class InstagramService {
  constructor() {
    this.baseURL = 'https://graph.instagram.com';
    this.accessToken = process.env.VITE_INSTAGRAM_ACCESS_TOKEN;
    this.rateLimiter = new Map();
  }

  async getFeedPosts(limit = 12) {
    try {
      // Rate limiting check
      if (this.isRateLimited()) {
        throw new Error('Rate limit exceeded');
      }

      const url = new URL(`${this.baseURL}/me/media`);
      url.searchParams.set('fields', 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp');
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('access_token', this.accessToken);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      const data = await response.json();

      // Update rate limiting
      this.updateRateLimit();

      return {
        posts: data.data.map(this.transformPost),
        error: null
      };
    } catch (error) {
      console.error('Instagram API error:', error);
      return {
        posts: [],
        error: error.message
      };
    }
  }

  transformPost(post) {
    return {
      id: post.id,
      type: post.media_type,
      url: post.media_url,
      thumbnail: post.thumbnail_url,
      permalink: post.permalink,
      caption: post.caption || '',
      timestamp: post.timestamp,
      alt: this.generateAltText(post.caption)
    };
  }

  generateAltText(caption) {
    if (!caption) return 'Instagram post da Saraiva Vision';

    // Extract meaningful text for alt attribute
    const cleanCaption = caption.replace(/#[\w]+/g, '').trim();
    const truncated = cleanCaption.substring(0, 100);

    return truncated || 'Instagram post da Saraiva Vision';
  }

  isRateLimited() {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    // Clean old entries
    for (const [timestamp] of this.rateLimiter) {
      if (timestamp < windowStart) {
        this.rateLimiter.delete(timestamp);
      }
    }

    // Check current rate (max 50 requests per minute)
    return this.rateLimiter.size >= 50;
  }

  updateRateLimit() {
    this.rateLimiter.set(Date.now(), true);
  }
}
```

---

## Development Workflows

### 1. Local Development Setup

#### Environment Configuration
```bash
# Required environment variables (client-side only)
DB_HOST=localhost
DB_USER=database_user
DB_PASSWORD=database_password
DB_NAME=saraiva_vision
REDIS_HOST=localhost
REDIS_PORT=6379
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_GOOGLE_PLACES_API_KEY=your_places_api_key
RESEND_API_KEY=your_resend_api_key

# Optional for development
VITE_INSTAGRAM_ACCESS_TOKEN=your_instagram_token
VITE_SPOTIFY_RSS_URL=your_podcast_rss_feed

# ⚠️ SECURITY CRITICAL: Server-side only (NEVER in frontend builds)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=saraiva_vision
DB_USER=api_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
```

**Security Note**: Database credentials and JWT secrets must be kept server-side only and never exposed to the browser. Store them in:
- Systemd environment files (`/etc/systemd/system/saraiva-api.service.d/override.conf`)
- Server-side `.env.server` files
- Server environment variables (not VITE_ prefixed)

**Never include database credentials or JWT secrets in frontend builds or commit to repository**. Use server-side functions or API routes for privileged operations.

#### Development Server Commands
```bash
# Start development server with hot reload
npm run dev                    # Port 3002 with proxy support

# Build and test commands
npm run build                  # Production build
npm run preview               # Preview production build
npm run test                  # Run test suite
npm run test:coverage         # Generate coverage report

# API validation
npm run validate:api          # Check API syntax and encoding
npm run lint                  # ESLint for code quality
```

### 2. Testing Strategy

#### Unit Testing with Vitest
```javascript
// Component testing example
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ContactForm from '../ContactForm.jsx';

describe('ContactForm', () => {
  const mockSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('submits form with valid data', async () => {
    render(<ContactForm onSubmit={mockSubmit} />);

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'João Silva' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'joao@email.com' }
    });
    fireEvent.change(screen.getByLabelText(/mensagem/i), {
      target: { value: 'Preciso agendar uma consulta' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@email.com',
        message: 'Preciso agendar uma consulta'
      });
    });
  });

  test('shows validation errors for invalid input', async () => {
    render(<ContactForm onSubmit={mockSubmit} />);

    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
    });

    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
```

#### Integration Testing
```javascript
// API integration testing
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import mysql from 'mysql2/promise';

describe('Contact API Integration', () => {
  let db;
  let testContactId;

  beforeEach(() => {
    db = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'test_user',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'saraiva_vision_test',
    });
  });

  afterEach(async () => {
    // Cleanup test data
    if (testContactId) {
      await db.execute(
        'DELETE FROM contact_messages WHERE id = ?',
        [testContactId]
      );
    }
  });

  test('creates contact message successfully', async () => {
    const contactData = {
      name: 'Test Patient',
      email: 'test@example.com',
      message: 'Test appointment request',
      subject: 'Consultation Request'
    };

    const [result] = await db.execute(
      'INSERT INTO contact_messages (name, email, message, subject, status) VALUES (?, ?, ?, ?, ?)',
      [contactData.name, contactData.email, contactData.message, contactData.subject, 'pending']
    );

    testContactId = (result as any).insertId;

    expect(testContactId).toBeDefined();
    expect(result).toBeDefined();
  });

  test('validates required fields', async () => {
    const invalidData = {
      name: '', // Empty name should fail
      email: 'invalid-email', // Invalid email should fail
      message: 'Test message'
    };

    // Test API validation instead of direct database insertion
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });

    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

#### E2E Testing with Playwright
```javascript
// E2E user workflow testing
import { test, expect } from '@playwright/test';

test.describe('Patient Journey', () => {
  test('complete appointment booking flow', async ({ page }) => {
    // Navigate to services page
    await page.goto('/servicos');
    await expect(page.getByRole('heading', { name: /nossos serviços/i })).toBeVisible();

    // Select a service
    await page.getByRole('button', { name: /consulta oftalmológica/i }).click();
    await expect(page).toHaveURL(/\/servicos\/consulta-oftalmologica/);

    // Book appointment
    await page.getByRole('button', { name: /agendar consulta/i }).click();

    // Fill appointment form
    await page.getByLabel(/nome completo/i).fill('Maria Silva');
    await page.getByLabel(/email/i).fill('maria@email.com');
    await page.getByLabel(/telefone/i).fill('(33) 99999-9999');

    // Select date and time
    await page.getByLabel(/data preferida/i).fill('2024-12-01');
    await page.getByLabel(/horário preferido/i).selectOption('09:00');

    // Submit appointment
    await page.getByRole('button', { name: /confirmar agendamento/i }).click();

    // Verify success message
    await expect(page.getByText(/agendamento realizado com sucesso/i)).toBeVisible();
  });

  test('accessibility compliance', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    const h1s = await page.getByRole('heading', { level: 1 }).count();
    expect(h1s).toBe(1); // Should have exactly one H1

    // Check for alt text on images
    const images = await page.getByRole('img').all();
    for (const image of images) {
      const alt = await image.getAttribute('alt');
      expect(alt).toBeTruthy(); // All images should have alt text
    }

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
```

### 3. Git Workflow

#### Branch Strategy
```bash
# Main branches
main                    # Production-ready code
development            # Integration branch
feature/*              # Feature development
hotfix/*               # Critical fixes
release/*              # Release preparation

# Current working branch
vps-deployment-optimization  # VPS migration and optimization
```

#### Commit Message Convention
```bash
# Format: type(scope): description

# Types:
feat: new feature implementation
fix: bug fix
docs: documentation changes
style: formatting, no code change
refactor: code restructuring
test: adding or updating tests
chore: maintenance tasks

# Examples:
feat(auth): implement patient login system
fix(api): resolve contact form submission issues
docs(deployment): add VPS setup instructions
refactor(components): optimize services grid performance
```

#### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test:run",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{md,json}": [
      "prettier --write"
    ]
  }
}
```

### 4. CI/CD Pipeline (Future Implementation)

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Run linting
        run: npm run lint

      - name: Build application
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build
        env:
          VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/saraiva-vision
            git pull origin main
            npm ci --production
            npm run build
            sudo cp -r dist/* /var/www/html/
            sudo systemctl reload nginx
            sudo systemctl restart saraiva-api
```

---

## Deployment Guide

### Native VPS Deployment Architecture

The Saraiva Vision project uses a **native VPS deployment** strategy for maximum performance and control, running all services directly on Ubuntu/Debian without containerization.

#### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS Ubuntu Server                        │
│                     31.97.129.78                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Nginx    │  │   Node.js   │  │   MySQL     │        │
│  │   (native)  │  │  (systemd)  │  │  (native)   │        │
│  │ Port 80/443 │  │  Port 3001  │  │  Port 3306  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Redis    │  │ Static Blog │  │ React SPA   │        │
│  │   (native)  │  │blogPosts.js │  │/var/www/html│        │
│  │ Port 6379   │  │  src/data/  │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 1. Initial VPS Setup

#### Server Requirements
- **OS**: Ubuntu 20.04+ or Debian 11+
- **RAM**: Minimum 2GB, recommended 4GB
- **Storage**: Minimum 20GB SSD
- **Network**: Public IP with ports 80, 443, 22 accessible

#### Automated Setup Script
```bash
# Download and run the VPS setup script
wget https://raw.githubusercontent.com/Sudo-psc/saraiva-vision-site/main/setup-vps-native.sh
chmod +x setup-vps-native.sh
sudo ./setup-vps-native.sh
```

#### Manual Setup Process
```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 22+ via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install and configure Nginx
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# 4. Install MySQL server
sudo apt install mysql-server -y
sudo mysql_secure_installation

# 5. Install Redis server
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# 6. Configure firewall
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 8. Install SSL certificate
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d saraivavision.com.br -d www.saraivavision.com.br
```

### 2. Nginx Configuration

#### Main Server Configuration
```nginx
# /etc/nginx/sites-available/saraiva-vision
server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'" always;

    # Document root for React SPA
    root /var/www/html;
    index index.html index.htm;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # React SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy to Node.js backend
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Systemd Service Configuration

#### Node.js API Service
```ini
# /etc/systemd/system/saraiva-api.service
[Unit]
Description=Saraiva Vision API Service
Documentation=https://github.com/Sudo-psc/saraiva-vision-site
After=network.target mysql.service redis.service
Wants=mysql.service redis.service

[Service]
Type=simple
User=saraiva-api
Group=saraiva-api
WorkingDirectory=/opt/saraiva-api
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=saraiva-api

# Environment variables
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=DB_HOST=localhost
Environment=DB_PORT=3306
Environment=DB_NAME=saraiva_vision
Environment=DB_USER=api_user
Environment=DB_PASSWORD=your_secure_password
Environment=JWT_SECRET=your_jwt_secret_key
Environment=REDIS_URL=redis://localhost:6379

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/saraiva-api

[Install]
WantedBy=multi-user.target
```

### 4. Deployment Process

#### Automated Deployment Script
```bash
#!/bin/bash
# deploy-vps-native.sh - Automated deployment to VPS

set -e

# Configuration
VPS_HOST="31.97.129.78"
VPS_USER="deploy"
APP_DIR="/var/www/html"
API_DIR="/opt/saraiva-api"
BACKUP_DIR="/var/backups/saraiva-vision"

echo "🚀 Starting deployment to VPS..."

# 1. Build the application locally
echo "📦 Building application..."
npm run build

# 2. Validate build output
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed - dist directory or index.html not found"
    exit 1
fi

echo "✅ Build completed successfully"

# 3. Create deployment package
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="saraiva-vision-${TIMESTAMP}.tar.gz"

echo "📦 Creating deployment package: ${PACKAGE_NAME}"
tar -czf "${PACKAGE_NAME}" -C dist .

# 4. Upload to VPS
echo "📤 Uploading to VPS..."
scp "${PACKAGE_NAME}" "${VPS_USER}@${VPS_HOST}:/tmp/"

# 5. Deploy on VPS
echo "🔧 Deploying on VPS..."
ssh "${VPS_USER}@${VPS_HOST}" << EOF
    set -e

    # Create backup of current deployment
    if [ -d "${APP_DIR}" ]; then
        echo "📋 Creating backup..."
        sudo tar -czf "${BACKUP_DIR}/backup-${TIMESTAMP}.tar.gz" -C "${APP_DIR}" .
    fi

    # Extract new version
    echo "📂 Extracting new version..."
    sudo mkdir -p "${APP_DIR}"
    sudo tar -xzf "/tmp/${PACKAGE_NAME}" -C "${APP_DIR}"

    # Set permissions
    sudo chown -R www-data:www-data "${APP_DIR}"
    sudo chmod -R 755 "${APP_DIR}"

    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    sudo nginx -t && sudo systemctl reload nginx

    # Restart API service if needed
    if systemctl is-active --quiet saraiva-api; then
        echo "🔄 Restarting API service..."
        sudo systemctl restart saraiva-api
    fi

    # Cleanup
    rm "/tmp/${PACKAGE_NAME}"

    echo "✅ Deployment completed successfully"
EOF

# 6. Verify deployment
echo "🔍 Verifying deployment..."
if curl -f "https://saraivavision.com.br" > /dev/null 2>&1; then
    echo "✅ Site is responding correctly"
else
    echo "❌ Site verification failed"
    exit 1
fi

# 7. Cleanup local files
rm "${PACKAGE_NAME}"

echo "🎉 Deployment completed successfully!"
echo "🌐 Site: https://saraivavision.com.br"
echo "📊 Monitor: sudo systemctl status nginx saraiva-api"
```

### 5. Health Monitoring

#### Service Health Check Script
```bash
#!/bin/bash
# monitor-services.sh - Comprehensive service monitoring

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Services to monitor
SERVICES=("nginx" "saraiva-api" "mysql" "redis" "php8.1-fpm")

echo "🔍 Saraiva Vision Health Check - $(date)"
echo "=================================================="

# Check each service
for service in "${SERVICES[@]}"; do
    if systemctl is-active --quiet "$service"; then
        echo -e "${GREEN}✅ $service: Running${NC}"
    else
        echo -e "${RED}❌ $service: Stopped${NC}"

        # Try to restart failed services
        echo "🔄 Attempting to restart $service..."
        sudo systemctl restart "$service"

        sleep 2

        if systemctl is-active --quiet "$service"; then
            echo -e "${GREEN}✅ $service: Restarted successfully${NC}"
        else
            echo -e "${RED}❌ $service: Failed to restart${NC}"
        fi
    fi
done

echo ""
echo "🌐 Website Health Check"
echo "=================================================="

# Check main site
if curl -f -s "https://saraivavision.com.br" > /dev/null; then
    echo -e "${GREEN}✅ Main site: Responding${NC}"
else
    echo -e "${RED}❌ Main site: Not responding${NC}"
fi

# Check API endpoint
if curl -f -s "https://saraivavision.com.br/api/health" > /dev/null; then
    echo -e "${GREEN}✅ API: Responding${NC}"
else
    echo -e "${RED}❌ API: Not responding${NC}"
fi

# Check SSL certificate
SSL_EXPIRY=$(openssl s_client -servername saraivavision.com.br -connect saraivavision.com.br:443 </dev/null 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
SSL_EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( (SSL_EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))

if [ $DAYS_UNTIL_EXPIRY -gt 30 ]; then
    echo -e "${GREEN}✅ SSL Certificate: Valid ($DAYS_UNTIL_EXPIRY days remaining)${NC}"
elif [ $DAYS_UNTIL_EXPIRY -gt 7 ]; then
    echo -e "${YELLOW}⚠️  SSL Certificate: Expiring soon ($DAYS_UNTIL_EXPIRY days remaining)${NC}"
else
    echo -e "${RED}❌ SSL Certificate: Expires very soon ($DAYS_UNTIL_EXPIRY days remaining)${NC}"
fi

echo ""
echo "💾 Resource Usage"
echo "=================================================="

# Memory usage
MEMORY_USAGE=$(free | awk 'FNR==2{printf "%.1f%%", $3/($3+$4)*100}')
echo "🧠 Memory Usage: $MEMORY_USAGE"

# Disk usage
DISK_USAGE=$(df -h / | awk 'FNR==2{print $5}')
echo "💿 Disk Usage: $DISK_USAGE"

# Load average
LOAD_AVERAGE=$(uptime | awk -F'load average:' '{ print $2 }')
echo "⚡ Load Average:$LOAD_AVERAGE"

echo ""
echo "📊 Recent Logs (last 5 entries)"
echo "=================================================="

# Recent errors in Nginx
echo "🌐 Nginx errors:"
sudo tail -n 5 /var/log/nginx/error.log | sed 's/^/  /'

echo ""
echo "🔧 API service logs:"
sudo journalctl -u saraiva-api -n 5 --no-pager | sed 's/^/  /'

echo ""
echo "Health check completed at $(date)"
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Build and Development Issues

##### ReferenceError: require is not defined
**Problem**: ES module compatibility issue in Node.js scripts
```bash
ReferenceError: require is not defined in ES module scope
```

**Solution**: Convert CommonJS to ES modules
```javascript
// ❌ Wrong (CommonJS)
const { workboxVitePlugin } = require('./src/utils/workbox-vite-plugin')

// ✅ Correct (ES modules)
import { workboxVitePlugin } from './src/utils/workbox-vite-plugin.js'
```

**Prevention**:
- Ensure `"type": "module"` in package.json
- Use `.js` extensions for all imports
- Convert all require() statements to import statements

##### Vite Build Failures
**Problem**: Build fails with module resolution errors
```bash
npm run build
# Error: Failed to resolve import
```

**Solution**:
```bash
# 1. Clear cache and dependencies
rm -rf node_modules package-lock.json
npm install

# 2. Check for missing dependencies
npm audit fix

# 3. Validate environment variables
cp .env.example .env
# Fill in required environment variables

# 4. Test build locally
npm run build
npm run preview
```

##### TypeScript Errors
**Problem**: Type checking failures during build
```bash
error TS2307: Cannot find module '@/components/Example'
```

**Solution**: Check tsconfig.json path mapping
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 2. API and Database Issues

##### MySQL Connection Problems
**Problem**: Database queries failing or returning errors
```javascript
// Error: Connection refused or authentication failed
```

**Solution**:
```bash
# 1. Verify MySQL service status
sudo systemctl status mysql

# 3. Check database credentials
echo $DB_USER
echo $DB_PASSWORD

# 4. Test MySQL connection
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SHOW DATABASES;"

# 5. Check database permissions and table existence
```

##### Contact Form Submission Failures
**Problem**: Form submissions not being processed
```javascript
// Error: Failed to submit contact form
```

**Diagnostic Steps**:
```bash
# 1. Check API endpoint
curl -X POST https://saraivavision.com.br/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'

# 2. Check server logs
sudo journalctl -u saraiva-api -f

# 3. Check MySQL logs
sudo tail -f /var/log/mysql/error.log

# 5. Verify ReCAPTCHA configuration
echo $VITE_RECAPTCHA_SITE_KEY
```

#### 3. VPS Deployment Issues

##### Nginx Configuration Problems
**Problem**: Site not loading or 502 Bad Gateway errors
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

**Common Solutions**:
```bash
# 1. Fix configuration syntax
sudo nginx -t
sudo systemctl reload nginx

# 2. Check upstream services
sudo systemctl status saraiva-api
curl http://localhost:3001/api/health

# 3. Verify file permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# 4. Check SSL certificate
sudo certbot certificates
sudo certbot renew --dry-run
```

##### Service Startup Failures
**Problem**: Node.js API service fails to start
```bash
sudo systemctl status saraiva-api
# Status: failed
```

**Solution**:
```bash
# 1. Check service logs
sudo journalctl -u saraiva-api -n 50

# 2. Test manual startup
cd /opt/saraiva-api
sudo -u saraiva-api node server.js

# 3. Check environment variables
sudo systemctl show saraiva-api -p Environment

# 4. Verify file permissions
sudo chown -R saraiva-api:saraiva-api /opt/saraiva-api
```

##### Database Connection Issues
**Problem**: Cannot connect to MySQL or Redis
```bash
# Test MySQL connection
mysql -u root -p -e "SHOW DATABASES;"

# Test Redis connection
redis-cli ping
# Should return: PONG

# Check service status
sudo systemctl status mysql redis
```

#### 4. Performance Issues

##### Slow Page Load Times
**Problem**: Pages loading slowly or timing out

**Diagnostic Tools**:
```bash
# 1. Check Core Web Vitals
npm run test:performance

# 2. Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# 3. Monitor server resources
htop
iostat -x 1
```

**Optimization Steps**:
```javascript
// 1. Implement lazy loading
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'));

// 2. Optimize images
function OptimizedImage({ src, alt }) {
  return (
    <picture>
      <source srcSet={`${src}.webp`} type="image/webp" />
      <img src={src} alt={alt} loading="lazy" />
    </picture>
  );
}

// 3. Add service worker caching
// Enable in vite.config.js for production
```

##### Memory Leaks
**Problem**: Server memory usage continuously increasing
```bash
# Monitor memory usage
free -h
ps aux --sort=-%mem | head

# Check for memory leaks in Node.js
node --inspect server.js
# Open Chrome DevTools -> Memory tab
```

**Solutions**:
```javascript
// 1. Proper cleanup in useEffect
useEffect(() => {
  const subscription = redisClient
    .subscribe('realtime-updates', (message) => {
      // Handle real-time updates from Redis Pub/Sub
    });

  return () => {
    subscription.unsubscribe(); // Important cleanup
  };
}, []);

// 2. Implement proper error boundaries
// 3. Use React.memo for expensive components
// 4. Implement proper cache eviction policies
```

### Error Recovery Procedures

#### 1. Site Down Recovery
```bash
#!/bin/bash
# emergency-recovery.sh

echo "🚨 Emergency Recovery Procedure"

# 1. Check all services
sudo systemctl status nginx saraiva-api mysql redis php8.1-fpm

# 2. Restart failed services
sudo systemctl restart nginx saraiva-api

# 3. Check logs for errors
sudo journalctl -u saraiva-api --since "5 minutes ago"

# 4. Verify site is responding
curl -f https://saraivavision.com.br || echo "Site still down"

# 5. Restore from backup if needed
# sudo tar -xzf /var/backups/saraiva-vision/latest.tar.gz -C /var/www/html/

echo "Recovery completed"
```

#### 2. Database Recovery
```bash
# 1. For MySQL issues
# - Check MySQL service status: sudo systemctl status mysql
# - Verify database credentials and connectivity
# - Check MySQL error logs: sudo tail -f /var/log/mysql/error.log

# 2. For application issues
sudo systemctl restart saraiva-api
sudo journalctl -u saraiva-api -n 50

# 3. For Redis issues
sudo systemctl restart redis
redis-cli flushall  # Only if cache corruption suspected
```

#### 3. SSL Certificate Issues
```bash
# 1. Check certificate status
sudo certbot certificates

# 2. Renew certificates
sudo certbot renew

# 3. Force renewal if needed
sudo certbot renew --force-renewal

# 4. Restart Nginx
sudo systemctl restart nginx
```

---

## Maintenance & Monitoring

### Regular Maintenance Tasks

#### Daily Tasks (Automated)
```bash
#!/bin/bash
# daily-maintenance.sh

# 1. Health check all services
./monitor-services.sh

# 2. Check disk space
DISK_USAGE=$(df -h / | awk 'FNR==2{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️ Disk usage high: ${DISK_USAGE}%"
    # Clean up old logs
    sudo find /var/log -name "*.log" -mtime +30 -delete
    # Clean up old backups
    sudo find /var/backups/saraiva-vision -name "*.tar.gz" -mtime +7 -delete
fi

# 3. Update system packages (security only)
sudo apt update
sudo apt upgrade -y --only-upgrade -o APT::Get::Fix-Missing=true

# 4. Backup current deployment
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
sudo tar -czf "/var/backups/saraiva-vision/daily-${TIMESTAMP}.tar.gz" -C /var/www/html .

# 5. Check SSL certificate expiry
DAYS_UNTIL_EXPIRY=$(openssl s_client -servername saraivavision.com.br -connect saraivavision.com.br:443 </dev/null 2>/dev/null | openssl x509 -noout -checkend $((30*86400)) && echo "OK" || echo "EXPIRING")
if [ "$DAYS_UNTIL_EXPIRY" = "EXPIRING" ]; then
    echo "⚠️ SSL certificate expiring soon"
    sudo certbot renew
fi
```

#### Weekly Tasks
```bash
#!/bin/bash
# weekly-maintenance.sh

# 1. Update Node.js dependencies (minor versions only)
cd /opt/saraiva-api
npm audit fix
npm update

# 2. Optimize database
mysql -u root -p <<EOF
OPTIMIZE TABLE contact_messages;
OPTIMIZE TABLE appointments;
OPTIMIZE TABLE message_outbox;
EOF

# 3. Clear Redis cache
redis-cli FLUSHDB

# 4. Performance analysis
npm run test:performance > /var/log/saraiva-vision/weekly-performance.log
```

#### Monthly Tasks
```bash
#!/bin/bash
# monthly-maintenance.sh

# 1. Security updates
sudo apt update && sudo apt upgrade -y

# 2. Restart all services for fresh start
sudo systemctl restart nginx saraiva-api mysql redis php8.1-fpm

# 3. Full backup
sudo tar -czf "/var/backups/saraiva-vision/monthly-$(date +%Y%m).tar.gz" \
    /var/www/html \
    /opt/saraiva-api \
    /etc/nginx/sites-available/saraiva-vision \
    /etc/systemd/system/saraiva-api.service

# 4. Security scan
sudo apt install lynis
sudo lynis audit system

# 5. Performance monitoring report
echo "Monthly Performance Report - $(date)" > /var/log/saraiva-vision/monthly-report.txt
echo "=================================" >> /var/log/saraiva-vision/monthly-report.txt
free -h >> /var/log/saraiva-vision/monthly-report.txt
df -h >> /var/log/saraiva-vision/monthly-report.txt
uptime >> /var/log/saraiva-vision/monthly-report.txt
```

### Monitoring Setup

#### Prometheus & Grafana Integration (Optional)
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"

volumes:
  grafana-storage:
```

#### Log Monitoring with Logrotate
```bash
# /etc/logrotate.d/saraiva-vision
/var/log/saraiva-vision/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
        systemctl restart saraiva-api > /dev/null 2>&1 || true
    endscript
}
```

#### Custom Monitoring Dashboard
```javascript
// src/components/admin/MonitoringDashboard.jsx
function MonitoringDashboard() {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/monitoring/metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading metrics...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Server Health"
        value={metrics.serverHealth?.status || 'Unknown'}
        color={metrics.serverHealth?.status === 'healthy' ? 'green' : 'red'}
      />
      <MetricCard
        title="Response Time"
        value={`${metrics.responseTime || 0}ms`}
        color={metrics.responseTime < 1000 ? 'green' : 'yellow'}
      />
      <MetricCard
        title="Memory Usage"
        value={`${metrics.memoryUsage || 0}%`}
        color={metrics.memoryUsage < 80 ? 'green' : 'red'}
      />
      <MetricCard
        title="Error Rate"
        value={`${metrics.errorRate || 0}%`}
        color={metrics.errorRate < 1 ? 'green' : 'red'}
      />
    </div>
  );
}
```

### Performance Monitoring

#### Core Web Vitals Tracking
```javascript
// src/utils/webVitals.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function setupWebVitalsMonitoring() {
  const sendToAnalytics = (metric) => {
    // Send to your analytics service
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric)
    }).catch(console.error);
  };

  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

// Initialize in main.jsx
setupWebVitalsMonitoring();
```

#### Error Tracking Integration
```javascript
// src/utils/errorTracking.js
export function initErrorTracking() {
  // Global error handler
  window.addEventListener('error', (event) => {
    logError({
      type: 'javascript',
      message: event.error.message,
      stack: event.error.stack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError({
      type: 'promise',
      message: event.reason.message || 'Unhandled promise rejection',
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  });
}

async function logError(errorData) {
  try {
    await fetch('/api/monitoring/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    });
  } catch (e) {
    console.error('Failed to log error:', e);
  }
}
```

### Security Monitoring

#### Security Headers Validation
```bash
#!/bin/bash
# security-check.sh

echo "🔒 Security Headers Check"
echo "========================="

# Check security headers
curl -I https://saraivavision.com.br | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection\|strict-transport-security"

# Check SSL configuration
echo ""
echo "SSL Configuration:"
nmap --script ssl-enum-ciphers -p 443 saraivavision.com.br

# Check for common vulnerabilities
echo ""
echo "Vulnerability Scan:"
nmap -sV --script vuln saraivavision.com.br
```

#### Access Log Analysis
```bash
# Analyze Nginx access logs for suspicious activity
sudo tail -f /var/log/nginx/access.log | grep -E "(404|403|500)" --color=always

# Check for brute force attempts
sudo grep "POST /api/auth" /var/log/nginx/access.log | \
    awk '{print $1}' | sort | uniq -c | sort -nr | head -10

# Monitor for SQL injection attempts
sudo grep -i "union\|select\|drop\|insert" /var/log/nginx/access.log
```

---

## Conclusion

This comprehensive documentation provides a complete guide to the Saraiva Vision medical website project, covering:

### Key Achievements
- ✅ **Complete VPS Migration**: Successfully migrated from Vercel to native VPS deployment
- ✅ **Static Blog Architecture**: Simplified blog with static data for maximum performance
- ✅ **Performance Optimization**: Achieved sub-3 second load times with optimized builds
- ✅ **Medical Compliance**: CFM and LGPD compliance systems integrated
- ✅ **Production Stability**: Robust error handling and monitoring systems

### Architecture Highlights
- **Modern React 18**: Concurrent features, TypeScript, and optimized builds
- **Unified Database**: MySQL for application data with Redis for caching and real-time
- **Static Blog**: Blog posts in version-controlled source code (no CMS overhead)
- **Native VPS**: Direct system deployment for maximum performance control
- **Medical-Grade Security**: Comprehensive input validation and data protection
- **Accessibility First**: WCAG 2.1 AA compliance throughout

### Development Excellence
- **Type Safety**: Comprehensive TypeScript implementation
- **Testing Strategy**: Unit, integration, and E2E testing coverage
- **Performance Monitoring**: Real-time metrics and Core Web Vitals tracking
- **Error Resilience**: Comprehensive error boundaries and recovery systems

### Operational Readiness
- **Automated Deployment**: Single-command deployment with health validation
- **Monitoring Systems**: Comprehensive service and performance monitoring
- **Backup Strategies**: Automated daily, weekly, and monthly backups
- **Security Monitoring**: SSL, vulnerability scanning, and access log analysis

This project demonstrates modern web development best practices applied to the medical industry, ensuring both technical excellence and regulatory compliance while delivering optimal user experience for healthcare providers and patients.

For questions or additional support, refer to the troubleshooting section or contact the development team through the project repository.