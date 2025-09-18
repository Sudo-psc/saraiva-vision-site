# 📊 Sample Log Analysis Queries - Saraiva Vision

This file demonstrates practical log analysis queries for the Saraiva Vision medical clinic website.

## 🔍 API Access Log Analysis

### Find all requests in the last hour
```bash
jq 'select(.timestamp > (now - 3600 | strftime("%Y-%m-%dT%H:%M:%S.%LZ")))' logs/access.log
```

### Most requested API endpoints
```bash
jq -r '.url' logs/access.log | sort | uniq -c | sort -nr | head -10
```

### Slow API requests (>200ms duration)
```bash
jq 'select(.duration | gsub("ms"; "") | tonumber > 200)' logs/access.log
```

### Requests from mobile devices
```bash
jq 'select(.userAgent | contains("Mobile") or contains("iPhone") or contains("Android"))' logs/access.log
```

## 📈 Error Analysis

### All warnings and errors
```bash
jq 'select(.level == "warn" or .level == "error")' logs/app.log
```

### Rate limiting events
```bash
jq 'select(.message | contains("Rate limit"))' logs/app.log
```

### API 4xx errors
```bash
jq 'select(.statusCode >= 400 and .statusCode < 500)' logs/access.log
```

## 🚨 Security Monitoring

### Unusual request patterns
```bash
jq 'select(.url | contains("admin") or contains("wp-") or contains("phpmyadmin"))' logs/access.log
```

### Multiple requests from single IP
```bash
jq -r '.ip' logs/access.log | sort | uniq -c | sort -nr | head -5
```

## 📊 Performance Metrics

### Average response time calculation
```bash
jq -r '.duration | gsub("ms"; "")' logs/access.log | awk '{sum+=$1; count++} END {print "Average:", sum/count "ms"}'
```

### Requests per minute
```bash
jq -r '.timestamp[:16]' logs/access.log | sort | uniq -c
```

## 🏥 Medical Context Analytics

### Contact form submissions
```bash
jq 'select(.url == "/api/contact" and .method == "POST")' logs/access.log
```

### Service page visits (from nginx logs)
```bash
# This would be used with nginx JSON logs
jq 'select(.request | contains("/servicos/"))' logs/nginx/access_json.log
```

### Health check monitoring
```bash
jq 'select(.url == "/api/health")' logs/access.log | jq -s 'length'
```

## 🔧 Troubleshooting Commands

### Export recent errors for analysis
```bash
jq 'select(.level == "error" and (.timestamp | fromdateiso8601) > (now - 86400))' logs/app.log > recent_errors.json
```

### Check API response codes distribution
```bash
jq -r '.statusCode' logs/access.log | sort | uniq -c | sort -nr
```

### Find requests with missing user agents (potential bots)
```bash
jq 'select(.userAgent == "" or .userAgent == null)' logs/access.log
```

---

**Clínica Saraiva Vision** - Dr. Philipe Saraiva Cruz (CRM-MG 69.870)  
*Advanced log analysis for medical website monitoring*