# 📊 Logs Directory - Saraiva Vision

This directory contains application logs for the Saraiva Vision medical clinic website.

## 📁 Directory Structure

```
logs/
├── nginx/              # Nginx web server logs (mounted from Docker)
├── api/               # API server logs (mounted from Docker)
├── sample/            # Sample log files for reference
└── export/            # Exported log archives (created by troubleshoot script)
```

## 🔍 Log Types

### Nginx Logs
- `access.log` - HTTP requests (standard format)
- `access_json.log` - HTTP requests (JSON format)
- `error.log` - Nginx errors and warnings
- `api_access.log` - API-specific requests

### API Logs
- `access.log` - API access logs (JSON format)
- `error.log` - API errors and exceptions (JSON format)
- `app.log` - Application logs (JSON format)

## 🛠️ Usage

### View logs with troubleshooting script
```bash
./scripts/troubleshoot-logs.sh logs nginx 100
./scripts/troubleshoot-logs.sh logs api 50
./scripts/troubleshoot-logs.sh errors
```

### Manual log analysis
```bash
# View recent nginx errors
tail -f logs/nginx/error.log

# Analyze API access patterns
jq '.url' logs/api/access.log | sort | uniq -c | sort -nr

# Find slow requests
jq 'select(.request_time > 1)' logs/nginx/access_json.log
```

## 🔒 Privacy Notice

These logs are configured to maintain patient privacy compliance:
- No personally identifiable information (PII) is logged
- IP addresses are logged for security purposes only
- All logs follow LGPD (Brazilian data protection) guidelines
- Logs are automatically rotated and have retention limits

---

**Clínica Saraiva Vision** - Dr. Philipe Saraiva Cruz (CRM-MG 69.870)  
*Professional medical website logging system*