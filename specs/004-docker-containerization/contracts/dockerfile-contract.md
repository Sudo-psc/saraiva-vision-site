# Dockerfile Contract Specification

## Overview
This contract defines the standardized structure and requirements that all Dockerfiles in the Saraiva Vision project must follow to ensure security, performance, and maintainability.

## Standard Dockerfile Structure

### 1. Header Section (Required)
Every Dockerfile must start with:
```dockerfile
# Service: [SERVICE_NAME]
# Description: [BRIEF_DESCRIPTION]
# Base Image: [BASE_IMAGE]
# Maintainer: Saraiva Vision Development Team
# Security: Non-root user, read-only filesystem where possible
```

### 2. Multi-Stage Build Structure
All Dockerfiles must use multi-stage builds where applicable:

```dockerfile
# Build Stage
FROM node:18-alpine AS builder
# ... build steps

# Runtime Stage
FROM nginx:alpine AS runtime
# ... runtime configuration
```

### 3. Security Requirements (Non-Negotiable)

#### Non-Root User
```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Switch to non-root user
USER appuser
```

#### Minimal Base Images
- Use Alpine Linux variants when available
- Official images preferred over custom builds
- Pin specific versions, not `latest`

#### Read-Only Root Filesystem
```dockerfile
# Mark volumes for writable areas
VOLUME ["/tmp", "/var/cache"]

# Configure for read-only root
ENV READONLY_ROOT=true
```

### 4. Layer Optimization Requirements

#### Minimize Layers
```dockerfile
# Good: Combined RUN commands
RUN apk add --no-cache \
    curl \
    wget \
    && rm -rf /var/cache/apk/*

# Bad: Multiple RUN commands
RUN apk add curl
RUN apk add wget
RUN rm -rf /var/cache/apk/*
```

#### Cache-Friendly Ordering
```dockerfile
# 1. System dependencies (changes rarely)
RUN apk add --no-cache [packages]

# 2. Application dependencies (changes occasionally)
COPY package*.json ./
RUN npm ci --only=production

# 3. Application code (changes frequently)
COPY . .
```

### 5. Health Check Requirements
Every service container must implement health checks:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD [health-check-command]
```

### 6. Resource and Security Labels
These labels must accurately reflect the container's runtime security posture.
```dockerfile
LABEL maintainer="Saraiva Vision Dev Team" \
      version="2.1.0" \
      description="[Service Description]" \
      security.non-root="[true|false]" \
      security.readonly-root="[true|false]"
```
**Note:** While `true` is the required standard for all new services, legacy services or complex applications like WordPress may be temporarily exempted. In such cases, the labels must be set to `false` to reflect the actual runtime environment.

## Service-Specific Contracts

### Frontend Container (React/Vite)

#### Build Stage Requirements
```dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency files first (caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Verify build output
RUN test -d dist || exit 1
```

#### Runtime Stage Requirements
```dockerfile
FROM nginx:alpine AS runtime

# Create non-root user
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Switch to non-root user
USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### API Container (Node.js)

#### Requirements
```dockerfile
FROM node:18-alpine

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Install dependencies first (caching)
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Switch to non-root user
USER nodejs

EXPOSE 3001
CMD ["node", "server.js"]
```

### WordPress Container (PHP-FPM)

**Note:** The WordPress container is a current exception to the non-root and read-only filesystem requirements due to the complexities of the application. It runs with elevated privileges, and its security labels must be set to `false`.

#### Requirements
```dockerfile
FROM wordpress:php8.1-fpm-alpine

# Install additional PHP extensions if needed
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Create necessary directories
RUN mkdir -p /var/www/html/wp-content/uploads && \
    mkdir -p /var/www/html/wp-content/databases && \
    chown -R www-data:www-data /var/www/html/wp-content

# Copy custom wp-config.php
COPY wp-config.php /var/www/html/

# Health check for PHP-FPM
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD php-fpm-healthcheck || exit 1

# The base image runs as root, and supervisord is used to manage processes.
# USER www-data is not used at the container level.

EXPOSE 9000
CMD ["php-fpm"]
```

### Nginx Container (Reverse Proxy)

#### Requirements
```dockerfile
FROM nginx:alpine

# Copy custom configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# Create necessary directories for non-root operation
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run/nginx.pid

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD nginx -t && curl -f http://localhost/health || exit 1

# Switch to non-root user
USER nginx

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

## Build Optimization Contracts

### .dockerignore Requirements
Every Dockerfile must have a corresponding .dockerignore:

```
# Version control
.git
.gitignore

# Dependencies
node_modules
npm-debug.log*

# Build artifacts
dist
build

# Environment files
.env*

# Documentation
*.md
docs/

# Test files
tests/
*.test.js
```

### Build Args Contract
```dockerfile
# Standard build arguments
ARG NODE_ENV=production
ARG BUILD_VERSION=latest
ARG USER_ID=1001
ARG GROUP_ID=1001

# Use build args
ENV NODE_ENV=$NODE_ENV
LABEL version=$BUILD_VERSION
```

### Environment Variables Contract
```dockerfile
# Required environment variables
ENV NODE_ENV=production \
    LOG_LEVEL=info \
    PORT=3001

# Security-related environment variables
ENV READONLY_ROOT=true \
    NO_NEW_PRIVILEGES=true
```

## Testing Contract

### Build Testing Requirements
Each Dockerfile must pass these tests:

1. **Security Scan**: No critical vulnerabilities
2. **User Check**: Container runs as non-root
3. **Health Check**: Health endpoint responds correctly
4. **Resource Usage**: Within defined limits
5. **Build Time**: Under 5 minutes for development builds

### Test Commands
```bash
# Security scan
docker scan [image-name]

# User verification
docker run --rm [image-name] whoami | grep -v root

# Health check test
docker run -d --name test [image-name]
docker exec test curl -f http://localhost/health

# Resource test
docker stats test --no-stream
```

## Maintenance Contract

### Version Pinning
```dockerfile
# Pin base image versions
FROM node:18.17.0-alpine

# Pin package versions in package.json
# Use package-lock.json for reproducible builds
```

### Update Strategy
1. Security updates: Immediate
2. Minor version updates: Monthly
3. Major version updates: Quarterly with testing

### Documentation Requirements
Each Dockerfile must include:
- Inline comments explaining complex operations
- Security justifications for any deviations
- Performance optimization notes
- Dependency version reasoning

## Compliance Verification

### Required Checks Before Merge
1. Dockerfile linting with hadolint
2. Security scan with trivy or similar
3. Health check verification
4. Resource limit validation
5. Non-root user confirmation

### Automated Pipeline Integration
```yaml
# CI/CD pipeline must include:
- dockerfile-lint
- security-scan
- build-test
- health-check-test
- resource-verification
```

This contract ensures all containers in the Saraiva Vision project maintain consistent security, performance, and maintainability standards.