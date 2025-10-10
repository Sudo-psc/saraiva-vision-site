# Traefik Implementation Guide

**Data**: 2025-10-08
**Status**: ✅ Production
**Versão**: Traefik 3.2.3

## Arquitetura

```
Internet → Nginx (HTTPS/SSL) → Traefik (Reverse Proxy) → {
                                                             ├─ API Backend (PM2:3001)
                                                             ├─ Webhook Receiver (:9000)
                                                             └─ Dashboard (:8081)
                                                           }
```

### Fluxo de Requisição

1. **Cliente** → `https://saraivavision.com.br/api/health`
2. **Nginx** (:443) → Rate limiting + SSL termination
3. **Traefik** (:8080) → Routing + Middleware + Health checks
4. **API Backend** (:3001) → Response
5. **Traefik** → Add headers + Access logging
6. **Nginx** → Response ao cliente

## Componentes

### 1. Traefik Service

**Location**: `/usr/local/bin/traefik`
**Config**: `/etc/traefik/traefik.yml`
**Dynamic Config**: `/etc/traefik/dynamic/services.yml`
**Service**: `systemd` → `/etc/systemd/system/traefik.service`

```bash
# Status
systemctl status traefik

# Logs
journalctl -u traefik -f
tail -f /var/log/traefik/traefik.log
tail -f /var/log/traefik/access.log

# Restart
systemctl restart traefik
```

### 2. Entry Points

- **Web** (`:8080`) - Receives from Nginx, routes to backends
- **Dashboard** (`:8081`) - Monitoring API with metrics

### 3. Routers

#### API Backend Router
- **Rule**: `PathPrefix(\`/api/\`)`
- **Service**: `api-backend-service` → `127.0.0.1:3001`
- **Middlewares**: Rate limiting (100 req/min), security headers
- **Health Check**: `/api/health` every 10s

#### Webhook Router
- **Rule**: `PathPrefix(\`/webhook\`)`
- **Service**: `webhook-receiver-service` → `127.0.0.1:9000`
- **Middlewares**: Rate limiting (10 req/min), webhook headers
- **Health Check**: `/health` every 30s

#### Dashboard Router
- **Rule**: `PathPrefix(\`/api\`) || PathPrefix(\`/dashboard\`)`
- **Service**: `api@internal` (built-in Traefik API)
- **Authentication**: HTTP Basic Auth (admin:saraiva2025)

### 4. Middlewares

#### Rate Limiting
- **API**: 100 requests/minute, burst 50
- **Webhooks**: 10 requests/minute, burst 5

#### Security Headers
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

#### Request ID
- Adds `X-Request-ID` to all requests for tracing

## Logs e Métricas

### Access Logs
**Location**: `/var/log/traefik/access.log`
**Format**: JSON

```json
{
  "ClientHost": "127.0.0.1",
  "RequestPath": "/api/health",
  "DownstreamStatus": 200,
  "Duration": 1708117
}
```

### Error Logs
**Location**: `/var/log/traefik/traefik.log`
**Format**: JSON with structured logging

### Prometheus Metrics
**Endpoint**: `http://localhost:8081/metrics`
**Labels**: EntryPoints, Routers, Services

```bash
# Curl metrics
curl -s http://localhost:8081/metrics | grep traefik
```

## Dashboard

### Acesso Local
```bash
# Via Nginx (localhost only)
curl -u admin:saraiva2025 http://localhost/traefik/dashboard/

# Direct access
curl -u admin:saraiva2025 http://localhost:8081/dashboard/
```

### Credenciais
- **Username**: `admin`
- **Password**: `saraiva2025`
- **Gerado com**: `htpasswd -nbB admin saraiva2025`

### Endpoints Disponíveis
- `/api/overview` - Full configuration overview
- `/api/http/routers` - All HTTP routers
- `/api/http/services` - All backend services
- `/dashboard/` - Web UI

## Comandos Úteis

### Status Dashboard
```bash
/usr/local/bin/traefik-status
```

Output:
- Traefik service status (PID, memory, uptime)
- Backend services health (API, Maps, Webhooks)
- Active routers and services count
- Recent API requests (last 5)
- Error summary (last 24h)

### Testes de Endpoints

```bash
# API Health
curl http://localhost:8080/api/health

# Maps Health
curl http://localhost:8080/api/maps-health

# Webhook (sem receiver ativo)
curl http://localhost:8080/webhook

# Dashboard API
curl -u admin:saraiva2025 http://localhost:8081/api/overview | jq
```

### Verificar Rotas Ativas
```bash
curl -s -u admin:saraiva2025 http://localhost:8081/api/http/routers | jq 'keys'
```

### Monitorar Logs em Tempo Real
```bash
# Access logs
tail -f /var/log/traefik/access.log | jq -c '{host:.ClientHost, path:.RequestPath, status:.DownstreamStatus}'

# Error logs
tail -f /var/log/traefik/traefik.log | jq -c 'select(.level=="error")'
```

## Nginx Integration

### Upstreams
```nginx
upstream traefik_proxy {
    server 127.0.0.1:8080;
    keepalive 64;
}

upstream traefik_dashboard {
    server 127.0.0.1:8081;
    keepalive 8;
}
```

### API Proxy
```nginx
location /api/ {
    limit_req zone=api_limit burst=10 nodelay;
    proxy_pass http://traefik_proxy;
    # Headers...
}
```

### Dashboard Proxy
```nginx
location /traefik/ {
    allow 127.0.0.1;
    deny all;
    proxy_pass http://traefik_dashboard/;
    # Headers...
}
```

## Troubleshooting

### Traefik não inicia
```bash
# Verificar configuração
traefik --configFile=/etc/traefik/traefik.yml --validate

# Ver logs de inicialização
journalctl -u traefik -n 50

# Verificar portas
netstat -tlnp | grep -E '8080|8081'
```

### Rotas não funcionam (404)
```bash
# Ver routers ativos
curl -u admin:saraiva2025 http://localhost:8081/api/http/routers | jq

# Ver services ativos
curl -u admin:saraiva2025 http://localhost:8081/api/http/services | jq

# Verificar health checks
tail -20 /var/log/traefik/traefik.log | grep health
```

### Backend não responde
```bash
# Verificar se backends estão rodando
curl http://localhost:3001/api/health  # API direto
pm2 list                                # PM2 status
systemctl status saraiva-api           # Systemd (se usar)

# Ver logs de conexão
tail -f /var/log/traefik/traefik.log | grep 'dial tcp'
```

### Dashboard não autoriza
```bash
# Gerar nova senha
htpasswd -nbB admin nova_senha

# Atualizar em /etc/traefik/dynamic/services.yml
# Seção: middlewares.dashboard-auth.basicAuth.users

# Restart traefik
systemctl restart traefik
```

## Performance Tuning

### Connection Pooling
- **Nginx → Traefik**: keepalive 64 connections
- **Traefik → Backends**: Load balancer with health checks

### Rate Limiting
- **Contact Form**: 5 req/min per IP (Nginx)
- **General API**: 30 req/min per IP (Nginx) + 100 req/min (Traefik)
- **Webhooks**: 10 req/min (Nginx + Traefik)

### Health Checks
- **API Backend**: Every 10s, 5s timeout
- **Webhook Receiver**: Every 30s, 5s timeout
- **Failed checks**: Remove from load balancer pool

## Security

### Authentication
- **Dashboard**: HTTP Basic Auth with bcrypt password
- **Access Control**: Dashboard restricted to localhost in Nginx

### Headers
- All responses include security headers
- CSP configured in both Nginx and Traefik
- HSTS, X-Frame-Options, X-Content-Type-Options

### Rate Limiting
- Multiple layers: Nginx (IP-based) + Traefik (endpoint-based)
- Burst capacity for legitimate spikes
- 429 responses for exceeded limits

### Logging
- All requests logged with structured JSON
- Sensitive headers (Authorization) dropped from logs
- Access logs rotated daily (max 7 days, max 100MB)

## Maintenance

### Log Rotation
**Config**: `/etc/logrotate.d/traefik` (auto-created by systemd)

```bash
/var/log/traefik/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        systemctl reload traefik > /dev/null 2>&1 || true
    endscript
}
```

### Updates
```bash
# Download new version
wget https://github.com/traefik/traefik/releases/download/vX.Y.Z/traefik_vX.Y.Z_linux_amd64.tar.gz

# Stop service
systemctl stop traefik

# Backup current
cp /usr/local/bin/traefik /usr/local/bin/traefik.backup

# Install new
tar -xzf traefik_vX.Y.Z_linux_amd64.tar.gz
chmod +x traefik
mv traefik /usr/local/bin/

# Test config
traefik --configFile=/etc/traefik/traefik.yml --validate

# Start service
systemctl start traefik
```

### Backup Configuration
```bash
# Backup configs
tar -czf traefik-config-$(date +%Y%m%d).tar.gz \
    /etc/traefik/ \
    /etc/systemd/system/traefik.service

# Restore
tar -xzf traefik-config-YYYYMMDD.tar.gz -C /
systemctl daemon-reload
systemctl restart traefik
```

## References

- **Traefik Docs**: https://doc.traefik.io/traefik/
- **Health Checks**: https://doc.traefik.io/traefik/routing/services/#health-check
- **Middlewares**: https://doc.traefik.io/traefik/middlewares/overview/
- **Metrics**: https://doc.traefik.io/traefik/observability/metrics/overview/
- **Access Logs**: https://doc.traefik.io/traefik/observability/access-logs/

---

**Última atualização**: 2025-10-08
**Implementado por**: Claude Code
**Versão**: 1.0.0
