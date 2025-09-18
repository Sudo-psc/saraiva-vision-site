# Nginx Proxy Dockerfile - Saraiva Vision
# Reverse proxy and load balancer for the application

FROM nginx:1.25-alpine

# Install security updates and curl for health checks
RUN apk update && apk upgrade && \
    apk add --no-cache ca-certificates curl openssl && \
    rm -rf /var/cache/apk/*

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configurations
COPY infra/docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY infra/docker/nginx/proxy.conf /etc/nginx/conf.d/proxy.conf
COPY infra/docker/nginx/security-headers.conf /etc/nginx/conf.d/security-headers.conf
COPY infra/docker/nginx/ssl.conf /etc/nginx/conf.d/ssl.conf

# Create directories for SSL certificates (if needed)
RUN mkdir -p /etc/nginx/ssl && \
    chown -R nginx:nginx /etc/nginx/ssl

# Create nginx log directory
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]