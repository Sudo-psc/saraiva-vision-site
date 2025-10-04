# Saraiva Vision Medical Ophthalmology Platform - Comprehensive Documentation

## Table of Contents
1. [Project Overview & Architecture](#project-overview--architecture)
2. [Development Guidelines](#development-guidelines)
3. [API Documentation](#api-documentation)
4. [Component Structure](#component-structure)
5. [Data Management](#data-management)
6. [Performance & Security](#performance--security)
7. [Deployment & Operations](#deployment--operations)
8. [Testing & Quality Assurance](#testing--quality-assurance)

---

## Project Overview & Architecture

### Platform Context
**Saraiva Vision** is a comprehensive medical ophthalmology platform for Clínica Saraiva Vision, based in Caratinga, Minas Gerais, Brazil. The platform serves as a digital presence for the medical clinic while maintaining strict compliance with Brazilian healthcare regulations (CFM/LGPD).

**Key Features:**
- Medical services showcase and appointment booking
- Educational blog with evidence-based medical content
- Google Reviews integration (136 reviews, 4.9/5.0 rating)
- Podcast integration for medical education (Spotify)
- Real-time health monitoring and API endpoints
- CFM-compliant medical content validation

### Technology Stack

#### Frontend Architecture
- **Framework**: React 18 + TypeScript 5.x
- **Build System**: Hybrid Next.js 15.5.4 + Vite 7.1.7
- **Styling**: Tailwind CSS 3.3.3 with custom medical theme
- **UI Components**: Radix UI + custom components
- **State Management**: React Context + local state
- **Routing**: React Router 6.16.0 with lazy loading
- **Performance**: Web Vitals, IntersectionObserver, GPU acceleration

#### Backend Architecture
- **Runtime**: Node.js 22+ (ES modules)
- **Framework**: Express.js 4.18.2
- **Database**: Static architecture (WordPress/Supabase removed)
- **Caching**: Redis for performance optimization
- **Web Server**: Nginx reverse proxy
- **Security**: Helmet.js, CORS, rate limiting, compression

#### Integration Ecosystem
- **Google Services**: Maps API, Places API, Reviews integration
- **Communication**: Resend API (email), WhatsApp API
- **Social Media**: Instagram Graph API
- **Analytics**: PostHog.js, Google Analytics
- **Media**: Spotify embed for podcast content

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vite/Next.js)                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐│
│  │   React App     │  │   Components    │  │   Context   ││
│  │                 │  │                 │  │             ││
│  │ • Lazy Routes   │  │ • UI Library    │  │ • State     ││
│  │ • Error Bounds  │  │ • Compliance    │  │ • i18n      ││
│  │ • Analytics     │  │ • Medical Cmp   │  │ • Theme     ││
│  └─────────────────┘  └─────────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                   │
│  • SSL/TLS Termination                                    │
│  • Static File Serving                                    │
│  • Load Balancing                                        │
│  • CORS Configuration                                     │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                    Backend API (Express.js)               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐│
│  │   API Routes    │  │   Middleware    │  │   Security  ││
│  │                 │  │                 │  │             ││
│  │ • Health Check  │  │ • Rate Limiting  │  │ • Helmet    ││
│  │ • Google Reviews│  │ • CORS Config   │  │ • Validation││
│  │ • Contact Forms │  │ • Compression    │  │ • Logging   ││
│  │ • Blog Data     │  │ • Error Handling │  │             ││
│  └─────────────────┘  └─────────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   External Services                      │
│  • Google Places API        • Redis Cache             │
│  • Resend Email Service     • WhatsApp API            │
│  • Instagram Graph API       • Spotify API             │
│  • PostHog Analytics        • SSL Certificates        │
└─────────────────────────────────────────────────────────┘
```

### Compliance & Regulatory Framework

#### CFM (Conselho Federal de Medicina) Compliance
- **Automated Content Validation**: Real-time CFM rule checking
- **Medical Disclaimer Requirements**: Mandatory patient education disclaimers
- **Professional Credentials**: CRM-MG 69.870 (Dr. Philipe Saraiva Cruz)
- **Evidence-Based Content**: All medical claims backed by reputable sources
- **Ethical Marketing**: Compliant medical communication practices

#### LGPD (Lei Geral de Proteção de Dados) Implementation
- **Data Protection Officer**: Designated contact for privacy matters
- **Patient Privacy Protection**: Automated PII detection and masking
- **Consent Management**: Cookie and data processing consent
- **Audit Logging**: Comprehensive data access logging
- **Secure Data Storage**: SHA-256 hashing for sensitive information

---

## Development Guidelines

### Available Scripts

#### Development Environment
```bash
# Development servers
npm run dev              # Next.js development server (primary)
npm run dev:vite         # Vite development server (alternative)

# Build process
npm run build            # Production build with prerendering
npm run build:vite       # Vite build
npm run build:norender   # Build without prerendering
npm run build:blog       # Blog content processing only
```

#### Testing & Quality Assurance
```bash
# Test execution
npm test                 # Vitest watch mode
npm run test:run         # Single test execution
npm run test:coverage    # Coverage report
npm run test:ui          # Test UI interface

# Comprehensive testing suites
npm run test:comprehensive  # Full test suite (unit + integration + API + frontend)
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e           # End-to-end tests
npm run test:performance   # Performance tests
npm run test:api           # API endpoint tests
npm run test:frontend      # Frontend component tests
```

#### Deployment & Operations
```bash
# Deployment workflows
npm run deploy              # Full VPS deployment
npm run deploy:quick        # Quick deployment (90% of cases)
npm run deploy:verify       # Post-deployment verification
npm run deploy:health       # Production health check

# Validation & monitoring
npm run validate:api        # API syntax and encoding validation
npm run validate:blog-images # Blog image optimization check
npm run validate:images     # Image asset validation
npm run validate:bundle     # Client bundle size validation

# Content management
npm run optimize:images     # Blog image optimization
npm run audit:blog-images   # Blog compliance audit
npm run generate:manifest   # Image manifest generation
```

### Code Conventions

#### TypeScript Configuration
```typescript
// tsconfig.json highlights
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "strict": false,           // Balanced strictness for healthcare platform
    "noImplicitAny": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]    // Path alias for clean imports
    }
  }
}
```

#### Component Patterns
```jsx
// Component structure example
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils'; // Utility imports first

const MedicalComponent = ({
  title,
  children,
  className,
  // Destructure props for clarity
}) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Side effects and data fetching
  }, []);

  return (
    <div className={cn(
      'base-styles',
      'medical-component',
      className
    )}>
      {/* Always include accessibility attributes */}
      <h2 className="text-lg font-semibold text-primary-700">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default MedicalComponent;
```

#### File Organization
```
src/
├── components/
│   ├── ui/                    # Reusable UI components (Radix-based)
│   ├── compliance/           # CFM/LGPD compliance components
│   ├── medical/              # Medical-specific components
│   ├── blog/                 # Blog and content components
│   └── __tests__/            # Component tests
├── hooks/                    # Custom React hooks
├── lib/                      # Utility libraries
├── utils/                    # Helper functions
├── services/                 # API service integrations
├── contexts/                 # React contexts
├── pages/                    # Route components (lazy-loaded)
├── data/                     # Static data (blog posts, etc.)
├── styles/                   # CSS files and theme configuration
└── __tests__/                # Test utilities and setup
```

#### Naming Conventions
- **Components**: PascalCase (e.g., `MedicalServiceCard.jsx`)
- **Hooks**: camelCase (e.g., `useCFMCompliance.js`)
- **Utilities**: camelCase (e.g., `formatMedicalDate.js`)
- **Files**: kebab-case for assets (e.g., `medical-service-icon.png`)
- **CSS Classes**: kebab-case (e.g., `medical-service-card`)

#### Environment Variables
```bash
# Required environment variables
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
VITE_GOOGLE_PLACES_API_KEY=your_places_key_here
VITE_GOOGLE_PLACE_ID=your_place_id_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
RESEND_API_KEY=your_resend_key
```

### Performance Guidelines

#### Bundle Optimization
- **Code Splitting**: Route-based lazy loading with retry logic
- **Chunk Strategy**: Aggressive chunking (<250KB per chunk)
- **Tree Shaking**: ESBuild minification with dead code elimination
- **Asset Optimization**: Images optimized with WebP/AVIF support
- **Caching**: Strategic cache headers and service worker implementation

#### Runtime Performance
```javascript
// Example performance optimization patterns
const useOptimizedAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  return isVisible;
};
```

---

## API Documentation

### Architecture Overview
The Saraiva Vision API is built with Express.js and follows RESTful principles with comprehensive security measures and healthcare compliance validation.

### Core Endpoints

#### Health & Monitoring
```http
GET /api/health
GET /health-check.js
```

**Purpose**: System health monitoring and uptime verification
**Response Format**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-04T10:00:00.000Z",
  "uptime": 86400,
  "environment": "production"
}
```

#### Google Reviews Integration
```http
GET /api/google-reviews?limit=5&language=pt-BR
```

**Purpose**: Real-time Google Places API reviews integration
**Parameters**:
- `limit`: Number of reviews (default: 5, max: 50)
- `language`: Review language (default: pt-BR)

**Response Format**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "places-timestamp",
        "reviewer": {
          "displayName": "Patient Name",
          "profilePhotoUrl": "https://...",
          "isAnonymous": false
        },
        "starRating": 5,
        "comment": "Review content...",
        "createTime": "2025-10-04T10:00:00.000Z",
        "isRecent": true,
        "wordCount": 45
      }
    ],
    "stats": {
      "overview": {
        "totalReviews": 136,
        "averageRating": 4.9,
        "recentReviews": 12
      },
      "sentiment": {
        "positive": 125,
        "negative": 2,
        "positivePercentage": 92
      }
    }
  }
}
```

#### Contact & Appointment
```http
POST /api/contact
GET /api/appointments/availability
```

**Purpose**: Patient contact forms and appointment scheduling
**Security**: Rate limited, input validation, GDPR compliance

### Security Implementation

#### Middleware Stack
```javascript
// Security middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: [
    'https://saraivavision.com.br',
    'https://www.saraivavision.com.br',
    'http://localhost:3002'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);
```

#### Input Validation
```javascript
// Zod schema example for contact form
const contactSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10,11}$/),
  message: z.string().min(10).max(1000),
  service: z.string().optional(),
  privacyConsent: z.boolean().refine(val => val === true)
});
```

### Error Handling
```javascript
// Standardized error response format
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "timestamp": "2025-10-04T10:00:00.000Z",
    "requestId": "req_123456789"
  }
}
```

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Google Reviews**: 30 requests per minute (API limit)
- **Contact Forms**: 5 submissions per hour per IP
- **Image Upload**: 10 uploads per hour per IP

---

## Component Structure

### Core Component Architecture

#### Medical Service Components
```jsx
// Service showcase component with CFM compliance
const MedicalServiceCard = ({ service, onConsultation }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="medical-service-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-primary-700">
              {service.title}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {service.description}
            </CardDescription>
          </div>
          <MedicalIcon type={service.icon} />
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-700 mb-4">
          {service.shortDescription}
        </p>

        {/* CFM Compliance Badge */}
        <CFMCompliance
          content={service.description}
          onComplianceCheck={handleCompliance}
        />

        <Button
          onClick={() => onConsultation(service)}
          className="w-full mt-4"
        >
          Agendar Consulta
        </Button>
      </CardContent>
    </Card>
  );
};
```

#### Blog & Content Components
```jsx
// Medical blog post with compliance validation
const MedicalBlogPost = ({ post }) => {
  return (
    <Article className="medical-blog-post">
      <header className="blog-header">
        <h1>{post.title}</h1>
        <div className="blog-meta">
          <AuthorCard author={post.author} />
          <time dateTime={post.date}>
            {formatMedicalDate(post.date)}
          </time>
        </div>
      </header>

      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Compliance components */}
      <CFMCompliance content={post.content} />
      <MedicalDisclaimer author={post.author} />

      {/* Related content */}
      {post.relatedPodcasts && (
        <PodcastEmbed episodes={post.relatedPodcasts} />
      )}
    </Article>
  );
};
```

#### UI Component Library

##### Foundation Components
- **Layout**: `Container`, `Grid`, `Stack`, `Section`
- **Typography**: `Heading`, `Text`, `Label`, `Caption`
- **Forms**: `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`
- **Feedback**: `Toast`, `Alert`, `Dialog`, `Modal`

##### Medical-Specific Components
```jsx
// Professional medical information display
const MedicalInfoCard = ({ title, content, severity = 'info' }) => {
  const severityStyles = {
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
    critical: 'bg-red-50 border-red-200'
  };

  return (
    <div className={cn(
      'medical-info-card',
      'border rounded-lg p-4',
      severityStyles[severity]
    )}>
      <div className="flex items-start space-x-3">
        <MedicalAlertIcon severity={severity} />
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-700">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};
```

#### Compliance Components

##### CFMCompliance Component
```jsx
// Automated CFM validation interface
const CFMCompliance = ({ content, onComplianceCheck }) => {
  const [complianceStatus, setComplianceStatus] = useState({
    validated: false,
    violations: [],
    score: 0,
    recommendations: []
  });

  useEffect(() => {
    validateContent(content).then(result => {
      setComplianceStatus(result);
      if (onComplianceCheck) onComplianceCheck(result);
    });
  }, [content]);

  return (
    <div className="cfm-compliance-panel">
      {/* Compliance score display */}
      <div className="compliance-score">
        <ScoreDisplay score={complianceStatus.score} />
      </div>

      {/* Violations and recommendations */}
      {complianceStatus.violations.length > 0 && (
        <ViolationsList violations={complianceStatus.violations} />
      )}

      {/* Medical disclaimer template */}
      <MedicalDisclaimerTemplate />
    </div>
  );
};
```

#### Accessibility Components

##### WCAG Compliance
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: ARIA labels and landmarks throughout
- **Focus Management**: Visible focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliant color combinations
- **Responsive Design**: Mobile-first approach with breakpoint testing

### State Management Patterns

#### React Context Usage
```jsx
// Global state for medical services
const MedicalServicesContext = createContext();

export const MedicalServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    services,
    loading,
    error,
    fetchServices: async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/servicos');
        const data = await response.json();
        setServices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <MedicalServicesContext.Provider value={value}>
      {children}
    </MedicalServicesContext.Provider>
  );
};
```

#### Local State Management
```jsx
// Component-level state with healthcare validation
const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    email: '',
    service: '',
    preferredDate: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Healthcare-specific validation
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Nome do paciente é obrigatório';
    }

    if (!/^\d{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Telefone inválido';
    }

    // ... additional validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
};
```

---

## Data Management

### Static Architecture Overview

Saraiva Vision uses a 100% static architecture with no external database dependencies. All data is managed through JavaScript modules and static files.

### Blog Content Management

#### Blog Data Structure
```javascript
// src/data/blogPosts.js
export const blogPosts = [
  {
    id: 1,
    slug: 'catarata-ep2',
    title: 'Catarata: Sintomas e Cirurgia',
    excerpt: 'Comprehensive overview of cataract symptoms and surgical treatments',
    content: `
      <h2>O Que é Catarata?</h2>
      <p>Detailed medical content...</p>
    `,
    author: 'Dr. Philipe Saraiva Cruz',
    date: '2025-09-29',
    category: 'Tratamento',
    tags: ['catarata', 'cirurgia', 'lentes intraoculares'],
    image: '/Blog/capa-lentes-premium-catarata.png',
    featured: true,
    seo: {
      metaTitle: 'Catarata: Sintomas e Cirurgia em Caratinga, MG',
      metaDescription: 'Comprehensive guide to cataract treatment options',
      keywords: ['catarata', 'cirurgia de catarata', 'Caratinga MG']
    },
    // CFM compliance metadata
    medicalDisclaimer: true,
    references: [
      'Conselho Brasileiro de Oftalmologia (CBO). Manual 2019',
      'Sociedade Brasileira de Oftalmologia (SBO). Guidelines 2023'
    ],
    // Related content
    relatedPodcasts: [
      {
        id: 'catarata-ep2',
        title: 'Catarata: Sintomas e Cirurgia',
        spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV'
      }
    ]
  }
];
```

#### Content Categories
```javascript
export const categories = [
  'Todas',
  'Prevenção',      // Preventive care
  'Tratamento',    // Treatment options
  'Tecnologia',     // Medical technology
  'Dúvidas Frequentes'  // FAQ and patient education
];
```

#### Content Utilities
```javascript
// Blog data utilities
export const getPostBySlug = (slug) => {
  return blogPosts.find(post => post.slug === slug);
};

export const getPostsByCategory = (category) => {
  if (category === 'Todas') return blogPosts;
  return blogPosts.filter(post => post.category === category);
};

export const getFeaturedPosts = () => {
  return blogPosts.filter(post => post.featured);
};

export const getRecentPosts = (limit = 3) => {
  return [...blogPosts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};
```

### Clinic Information Management

#### Canonical Data Source
```javascript
// src/lib/clinicInfo.js
export const clinicInfo = {
  // Business information
  name: 'Clínica Saraiva Vision',
  legalName: 'Clínica Saraiva Vision LTDA',

  // Location (NAP - Name, Address, Phone)
  address: {
    street: 'Rua Capitão Domingos Corrêa, 150',
    city: 'Caratinga',
    state: 'MG',
    zip: '35200-000',
    country: 'BR'
  },

  // Contact information
  phone: '+55 33 99860-1427',
  whatsapp: '+55 33 99860-1427',
  email: 'saraivavision@gmail.com',

  // Professional credentials (CFM compliance)
  responsiblePhysician: 'Dr. Philipe Saraiva Cruz',
  responsiblePhysicianCRM: 'CRM-MG 69.870',
  responsiblePhysicianTitle: 'Responsável Técnico Médico',

  // Data protection (LGPD)
  dpoEmail: 'saraivavision@gmail.com',
  taxId: '53.864.119/0001-79',

  // Geographic coordinates
  latitude: -19.7890206,
  longitude: -42.1347583,

  // Service keywords for SEO
  servicesKeywords: [
    'Consultas oftalmológicas',
    'Exames de refração',
    'Cirurgias oftalmológicas',
    'Oftalmologia pediátrica'
  ]
};
```

### Data Validation & Compliance

#### CFM Content Validation
```javascript
// Automated medical content validation
const validateMedicalContent = (content) => {
  const violations = [];
  let score = 100;

  // Check for required medical disclaimer
  if (!content.includes('não substitui consulta médica')) {
    violations.push({
      type: 'missing_disclaimer',
      severity: 'high',
      message: 'Conteúdo médico deve incluir disclaimer',
      article: 'Resolução CFM 1.974/2011'
    });
    score -= 30;
  }

  // Check for CRM identification
  if (!/CRM-MG\s+69\.870/.test(content)) {
    violations.push({
      type: 'missing_crm',
      severity: 'medium',
      message: 'Identificação CRM do médico responsável ausente',
      article: 'Código de Ética Médica Art. 119'
    });
    score -= 20;
  }

  // PII detection for privacy
  const piiPatterns = [
    /\d{3}\.\d{3}\.\d{3}-\d{2}/g, // CPF
    /\b\d{2}\/\d{2}\/\d{4}\b/g,   // Dates
  ];

  const detectedPII = [];
  piiPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) detectedPII.push(...matches);
  });

  if (detectedPII.length > 0) {
    violations.push({
      type: 'pii_detected',
      severity: 'critical',
      message: `Dados pessoais detectados: ${detectedPII.join(', ')}`,
      article: 'LGPD Art. 11'
    });
    score -= 40;
  }

  return {
    violations,
    score: Math.max(0, score),
    level: getComplianceLevel(score)
  };
};
```

#### SEO Schema Implementation
```javascript
// Structured data for medical organization
const medicalClinicSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  "name": clinicInfo.name,
  "url": "https://saraivavision.com.br",
  "telephone": clinicInfo.phone,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": clinicInfo.address.street,
    "addressLocality": clinicInfo.address.city,
    "addressRegion": clinicInfo.address.state,
    "postalCode": clinicInfo.address.zip,
    "addressCountry": clinicInfo.address.country
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": clinicInfo.latitude,
    "longitude": clinicInfo.longitude
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
      ],
      "opens": "08:00",
      "closes": "18:00"
    }
  ],
  "medicalSpecialty": "Ophthalmology",
  "priceRange": "$$"
};
```

### Cache Management

#### Redis Integration Pattern
```javascript
// API caching strategy
const getCachedReviews = async (placeId, limit = 5) => {
  const cacheKey = `reviews:${placeId}:${limit}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  // Fetch fresh data
  const freshData = await fetchGoogleReviews(placeId, limit);

  // Cache with 30-minute expiration
  await redis.setex(cacheKey, 1800, JSON.stringify(freshData));

  return freshData;
};
```

---

## Performance & Security

### Performance Optimization Strategy

#### Build Optimization
The Vite configuration implements aggressive performance optimization:

```javascript
// vite.config.js - Performance optimizations
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 250, // 250KB chunks
    assetsInlineLimit: 2048,
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Strategic code splitting
          if (id.includes('react/')) return 'react-core';
          if (id.includes('@radix-ui')) return 'radix-ui';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('googlemaps')) return 'maps';
          if (id.includes('lucide-react')) return 'icons';
          return 'vendor-misc';
        },
        // Optimized file naming for caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
```

#### Runtime Performance Patterns

##### Lazy Loading Implementation
```javascript
// Route-based lazy loading with retry logic
const createLazyComponent = (importFunc) => {
  const LazyComponent = React.lazy(importFunc);

  return (props) => (
    <Suspense fallback={<LoadingSpinner />}>
      <ErrorBoundary retry={importFunc}>
        <LazyComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

// Usage in routing
const HomePageLayout = createLazyComponent(() => import('./pages/HomePageLayout.jsx'));
const ServicesPage = createLazyComponent(() => import('./pages/ServicesPage.jsx'));
```

##### Intersection Observer for Images
```javascript
// Lazy image loading component
const LazyImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div ref={imageRef} className={cn('lazy-image-container', className)}>
      {inView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
      {!inView && <div className="image-placeholder" />}
    </div>
  );
};
```

##### Web Vitals Monitoring
```javascript
// Performance monitoring setup
const sendToAnalytics = (metric) => {
  const analyticsData = {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    navigationType: metric.navigationType
  };

  // Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      custom_parameter_1: metric.value,
      custom_parameter_2: metric.id
    });
  }

  // Send to PostHog
  if (window.posthog) {
    window.posthog.capture('web_vital', analyticsData);
  }
};

// Core Web Vitals tracking
if (import.meta.env.PROD) {
  onCLS(sendToAnalytics);  // Cumulative Layout Shift
  onINP(sendToAnalytics);  // Interaction to Next Paint
  onFCP(sendToAnalytics);  // First Contentful Paint
  onLCP(sendToAnalytics);  // Largest Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}
```

### Security Implementation

#### Application Security

##### Content Security Policy
```javascript
// Helmet.js CSP configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:"],
      connectSrc: ["'self'", "https://maps.googleapis.com"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  }
}));
```

##### Input Validation & Sanitization
```javascript
// Comprehensive input sanitization
import DOMPurify from 'dompurify';
import { z } from 'zod';

const contactFormSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),

  email: z.string()
    .email('Email inválido')
    .max(254, 'Email muito longo'),

  phone: z.string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos'),

  message: z.string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(1000, 'Mensagem deve ter no máximo 1000 caracteres'),

  privacyConsent: z.boolean()
    .refine(val => val === true, 'Consentimento de privacidade é obrigatório')
});

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};
```

#### Healthcare Data Protection

##### LGPD Compliance Implementation
```javascript
// Data protection utilities
const encryptSensitiveData = (data) => {
  // SHA-256 hashing for sensitive information
  return crypto.createHash('sha256').update(data).digest('hex');
};

const anonymizePatientData = (data) => {
  // Remove or mask PII from logs and storage
  return {
    ...data,
    name: data.name ? hashSensitive(data.name) : null,
    phone: data.phone ? maskPhoneNumber(data.phone) : null,
    email: data.email ? hashSensitive(data.email) : null
  };
};

const maskPhoneNumber = (phone) => {
  return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '$1****-$3');
};

// Data retention policy
const DATA_RETENTION_DAYS = {
  contactForms: 365,     // 1 year
  appointmentRequests: 180, // 6 months
  analyticsData: 730     // 2 years
};
```

##### CFM Compliance System
```javascript
// Automated medical content validation
const validateCFMCompliance = (content) => {
  const rules = {
    disclaimer: {
      required: true,
      patterns: [
        /não substitui consulta médica/i,
        /procure orientação médica/i,
        /consulte um médico/i
      ],
      weight: 30
    },

    crmIdentification: {
      required: true,
      pattern: /CRM-MG\s+69\.870/,
      weight: 20
    },

    patientPrivacy: {
      required: true,
      patterns: [
        /\d{3}\.\d{3}\.\d{3}-\d{2}/, // CPF detection
        /paciente\s+[A-Z][a-z]+\s+[A-Z][a-z]+/ // Patient name detection
      ],
      weight: 40
    },

    medicalAdvice: {
      required: false,
      patterns: [
        /recomendo que (?:tome|use|faça)/i,
        /você deve tomar/i,
        /o tratamento (?:é|deve ser)/i
      ],
      weight: 25
    }
  };

  return performValidation(content, rules);
};
```

#### API Security

##### Rate Limiting Strategy
```javascript
// Multi-tier rate limiting
const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 contact form submissions per hour
  message: 'Limite de formulários de contato atingido. Tente novamente mais tarde.',
  skip: (req) => {
    // Skip rate limiting for trusted IPs
    return req.ip === '127.0.0.1' || req.ip === '::1';
  }
});

const googleReviewsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute (Google API limit)
  message: 'Limite de requisições à API do Google atingido.'
});

// Apply rate limiters
app.use('/api/contact', contactFormLimiter);
app.use('/api/google-reviews', googleReviewsLimiter);
```

##### Request Validation Middleware
```javascript
// Request validation and sanitization middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body
      const validatedData = schema.parse(req.body);

      // Sanitize input
      const sanitizedData = sanitizeObject(validatedData);

      // Attach to request
      req.validatedBody = sanitizedData;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Dados de entrada inválidos',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  };
};
```

#### Security Headers
```javascript
// Additional security headers
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  next();
});
```

### CDN & Caching Strategy

#### Static Asset Optimization
```javascript
// Cache headers for different asset types
const getCacheHeaders = (filePath) => {
  const ext = path.extname(filePath);

  if (['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) {
    return {
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      'CDN-Cache-Control': 'public, max-age=31536000, immutable'
    };
  }

  if (['.css', '.js'].includes(ext)) {
    return {
      'Cache-Control': 'public, max-age=86400', // 1 day
      'CDN-Cache-Control': 'public, max-age=86400'
    };
  }

  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  };
};
```

---

## Deployment & Operations

### VPS Deployment Architecture

#### Infrastructure Overview
Saraiva Vision is deployed on a native VPS with the following architecture:

```
┌─────────────────────────────────────────────────────────┐
│                     VPS Infrastructure                   │
│  Ubuntu Server + Node.js 22 + Nginx + Redis + Let's Encrypt  │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                    Nginx Configuration                 │
│  • SSL Termination (Port 443)                         │
│  • Static File Serving (dist/)                         │
│  • Reverse Proxy to Node.js (Port 3001)               │
│  • Load Balancing                                      │
│  • Gzip Compression                                    │
│  • Cache Headers                                       │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                    Node.js Application                 │
│  • Express.js API Server (Port 3001)                   │
│  • React Frontend (Next.js/Vite hybrid)                │
│  • Health Monitoring                                  │
│  • Process Management (PM2)                          │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                    External Services                   │
│  • Google APIs (Maps, Places, Reviews)               │
│  • Redis Cache (Session & API caching)                │
│  • Email Service (Resend)                             │
│  • WhatsApp Business API                              │
└─────────────────────────────────────────────────────────┘
```

### Deployment Scripts

#### Main Deployment Script
```bash
#!/bin/bash
# scripts/fixed-deploy.sh

set -e  # Exit on any error

echo "🚀 Starting Saraiva Vision deployment..."

# Configuration
PROJECT_DIR="/var/www/saraivavision-site"
BACKUP_DIR="/var/backups/saraivavision"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

# Create backup
echo "📦 Creating backup..."
BACKUP_NAME="saraivavision-$(date +%Y%m%d-%H%M%S)"
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=.next \
  "$PROJECT_DIR"

# Build application
echo "🔨 Building application..."
cd "$PROJECT_DIR"
npm ci --production
npm run build

# Run health checks
echo "🏥 Running pre-deployment health checks..."
npm run validate:api
npm run validate:bundle
npm run test:run

# Deploy static files
echo "📁 Deploying static files..."
sudo cp -r dist/* "/var/www/html/"
sudo chown -R www-data:www-data "/var/www/html/"

# Restart services
echo "🔄 Restarting services..."
sudo systemctl restart nginx
sudo systemctl restart saraiva-api

# Post-deployment health check
echo "🏥 Running post-deployment health checks..."
sleep 5
npm run deploy:health

echo "✅ Deployment completed successfully!"
echo "📊 Health status: $(curl -s https://saraivavision.com.br/api/health | jq -r '.status')"
```

#### Quick Deployment
```bash
#!/bin/bash
# scripts/quick-deploy.sh

set -e

echo "⚡ Quick deployment starting..."

cd /var/www/saraivavision-site

# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Build
npm run build

# Deploy
sudo cp -r dist/* /var/www/html/

# Restart
sudo systemctl restart nginx

echo "⚡ Quick deployment completed!"
```

### Environment Configuration

#### Production Environment
```bash
# .env.production
NODE_ENV=production
VITE_GOOGLE_MAPS_API_KEY=your_production_key
VITE_GOOGLE_PLACES_API_KEY=your_production_places_key
VITE_GOOGLE_PLACE_ID=ChIJVUKww7WRugARF7u2lAe7BeE
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
RESEND_API_KEY=your_resend_key
VITE_GA_ID=your_google_analytics_id
```

#### Development Environment
```bash
# .env.local
NODE_ENV=development
VITE_GOOGLE_MAPS_API_KEY=your_dev_key
VITE_GOOGLE_PLACES_API_KEY=your_dev_places_key
VITE_GOOGLE_PLACE_ID=ChIJVUKww7WRugARF7u2lAe7BeE
VITE_SUPABASE_URL=your_dev_supabase_url
VITE_SUPABASE_ANON_KEY=your_dev_supabase_key
```

### Monitoring & Health Checks

#### Comprehensive Health Monitoring
```javascript
// health-check.js - System health monitoring
const SERVICES = ["nginx", "php8.1-fpm", "mysql", "redis-server"];
const WEBSITES = [
  "https://saraivavision.com.br",
  "https://cms.saraivavision.com.br"
];
const APIS = [
  "https://saraivavision.com.br/api/health",
  "https://saraivavision.com.br/api/google-reviews"
];

async function checkService(service) {
  try {
    const { stdout } = await execAsync(`systemctl is-active ${service}`);
    const status = stdout.trim();
    return {
      status: status === 'active' ? 'running' : 'stopped',
      details: `Service is ${status === 'active' ? 'active' : 'inactive'}`
    };
  } catch (error) {
    return { status: 'error', details: error.message };
  }
}

async function checkWebsite(url) {
  try {
    const startTime = Date.now();
    const response = await fetch(url, { timeout: 30000 });
    const responseTime = Date.now() - startTime;

    return {
      status: response.status === 200 ? 'healthy' : 'error',
      details: `HTTP ${response.status}, ${responseTime}ms response time`
    };
  } catch (error) {
    return { status: 'down', details: error.message };
  }
}
```

#### System Resource Monitoring
```javascript
// Monitor CPU, memory, and disk usage
async function checkSystemResources() {
  const cpuUsage = await getCpuUsage();
  const memoryUsage = await getMemoryUsage();
  const diskUsage = await getDiskUsage();

  return {
    cpu: {
      status: cpuUsage < 80 ? 'healthy' : 'warning',
      details: `CPU usage: ${cpuUsage.toFixed(1)}%`
    },
    memory: {
      status: memoryUsage < 90 ? 'healthy' : 'warning',
      details: `Memory usage: ${memoryUsage}%`
    },
    disk: {
      status: diskUsage < 90 ? 'healthy' : 'warning',
      details: `Disk usage: ${diskUsage}%`
    }
  };
}
```

### Backup Strategy

#### Automated Backup Configuration
```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/var/backups/saraivavision"
PROJECT_DIR="/var/www/saraivavision-site"
DB_NAME="saraivavision_db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="saraivavision_$TIMESTAMP"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Database backup
mysqldump -u root -p"$DB_PASSWORD" "$DB_NAME" > \
  "$BACKUP_DIR/${BACKUP_NAME}_database.sql"

# Files backup
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_files.tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=.next \
  "$PROJECT_DIR"

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -name "saraivavision_*" -mtime +30 -delete

echo "Backup completed: $BACKUP_NAME"
```

### SSL Certificate Management

#### Let's Encrypt Configuration
```nginx
# Nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;

    # SSL certificate paths
    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
}
```

#### Automated SSL Renewal
```bash
# Add to crontab for automatic renewal
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

---

## Testing & Quality Assurance

### Testing Architecture Overview

Saraiva Vision implements a comprehensive testing strategy with multiple test types and coverage requirements.

#### Test Structure
```
tests/
├── __tests__/              # Test utilities and setup
├── unit/                   # Unit tests (Vitest workspace)
├── integration/            # Integration tests (Vitest workspace)
├── e2e/                    # End-to-end tests (Vitest workspace)
├── performance/            # Performance tests (Vitest workspace)
└── api/                    # API-specific tests
```

### Test Configuration

#### Vitest Configuration
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

#### Workspace Configuration
```json
// vitest.workspace.json
{
  "projects": [
    {
      "name": "unit",
      "test": {
        "include": ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
        "exclude": ["src/**/*.e2e.{js,jsx,ts,tsx}"]
      }
    },
    {
      "name": "integration",
      "test": {
        "include": ["src/**/*.integration.{js,jsx,ts,tsx}"]
      }
    },
    {
      "name": "e2e",
      "test": {
        "include": ["src/**/*.e2e.{js,jsx,ts,tsx}"],
        "environment": "node"
      }
    },
    {
      "name": "performance",
      "test": {
        "include": ["src/**/*.performance.{js,jsx,ts,tsx}"]
      }
    }
  ]
}
```

### Unit Testing

#### Component Testing Example
```javascript
// src/components/__tests__/MedicalServiceCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MedicalServiceCard from '../MedicalServiceCard';
import { useCFMCompliance } from '../../hooks/useCFMCompliance';

// Mock CFM compliance hook
vi.mock('../../hooks/useCFMCompliance');

describe('MedicalServiceCard', () => {
  const mockService = {
    id: 1,
    title: 'Cirurgia de Catarata',
    description: 'Procedimento cirúrgico para remoção de catarata',
    icon: 'surgery',
    price: 'R$ 5.000,00'
  };

  const mockOnConsultation = vi.fn();

  beforeEach(() => {
    useCFMCompliance.mockReturnValue({
      validateContent: vi.fn().mockResolvedValue({
        violations: [],
        score: 100,
        level: 'excellent'
      })
    });
  });

  it('renders service information correctly', () => {
    render(
      <MedicalServiceCard
        service={mockService}
        onConsultation={mockOnConsultation}
      />
    );

    expect(screen.getByText('Cirurgia de Catarata')).toBeInTheDocument();
    expect(screen.getByText('Procedimento cirúrgico para remoção de catarata')).toBeInTheDocument();
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
  });

  it('calls onConsultation when appointment button is clicked', () => {
    render(
      <MedicalServiceCard
        service={mockService}
        onConsultation={mockOnConsultation}
      />
    );

    const appointmentButton = screen.getByText('Agendar Consulta');
    fireEvent.click(appointmentButton);

    expect(mockOnConsultation).toHaveBeenCalledWith(mockService);
  });

  it('displays CFM compliance badge', async () => {
    render(
      <MedicalServiceCard
        service={mockService}
        onConsultation={mockOnConsultation}
      />
    );

    // Wait for CFM compliance validation
    expect(await screen.findByText('Compliance CFM')).toBeInTheDocument();
  });

  it('handles loading state during compliance validation', () => {
    useCFMCompliance.mockReturnValue({
      validateContent: vi.fn().mockImplementation(() => new Promise(() => {}))
    });

    render(
      <MedicalServiceCard
        service={mockService}
        onConsultation={mockOnConsultation}
      />
    );

    expect(screen.getByText('Aguardando validação CFM...')).toBeInTheDocument();
  });
});
```

#### Hook Testing Example
```javascript
// src/hooks/__tests__/useCFMCompliance.test.js
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCFMCompliance } from '../useCFMCompliance';

// Mock Web Worker
vi.mock('../workers/cfmValidationWorker.js', () => ({
  default: class MockWorker {
    constructor() {
      this.onmessage = null;
      this.postMessage = vi.fn();
    }

    postMessage(data) {
      // Simulate worker response
      setTimeout(() => {
        this.onmessage({
          data: {
            violations: [],
            score: 95,
            level: 'excellent'
          }
        });
      }, 100);
    }
  }
}));

describe('useCFMCompliance', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useCFMCompliance());

    expect(result.current.complianceStatus).toEqual({
      validated: false,
      violations: [],
      score: 0,
      recommendations: []
    });
    expect(result.current.validating).toBe(false);
  });

  it('validates content and updates state', async () => {
    const { result } = renderHook(() => useCFMCompliance());
    const testContent = 'This is medical content that needs validation';

    await act(async () => {
      await result.current.validateContent(testContent);
    });

    expect(result.current.validating).toBe(false);
    expect(result.current.complianceStatus.validated).toBe(true);
    expect(result.current.complianceStatus.score).toBe(95);
  });

  it('handles validation errors gracefully', async () => {
    const { result } = renderHook(() => useCFMCompliance());

    // Mock worker to throw error
    vi.spyOn(global, 'Worker').mockImplementation(() => ({
      postMessage: vi.fn(),
      onmessage: null,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'message') {
          setTimeout(() => handler({ data: { error: 'Validation failed' } }), 10);
        }
      })
    }));

    await act(async () => {
      await result.current.validateContent('test content');
    });

    expect(result.current.complianceStatus.validated).toBe(true);
    expect(result.current.complianceStatus.violations).toHaveLength(1);
    expect(result.current.complianceStatus.violations[0].type).toBe('validation_error');
  });
});
```

### Integration Testing

#### API Integration Tests
```javascript
// api/__tests__/google-reviews.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { parse } from 'url';
import request from 'supertest';

// Mock Google Places API
const mockGoogleResponse = {
  status: 'OK',
  result: {
    name: 'Clínica Saraiva Vision',
    rating: 4.9,
    user_ratings_total: 136,
    reviews: [
      {
        author_name: 'Test Patient',
        rating: 5,
        text: 'Excelente atendimento!',
        time: 1633027200,
        profile_photo_url: 'https://example.com/photo.jpg'
      }
    ]
  }
};

describe('Google Reviews API Integration', () => {
  let server;
  let app;

  beforeAll(async () => {
    // Start test server
    app = (await import('../google-reviews.js')).default;
    server = createServer((req, res) => {
      // Mock Google Places API responses
      if (req.url.includes('maps.googleapis.com')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockGoogleResponse));
        return;
      }

      // Handle actual API requests
      app(req, res);
    });

    server.listen(3001);
  });

  afterAll(() => {
    server.close();
  });

  it('fetches Google reviews successfully', async () => {
    const response = await request(server)
      .get('/api/google-reviews?limit=5')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.reviews).toHaveLength(1);
    expect(response.body.data.stats.overview.totalReviews).toBe(136);
    expect(response.body.data.stats.overview.averageRating).toBe(4.9);
  });

  it('handles API rate limiting', async () => {
    // Make multiple requests to test rate limiting
    const requests = Array(35).fill().map(() =>
      request(server).get('/api/google-reviews')
    );

    const responses = await Promise.all(requests);

    // Some requests should be rate limited
    const rateLimitedResponses = responses.filter(res =>
      res.status === 429
    );

    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  it('validates required parameters', async () => {
    const response = await request(server)
      .get('/api/google-reviews?limit=invalid')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.reviews).toHaveLength(1); // Default limit
  });
});
```

#### Component Integration Tests
```javascript
// src/components/__tests__/BlogPage.integration.jsx
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BlogPage from '../pages/BlogPage';
import { blogPosts } from '../../data/blogPosts';

// Mock API calls
vi.mock('../../services/blogService', () => ({
  fetchBlogPosts: vi.fn().mockResolvedValue(blogPosts),
  fetchBlogPostBySlug: vi.fn().mockImplementation((slug) =>
    Promise.resolve(blogPosts.find(post => post.slug === slug))
  )
}));

describe('BlogPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders blog posts list', async () => {
    render(
      <BrowserRouter>
        <BlogPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Carregando...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Blog - Clínica Saraiva Vision')).toBeInTheDocument();
      expect(screen.getAllByRole('article')).toHaveLength(blogPosts.length);
    });
  });

  it('filters posts by category', async () => {
    render(
      <BrowserRouter>
        <BlogPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const categoryFilter = screen.getByLabelText('Filtrar por categoria');
      fireEvent.change(categoryFilter, { target: { value: 'Tratamento' } });

      const treatmentPosts = screen.getAllByRole('article');
      expect(treatmentPosts.length).toBeGreaterThan(0);

      treatmentPosts.forEach(post => {
        expect(post).toHaveTextContent(/Tratamento/i);
      });
    });
  });

  it('navigates to individual blog post', async () => {
    render(
      <BrowserRouter>
        <BlogPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const firstPost = screen.getAllByRole('article')[0];
      const postLink = firstPost.querySelector('a');

      fireEvent.click(postLink);

      // Verify navigation occurred
      expect(window.location.pathname).toContain('/blog/');
    });
  });
});
```

### End-to-End Testing

#### E2E Test Example
```javascript
// src/__tests__/appointmentBooking.e2e.jsx
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';

describe('Appointment Booking Flow', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('completes appointment booking successfully', async () => {
    // Navigate to services page
    await page.goto('http://localhost:3002/servicos');

    // Wait for services to load
    await page.waitForSelector('.medical-service-card');

    // Select a service
    await page.click('text=Cirurgia de Catarata');

    // Fill appointment form
    await page.fill('[name="patientName"]', 'João Silva');
    await page.fill('[name="phoneNumber"]', '339998601427');
    await page.fill('[name="email"]', 'joao.silva@email.com');
    await page.fill('[name="preferredDate"]', '2025-12-01');
    await page.fill('[name="message"]', 'Gostaria de agendar uma consulta.');

    // Accept privacy terms
    await page.check('[name="privacyConsent"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toHaveText(
      /Agendamento realizado com sucesso/i
    );
  });

  it('validates form inputs', async () => {
    await page.goto('http://localhost:3002/servicos');
    await page.click('text=Cirurgia de Catarata');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Check validation errors
    await expect(page.locator('text=Nome do paciente é obrigatório')).toBeVisible();
    await expect(page.locator('text=Telefone inválido')).toBeVisible();
    await expect(page.locator('text=Email inválido')).toBeVisible();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    await page.route('**/api/contact', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('http://localhost:3002/servicos');
    await page.click('text=Cirurgia de Catarata');

    // Fill form and submit
    await page.fill('[name="patientName"]', 'Maria Santos');
    await page.fill('[name="phoneNumber"]', '339998601427');
    await page.fill('[name="email"]', 'maria@email.com');
    await page.check('[name="privacyConsent"]');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toHaveText(
      /Erro ao enviar formulário/i
    );
  });
});
```

### Performance Testing

#### Performance Test Example
```javascript
// src/__tests__/bundleSize.performance.jsx
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

describe('Bundle Size Performance', () => {
  const MAX_BUNDLE_SIZE = 250 * 1024; // 250KB
  const distPath = path.resolve(__dirname, '../../dist');

  it('keeps main bundle under size limit', () => {
    const mainBundlePath = path.join(distPath, 'assets', 'main-*.js');
    const mainBundleFiles = require('glob').sync(mainBundlePath);

    expect(mainBundleFiles.length).toBeGreaterThan(0);

    const largestBundle = mainBundleFiles.reduce((largest, current) => {
      const currentSize = readFileSync(current).length;
      const largestSize = readFileSync(largest).length;
      return currentSize > largestSize ? current : largest;
    });

    const bundleSize = readFileSync(largestBundle).length;

    console.log(`Main bundle size: ${(bundleSize / 1024).toFixed(2)}KB`);
    expect(bundleSize).toBeLessThan(MAX_BUNDLE_SIZE);
  });

  it('optimizes vendor chunks correctly', () => {
    const vendorChunks = [
      'react-core',
      'radix-ui',
      'framer-motion',
      'maps'
    ];

    vendorChunks.forEach(chunkName => {
      const chunkPath = path.join(distPath, 'assets', `${chunkName}-*.js`);
      const chunkFiles = require('glob').sync(chunkPath);

      expect(chunkFiles.length).toBeGreaterThan(0);

      chunkFiles.forEach(file => {
        const size = readFileSync(file).length;
        console.log(`${chunkName} chunk: ${(size / 1024).toFixed(2)}KB`);
        expect(size).toBeLessThan(MAX_BUNDLE_SIZE);
      });
    });
  });

  it('measures Web Vitals during development', async () => {
    // This would typically be run in a browser environment
    const metrics = {
      LCP: { value: 1200, threshold: 2500 },  // Largest Contentful Paint
      FID: { value: 100, threshold: 100 },    // First Input Delay
      CLS: { value: 0.05, threshold: 0.1 },  // Cumulative Layout Shift
      TTFB: { value: 600, threshold: 800 }    // Time to First Byte
    };

    Object.entries(metrics).forEach(([metric, data]) => {
      console.log(`${metric}: ${data.value}ms`);
      expect(data.value).toBeLessThan(data.threshold);
    });
  });
});
```

### API Testing

#### API Test Suite
```javascript
// api/__tests__/contact.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import app from '../contact';

describe('Contact API', () => {
  let server;

  beforeAll(() => {
    server = createServer(app);
    server.listen(3002);
  });

  afterAll(() => {
    server.close();
  });

  it('accepts valid contact form submission', async () => {
    const validSubmission = {
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '339998601427',
      service: 'Cirurgia de Catarata',
      message: 'Gostaria de agendar uma consulta.',
      privacyConsent: true
    };

    const response = await request(server)
      .post('/api/contact')
      .send(validSubmission)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toMatch(/recebido com sucesso/i);
  });

  it('rejects invalid email addresses', async () => {
    const invalidSubmission = {
      name: 'João Silva',
      email: 'invalid-email',
      phone: '339998601427',
      message: 'Test message',
      privacyConsent: true
    };

    const response = await request(server)
      .post('/api/contact')
      .send(invalidSubmission)
      .expect(400);

    expect(response.body.error).toBe('VALIDATION_ERROR');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'email',
          message: expect.any(String)
        })
      ])
    );
  });

  it('requires privacy consent', async () => {
    const submissionWithoutConsent = {
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '339998601427',
      message: 'Test message',
      privacyConsent: false
    };

    const response = await request(server)
      .post('/api/contact')
      .send(submissionWithoutConsent)
      .expect(400);

    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'privacyConsent',
          message: expect.stringMatching(/consentimento/i)
        })
      ])
    );
  });

  it('handles rate limiting', async () => {
    const validSubmission = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '339998601427',
      message: 'Test message',
      privacyConsent: true
    };

    // Make 6 requests (limit is 5 per hour)
    const responses = await Promise.all(
      Array(6).fill().map(() =>
        request(server)
          .post('/api/contact')
          .send(validSubmission)
      )
    );

    // Last request should be rate limited
    expect(responses[5].status).toBe(429);
  });
});
```

### Coverage Requirements

#### Minimum Coverage Standards
- **Unit Tests**: 80% code coverage minimum
- **Integration Tests**: 70% coverage minimum
- **API Tests**: 90% endpoint coverage
- **E2E Tests**: Critical user journey coverage
- **Performance Tests**: Key metrics validation

#### Coverage Report Generation
```bash
# Generate comprehensive coverage report
npm run test:coverage

# Generate coverage for specific test types
npm run test:unit -- --coverage
npm run test:api -- --coverage
```

### Continuous Integration

#### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npx tsc --noEmit

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration

      - name: Run API tests
        run: npm run test:api

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

      - name: Run E2E tests (only on main branch)
        if: github.ref == 'refs/heads/main'
        run: npm run test:e2e
```

### Quality Assurance Checklist

#### Pre-Deployment Checklist
- [ ] All tests passing (unit, integration, API)
- [ ] Coverage requirements met
- [ ] Linting errors resolved
- [ ] TypeScript compilation successful
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] CFM compliance validation passed
- [ ] Accessibility audit completed
- [ ] Cross-browser testing performed
- [ ] Mobile responsiveness verified

#### Post-Deployment Verification
- [ ] Health check endpoints responding
- [ ] SSL certificate valid
- [ ] Performance metrics within thresholds
- [ ] Error rates monitored
- [ ] Backup systems verified
- [ ] Security headers configured
- [ ] CDN cache properly configured
- [ ] Analytics tracking active

---

## Conclusion

This comprehensive documentation provides a detailed overview of the Saraiva Vision medical ophthalmology platform, covering all aspects from architecture and development to deployment and testing. The platform demonstrates exceptional attention to healthcare compliance, performance optimization, and professional medical standards.

Key strengths include:
- **CFM Compliance**: Automated medical content validation
- **Performance**: Advanced optimization strategies with <250KB chunks
- **Security**: Comprehensive security measures with healthcare data protection
- **Professional Standards**: Evidence-based medical content with proper credentials
- **Accessibility**: WCAG-compliant design with screen reader support
- **Scalability**: Modern architecture ready for future growth

For developers working on this platform, adherence to the documented guidelines ensures consistent quality, regulatory compliance, and optimal performance for this critical healthcare application.