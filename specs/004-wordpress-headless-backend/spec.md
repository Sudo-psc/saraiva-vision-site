# WordPress Headless Backend - Feature Specification

## Overview
Implement a WordPress headless backend using PHP-FPM with Docker containerization for the Saraiva Vision website. This will provide a robust CMS solution with custom REST API endpoints optimized for the Next.js frontend, while maintaining compatibility with the existing hybrid architecture.

## Functional Requirements

### Core Features

#### 1. **WordPress Headless CMS**
   - WordPress installation with headless configuration
   - Custom post types for medical content (services, testimonials, blog posts)
   - Advanced Custom Fields (ACF) for structured content
   - Custom REST API endpoints optimized for frontend consumption
   - Media management with automatic optimization

#### 2. **Custom API Endpoints**
   - `/wp-json/saraiva/v1/home` - Home page content
   - `/wp-json/saraiva/v1/services` - Medical services
   - `/wp-json/saraiva/v1/testimonials` - Patient testimonials
   - `/wp-json/saraiva/v1/blog` - Blog posts with pagination
   - `/wp-json/saraiva/v1/contact` - Contact form submissions

#### 3. **Content Management**
   - Intuitive admin interface for clinic staff
   - Custom fields for medical content (procedures, pricing, schedules)
   - Image galleries for before/after treatments
   - SEO optimization fields for each content type
   - Multi-language support preparation

#### 4. **Performance Optimization**
   - Redis caching for API responses
   - Image optimization and WebP conversion
   - Database query optimization
   - CDN integration for media files

#### 5. **Security & Compliance**
   - Healthcare data protection (LGPD compliance)
   - API rate limiting and authentication
   - Secure file uploads with virus scanning
   - Regular security updates and monitoring

#### 6. **Integration Points**
   - Contact form submissions storage
   - Podcast episode metadata (from Spotify sync)
   - WhatsApp integration data
   - Analytics event logging

## Technical Requirements

### Architecture

#### **Containerized Stack**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   PHP-FPM       │    │   WordPress     │
│   (Reverse      │◄──►│   8.2/8.3      │◄──►│   + Plugins     │
│    Proxy)       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   MySQL/MariaDB │    │   Redis Cache   │
                    │   Database      │    │   (Optional)    │
                    └─────────────────┘    └─────────────────┘
```

#### **Technology Stack**
- **WordPress**: Latest stable version (6.4+)
- **PHP**: 8.2 or 8.3 with FPM
- **Web Server**: Nginx with custom configuration
- **Database**: MySQL 8.0 or MariaDB 10.6+
- **Caching**: Redis 7+ (optional but recommended)
- **Container**: Docker with docker-compose

### WordPress Configuration

#### **Required Plugins**
- **Advanced Custom Fields PRO** - Structured content
- **WP REST API** - Enhanced REST endpoints
- **WP Rocket** or **WP Super Cache** - Performance
- **WordPress SEO by Yoast** - SEO optimization
- **Smush** or **ShortPixel** - Image optimization
- **Custom Post Type UI** - Content type management
- **WP Mail SMTP** - Email configuration

#### **Custom Plugins**
- **Saraiva Vision API** - Custom REST endpoints
- **Saraiva Vision Security** - Healthcare compliance
- **Saraiva Vision Media** - Medical image handling

### API Specifications

#### **Response Format**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Service Title",
    "content": "Service description...",
    "acf": {
      "custom_field": "value"
    },
    "featured_image": {
      "url": "https://...",
      "alt": "Alt text",
      "sizes": {
        "thumbnail": "https://...",
        "medium": "https://...",
        "large": "https://..."
      }
    }
  },
  "meta": {
    "total": 25,
    "per_page": 10,
    "current_page": 1
  }
}
```

#### **Error Response**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Content not found",
    "details": "Additional error information"
  }
}
```

### Security Requirements

#### **Healthcare Compliance**
- **LGPD Compliance**: Brazilian data protection law
- **Patient Data Protection**: Encrypted storage of sensitive information
- **Audit Logging**: All data access and modifications logged
- **Access Controls**: Role-based permissions for medical staff

#### **API Security**
- **JWT Authentication** for admin endpoints
- **API Keys** for frontend integration
- **Rate Limiting** (100 requests/hour per IP)
- **CORS Configuration** for frontend domains
- **Input Sanitization** for all form submissions

### Performance Requirements

#### **Response Times**
- **API Endpoints**: < 200ms average response time
- **Database Queries**: < 50ms execution time
- **Image Optimization**: < 2 seconds for processing
- **Page Load**: < 3 seconds for admin interface

#### **Caching Strategy**
- **Redis TTL**: 1 hour for content, 24 hours for media
- **Browser Cache**: 1 year for static assets
- **CDN Integration**: Cloudflare or similar for media

### Scalability Requirements

#### **Concurrent Users**
- **Target**: 1000+ concurrent users
- **PHP Workers**: 10-20 FPM processes
- **Database Connections**: Connection pooling
- **Load Balancing**: Nginx upstream configuration

## Non-Functional Requirements

### Reliability
- **Uptime**: 99.5% availability
- **Backup**: Daily automated backups
- **Recovery**: < 1 hour recovery time
- **Monitoring**: Real-time health checks

### Maintainability
- **Documentation**: Complete API documentation
- **Code Standards**: PSR-12 PHP standards
- **Version Control**: Git with semantic versioning
- **Deployment**: Automated with docker-compose

### Monitoring & Observability
- **Health Checks**: `/wp-json/saraiva/v1/health`
- **Metrics**: Response times, error rates, database performance
- **Logging**: Structured logs with ELK stack
- **Alerts**: Email/SMS for critical issues

## Implementation Phases

### Phase 1: Infrastructure Setup
1. Docker environment configuration
2. WordPress installation and basic setup
3. Database configuration and optimization
4. Nginx reverse proxy setup

### Phase 2: WordPress Customization
1. Custom post types creation
2. ACF field groups configuration
3. Custom REST API development
4. Plugin installation and configuration

### Phase 3: API Development
1. Custom endpoints implementation
2. Authentication and security
3. Caching layer implementation
4. Performance optimization

### Phase 4: Integration & Testing
1. Frontend integration testing
2. Load testing and performance validation
3. Security audit and compliance check
4. Production deployment

## Success Criteria

### Technical Success
- ✅ All API endpoints functional and documented
- ✅ Response times meet performance requirements
- ✅ Security audit passed with no critical issues
- ✅ 99%+ test coverage for custom code
- ✅ Docker containers running successfully

### Business Success
- ✅ Content management workflow improved
- ✅ Medical staff can easily update content
- ✅ Frontend integration seamless
- ✅ Patient data properly protected
- ✅ System reliable and maintainable

## Acceptance Criteria

### Infrastructure
- [ ] Docker containers build and run successfully
- [ ] WordPress accessible via admin interface
- [ ] Database connections working properly
- [ ] Nginx serving content correctly

### Content Management
- [ ] Custom post types created and functional
- [ ] ACF fields working in admin interface
- [ ] Media upload and optimization working
- [ ] SEO fields properly configured

### API Functionality
- [ ] All custom endpoints returning correct data
- [ ] Authentication working for protected endpoints
- [ ] Caching implemented and effective
- [ ] Error handling consistent across endpoints

### Security & Compliance
- [ ] LGPD compliance measures implemented
- [ ] API rate limiting functional
- [ ] Input validation working
- [ ] Audit logging active

### Performance
- [ ] API response times < 200ms
- [ ] Admin interface loads in < 3 seconds
- [ ] Image optimization working
- [ ] Caching reducing database load

## Dependencies
- Docker and docker-compose installed
- Domain configuration for WordPress
- SSL certificates for HTTPS
- SMTP server for email functionality
- CDN service for media optimization

## Constraints
- Must maintain compatibility with existing VPS infrastructure
- WordPress updates must be tested before production deployment
- Custom code must follow WordPress coding standards
- Healthcare data must remain on secure infrastructure

## Risk Factors
- WordPress core updates potentially breaking custom functionality
- Plugin conflicts affecting stability
- PHP version compatibility issues
- Database migration complexity
- Performance degradation under high load

## Cost Estimation
- **Infrastructure**: $50-100/month (VPS hosting)
- **SSL Certificate**: $10-20/year
- **CDN**: $10-50/month
- **Premium Plugins**: $200-500/year
- **Development Time**: 40-60 hours

## Maintenance Plan
- **Daily**: Automated backups and health checks
- **Weekly**: Security updates and plugin updates
- **Monthly**: Performance monitoring and optimization
- **Quarterly**: Security audit and compliance review
- **Annually**: Major WordPress version updates</content>
</xai:function_call: create file specs/004-wordpress-headless-backend/spec.md