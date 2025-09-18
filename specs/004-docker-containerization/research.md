# Research: Docker Containerization for Medical Website Stack

## Overview
Research findings for containerizing the complete Saraiva Vision medical website stack using Docker best practices, focusing on production-ready deployment, development efficiency, and maintaining current architectural benefits.

## Docker Best Practices for Medical Website Stack

### Decision: Multi-Stage Docker Builds
**Rationale**: Optimize image sizes and security by separating build dependencies from runtime
**Alternatives considered**: Single-stage builds (rejected for large image sizes), pre-built images (rejected for customization needs)

**Research Findings**:
- React/Vite builds benefit from Node.js build stage → Nginx runtime stage
- WordPress can use PHP-FPM Alpine base with minimal security surface
- Node.js API uses Alpine base with only production dependencies
- Nginx uses official Alpine image with custom configuration

### Decision: Docker Compose for Orchestration
**Rationale**: Single-server deployment doesn't require Kubernetes complexity, Docker Compose provides sufficient orchestration
**Alternatives considered**: Kubernetes (overkill for single server), Docker Swarm (deprecated), manual docker run (unmaintainable)

**Research Findings**:
- Docker Compose v2 provides health checks, dependency ordering, and volume management
- Separate compositions for development (docker-compose.dev.yml) and production (docker-compose.prod.yml)
- Override files allow environment-specific configurations without duplication

### Decision: Container-to-Container Communication
**Rationale**: Docker networks provide isolation and service discovery without exposing unnecessary ports
**Alternatives considered**: Host networking (security risk), port forwarding (complexity), external load balancer (unnecessary)

**Research Findings**:
- Internal Docker network for container communication
- Only Nginx container exposes ports 80/443 to host
- Service names resolve automatically within Docker network
- Health checks ensure services are ready before accepting traffic

## WordPress Containerization Strategy

### Decision: WordPress with PHP-FPM + Volume Mounts
**Rationale**: Preserve current SQLite database and uploads while containerizing the runtime environment
**Alternatives considered**: MySQL container (unnecessary complexity), WordPress Docker image (missing customizations), host-mounted WordPress (defeats containerization purpose)

**Research Findings**:
- Official WordPress Docker image provides PHP-FPM configuration
- SQLite plugin compatibility maintained through volume mounts
- wp-content uploads and themes preserved via named volumes
- wp-config.php customizations applied during container build

### Decision: Development vs Production WordPress Handling
**Rationale**: Development needs quick iteration, production needs security and performance
**Alternatives considered**: Single configuration (inflexible), separate images (maintenance overhead)

**Research Findings**:
- Development: Volume mounts for live code editing
- Production: Built-in files with external volume for uploads only
- Health checks verify WordPress and PHP-FPM readiness
- Separate database handling for development vs production

## Node.js API Containerization

### Decision: Alpine Node.js with Production Dependencies Only
**Rationale**: Minimize attack surface and image size while maintaining full API functionality
**Alternatives considered**: Ubuntu base (larger), full Node.js (unnecessary dev tools), distroless (complexity)

**Research Findings**:
- Node.js 18 Alpine provides security updates and small footprint
- Multi-stage build separates npm install from runtime
- Health check endpoint verifies API server readiness
- Environment variables handled via Docker secrets

### Decision: API Development Hot Reload
**Rationale**: Maintain development productivity with live code updates
**Alternatives considered**: Container rebuilds (slow), nodemon in production (security risk)

**Research Findings**:
- Development: Volume mount source code with nodemon
- Production: Built-in code with optimized startup
- Separate package.json handling for dev vs prod dependencies

## React Frontend Containerization

### Decision: Multi-Stage Build with Nginx Serving
**Rationale**: Build React app in Node.js container, serve static files via Nginx for performance
**Alternatives considered**: Node.js serving (resource intensive), external CDN (complexity), shared volume (coupling)

**Research Findings**:
- Build stage: Node.js with Vite for optimized production build
- Runtime stage: Nginx Alpine serving static files
- Build-time environment variables for API endpoints
- Asset optimization maintained from current Vite configuration

### Decision: Development Hot Reload Strategy
**Rationale**: Maintain Vite's fast hot module replacement for development productivity
**Alternatives considered**: Production builds for dev (slow), external Vite (complexity)

**Research Findings**:
- Development: Vite dev server in container with volume mounts
- Production: Pre-built static files served by Nginx
- Port mapping preserves current development workflow

## Nginx Reverse Proxy Containerization

### Decision: Official Nginx Alpine with Custom Configuration
**Rationale**: Maintain current production Nginx configuration while containerizing the runtime
**Alternatives considered**: Traefik (learning curve), HAProxy (overkill), cloud load balancer (cost)

**Research Findings**:
- Official Nginx Alpine image provides security and performance
- Custom configuration files mounted as volumes
- SSL certificate handling via volume mounts (preserve current Let's Encrypt workflow)
- Health checks verify proxy functionality

### Decision: SSL Certificate Management
**Rationale**: Preserve current Let's Encrypt workflow while making certificates available to containers
**Alternatives considered**: Container-based certbot (complexity), cloud certificates (cost), self-signed (production unusable)

**Research Findings**:
- Volume mount existing SSL certificates from host
- Nginx container reads certificates from mounted volume
- Certbot renewal continues on host system
- Health check includes SSL validation

## Security Hardening Strategies

### Decision: Non-Root Users in All Containers
**Rationale**: Minimize privilege escalation risks following security best practices
**Alternatives considered**: Root containers (security risk), complex user mapping (maintenance overhead)

**Research Findings**:
- All containers run with non-root users
- WordPress: www-data user (standard PHP-FPM user)
- Node.js: node user (Alpine default)
- Nginx: nginx user (Alpine default)
- React build: temporary root, runtime non-root

### Decision: Read-Only Root Filesystem Where Possible
**Rationale**: Prevent runtime modifications to reduce attack surface
**Alternatives considered**: Writable containers (security risk), immutable infrastructure (complexity)

**Research Findings**:
- Nginx: Read-only root with writable /var/cache/nginx and /var/run
- Node.js API: Read-only root with writable /tmp
- WordPress: Requires writable wp-content for uploads
- Frontend: Fully read-only (static files)

## Performance Optimization

### Decision: Resource Limits and Health Checks
**Rationale**: Prevent resource exhaustion and ensure service reliability
**Alternatives considered**: Unlimited resources (resource exhaustion risk), external monitoring (complexity)

**Research Findings**:
- Memory limits: Frontend 128MB, API 256MB, WordPress 512MB, Nginx 64MB
- CPU limits: Soft limits allow bursting while preventing monopolization
- Health checks: HTTP endpoints for each service
- Startup probes: Allow sufficient time for service initialization

### Decision: Container Optimization Techniques
**Rationale**: Minimize startup time and resource usage
**Alternatives considered**: Large base images (slow), complex optimization (maintenance)

**Research Findings**:
- Alpine Linux base images for minimal footprint
- Multi-stage builds remove build dependencies
- .dockerignore files exclude unnecessary files
- Layer caching optimization for faster rebuilds

## Development Workflow Integration

### Decision: Docker Compose with Override Files
**Rationale**: Maintain single source of truth while allowing environment-specific configurations
**Alternatives considered**: Separate compose files (duplication), environment variables only (limited flexibility)

**Research Findings**:
- Base docker-compose.yml with common configuration
- docker-compose.override.yml for development-specific settings
- docker-compose.prod.yml for production overrides
- Environment-specific .env files

### Decision: Volume Strategy for Development
**Rationale**: Enable live code editing while maintaining container benefits
**Alternatives considered**: Image rebuilds (slow), file copying (complex)

**Research Findings**:
- Source code: Bind mounts for live editing
- Dependencies: Named volumes for node_modules persistence
- Database: Named volume for data persistence
- Uploads: Named volume for WordPress content

## Production Deployment Strategy

### Decision: Blue-Green Deployment with Docker
**Rationale**: Enable zero-downtime deployments while maintaining current deployment benefits
**Alternatives considered**: Rolling updates (complexity), manual deployment (error-prone)

**Research Findings**:
- New containers built with unique tags
- Health checks verify service readiness
- Nginx configuration switches to new containers
- Old containers removed after successful verification

### Decision: Container Registry Strategy
**Rationale**: Enable efficient image distribution and caching
**Alternatives considered**: Docker Hub (security concerns), building on server (resource intensive)

**Research Findings**:
- Local registry for production deployment
- Image tagging with git commit SHA
- Base image caching for faster builds
- Automated cleanup of old images

## Data Persistence Strategy

### Decision: Named Volumes for Persistent Data
**Rationale**: Separate data lifecycle from container lifecycle while maintaining data integrity
**Alternatives considered**: Host bind mounts (permission issues), database containers (complexity)

**Research Findings**:
- WordPress database: Named volume for SQLite file
- WordPress uploads: Named volume for wp-content/uploads
- SSL certificates: Host bind mount (external renewal process)
- Logs: Named volume with rotation

### Decision: Backup Strategy for Containerized Data
**Rationale**: Maintain current backup procedures while adapting to containerized storage
**Alternatives considered**: Container-based backups (complexity), external backup tools (learning curve)

**Research Findings**:
- Volume backup via docker run commands
- Database export via WordPress container
- Integration with existing backup scripts
- Recovery procedures documented

## Monitoring and Logging

### Decision: Docker Logging Drivers with Aggregation
**Rationale**: Centralize logging while maintaining container isolation
**Alternatives considered**: External logging services (cost), container-based logging (complexity)

**Research Findings**:
- JSON file driver for local development
- Syslog driver for production aggregation
- Log rotation configured at Docker level
- Container health checks logged centrally

### Decision: Health Check Strategy
**Rationale**: Proactive monitoring of service health with automated recovery
**Alternatives considered**: External monitoring only (delayed detection), no health checks (blind deployment)

**Research Findings**:
- HTTP health endpoints for all services
- Startup probes for initialization time
- Liveness probes for failure detection
- Readiness probes for traffic routing

## Integration Testing Strategy

### Decision: Container Integration Tests
**Rationale**: Verify service communication and functionality in containerized environment
**Alternatives considered**: Unit tests only (insufficient), external testing (complexity)

**Research Findings**:
- Docker Compose test environment
- Service-to-service communication tests
- End-to-end workflow verification
- Performance testing in containerized environment

## Migration Strategy

### Decision: Phased Migration Approach
**Rationale**: Minimize risk and enable rollback at each stage
**Alternatives considered**: Big-bang migration (high risk), service-by-service (dependencies)

**Research Findings**:
- Phase 1: Development environment containerization
- Phase 2: Production preparation and testing
- Phase 3: Production deployment with parallel systems
- Phase 4: Legacy system removal after verification

## Implementation Priorities

Based on research findings, implementation order:

1. **Container Definitions**: Create Dockerfiles for each service
2. **Development Composition**: docker-compose.dev.yml with hot reload
3. **Integration Testing**: Service communication and health checks
4. **Production Composition**: docker-compose.prod.yml with optimization
5. **Security Hardening**: Non-root users, resource limits, read-only filesystems
6. **Performance Optimization**: Resource tuning and monitoring
7. **Deployment Integration**: Blue-green deployment with existing scripts
8. **Documentation and Training**: Team adoption and troubleshooting guides

## Risk Mitigation Strategies

### High-Priority Risks:
- **Database Migration**: Comprehensive testing with SQLite in containers
- **SSL Integration**: Thorough testing of certificate mounting and renewal
- **Performance Impact**: Baseline testing and optimization verification

### Medium-Priority Risks:
- **Development Workflow**: Parallel development environment during transition
- **Team Adoption**: Documentation and training program

### Low-Priority Risks:
- **Resource Usage**: Monitoring and alerting for resource exhaustion

## Success Criteria Validation

Research confirms feasibility of all success criteria:
- ✅ One-command development setup achievable with Docker Compose
- ✅ Production parity possible with same images and configurations
- ✅ Zero-downtime deployment enabled with health checks and rolling updates
- ✅ Performance maintenance possible with proper optimization
- ✅ Reliability improvement through container health checks and restart policies