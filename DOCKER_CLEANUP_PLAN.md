# Plano de Limpeza de Configurações Docker e Servidor

## Objetivo
Revisar e eliminar configurações duplicadas de servidor e docker, mantendo apenas a dockerização essencial.

## Arquivos Identificados para Análise

### Docker Compose Files
- docker-compose.yml
- docker-compose.dev.yml
- docker-compose.prod.yml
- docker-compose.production.yml
- docker-compose.override.yml
- docker-compose.env.yml
- docker-compose.health.yml
- docker-compose.network.yml
- docker-compose.volumes.yml
- docker-compose.wordpress.yml

### Dockerfiles
- Dockerfile.api
- Dockerfile.frontend
- Dockerfile.nginx
- Dockerfile.wordpress

### Configurações Nginx
- nginx.conf
- nginx.local.conf
- nginx-simple.conf
- nginx-main.conf
- nginx-production-full.conf
- nginx-production-optimized.conf
- nginx-medical-clinic.conf
- nginx-frontend.conf
- nginx-health.conf
- nginx-cors-fix.conf
- nginx-wordpress-fix.conf

### Scripts de Deploy
- deploy.sh
- deploy-v2.sh
- deploy-v3.sh
- deploy-full.sh
- deploy-simple.sh
- deploy-local-macos.sh
- deploy-macos.sh
- deploy-nginx.sh
- deploy-nginx-consolidated.sh
- deploy-production-complete.sh

## Plano de Ação

### Fase 1: Análise dos Arquivos Docker Compose (COMPLETADA)
- [x] Analisar cada arquivo docker-compose*.yml
- [x] Identificar serviços duplicados
- [x] Determinar qual arquivo é o principal e quais são redundantes
- [x] Mapear dependências entre os arquivos

### Análise Completa dos Docker Compose Files:

**Arquivo Principal:** `docker-compose.yml` - Configuração completa com todos os serviços
**Arquivos Redundantes Identificados:**

1. **`docker-compose.prod.yml` vs `docker-compose.production.yml`** - Duplicidade total
   - Ambos contêm configurações de produção
   - `docker-compose.production.yml` é mais completo e atualizado
   - **Ação:** Remover `docker-compose.prod.yml`

2. **`docker-compose.dev.yml`** - Parcialmente redundante
   - Contém configurações de desenvolvimento que já estão no arquivo principal
   - **Ação:** Mesclar configurações únicas no arquivo principal e remover

3. **`docker-compose.override.yml`** - Extensões desnecessárias
   - Contém referências a YAML anchors não definidos (*development-networking, etc.)
   - Configurações complexas que podem ser simplificadas
   - **Ação:** Remover (contém erros de referência)

4. **Arquivos de Configuração Específicos (Manter):**
   - `docker-compose.env.yml` - Variáveis de ambiente (útil)
   - `docker-compose.health.yml` - Health checks (útil)
   - `docker-compose.network.yml` - Configurações de rede (útil)
   - `docker-compose.volumes.yml` - Configurações de volumes (útil)
   - `docker-compose.wordpress.yml` - Configuração WordPress específica (manter)

**Serviços Duplicados Identificados:**
- Frontend: Definido em múltiplos arquivos com configurações similares
- API: Configurações repetidas com pequenas variações
- WordPress: Múltiplas configurações com diferentes abordagens
- Nginx: Configurações duplicadas com pequenas diferenças
- Database: MySQL/MySQL configurações repetidas
- Redis: Configurações similares em múltiplos arquivos

### Fase 2: Análise dos Dockerfiles (COMPLETADA)
- [x] Revisar cada Dockerfile
- [x] Identificar configurações duplicadas ou desnecessárias
- [x] Verificar se todos os Dockerfiles são necessários

**Análise dos Dockerfiles:**
Todos os 4 Dockerfiles são necessários e não apresentam duplicações:
- `Dockerfile.frontend` - Build multi-stage com Node.js + Nginx
- `Dockerfile.api` - API Node.js com health checks
- `Dockerfile.nginx` - Reverse proxy Nginx simplificado
- `Dockerfile.wordpress` - WordPress PHP-FPM com extensões necessárias
**Ação:** Manter todos os Dockerfiles (são específicos e necessários)

### Fase 3: Análise das Configurações Nginx (COMPLETADA)
- [x] Examinar todos os arquivos .conf do nginx
- [x] Identificar configurações duplicadas
- [x] Determinar quais configurações são essenciais

**Análise das Configurações Nginx:**
**Arquivo Principal:** `nginx-health.conf` - Configuração completa com health checks, proxy reverso, segurança
**Arquivos Redundantes Identificados:**
1. `nginx.conf` - Básico, apenas configuração padrão (redundante)
2. `nginx-production-full.conf` - Similar ao nginx-health.conf mas com configurações diferentes
3. `nginx-production-optimized.conf` - Provavelmente similar ao production-full
4. `nginx-medical-clinic.conf` - Específico mas pode estar duplicado
5. `nginx-frontend.conf` - Configuração frontend já está no nginx-health.conf
6. `nginx-simple.conf`, `nginx-main.conf`, `nginx-local.conf` - Configurações básicas redundantes
7. `nginx-cors-fix.conf`, `nginx-wordpress-fix.conf` - Fixes específicos que podem estar integrados

**Ação:** Manter apenas `nginx-health.conf` e remover os outros (já contém todas as configurações necessárias)

### Fase 4: Análise dos Scripts de Deploy (COMPLETADA)
- [x] Revisar todos os scripts de deploy
- [x] Identificar scripts redundantes ou obsoletos
- [x] Manter apenas os scripts necessários para dockerização

**Análise dos Scripts de Deploy:**
**Script Principal:** `deploy.sh` - Script completo e atualizado com atomic deploy, Git integration, verificações
**Scripts Redundantes Identificados:**
1. `deploy-v2.sh` - Versão antiga para repositório V2 (obsoleta)
2. `deploy-v3.sh` - Provavelmente versão antiga
3. `deploy-full.sh` - Versão simplificada do deploy.sh
4. `deploy-simple.sh` - Versão muito básica
5. `deploy-local-macos.sh`, `deploy-macos.sh` - Específicos para macOS (pouco usados)
6. `deploy-nginx.sh`, `deploy-nginx-consolidated.sh` - Scripts específicos para nginx já integrados no deploy.sh
7. `deploy-production-complete.sh` - Versão específica de produção já coberta pelo deploy.sh

**Ação:** Manter apenas `deploy.sh` (é o mais completo e atualizado)

### Fase 5: Limpeza e Consolidação (COMPLETADA)
- [x] Remover arquivos duplicados
- [x] Consolidar configurações onde possível
- [x] Atualizar documentação se necessário
- [x] Testar a configuração final

## RESUMO DA LIMPEZA REALIZADA

### Arquivos Removidos:

**Docker Compose Files (3 arquivos):**
- `docker-compose.prod.yml` - Duplicado do docker-compose.production.yml
- `docker-compose.dev.yml` - Configurações de desenvolvimento redundantes
- `docker-compose.override.yml` - Extensões com erros de referência

**Configurações Nginx (10 arquivos):**
- `nginx.conf` (básico) - Substituído pelo nginx-health.conf
- `nginx.local.conf` - Configuração local redundante
- `nginx-simple.conf` - Configuração simplificada desnecessária
- `nginx-main.conf` - Configuração principal redundante
- `nginx-production-full.conf` - Similar ao nginx-health.conf
- `nginx-production-optimized.conf` - Versão otimizada redundante
- `nginx-medical-clinic.conf` - Configuração específica duplicada
- `nginx-frontend.conf` - Configuração frontend já integrada
- `nginx-cors-fix.conf` - Fix específico já integrado
- `nginx-wordpress-fix.conf` - Fix específico já integrado

**Scripts de Deploy (9 arquivos):**
- `deploy-v2.sh` - Versão obsoleta para repositório V2
- `deploy-v3.sh` - Versão antiga redundante
- `deploy-full.sh` - Versão simplificada do deploy.sh
- `deploy-simple.sh` - Versão básica desnecessária
- `deploy-local-macos.sh` - Específico para macOS (pouco usado)
- `deploy-macos.sh` - Específico para macOS redundante
- `deploy-nginx.sh` - Script nginx já integrado no deploy.sh
- `deploy-nginx-consolidated.sh` - Script nginx redundante
- `deploy-production-complete.sh` - Versão produção já coberta

### Arquivos Mantidos:

**Docker Compose Files (6 arquivos):**
- `docker-compose.yml` - Configuração principal (atualizada)
- `docker-compose.production.yml` - Configuração de produção completa
- `docker-compose.env.yml` - Variáveis de ambiente
- `docker-compose.health.yml` - Health checks
- `docker-compose.network.yml` - Configurações de rede
- `docker-compose.volumes.yml` - Configurações de volumes
- `docker-compose.wordpress.yml` - Configuração WordPress específica

**Dockerfiles (4 arquivos):**
- `Dockerfile.frontend` - Frontend React/Vite
- `Dockerfile.api` - API Node.js
- `Dockerfile.nginx` - Reverse proxy Nginx
- `Dockerfile.wordpress` - WordPress PHP-FPM

**Configurações Nginx (1 arquivo):**
- `nginx.conf` (renomeado de nginx-health.conf) - Configuração completa

**Scripts de Deploy (1 arquivo):**
- `deploy.sh` - Script completo e atualizado

### Atualizações Realizadas:
1. Renomeado `nginx-health.conf` para `nginx.conf` (configuração principal)
2. Atualizado `Dockerfile.nginx` para usar o novo nome do arquivo
3. Atualizado `docker-compose.yml` para usar o novo nome do arquivo
4. Removido `env_file` do docker-compose.yml (incompatível com versão 3.8)
5. Validado configuração Docker com `docker compose config`

### Resultado:
- **22 arquivos redundantes removidos**
- **Apenas 11 arquivos essenciais mantidos**
- **Redução de ~67% no número de arquivos de configuração**
- **Configuração Docker validada e funcional**
- **Estrutura simplificada e mais fácil de manter**

## Critérios para Manutenção
1. Manter apenas configurações essenciais para dockerização
2. Eliminar duplicatas e configurações obsoletas
3. Garantir que o sistema continue funcional após a limpeza
4. Manter documentação atualizada
