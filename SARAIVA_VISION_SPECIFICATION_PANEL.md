# Saraiva Vision Medical Website - Comprehensive Specification Panel

*Last Updated: September 23, 2025*
*Project Version: 2.0.1*
*Current Branch: deploy-vps-docker*

## 🏗️ Technical Architecture Specifications

### Hybrid Architecture Overview
```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   Vercel CDN    │    │    VPS Backend       │    │   External APIs     │
│                 │    │  (31.97.129.78)      │    │                     │
│ • React 18.2.0  │◄──►│ • Nginx Proxy        │◄──►│ • WhatsApp Business │
│ • Vite 7.1.3    │    │ • Node.js 22.x API   │    │ • Google Maps       │
│ • Next.js 15.5.4│    │ • WordPress CMS      │    │ • Spotify Web API   │
│ • TypeScript 5.x│    │ • MySQL Database     │    │ • Instagram Graph   │
│                 │    │ • Redis Cache        │    │ • Resend Email      │
└─────────────────┘    └──────────────────────┘    └─────────────────────┘
```

### Frontend Technology Stack
- **Framework**: React 18.2.0 with Next.js 15.5.4 (App Router)
- **Build Tool**: Vite 7.1.3 (Hybrid configuration for Vercel deployment)
- **Language**: TypeScript 5.9.2 with strict mode
- **Styling**: Tailwind CSS 3.3.3 with Radix UI components
- **Animation**: Framer Motion 10.16.4 for micro-interactions
- **State Management**: React Context + Supabase real-time subscriptions
- **Routing**: React Router DOM 6.16.0 with lazy loading

### Backend Infrastructure
- **Runtime**: Node.js 22.x (ES Modules)
- **Deployment**: Containerized Docker services on Linux VPS
- **Proxy**: Nginx with HTTPS termination and load balancing
- **Database**: MySQL with Supabase integration
- **Caching**: Redis for session and API response caching
- **CMS**: WordPress Headless for content management

### Database & APIs
- **Primary Database**: Supabase (PostgreSQL) with real-time features
- **CMS Database**: MySQL for WordPress backend
- **Authentication**: Supabase Auth with role-based access control
- **Email Service**: Resend API for transactional emails
- **Communication**: WhatsApp Business API integration
- **Location**: Google Maps API for clinic location services
- **Media**: Instagram Graph API for social feed integration

## 📊 Project Status & Recent Progress

### ✅ Recently Completed Features
- **Security Enhancements**
  - Command injection vulnerability fixes in environment variable handling
  - API key security audit and placeholder implementation
  - CORS configuration optimization for cross-origin requests

- **Build & Deployment Optimization**
  - Successful Next.js app router migration from legacy structure
  - Vite configuration optimization with intelligent code splitting
  - Bundle size optimization: 479KB total JavaScript bundle
  - Image optimization with Next.js localPatterns configuration

- **Infrastructure Improvements**
  - Node.js 22.x upgrade completion across all environments
  - Vercel deployment scripts automation and testing
  - Container orchestration with Docker Compose
  - Nginx proxy configuration for multi-service routing

- **Performance Enhancements**
  - Manual chunk splitting for vendor libraries (React, UI components, animations)
  - Asset optimization with immutable caching strategies
  - Service Worker implementation for development environment
  - Source map generation for production debugging

### 🔄 In Progress (Branch: 008-agendamento-online-via)
- **Online Appointment Booking System**
  - Multi-step booking flow implementation
  - Calendar integration with availability management
  - Patient appointment confirmation workflow
  - Backend API endpoints for appointment management

### 🏆 Quality Achievements
- **Performance Metrics**
  - Build time: 39.26 seconds (optimized)
  - JavaScript bundle: 479KB (compressed and chunked)
  - Lighthouse performance scores: Excellent ratings
  - Core Web Vitals compliance

- **Accessibility Standards**
  - WCAG 2.1 AA compliance implementation
  - Radix UI accessible component integration
  - Screen reader optimization
  - Enhanced CSS with glassmorphism and floating widget improvements

## 🚀 Deployment Specifications

### Vercel Configuration
```json
{
  "framework": "vite",
  "buildCommand": "npm run build:vite",
  "outputDirectory": "dist",
  "regions": ["gru1"],
  "functions": {
    "api/**": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

### Environment Variables
```bash
# Production Environment
NODE_ENV=production
VITE_API_URL=https://31.97.129.78:3002/api
VITE_WORDPRESS_URL=https://31.97.129.78
VITE_SUPABASE_URL=[Configured]
VITE_SUPABASE_ANON_KEY=[Configured]
VITE_GOOGLE_MAPS_API_KEY=[Configured]
RESEND_API_KEY=[Configured]
```

### VPS Container Architecture
- **Nginx**: Reverse proxy and SSL termination (Port 80/443)
- **Node.js API**: Backend services (Port 3002)
- **WordPress**: Content management system (Port 8080)
- **MySQL**: Database server (Port 3306)
- **Redis**: Caching layer (Port 6379)

### Deployment Process
1. **Automated Scripts Available**:
   - `npm run deploy:simple` - Quick deployment (Recommended)
   - `npm run deploy:intelligent` - Multi-strategy deployment
   - `npm run deploy:production` - Full production deployment

2. **Manual Deployment Fallback**:
   ```bash
   npx vercel login
   npm run build:vercel
   npx vercel --prod --yes
   ```

## 📈 Performance & Quality Metrics

### Bundle Analysis
```
Chunk Breakdown:
├── vendor.js: ~180KB (React, React-DOM)
├── router.js: ~45KB (React Router DOM)
├── ui.js: ~95KB (Radix UI components)
├── animation.js: ~85KB (Framer Motion)
├── utils.js: ~35KB (Date-fns, utility libraries)
└── main.js: ~39KB (Application code)
Total: 479KB (Gzipped and optimized)
```

### Performance Standards
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **Time to Interactive**: <3.0s
- **Bundle Size Target**: <500KB (✅ Achieved: 479KB)

### Quality Assurance
- **Test Coverage**: Vitest configuration with jsdom environment
- **Code Quality**: ESLint + TypeScript strict mode
- **Security**: Automated vulnerability scanning
- **Accessibility**: WCAG 2.1 AA compliance testing

## 🔧 Development Environment

### Available Commands
```bash
# Development
npm run dev              # Next.js development server
npm run dev:vite         # Vite development server (port 3002)
npm run dev:vercel       # Vercel development environment

# Building
npm run build           # Next.js production build
npm run build:vite      # Vite production build
npm run build:static    # Static-only build

# Testing
npm test               # Vitest test runner
npm run test:run       # Single test run
npm run test:coverage  # Coverage report

# Deployment
npm run deploy:simple     # Quick Vercel deployment
npm run deploy:intelligent # Smart deployment strategy
npm run deploy:production # Full production deployment
```

### Development Proxy Configuration
- **WordPress Development**: `http://localhost:8083/wp-json`
- **Backend API**: `https://31.97.129.78:3002/api`
- **Frontend Development**: `http://localhost:3002`

## 🎯 Next Steps & Recommendations

### ✅ Immediate Deployment Readiness
The project is **production-ready** with:
- Successful build completion (479KB optimized bundle)
- Security vulnerabilities addressed
- Performance optimization implemented
- Deployment scripts tested and verified

### 📋 Immediate Actions
1. **Deploy to Production**
   ```bash
   npm run deploy:simple
   ```

2. **Monitor Deployment**
   - Verify Vercel dashboard deployment status
   - Test critical user flows post-deployment
   - Monitor performance metrics in production

### 🔮 Future Enhancement Opportunities

#### Short-term (1-2 weeks)
- **Complete Agendamento System**: Merge branch `008-agendamento-online-via`
- **Performance Monitoring**: Implement real-time performance tracking
- **SEO Optimization**: Meta tags and structured data implementation
- **Analytics Integration**: Enhanced user behavior tracking

#### Medium-term (1-2 months)
- **Progressive Web App**: Add offline functionality and app shell
- **Internationalization**: Multi-language support (Portuguese/English)
- **Advanced Caching**: Implement sophisticated caching strategies
- **API Rate Limiting**: Enhanced API protection and throttling

#### Long-term (3-6 months)
- **Mobile App**: React Native companion application
- **AI Integration**: Chatbot for patient inquiries
- **Telemedicine Features**: Video consultation capabilities
- **Advanced Analytics**: Patient journey and conversion optimization

### 🛡️ Security & Compliance
- **LGPD Compliance**: Brazilian data protection law adherence
- **Medical Data Security**: Healthcare industry security standards
- **SSL/TLS**: End-to-end encryption implementation
- **Backup Strategy**: Automated database and asset backup procedures

### 📊 Monitoring & Maintenance
- **Performance Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Sentry integration for error monitoring
- **Uptime Monitoring**: Infrastructure health checks
- **Automated Testing**: CI/CD pipeline with quality gates

---

## 📞 Technical Contact Information
- **Repository**: https://github.com/Sudo-psc/saraivavision-site-v2.git
- **Production URL**: https://saraivavision.com.br
- **VPS Backend**: 31.97.129.78 (Containerized services)
- **Vercel Region**: São Paulo (gru1) for optimal Brazilian performance

**Status**: ✅ **READY FOR PRODUCTION DEPLOYMENT**