# 📊 Docker Logs Collection & Analysis Guide
**Saraiva Vision - Clínica Oftalmológica**  
*Dr. Philipe Saraiva Cruz (CRM-MG 69.870) - Caratinga, MG*

---

## 🚀 Quick Start

### Start Services with Logging
```bash
# Production mode
docker compose up -d

# Staging mode (with enhanced debugging)
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# With log monitoring enabled
docker compose --profile monitoring up -d
```

### View Logs Immediately
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f nginx
docker compose logs -f api

# With timestamps
docker compose logs -f --timestamps
```

---

## 📁 Log File Locations

### Container Logs (JSON Format)
- **Nginx Container**: `docker logs saraiva-nginx`
- **API Container**: `docker logs saraiva-api`
- **Log Collector**: `docker logs saraiva-logs`

### Host-Mounted Logs
```
logs/
├── nginx/                 # Nginx access/error logs
│   ├── access.log        # Standard format
│   ├── access_json.log   # JSON format
│   ├── error.log         # Nginx errors
│   ├── api_access.log    # API-specific requests
│   └── staging_*.log     # Staging environment logs
├── api/                  # API application logs
│   ├── access.log        # API access logs (JSON)
│   ├── error.log         # API errors (JSON)
│   ├── app.log          # Application logs (JSON)
│   └── *.log            # Additional API logs
└── saraiva-vision.log   # Aggregated logs (Fluent Bit)
```

### Docker Volume Logs
- **nginx_logs**: `/var/log/nginx` inside nginx container
- **api_logs**: `/app/logs` inside api container

---

## 🔍 Log Formats & Sample Queries

### Nginx Access Log Format (JSON)
```json
{
  "timestamp": "2024-01-15T10:30:45-03:00",
  "remote_addr": "192.168.1.100",
  "request": "GET /api/health HTTP/1.1",
  "status": 200,
  "body_bytes_sent": 156,
  "http_referer": "https://saraivavision.com.br/",
  "http_user_agent": "Mozilla/5.0...",
  "request_time": 0.123,
  "upstream_response_time": "0.089",
  "upstream_addr": "172.18.0.3:3001",
  "service": "saraiva-vision-web",
  "clinic": "Clínica Saraiva Vision"
}
```

### API Application Log Format (JSON)
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "service": "saraiva-vision-api",
  "clinic": "Clínica Saraiva Vision",
  "message": "HTTP Request",
  "method": "POST",
  "url": "/api/contact",
  "ip": "192.168.1.100",
  "statusCode": 200,
  "duration": "89ms"
}
```

---

## 📝 Common Log Analysis Commands

### Using Docker Compose
```bash
# Last 100 lines from all services
docker compose logs --tail=100

# Follow logs from specific service
docker compose logs -f nginx

# Logs since specific time
docker compose logs --since="2024-01-15T10:00:00"

# Logs until specific time
docker compose logs --until="2024-01-15T11:00:00"

# Export all logs to file
docker compose logs > all_logs_$(date +%Y%m%d_%H%M%S).log
```

### Using Docker Commands
```bash
# Real-time logs with timestamps
docker logs -f --timestamps saraiva-nginx

# Last 500 lines
docker logs --tail=500 saraiva-api

# Logs between specific times
docker logs --since="1h" --until="30m" saraiva-nginx
```

### Log Analysis with Standard Tools
```bash
# Find errors in nginx logs
docker exec saraiva-nginx grep -i error /var/log/nginx/error.log

# Count HTTP status codes
docker exec saraiva-nginx awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c

# Top 10 client IPs
docker exec saraiva-nginx awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# API errors in JSON logs
docker exec saraiva-api jq 'select(.level=="error")' /app/logs/app.log

# Request duration analysis
docker exec saraiva-nginx jq -r '.request_time' /var/log/nginx/access_json.log | sort -n | tail -10
```

---

## 🛠️ Troubleshooting Script Usage

We provide a comprehensive troubleshooting script for easy log analysis:

```bash
# Make script executable (first time only)
chmod +x scripts/troubleshoot-logs.sh

# Show service status
./scripts/troubleshoot-logs.sh status

# Show recent logs
./scripts/troubleshoot-logs.sh logs nginx 100
./scripts/troubleshoot-logs.sh logs api 50
./scripts/troubleshoot-logs.sh logs all 200

# Analyze error patterns
./scripts/troubleshoot-logs.sh errors

# Show access patterns
./scripts/troubleshoot-logs.sh access 500

# Run health checks
./scripts/troubleshoot-logs.sh health

# Monitor logs in real-time
./scripts/troubleshoot-logs.sh monitor

# Export logs for analysis
./scripts/troubleshoot-logs.sh export /tmp/logs

# Check disk usage
./scripts/troubleshoot-logs.sh disk

# Show help
./scripts/troubleshoot-logs.sh help
```

---

## 🔍 Sample Log Queries

### Find Slow Requests (>1 second)
```bash
# Nginx logs
docker exec saraiva-nginx jq 'select(.request_time > 1)' /var/log/nginx/access_json.log

# API logs
docker exec saraiva-api jq 'select(.duration | tonumber > 1000)' /app/logs/access.log
```

### Find 4xx/5xx Errors
```bash
# HTTP 4xx errors
docker exec saraiva-nginx jq 'select(.status >= 400 and .status < 500)' /var/log/nginx/access_json.log

# HTTP 5xx errors
docker exec saraiva-nginx jq 'select(.status >= 500)' /var/log/nginx/access_json.log

# API errors
docker exec saraiva-api jq 'select(.level=="error")' /app/logs/error.log
```

### Traffic Analysis
```bash
# Requests per hour
docker exec saraiva-nginx jq -r '.timestamp[:13]' /var/log/nginx/access_json.log | sort | uniq -c

# Most active user agents
docker exec saraiva-nginx jq -r '.http_user_agent' /var/log/nginx/access_json.log | sort | uniq -c | sort -nr | head -10

# API endpoint usage
docker exec saraiva-api jq -r '.url' /app/logs/access.log | sort | uniq -c | sort -nr
```

### Security Analysis
```bash
# Potential attack patterns
docker exec saraiva-nginx grep -E "(admin|wp-admin|phpmyadmin|sql)" /var/log/nginx/access.log

# Rate limit violations
docker exec saraiva-api jq 'select(.message | contains("Rate limit"))' /app/logs/app.log

# Blocked requests
docker exec saraiva-nginx jq 'select(.status == 403 or .status == 429)' /var/log/nginx/access_json.log
```

---

## 📊 Log Rotation & Retention

### Docker Logging Driver Configuration
```yaml
# In docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"     # Maximum size per log file
    max-file: "3"       # Keep 3 rotated files
    tag: "nginx"        # Tag for identification
```

### Manual Log Rotation
```bash
# Rotate nginx logs manually
docker exec saraiva-nginx nginx -s reopen

# Rotate and compress old logs
docker exec saraiva-nginx sh -c '
  cd /var/log/nginx
  mv access.log access.log.$(date +%Y%m%d_%H%M%S)
  mv error.log error.log.$(date +%Y%m%d_%H%M%S)
  nginx -s reopen
  gzip access.log.* error.log.*
'
```

### Automated Cleanup Script
```bash
# Clean logs older than 7 days
find logs/ -name "*.log" -mtime +7 -delete

# Compress logs older than 1 day
find logs/ -name "*.log" -mtime +1 -exec gzip {} \;
```

---

## 🚨 Monitoring & Alerts

### Health Check Endpoints
- **Nginx**: `http://localhost/health`
- **API**: `http://localhost/api/health`
- **Staging**: `http://localhost:8080/health`

### Key Metrics to Monitor
1. **Response Times**: `request_time` > 2 seconds
2. **Error Rates**: HTTP 5xx status codes
3. **Rate Limiting**: 429 status codes
4. **Disk Usage**: Log file sizes
5. **Container Health**: Exit codes, restarts

### Sample Monitoring Commands
```bash
# Check for recent errors (last 10 minutes)
docker exec saraiva-nginx find /var/log/nginx -name "*.log" -newermt "10 minutes ago" -exec grep -l ERROR {} \;

# Monitor response times
watch 'docker exec saraiva-nginx tail -n 20 /var/log/nginx/access_json.log | jq -r ".request_time" | sort -n | tail -5'

# Check container health
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

---

## 🔧 Configuration Files

### Log Format Definitions
Location: `infra/nginx/sites-available/production.conf`

### Fluent Bit Configuration  
Location: `infra/docker/fluent-bit/fluent-bit.conf`

### API Logger Configuration
Location: `server.js` (Logger class)

---

## 📞 Medical Clinic Context

This logging system is specifically designed for **Clínica Saraiva Vision**, an ophthalmology clinic in Caratinga, MG. All logs include medical context identifiers:

- **Clinic**: Clínica Saraiva Vision
- **Doctor**: Dr. Philipe Saraiva Cruz (CRM-MG 69.870)
- **Service**: Medical website and patient communication system
- **Compliance**: Logs maintain patient privacy (no PII in standard logs)

For questions or issues, refer to the troubleshooting script or contact the development team.

---

**Remember**: Always handle medical data with appropriate privacy and security measures. This logging system is designed to monitor technical performance without exposing patient information.