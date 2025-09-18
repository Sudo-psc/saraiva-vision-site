# 🐳 Docker Deployment - Saraiva Vision

Este documento descreve como usar a implementação Docker para desenvolvimento e produção da Clínica Saraiva Vision.

## 🚀 Quick Start

### Desenvolvimento
```bash
# Build das imagens
npm run docker:build:dev

# Deploy completo com hot reload
npm run docker:deploy:dev

# Ou usar docker compose diretamente
npm run docker:up:dev
```

### Produção
```bash
# Build otimizado para produção
npm run docker:build:prod

# Deploy de produção
npm run docker:deploy:prod

# Ou usar docker compose diretamente
npm run docker:up:prod
```

## 📁 Estrutura Docker

```
infra/docker/
├── frontend/Dockerfile           # Multi-stage: build + nginx
├── backend/Dockerfile            # Node.js API com health checks
└── nginx/                       # Proxy reverso e load balancer
    ├── Dockerfile
    ├── default.conf             # Config frontend
    ├── nginx.conf               # Config principal  
    ├── proxy.conf               # Config proxy
    ├── security-headers.conf    # Headers médicos
    └── ssl.conf                 # SSL/TLS config

docker-compose.yml               # Config principal
docker-compose.dev.yml          # Override desenvolvimento
docker-compose.prod.yml         # Override produção
.dockerignore                   # Otimização build context
```

## 🔧 Configuração por Ambiente

### Desenvolvimento (`dev` profile)
- **Frontend**: Vite dev server (porta 5173) com hot reload
- **Backend**: Node.js (porta 3001) com auto-reload
- **WordPress**: CMS para desenvolvimento (porta 8083)
- **Nginx**: Desabilitado (acesso direto aos serviços)

### Produção (`prod` profile)
- **Frontend**: Build otimizado servido pelo Nginx
- **Backend**: Node.js production (porta 3001)  
- **Nginx**: Proxy reverso (portas 80/443) com SSL
- **WordPress**: Desabilitado

## 🛠️ Comandos Principais

### Build
```bash
npm run docker:build          # Build ambiente dev (padrão)
npm run docker:build:dev      # Build desenvolvimento
npm run docker:build:prod     # Build produção
```

### Deploy  
```bash
npm run docker:deploy         # Deploy dev (padrão)
npm run docker:deploy:dev     # Deploy desenvolvimento
npm run docker:deploy:prod    # Deploy produção
```

### Gerenciamento
```bash
npm run docker:up:dev         # Subir desenvolvimento
npm run docker:up:prod        # Subir produção
npm run docker:down           # Parar todos os containers
npm run docker:logs           # Ver logs em tempo real
```

### Docker Compose Manual
```bash
# Desenvolvimento
docker compose --profile dev up -d

# Produção  
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d

# Parar
docker compose down
```

## 🔍 Monitoramento e Health Checks

### Endpoints de Saúde
- **Frontend**: `GET /health` → `200 "healthy"`
- **Backend**: `GET /health` → `{"status": "healthy", "uptime": 123}`
- **Nginx**: `GET /health` → `200 "healthy"`

### Verificação Manual
```bash
# Backend direto
curl http://localhost:3001/health

# Através do proxy (produção)
curl http://localhost/health
curl http://localhost/api/health
```

### Logs
```bash
# Todos os serviços
docker compose logs -f

# Serviço específico
docker compose logs -f frontend
docker compose logs -f backend  
docker compose logs -f nginx
```

## 🌐 URLs de Acesso

### Desenvolvimento
- **Frontend (HMR)**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **WordPress CMS**: http://localhost:8083
- **Health Checks**: http://localhost:3001/health

### Produção
- **Website**: http://localhost (proxy nginx)
- **API**: http://localhost/api
- **Health Check**: http://localhost/health

## 🔒 Configurações de Segurança

### Headers Médicos (OWASP)
- Content Security Policy (CSP) otimizada para clínicas
- X-XSS-Protection, X-Frame-Options, X-Content-Type-Options
- Referrer-Policy para privacidade do paciente
- Permissions-Policy para recursos sensíveis

### Rate Limiting
- API geral: 10 requests/segundo
- Formulário contato: 2 requests/minuto
- Proteção DDoS configurada

### SSL/TLS (Produção)
- TLS 1.2+ obrigatório
- Ciphers modernos e seguros
- HSTS habilitado
- OCSP Stapling configurado

## 🚨 Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker compose logs nome-do-servico

# Verificar recursos
docker stats

# Verificar rede
docker network ls
docker network inspect saraiva_network
```

### Build falha
```bash
# Limpar cache Docker
docker system prune -a

# Rebuild sem cache
docker compose build --no-cache

# Verificar .dockerignore
cat .dockerignore
```

### Health check falha
```bash
# Testar endpoints manualmente
curl -f http://localhost:3001/health
curl -f http://localhost/health

# Verificar configuração nginx
docker exec -it saraiva-nginx nginx -t
```

### Performance
```bash
# Monitorar recursos
docker stats

# Verificar imagem sizes
docker images | grep saraiva

# Profile de performance
docker exec -it saraiva-backend node --prof server.js
```

## 🔄 Backup e Rollback

### Backup Automático
O script `docker-deploy.sh` cria backup automático antes de cada deployment:
```bash
backup/docker-YYYYMMDD_HHMMSS/
└── containers.json    # Estado anterior
```

### Rollback Manual
```bash
# Parar deployment atual
docker compose down

# Restaurar versão anterior
docker compose up -d --scale frontend=0
# Aguardar confirmação
docker compose up -d
```

## 📊 Métricas e Observabilidade

### Container Metrics
```bash
# Uso de recursos
docker stats --no-stream

# Disk usage
docker system df
```

### Application Metrics
- Logs estruturados via stdout
- Health checks com uptime
- Rate limiting metrics nos logs nginx

### Próximos Passos
- [ ] Prometheus + Grafana para métricas
- [ ] ELK Stack para logs centralizados  
- [ ] Jaeger para distributed tracing

## 💡 Dicas de Performance

### Build Otimization
- Usar .dockerignore para reduzir contexto
- Multi-stage builds para imagens menores
- Layer caching otimizado
- BuildKit habilitado por padrão

### Runtime Optimization  
- Resource limits configurados
- Health checks com timeouts adequados
- Nginx caching configurado
- Compressão gzip/brotli ativa

### Development Workflow
- Hot reload apenas em development
- Volumes mínimos em produção
- Environment-specific overrides
- Health checks mais permissivos em dev

## 📞 Suporte

Para problemas específicos da implementação Docker:

1. Verificar logs: `npm run docker:logs`
2. Health checks: `curl http://localhost/health`
3. Rebuild limpo: `docker system prune -a && npm run docker:build:prod`
4. Consultar documentação: `DEPLOY_DOCKER_PLAN.md`

---

**Clínica Saraiva Vision** - Deploy containerizado para máxima confiabilidade médica.