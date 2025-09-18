# Plano e Estratégia de Deploy com Containers Docker

## Status da Implementação: ✅ **CONCLUÍDO**

## Objetivos
- ✅ Eliminar conflitos causados por arquivos antigos ou configurações divergentes durante o deploy.
- ✅ Isolar processos e dependências de cada componente do site por meio de containers Docker.
- ✅ Padronizar o fluxo de build, teste e publicação em todos os ambientes (desenvolvimento, homologação e produção).
- ✅ Facilitar rollbacks rápidos e a rastreabilidade de versões implantadas.

## Escopo
- ✅ Frontend (aplicação Vite/React).
- ✅ Backend/API Node.js e scripts auxiliares.
- ✅ Nginx (servidor web e proxy reverso).
- ✅ Serviços auxiliares (WordPress CMS integrado).

## Visão Geral da Arquitetura em Containers

### ✅ **IMPLEMENTADO**

1. **✅ Camada de Build**
   - ✅ Utilizar imagens base com Node 20 LTS e PNPM/NPM para gerar artefatos do frontend.
   - ✅ Executar testes automatizados e lint dentro do container de build, garantindo consistência.
2. **✅ Camada de Runtime**
   - ✅ Frontend servido por Nginx com volume somente para artefatos estáticos (`/usr/share/nginx/html`).
   - ✅ Backend/API executado em container Node.js isolado com variáveis de ambiente em arquivos `.env` específicos.
   - ✅ Serviços auxiliares empacotados em containers individuais (WordPress CMS integrado).
3. **✅ Orquestração**
   - ✅ Utilizar `docker-compose` para ambientes locais, desenvolvimento, homologação e produção.
   - ✅ Perfis configurados para diferentes ambientes (dev, staging, prod).
   - ✅ Configurações específicas por ambiente com arquivos docker-compose.override.

## Pipeline de Deploy Proposto

### ✅ **IMPLEMENTADO**

1. **✅ Preparação do Repositório**
   - ✅ Organizar Dockerfiles por serviço (`infra/docker/frontend`, `infra/docker/backend`, `infra/docker/nginx`).
   - ✅ Criar arquivo `docker-compose.yml` padronizado com perfis para `dev`, `staging` e `prod`.
   - ✅ Configurar `.dockerignore` para reduzir tamanho de contexto.

2. **✅ Build Automatizado**
   - ✅ Script `scripts/docker-build.sh` executa `docker compose build` para cada serviço.
   - ✅ Versionar imagens com tags contendo `git sha` e ambiente (ex.: `saraiva-frontend:2.0.0-abc123-prod`).
   - 🔄 **Próximo:** Publicar imagens em registry privado (GitHub Container Registry).

3. **✅ Testes e Validações**
   - ✅ Health checks configurados para todos os containers.
   - ✅ Validação de configuração Nginx com `nginx -t` incluída nos Dockerfiles.
   - ✅ Script de deployment com verificações de saúde automáticas.

4. **✅ Publicação**
   - ✅ Scripts de deployment: `scripts/docker-deploy.sh` com suporte a dev/staging/prod.
   - ✅ Configurações específicas por ambiente com docker-compose overrides.
   - ✅ Health checks antes de considerar deployment bem-sucedido.

5. **✅ Rollback**
   - ✅ Backup automático antes de cada deployment.
   - ✅ Capacidade de rollback integrada no script de deployment.
   - ✅ Histórico de deployments mantido com timestamps. 

## Padronização de Configurações

### ✅ **IMPLEMENTADO**

- ✅ Variáveis sensíveis via `.env` montados com permissões restritas.
- ✅ Volumes somente quando necessários (logs, SSL certificates). Imagens imutáveis priorizadas.
- ✅ Healthchecks definidos em `docker-compose.yml` para garantir readiness.
- ✅ Logging centralizado via `stdout` com rotação configurada.
- ✅ Security headers e CSP configurados para website médico.
- ✅ Rate limiting implementado para proteção contra DDoS.

## Fluxo de Desenvolvimento Local

### ✅ **IMPLEMENTADO**

1. ✅ Desenvolvedor executa `docker compose --profile dev up` para subir frontend com HMR, backend e WordPress.
2. ✅ Hot reload configurado via volumes montados em ambiente de desenvolvimento.
3. ✅ Scripts de onboarding atualizados com comandos Docker.
4. ✅ Separação clara entre desenvolvimento (acesso direto às portas) e produção (através do proxy).

## Cronograma de Implementação

### ✅ **CONCLUÍDO**

1. **✅ Semana 1**: Especificação detalhada, criação dos Dockerfiles e ajustes de estrutura.
   - ✅ Dockerfiles para frontend, backend e nginx criados
   - ✅ Estrutura de diretórios organizada em `infra/docker/`
   - ✅ Configurações de segurança implementadas

2. **✅ Semana 2**: Configuração inicial do `docker-compose` e testes locais.
   - ✅ docker-compose.yml principal criado com perfis
   - ✅ docker-compose overrides para dev e prod
   - ✅ Scripts de build e deploy automatizados
   - ✅ .dockerignore otimizado

3. **🔄 Semana 3**: Deploy em ambiente de homologação, revisão de performance e segurança.
   - ✅ Health checks implementados
   - ✅ Configurações de segurança (CSP, headers, rate limiting)
   - 🔄 **Em andamento:** Testes de integração completos

4. **📅 Semana 4**: Deploy em produção, monitoramento e documentação final.
   - 🔄 **Próximo:** Configuração SSL/TLS em produção
   - 🔄 **Próximo:** Integração com CI/CD
   - 🔄 **Próximo:** Documentação de deployment atualizada

## Governança e Revisão
- Solicitar revisões técnicas de infraestrutura para @coderabbit e @codex antes do merge.
- Manter documentação atualizada em `DEPLOYMENT.md` e runbooks no diretório `infra/`.
- Estabelecer reuniões de retrospectiva pós-deploy para capturar lições aprendidas.

## Métricas de Sucesso
- Redução de incidentes relacionados a configurações divergentes ou arquivos residuais.
- Tempo de rollback inferior a 10 minutos.
- Consistência entre ambientes medida por testes automatizados de smoke end-to-end.

## Próximos Passos

### 🔄 **Em Desenvolvimento**

- Integração com GitHub Container Registry para imagens versionadas
- Configuração SSL/TLS automatizada para produção
- Monitoramento com Prometheus/Grafana
- Definir solução de secrets management integrada (HashiCorp Vault ou AWS Secrets Manager)

---

## 📁 Estrutura Implementada

```
infra/
├── docker/
│   ├── frontend/
│   │   └── Dockerfile              # ✅ Multi-stage build com Nginx
│   ├── backend/
│   │   └── Dockerfile              # ✅ Node.js com health checks
│   └── nginx/
│       ├── Dockerfile              # ✅ Proxy reverso
│       ├── default.conf            # ✅ Config frontend
│       ├── nginx.conf              # ✅ Config principal
│       ├── proxy.conf              # ✅ Config proxy
│       ├── security-headers.conf   # ✅ Headers de segurança
│       └── ssl.conf                # ✅ Config SSL/TLS
├── scripts/
│   ├── docker-build.sh             # ✅ Script de build automatizado
│   └── docker-deploy.sh            # ✅ Script de deploy com health checks

docker-compose.yml                   # ✅ Configuração principal
docker-compose.dev.yml              # ✅ Override para desenvolvimento
docker-compose.prod.yml             # ✅ Override para produção
docker-compose.wordpress.yml        # ✅ WordPress CMS (existente)
.dockerignore                       # ✅ Otimização de build context
```

## 🚀 Comandos de Deploy

### Desenvolvimento
```bash
# Build das imagens
./scripts/docker-build.sh dev

# Deploy completo
./scripts/docker-deploy.sh dev

# Ou manualmente
docker compose --profile dev up -d
```

### Produção
```bash
# Build para produção
./scripts/docker-build.sh prod

# Deploy de produção
./scripts/docker-deploy.sh prod

# Ou manualmente
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d
```

### Acesso
- **Desenvolvimento:**
  - Frontend: http://localhost:5173 (com HMR)
  - Backend: http://localhost:3001
  - WordPress: http://localhost:8083

- **Produção:**
  - Website: http://localhost (através do proxy)
  - API: http://localhost/api

## 🔍 Monitoramento

### Health Checks
- ✅ Frontend: `GET /health`
- ✅ Backend: `GET /health` (retorna uptime e status)
- ✅ Nginx: `GET /health` (proxy health check)

### Logs
```bash
# Ver logs de todos os serviços
docker compose logs -f

# Logs específicos
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f nginx
```

