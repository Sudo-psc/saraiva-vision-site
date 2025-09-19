# Containerização Revisada – Clínica Saraiva Vision (Caratinga, MG)

## ANALISE
- Inventário da pilha existente (`docker-compose.yml`, `docker-compose.wordpress.yml`, `Dockerfile.*`, `nginx.conf`).
- Identificação de múltiplos arquivos legados, ausência de separação clara entre dev/prod e uso simultâneo de Nginx interno em serviços.
- Avaliação de requisitos funcionais: proxy reverso central, React/Vite com hot reload, API Node.js, WordPress com PHP-FPM, SSL futuro e observabilidade.

## IDENTIFIQUE
- Nginx antigo com regras redundantes, sem integração com PHP-FPM dedicado e sem logs estruturados.
- WordPress rodando em imagem Apache, sem tuning de PHP-FPM, sem healthcheck e sem bloqueios de segurança (xmlrpc, rate limit).
- Compose monolítico com dependências difusas, sem redes separadas, sem volumes de logs externos e sem profiles/overrides para desenvolvimento.
- Falta de preparação para TLS futuro e ausência de scripts de auto-reload em dev.

## PLANEJE
1. Criar arquitetura base com redes `edge` (exposição) e `backend` (serviços internos).
2. Consolidar serviços em `docker-compose.yml` (produção) + `docker-compose.dev.yml` (desenvolvimento) reutilizando Dockerfiles existentes.
3. Reescrever Dockerfile/stack Nginx com templates, auto-reload opcional, logs estruturados, gzip/brotli e upstreams dinâmicos.
4. Substituir WordPress Apache por PHP-FPM customizado (`Dockerfile.wordpress`) com limites de memória/upload, pool ajustado e slowlog.
5. Adicionar healthchecks consistentes (Nginx, Frontend, API, PHP-FPM, MySQL) e logging persistente.
6. Documentar fluxo e ressaltar governança (@codex para dúvidas, @coderabbit para revisão).

## EXECUTE
- `docker-compose.yml` reformulado com serviços `nginx`, `frontend`, `api`, `cms`, `db`, redes dedicadas, variáveis e volumes persistentes (logs, certs). Inclui imagens nomeadas, healthchecks HTTP e dependências condicionais.
- `docker-compose.dev.yml` criado como override para hot reload (montagem de código, auto-reload do Nginx, Node com `--watch --inspect`).
- Novo bundle Nginx (`Dockerfile.nginx`, `infra/nginx/**`, certificado autoassinado) com entrypoint que renderiza templates via `envsubst`, valida config e ativa `inotifywait` em desenvolvimento.
- Configuração modular (`snippets/security-headers.conf`, `snippets/no-cache.conf`, `snippets/app-locations.conf`) cobrindo cache de estáticos, proxy `/api`, `/cms`, `/wp-admin`, bloqueios a `xmlrpc`, rate limit, headers de segurança e servidor dedicado em :8080.
- WordPress refeito via `Dockerfile.wordpress` (PHP 8.3 FPM), healthcheck `cgi-fcgi`, parâmetros `pm.*`, `slowlog`, `opcache`, limites de upload/memória (`infra/php/**`).
- Volume de logs exposto em `./logs/nginx`, criação de certificados default (`infra/nginx/certs/tls.{crt,key}`) e diretório Let’s Encrypt para futura automação.
- Ajustes menores: healthchecks com `curl`, variáveis `WORDPRESS_URL`/`WP_SITEURL`, instalação de `gettext` e `brotli`.

## VERIFIQUE
- Tentativa de `docker compose config` bloqueada (Docker indisponível no ambiente CI), registrada para execução local.
- Validação estática via `nginx -t` integrada no entrypoint (executada automaticamente ao subir containers).

## DOCUMENTE
- Produção: `docker compose up -d` (ou `docker compose --profile prod up -d` se desejado); logs em `./logs/nginx`. Substituir `WORDPRESS_DB_*`/`WORDPRESS_CONFIG_EXTRA` conforme domínio real e montar certificados válidos em `infra/nginx/certs`.
- Desenvolvimento: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` habilita hot reload (Vite em :3002, API em :3001, WordPress admin direto em :8080). Nginx recarrega automaticamente ao salvar configs.
- Observabilidade: health endpoints (`/healthz`, `/api/health`, `php-fpm ping`, MySQL `mysqladmin ping`), slowlog em `logs/php-fpm/slow.log`, access logs JSON para ingestão futura.
- Escalonamento: ajustar `pm.max_children`/`pm.max_requests` e caches conforme picos de agendamento e uploads (exames oftalmológicos).
- Dúvidas adicionais devem ser encaminhadas a **@codex**; revisão de código recomendada com **@coderabbit**.
