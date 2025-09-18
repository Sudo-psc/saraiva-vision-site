# Data Model: Container Architecture Design

## Container Service Model

### Container Entities

#### Frontend Container (React/Vite)
**Purpose**: Serve the React application with hot reload in development, static files in production
**Base Image**: node:18-alpine (build) → nginx:alpine (runtime)
**State**: Stateless (static files only)

**Fields**:
- `build_stage`: Node.js environment for building React app
- `runtime_stage`: Nginx serving optimized static files
- `environment_variables`: API endpoints, build configuration
- `volumes`: Source code (dev), static assets (prod)
- `health_check`: HTTP GET on Nginx port
- `resource_limits`: CPU 0.5, Memory 128MB

**Relationships**:
- Communicates with: API container (via Nginx proxy)
- Depends on: API container readiness
- Exposed via: Nginx reverse proxy

#### API Container (Node.js)
**Purpose**: Run the Node.js server with API endpoints
**Base Image**: node:18-alpine
**State**: Stateless (no persistent data storage)

**Fields**:
- `runtime_user`: node (non-root)
- `working_directory`: /app
- `exposed_port`: 3001 (internal only)
- `environment_variables`: Database URLs, API keys
- `health_check`: HTTP GET /api/health
- `resource_limits`: CPU 0.5, Memory 256MB

**Relationships**:
- Communicates with: WordPress container (API proxy)
- Depends on: None (can start independently)
- Serves: Frontend container requests

#### WordPress Container (PHP-FPM)
**Purpose**: Run WordPress CMS with PHP-FPM
**Base Image**: wordpress:php8.1-fpm-alpine
**State**: Stateful (database and uploads)

**Fields**:
- `php_version`: 8.1
- `runtime_user`: www-data
- `exposed_port`: 9000 (PHP-FPM, internal only)
- `database_type`: SQLite
- `persistent_volumes`: wp-content/uploads, database
- `health_check`: PHP-FPM status page
- `resource_limits`: CPU 0.5, Memory 512MB

**Relationships**:
- Communicates with: Nginx container (FastCGI)
- Depends on: Database volume availability
- Serves: CMS content via API proxy

#### Nginx Container (Reverse Proxy)
**Purpose**: SSL termination, static file serving, reverse proxy
**Base Image**: nginx:alpine
**State**: Stateless (configuration only)

**Fields**:
- `runtime_user`: nginx
- `exposed_ports`: 80, 443 (public)
- `ssl_certificates`: Volume mount from host
- `configuration_files`: Custom nginx.conf
- `health_check`: HTTP GET /health
- `resource_limits`: CPU 0.25, Memory 64MB

**Relationships**:
- Communicates with: All backend containers
- Depends on: Backend container readiness
- Entry point: External traffic

### Volume Entities

#### Development Volumes
**Purpose**: Enable live code editing and development workflow

**Source Code Volumes**:
- `frontend_source`: Bind mount `./src` → `/app/src`
- `api_source`: Bind mount `./` → `/app` (exclude node_modules)
- `wordpress_source`: Bind mount `./wordpress-local` → `/var/www/html`

**Dependency Volumes**:
- `frontend_node_modules`: Named volume for React dependencies
- `api_node_modules`: Named volume for API dependencies
- `wordpress_uploads`: Named volume for wp-content/uploads

#### Production Volumes
**Purpose**: Persist data and configuration in production

**Data Persistence**:
- `wordpress_database`: SQLite database file
- `wordpress_uploads`: User uploads and media
- `ssl_certificates`: Host bind mount for Let's Encrypt certs
- `nginx_logs`: Centralized logging

**Configuration**:
- `nginx_config`: Production nginx configuration
- `wordpress_config`: wp-config.php and customizations

### Network Entity

#### Docker Networks
**Purpose**: Isolate and connect containers securely

**Internal Network**:
- `name`: saraivavision_internal
- `driver`: bridge
- `internal`: true (no external access except via Nginx)
- `subnet`: 172.20.0.0/16

**External Network**:
- `name`: saraivavision_external
- `driver`: bridge
- `internal`: false (Nginx container only)

### Service Discovery Model

#### Container Communication
**Internal Service Names**:
- `frontend`: React container (development only)
- `api`: Node.js API server
- `wordpress`: WordPress PHP-FPM
- `nginx`: Reverse proxy (production only)

**Port Mapping**:
- Frontend: 3002 (dev) → 3002 (host)
- API: 3001 (internal) → not exposed
- WordPress: 9000 (internal) → not exposed
- Nginx: 80/443 (internal) → 80/443 (host)

## State Transitions

### Container Lifecycle States

```
Container States:
- BUILDING: Docker image being built
- STARTING: Container initialization
- HEALTHY: Health check passing
- UNHEALTHY: Health check failing
- STOPPING: Graceful shutdown
- STOPPED: Not running
```

**Frontend Container**:
- Build: `BUILDING` → `STARTING` → `HEALTHY`
- Development: Source changes trigger hot reload (no restart)
- Production: Static files, no state changes

**API Container**:
- Startup: `BUILDING` → `STARTING` → `HEALTHY`
- Health Check: `/api/health` every 30s
- Failure: `UNHEALTHY` → restart → `STARTING`

**WordPress Container**:
- Startup: `BUILDING` → `STARTING` → `HEALTHY`
- Database: Check SQLite file accessibility
- Uploads: Verify wp-content/uploads writability

**Nginx Container**:
- Startup: `BUILDING` → `STARTING` → `HEALTHY`
- SSL: Verify certificate availability
- Proxy: Test backend connectivity

### Data Persistence Rules

#### Development Environment
- Source code: Live editing via volume mounts
- Dependencies: Cached in named volumes
- Database: Persistent across restarts
- Uploads: Persistent for testing

#### Production Environment
- Source code: Built into images (immutable)
- Dependencies: Built into images
- Database: Persistent in named volume
- Uploads: Persistent in named volume
- SSL: Host bind mount (external renewal)

## Validation Rules

### Container Requirements
1. **Health Checks**: All containers must implement health endpoints
2. **Resource Limits**: All containers must define CPU/memory limits
3. **Non-Root Users**: All containers must run as non-root users
4. **Security**: No secrets in environment variables or images

### Data Integrity Rules
1. **Database**: SQLite file must be in persistent volume
2. **Uploads**: WordPress uploads must persist across restarts
3. **SSL**: Certificates must be available before Nginx starts
4. **Backups**: All persistent data must be backup-accessible

### Network Security Rules
1. **Isolation**: Only Nginx container exposes public ports
2. **Internal Communication**: Backend containers communicate via internal network
3. **No Direct Access**: API and WordPress not accessible from host
4. **SSL Termination**: All external traffic encrypted at Nginx

### Service Dependencies
1. **Startup Order**: Database volumes → WordPress → API → Nginx
2. **Health Dependencies**: Nginx waits for backend health checks
3. **Graceful Shutdown**: Containers handle SIGTERM properly
4. **Restart Policy**: Containers restart automatically on failure

## Environment Configuration

### Development Configuration
```yaml
Environment Variables:
- NODE_ENV=development
- VITE_API_URL=http://localhost:3001
- WORDPRESS_URL=http://wordpress:8083
- HOT_RELOAD=true
```

### Production Configuration
```yaml
Environment Variables:
- NODE_ENV=production
- API_URL=https://saraivavision.com.br/api
- WORDPRESS_URL=http://wordpress:9000
- SSL_ENABLED=true
```

### Secrets Management
- API keys: Docker secrets or external secret management
- Database credentials: Environment files not in VCS
- SSL certificates: Host filesystem with proper permissions
- Service tokens: Runtime injection, not build-time