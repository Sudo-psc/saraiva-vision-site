# Plano e Estratégia de Deploy com Containers Docker

## Objetivos
- Eliminar conflitos causados por arquivos antigos ou configurações divergentes durante o deploy.
- Isolar processos e dependências de cada componente do site por meio de containers Docker.
- Padronizar o fluxo de build, teste e publicação em todos os ambientes (desenvolvimento, homologação e produção).
- Facilitar rollbacks rápidos e a rastreabilidade de versões implantadas.

## Escopo
- Frontend (aplicação Vite/React).
- Backend/API Node.js e scripts auxiliares.
- Nginx (servidor web e proxy reverso).
- Serviços auxiliares (por exemplo, mock WordPress ou integrações legadas).

## Visão Geral da Arquitetura em Containers
1. **Camada de Build**
   - Utilizar imagens base com Node 20 LTS e PNPM/NPM para gerar artefatos do frontend.
   - Executar testes automatizados e lint dentro do container de build, garantindo consistência.
2. **Camada de Runtime**
   - Frontend servido por Nginx com volume somente para artefatos estáticos (`/usr/share/nginx/html`).
   - Backend/API executado em container Node.js isolado com variáveis de ambiente em arquivos `.env` específicos.
   - Serviços auxiliares empacotados em containers individuais ou compostos (ex.: docker-compose) conforme a necessidade.
3. **Orquestração**
   - Utilizar `docker-compose` para ambientes locais e de homologação.
   - Para produção, gerar manifests compatíveis com Docker Swarm ou Kubernetes caso necessário, mantendo paridade com o `docker-compose`.

## Pipeline de Deploy Proposto
1. **Preparação do Repositório**
   - Organizar Dockerfiles por serviço (`infra/docker/frontend`, `infra/docker/backend`, `infra/docker/nginx`, etc.).
   - Criar arquivo `docker-compose.yml` padronizado com perfis para `dev`, `staging` e `prod`.
   - Configurar `.dockerignore` para reduzir tamanho de contexto.

2. **Build Automatizado**
   - CI executa `docker compose build` para cada serviço.
   - Versionar imagens com tags contendo `git sha` e ambiente (ex.: `registry.example.com/site-frontend:sha-prod`).
   - Publicar imagens em registry privado (GitHub Container Registry ou AWS ECR).

3. **Testes e Validações**
   - Rodar suite de testes e lint dentro dos containers durante o pipeline.
   - Validar configuração Nginx com `nginx -t` dentro do container antes de publicar.

4. **Publicação**
   - Em homologação: `docker compose up -d` com imagens da tag `:sha-staging`.
   - Em produção: utilizar playbooks (Ansible) ou GitHub Actions com `docker stack deploy` (Swarm) ou `kubectl apply` (Kubernetes).
   - Executar migrações/backups antes de atualizar containers críticos.

5. **Rollback**
   - Manter histórico de imagens no registry.
   - Para incidentes, reverter para a tag anterior e reexecutar `docker compose up -d` ou `docker service update --image`. 

## Padronização de Configurações
- Variáveis sensíveis via `docker secrets` ou `.env` montados com permissões restritas.
- Volumes somente quando necessários (logs, uploads). Priorizar imagens imutáveis para eliminar resíduos de builds anteriores.
- Healthchecks definidos em `docker-compose.yml` para garantir readiness.
- Logging centralizado via `stdout` + stack ELK/EFK opcional.

## Fluxo de Desenvolvimento Local
1. Desenvolvedor executa `docker compose --profile dev up` para subir Nginx, frontend em modo HMR, backend e mocks.
2. Hot reload configurado via volumes montados apenas em ambiente local.
3. Scripts de onboarding atualizados em `README-LOCAL-DEPLOY.md` para refletir o uso de containers.

## Cronograma de Implementação
1. **Semana 1**: Especificação detalhada, criação dos Dockerfiles e ajustes de estrutura.
2. **Semana 2**: Configuração inicial do `docker-compose` e testes locais; ajustes de CI/CD.
3. **Semana 3**: Deploy em ambiente de homologação, revisão de performance e segurança.
4. **Semana 4**: Deploy em produção, monitoramento e documentação final.

## Governança e Revisão
- Solicitar revisões técnicas de infraestrutura para @coderabbit e @codex antes do merge.
- Manter documentação atualizada em `DEPLOYMENT.md` e runbooks no diretório `infra/`.
- Estabelecer reuniões de retrospectiva pós-deploy para capturar lições aprendidas.

## Métricas de Sucesso
- Redução de incidentes relacionados a configurações divergentes ou arquivos residuais.
- Tempo de rollback inferior a 10 minutos.
- Consistência entre ambientes medida por testes automatizados de smoke end-to-end.

## Próximos Passos
- Levantar requisitos específicos de infraestrutura (storage, rede, certificados).
- Definir solução de secrets management integrada (por exemplo, HashiCorp Vault ou AWS Secrets Manager).
- Planejar observabilidade (Prometheus/Grafana) acoplada aos containers.

