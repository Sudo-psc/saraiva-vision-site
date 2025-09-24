# Playbook de Debug para Nginx, APIs e Containers Docker

## 🎯 Introdução
**VOCÊ É** um **ENGENHEIRO(A) DE CONFIABILIDADE/DEVOPS** especialista em depuração de serviços web com Nginx (proxy/reverse proxy), APIs (REST/GraphQL) e orquestração em Docker/Docker Compose.

**Contexto**: "Preciso identificar rapidamente causas de falha, gargalos de performance e erros de configuração entre Nginx ⇄ API ⇄ Docker."

## 📋 Tarefa
Conduzir um **diagnóstico estruturado** do ambiente e produzir:
1. **Resumo executivo** (estado atual, impacto, suspeitas principais)
2. **Matriz de sintomas → hipóteses → evidências → ações**
3. **Passo a passo de correções propostas** com comandos e configs
4. **Lista de verificação** para validação pós-correção e prevenção

## 📝 Template de Entradas

```bash
# Preencher os placeholders conforme seu ambiente
HOST_OU_IP="{SEU_HOST_OU_IP}"
PORTAS="{SUAS_PORTAS}"
ENDPOINTS_CRITICOS="{SEUS_ENDPOINTS}"  # ex: /api/health, /status
CAMINHO_NGINX_CONF="{CAMINHO_NGINX}"   # ex: /etc/nginx/nginx.conf
CAMINHO_DOCKER_COMPOSE="{CAMINHO_COMPOSE}"
CAMINHO_ENV="{CAMINHO_ENV}"
SINTOMAS="{SEUS_SINTOMAS}"
MUDANCAS_RECENTES="{MUDANCAS_RECENTES}"
```

## 🔍 Processo de Investigação

### 0️⃣ Checagens Rápidas (Uptime e Alcance)

```bash
# Teste básico de conectividade
curl -I http://${HOST_OU_IP}:${PORTA}
curl -vkI https://${HOST_OU_IP}

# DNS e SSL
dig +short ${DOMINIO}
openssl s_client -connect ${HOST}:443 -servername ${HOST} </dev/null 2>/dev/null | openssl x509 -noout -dates -issuer -subject

# Teste com timing detalhado
curl -w "@curl-format.txt" -o /dev/null -s https://${HOST}/health
```

**Arquivo curl-format.txt:**
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

### 1️⃣ Nginx (Frontend)

#### Validação de Configuração
```bash
# Testar sintaxe
nginx -t

# Ver configuração ativa
nginx -T | grep -A 20 "server {"

# Recarregar configuração
nginx -s reload
```

#### Análise de Logs
```bash
# Logs de acesso (últimas 200 linhas)
tail -n 200 /var/log/nginx/access.log

# Logs de erro
tail -n 200 /var/log/nginx/error.log

# Monitoramento em tempo real
tail -f /var/log/nginx/error.log | grep -E "(error|warn|crit)"
```

#### Configuração Nginx Otimizada
```nginx
# /etc/nginx/sites-available/saraiva-vision
server {
    listen 80;
    listen [::]:80;
    server_name saraivavision.com.br www.saraivavision.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

    # Headers de Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy Settings
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Timeouts
    proxy_connect_timeout 5s;
    proxy_read_timeout 60s;
    proxy_send_timeout 60s;

    # Buffer Settings
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;

    # Client Settings
    client_max_body_size 20m;
    client_body_timeout 60s;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Static Files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # Main App
    location / {
        proxy_pass http://localhost:3000;
        try_files $uri $uri/ /index.html;
    }

    # Health Check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 2️⃣ Docker e Containers

#### Status dos Containers
```bash
# Listar containers
docker ps -a

# Logs de containers específicos
docker logs --tail=200 ${CONTAINER_NAME}
docker logs -f ${CONTAINER_NAME}

# Estatísticas de recursos
docker stats --no-stream

# Inspecionar container
docker inspect ${CONTAINER_NAME} | jq '.[]'
```

#### Docker Compose Otimizado
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    networks:
      - app-network

  api:
    build: ./api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
      - api
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### 3️⃣ API e Backend

#### Testes de API
```bash
# Health check
curl -v http://localhost:3001/health

# Teste com payload
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  http://localhost:3001/api/test

# Teste de performance
ab -n 100 -c 10 http://localhost:3001/api/endpoint
```

#### Monitoramento de Logs
```bash
# Logs da aplicação
docker logs api-container 2>&1 | grep -E "(error|Error|ERROR)"

# Logs estruturados
docker logs api-container 2>&1 | jq 'select(.level == "error")'
```

## 🔧 Matriz de Diagnóstico

| Sintoma | Hipótese | Evidência | Ação |
|---------|----------|-----------|------|
| 502 Bad Gateway | Container API down | `docker ps` mostra container parado | `docker-compose up -d api` |
| 504 Gateway Timeout | API lenta/travada | Logs mostram timeout | Aumentar `proxy_read_timeout` |
| 413 Request Entity Too Large | Body muito grande | Nginx error log | Aumentar `client_max_body_size` |
| SSL/TLS errors | Certificado expirado | `openssl` mostra data expirada | Renovar certificado |
| High CPU/Memory | Resource leak | `docker stats` mostra uso alto | Restart container, investigar código |

## 🚨 Comandos de Emergência

```bash
# Restart rápido de serviços
docker-compose restart nginx
docker-compose restart api
systemctl restart nginx

# Limpeza de recursos Docker
docker system prune -f
docker volume prune -f

# Backup de configuração antes de mudanças
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)

# Rollback rápido
docker-compose down && git checkout HEAD~1 && docker-compose up -d
```

## ✅ Checklist de Validação Pós-Correção

### Testes Funcionais
- [ ] `curl -I https://${HOST}` retorna 200
- [ ] `curl https://${HOST}/health` retorna status OK
- [ ] `curl https://${HOST}/api/health` retorna status OK
- [ ] SSL Labs test score A+ (https://www.ssllabs.com/ssltest/)

### Testes de Performance
- [ ] Tempo de resposta < 2s para página principal
- [ ] Tempo de resposta < 500ms para API health
- [ ] Load test com 100 requests simultâneas passa

### Monitoramento
- [ ] Logs não mostram erros nos últimos 10 minutos
- [ ] CPU usage < 80%
- [ ] Memory usage < 80%
- [ ] Disk usage < 90%

### Segurança
- [ ] Headers de segurança presentes
- [ ] Certificado SSL válido por > 30 dias
- [ ] Portas desnecessárias fechadas
- [ ] Logs de acesso não mostram tentativas de ataque

## 📊 Scripts de Monitoramento

### Script de Health Check
```bash
#!/bin/bash
# health-check.sh

ENDPOINTS=(
    "https://saraivavision.com.br"
    "https://saraivavision.com.br/health"
    "https://saraivavision.com.br/api/health"
)

for endpoint in "${ENDPOINTS[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")
    if [ "$status" -eq 200 ]; then
        echo "✅ $endpoint - OK ($status)"
    else
        echo "❌ $endpoint - FAIL ($status)"
    fi
done
```

### Script de Logs Consolidados
```bash
#!/bin/bash
# consolidated-logs.sh

echo "=== NGINX ERROR LOGS ==="
tail -n 50 /var/log/nginx/error.log

echo -e "\n=== DOCKER LOGS ==="
docker-compose logs --tail=50 api

echo -e "\n=== SYSTEM RESOURCES ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

## 🔄 Procedimento de Rollback

```bash
#!/bin/bash
# rollback.sh

echo "Iniciando rollback..."

# 1. Parar serviços
docker-compose down

# 2. Restaurar configuração
cp /etc/nginx/sites-available/default.backup.* /etc/nginx/sites-available/default

# 3. Restaurar código
git checkout HEAD~1

# 4. Reiniciar serviços
docker-compose up -d

# 5. Verificar saúde
sleep 30
./health-check.sh

echo "Rollback concluído!"
```

---

**Este playbook deve ser executado sistematicamente para identificar e resolver problemas rapidamente no ambiente Nginx + API + Docker da Saraiva Vision.**