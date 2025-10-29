# Monit Web Interface - Correção Aplicada

**Data**: 2025-10-29  
**Status**: ✅ Resolvido

## Problema
A interface web do Monit em `https://saraivavision.com.br/monit/` retornava erro 404 (página não encontrada do React).

## Causa Raiz
O arquivo `/etc/nginx/sites-enabled/saraivavision` era um arquivo regular desatualizado (24/10/2025), não um symlink para `/etc/nginx/sites-available/saraivavision`. Todas as alterações de configuração (incluindo o bloco `location ^~ /monit/`) estavam sendo aplicadas no `sites-available`, mas o Nginx carregava a versão antiga do `sites-enabled`.

## Solução Aplicada

1. **Sincronização dos arquivos**:
   ```bash
   cat /etc/nginx/sites-available/saraivavision > /etc/nginx/sites-enabled/saraivavision
   ```

2. **Remoção de duplicação**:
   - Removidas linhas 8-16 do `sites-enabled` (declaração duplicada de `proxy_cache_path`)
   - Esta configuração já existe em `/etc/nginx/nginx.conf:98`

3. **Configuração final do bloco Monit**:
   ```nginx
   location ^~ /monit/ {
       proxy_pass http://127.0.0.1:2812/;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       
       # Basic Auth handled by Monit itself
       proxy_set_header Authorization $http_authorization;
       proxy_pass_header Authorization;
       
       # Timeouts
       proxy_read_timeout 90s;
       proxy_connect_timeout 10s;
       
       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
   }
   ```

## Resultado
- ✅ Monit Web Interface acessível em `https://saraivavision.com.br/monit/`
- ✅ Autenticação Basic Auth funcional (usuário: `admin`)
- ✅ Dashboard exibindo 13 serviços monitorados
- ✅ Proxy reverso Nginx operacional com HTTP/2 401 (auth required)

## Credenciais
- **URL**: https://saraivavision.com.br/monit/
- **Usuário**: admin
- **Senha**: Psc451992*

## Backups Criados
- `/etc/nginx/sites-available/saraivavision.backup.20251029_144932`
- `/etc/nginx/sites-available/saraivavision.backup-debug`

## Lições Aprendidas
- Sempre verificar se `sites-enabled` é um symlink, não um arquivo regular
- O modificador `^~` garante prioridade sobre `location /` com `try_files`
- Testar configurações com headers customizados (`X-Monit-Proxy`) ajuda no debug
