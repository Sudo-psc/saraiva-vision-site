# Phase 0 Research: VPS Migration with Docker Containers

## Executive Summary

This research documents the findings for migrating Saraiva Vision website from Vercel hosting to VPS with Docker containers, Nginx configuration, and WordPress API integration. All technical unknowns have been resolved and a clear migration path has been established.

## Technology Decisions & Rationale

### 1. Containerization Strategy
**Decision**: Multi-container Docker Compose setup
- **Frontend**: React/Vite in Alpine Linux container
- **Backend**: Node.js API services in separate container
- **WordPress**: Official WordPress image with PHP-FPM
- **Database**: MySQL 8.0 official image
- **Proxy**: Nginx reverse proxy container

**Rationale**:
- Isolation and security benefits
- Independent scaling of services
- Simplified deployment and rollback
- Standardized development environment
- Community support for official images

**Alternatives Considered**:
- Single container with all services (rejected: too complex, poor isolation)
- Kubernetes (rejected: overkill for single-site deployment)
- Manual VPS setup (rejected: difficult to maintain, no reproducibility)

### 2. VPS Configuration
**Decision**: Ubuntu 22.04 LTS
- **RAM**: 4GB minimum (8GB recommended for growth)
- **CPU**: 2 vCPUs minimum (4 vCPUs recommended)
- **Storage**: 80GB SSD (100GB recommended for media and backups)
- **Network**: 1Gbps connection

**Rationale**:
- Long-term support until 2027
- Extensive Docker and WordPress documentation
- Large community support
- Stability and security updates

### 3. Nginx Configuration
**Decision**: Nginx as reverse proxy and load balancer
- SSL/TLS termination with Let's Encrypt
- HTTP/2 support for performance
- Caching static assets
- Rate limiting and security headers
- WordPress integration with PHP-FPM

**Rationale**:
- Superior performance to Apache for static content
- Better memory efficiency
- Excellent reverse proxy capabilities
- Mature ecosystem and documentation

### 4. Database Migration Strategy
**Decision**: MySQL 8.0 with phased migration
1. Export Supabase data to SQL dump
2. Set up MySQL 8.0 container with proper schema
3. Import and transform data for WordPress compatibility
4. Implement real-time sync during transition
5. Switch to MySQL as primary database

**Rationale**:
- WordPress native compatibility
- Better performance than Supabase for traditional CMS
- Cost reduction (no external database service)
- Full control over data and backups

### 5. WordPress Integration
**Decision**: Headless WordPress CMS setup
- WordPress REST API for content management
- Custom post types for clinic services and doctors
- Media library integration
- User role management for clinic staff

**Rationale**:
- Familiar interface for content editors
- Large plugin ecosystem
- Excellent REST API support
- SEO-friendly out of the box
- Easy training for administrative staff

## Migration Strategy

### Phase 1: Infrastructure Setup (Week 1-2)
1. **VPS Provisioning**
   - Ubuntu 22.04 LTS installation
   - Docker and Docker Compose setup
   - Network and security configuration
   - SSL certificate setup

2. **Development Environment**
   - Local Docker development setup
   - Git repository structure for containers
   - CI/CD pipeline preparation

### Phase 2: Containerization (Week 3-4)
1. **Frontend Container**
   - Dockerfile optimization for React/Vite
   - Multi-stage build for smaller image size
   - Environment variable management
   - Static file serving configuration

2. **Backend Services**
   - Node.js API containerization
   - Database connection management
   - API endpoint preservation
   - Health check endpoints

3. **WordPress Container**
   - Custom Dockerfile with required PHP extensions
   - wp-content volume management
   - Configuration file management
   - Security hardening

### Phase 3: Data Migration (Week 5-6)
1. **Database Migration**
   - Supabase data export
   - MySQL schema design
   - Data transformation scripts
   - Integrity verification

2. **Content Migration**
   - Page structure creation in WordPress
   - Media file migration
   - URL structure preservation
   - SEO metadata migration

### Phase 4: Integration & Testing (Week 7-8)
1. **API Integration**
   - WordPress REST API integration
   - Custom endpoint development
   - Authentication bridge
   - Performance optimization

2. **Testing**
   - Container integration testing
   - Performance benchmarking
   - Security testing
   - User acceptance testing

### Phase 5: Deployment (Week 9-10)
1. **Production Deployment**
   - Blue-green deployment strategy
   - DNS switching procedure
   - Monitoring setup
   - Backup procedures

## Security Considerations

### Container Security
- Use official Docker images from trusted sources
- Implement image scanning in CI/CD pipeline
- Regular security updates for base images
- Non-root user execution in containers
- Read-only filesystems where possible

### Network Security
- Firewall configuration with UFW
- SSL/TLS encryption for all communications
- Rate limiting for API endpoints
- DDoS protection measures
- Private Docker network for internal communication

### Data Security
- Database encryption at rest
- Regular automated backups
- Secure backup storage
- Access control and authentication
- Audit logging for all operations

## Performance Optimization

### Container Optimization
- Multi-stage builds for smaller images
- Caching layers for faster builds
- Resource limits and monitoring
- Health checks and auto-restart policies
- Log aggregation and monitoring

### Application Performance
- Nginx caching for static assets
- Database query optimization
- CDN integration for media files
- HTTP/2 for better performance
- Gzip compression for responses

## Monitoring & Maintenance

### Monitoring Stack
- Prometheus for metrics collection
- Grafana for dashboards
- Loki for log aggregation
- Alertmanager for notifications
- Uptime monitoring

### Maintenance Procedures
- Regular security updates
- Database backups and rotation
- Log file management
- Performance tuning
- Disaster recovery testing

## Risk Mitigation

### High-Risk Areas
1. **Data Loss During Migration**
   - Comprehensive backup strategy
   - Multiple verification steps
   - Rollback procedures documented

2. **Downtime During Cutover**
   - Blue-green deployment approach
   - DNS switching automation
   - Load balancer configuration

3. **Performance Degradation**
   - Load testing before production
   - Resource monitoring setup
   - Scaling procedures ready

### Backup Strategy
1. **Database Backups**: Hourly snapshots, 7-day retention
2. **Media Files**: Daily backups, 30-day retention
3. **Configuration**: Version control + automated backups
4. **Container Images**: Registry with version tags
5. **Complete System**: Weekly full system backups

## Cost Analysis

### Infrastructure Costs
- **VPS Hosting**: $80-120/month (4-8GB RAM, 2-4 vCPUs)
- **Domain & SSL**: $20/year
- **Backup Storage**: $10-20/month
- **Monitoring**: $30-50/month
- **Total**: ~$150-210/month

### Development Resources
- **Development Team**: 2-3 developers for 10 weeks
- **DevOps**: 1 engineer for setup and monitoring
- **Testing**: QA resources for integration testing
- **Training**: Staff training on WordPress admin

### Cost Savings
- **Vercel Hosting**: ~$50-100/month saved
- **Supabase Database**: ~$25-50/month saved
- **External Development**: Reduced dependency on external services
- **Net Change**: ~$75-150/month increase (worth it for control and features)

## Compliance Considerations

### LGPD (Brazilian Data Protection)
- Data processing documentation
- User consent management
- Data retention policies
- Breach notification procedures
- User data access/deletion capabilities

### Medical Industry Standards
- HIPAA-like considerations for patient data
- Secure transmission of medical information
- Access control for sensitive data
- Audit trails for data access
- Secure storage of patient information

## Success Metrics

### Technical Metrics
- **Uptime**: 99.9% or higher
- **Response Time**: <200ms for API calls
- **Page Load**: <2 seconds for all pages
- **Security**: Zero critical vulnerabilities in scans
- **Backup Success**: 100% successful backup completion

### Business Metrics
- **Zero Data Loss**: All data successfully migrated
- **No Downtime**: Seamless transition with no service interruption
- **User Satisfaction**: No user complaints about performance or functionality
- **Admin Efficiency**: Content editors able to manage WordPress effectively
- **Cost Control**: Within 10% of budget estimates

## Next Steps

1. **Phase 1 Design**: Create detailed data models and API contracts
2. **Infrastructure Setup**: Begin VPS provisioning and Docker environment setup
3. **Container Development**: Start building Dockerfiles and docker-compose configuration
4. **Migration Scripts**: Develop data migration tools and procedures
5. **Testing Strategy**: Establish comprehensive testing framework

All technical unknowns have been resolved. The migration path is clear and well-documented with appropriate risk mitigation strategies in place.