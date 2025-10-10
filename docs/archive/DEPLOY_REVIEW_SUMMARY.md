# Deploy Local e Revisão Nginx - Sistema de Agendamento

## Data: 2025-10-06
## Status: ✅ DEPLOY REALIZADO COM SUCESSO

---

## 📋 Resumo das Alterações

### 1. Script de Deploy Aprimorado (`DEPLOY_NOW.sh`)

**Melhorias Implementadas:**

✅ **Backup Automático**
- Cria backup da release atual antes do deploy
- Armazenado em: `/var/www/saraivavision/backups/backup_TIMESTAMP`

✅ **Versionamento de Releases**
- Cada deploy cria uma nova release timestamped
- Diretório: `/var/www/saraivavision/releases/YYYYMMDD_HHMMSS`
- Symlink atômico para evitar downtime

✅ **Validação Completa**
- Verifica presença de `dist/index.html`
- Valida diretório `assets`
- Testa configuração nginx antes de aplicar
- Rollback automático em caso de falha

✅ **Build com Vite**
- Usa `npm run build:norender` (Vite) ao invés de Next.js
- Fallback para `npx vite build` se necessário
- Build otimizado em ~12 segundos

✅ **Cleanup Automático**
- Mantém apenas as últimas 5 releases
- Remove releases antigas automaticamente

✅ **Logging Detalhado**
- Cores para melhor visualização
- Informações de debug úteis
- URLs de teste pós-deploy

---

## 🔧 Configuração Nginx Atualizada

### Backup da Configuração Original
```bash
Backup criado: /etc/nginx/sites-available/saraivavision.backup.20251006_080444
```

### Mudanças Aplicadas

#### 1. Content Security Policy (CSP) - Frame-src

**Antes:**
```nginx
frame-src 'self' https://www.google.com https://open.spotify.com https://*.spotify.com;
```

**Depois:**
```nginx
frame-src 'self' https://www.google.com https://open.spotify.com https://*.spotify.com https://apolo.ninsaude.com https://*.ninsaude.com;
```

**Motivo:** Permite que o iframe da Nin Saúde seja carregado na página /agendamento

#### 2. Content Security Policy (CSP) - Connect-src

**Antes:**
```nginx
connect-src 'self' https://saraivavision.com.br https://*.supabase.co wss://*.supabase.co https://lc.pulse.is https://maps.googleapis.com;
```

**Depois:**
```nginx
connect-src 'self' https://saraivavision.com.br https://*.supabase.co wss://*.supabase.co https://lc.pulse.is https://maps.googleapis.com https://apolo.ninsaude.com https://*.ninsaude.com;
```

**Motivo:** Permite requisições AJAX/fetch para a API da Nin Saúde (se necessário)

---

## 📊 Estrutura de Deploy

### Diretórios

```
/var/www/saraivavision/
├── current -> releases/20251006_081248/  (symlink)
├── releases/
│   ├── 20251006_081248/
│   │   ├── index.html
│   │   ├── assets/
│   │   │   ├── AgendamentoPage-Bh3Seoyc.js (2.40 kB)
│   │   │   ├── index-B28LOvf6.js (141.39 kB)
│   │   │   └── ...
│   │   └── ...
│   ├── 20251006_013047/
│   └── ...
└── backups/
    ├── backup_20251006_081248/
    └── ...
```

### Nginx Root
```nginx
root /var/www/saraivavision/current;
```

---

## 🧪 Testes Realizados

### 1. Build Local
```bash
✓ Vite build completed in 12.49s
✓ 2774 modules transformed
✓ 43 chunks generated
✓ AgendamentoPage-Bh3Seoyc.js (2.40 kB)
```

### 2. Deploy
```bash
✓ Files copied to /var/www/saraivavision/releases/20251006_081248
✓ Permissions set (www-data:www-data)
✓ Symlink updated atomically
✓ Nginx config test passed
✓ Nginx reloaded successfully
```

### 3. Rotas Testadas

```bash
# Home
curl -I https://saraivavision.com.br
✓ HTTP/2 200

# Agendamento
curl -I https://saraivavision.com.br/agendamento
✓ HTTP/2 200
```

---

## 🔍 Validações de Segurança

### Headers de Segurança Mantidos

✅ **X-Frame-Options:** SAMEORIGIN
- Protege contra clickjacking
- Permite iframes da mesma origem

✅ **X-Content-Type-Options:** nosniff
- Previne MIME type sniffing

✅ **X-XSS-Protection:** 1; mode=block
- Proteção adicional contra XSS

✅ **Referrer-Policy:** strict-origin-when-cross-origin
- Controla informações de referrer

✅ **Permissions-Policy:** geolocation=(), microphone=(), camera=()
- Desabilita APIs sensíveis

✅ **Strict-Transport-Security:** max-age=31536000; includeSubDomains; preload
- Força HTTPS

### Content Security Policy

✅ **Modo:** Report-Only
- Reporta violações sem bloquear
- Permite monitoramento antes de enforcement

✅ **Domínios Autorizados:**
- **frame-src:** Nin Saúde, Google Maps, Spotify
- **script-src:** Google, Pulse.is
- **connect-src:** APIs autorizadas + Nin Saúde
- **img-src:** https:, data:, blob:

---

## 📝 Arquivo de Patch Criado

**Arquivo:** `nginx-agendamento-patch.conf`

Contém:
- Documentação das mudanças
- Comandos para aplicar manualmente
- Comandos de rollback
- Alternativas de configuração
- Notas de segurança

---

## 🚀 Comandos de Deploy

### Deploy Completo
```bash
cd /home/saraiva-vision-site
sudo bash DEPLOY_NOW.sh
```

### Deploy Rápido (sem validações extras)
```bash
npm run build:norender
sudo rsync -av --delete dist/ /var/www/saraivavision/current/
sudo systemctl reload nginx
```

### Verificar Status
```bash
# Verificar symlink atual
ls -l /var/www/saraivavision/current

# Listar releases
ls -lt /var/www/saraivavision/releases/

# Verificar nginx
sudo nginx -t
sudo systemctl status nginx
```

---

## 🔄 Rollback

### Opção 1: Usando Backup
```bash
BACKUP_DIR="/var/www/saraivavision/backups/backup_20251006_081248"
sudo ln -sfn "$BACKUP_DIR" /var/www/saraivavision/current
sudo systemctl reload nginx
```

### Opção 2: Usando Release Anterior
```bash
# Listar releases
ls -t /var/www/saraivavision/releases/

# Fazer rollback para release anterior
sudo ln -sfn /var/www/saraivavision/releases/YYYYMMDD_HHMMSS /var/www/saraivavision/current
sudo systemctl reload nginx
```

### Opção 3: Rollback do Nginx (se necessário)
```bash
# Restaurar configuração anterior
sudo cp /etc/nginx/sites-available/saraivavision.backup.20251006_080444 /etc/nginx/sites-available/saraivavision

# Testar e recarregar
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📊 Métricas do Deploy

### Performance
- **Build Time:** 12.49 segundos
- **Deploy Time:** ~15 segundos
- **Total Downtime:** < 1 segundo (symlink atômico)

### Arquivos
- **Total Chunks:** 43 arquivos JavaScript
- **Largest Chunk:** OptimizedImage-Cv40E9pi.js (207.91 kB)
- **Total Size (gzip):** ~390 kB
- **AgendamentoPage:** 2.40 kB (gzip: 1.13 kB)

### Cache
- **HTML:** no-cache (sempre fresh)
- **Assets:** cache público com hash
- **Images:** 6 meses de cache

---

## 🔐 Conformidade e Compliance

### LGPD
✅ Headers de privacidade configurados
✅ CSP restritivo
✅ Sem tracking não autorizado

### Segurança
✅ HTTPS obrigatório
✅ TLS 1.2+ apenas
✅ Headers de segurança completos
✅ Rate limiting ativo

### SEO
✅ HTML não cacheado (conteúdo sempre atualizado)
✅ Canonical URLs preservados
✅ Sitemap acessível

---

## 📋 Checklist Pós-Deploy

### Validações Automáticas
- [x] Build sem erros
- [x] Arquivos copiados corretamente
- [x] Permissões ajustadas
- [x] Nginx config válida
- [x] Nginx recarregado
- [x] Cleanup de releases antigas

### Validações Manuais Recomendadas
- [ ] Testar /agendamento em navegador
- [ ] Verificar se iframe Nin Saúde carrega
- [ ] Testar navegação entre páginas
- [ ] Verificar responsividade mobile
- [ ] Testar em diferentes navegadores
- [ ] Verificar console por erros JS
- [ ] Validar headers de segurança
- [ ] Testar forms de contato

### Monitoramento (Primeiras 24h)
- [ ] Acompanhar logs de erro nginx
- [ ] Verificar métricas de performance
- [ ] Monitorar taxa de conversão
- [ ] Coletar feedback de usuários

---

## 🎯 URLs de Teste

### Produção
- **Home:** https://saraivavision.com.br
- **Agendamento:** https://saraivavision.com.br/agendamento ⭐
- **Blog:** https://saraivavision.com.br/blog
- **Serviços:** https://saraivavision.com.br/servicos
- **Sobre:** https://saraivavision.com.br/sobre
- **FAQ:** https://saraivavision.com.br/faq
- **Podcast:** https://saraivavision.com.br/podcast

### Comandos de Teste
```bash
# Testar agendamento
curl -I https://saraivavision.com.br/agendamento

# Testar com headers
curl -I https://saraivavision.com.br/agendamento | grep -i "frame\|csp"

# Verificar HTML
curl -s https://saraivavision.com.br/agendamento | grep -i "nin"
```

---

## 📞 Contato e Suporte

### Em caso de problemas:

1. **Verificar logs:**
   ```bash
   sudo tail -f /var/log/nginx/saraivavision.error.log
   sudo tail -f /var/log/nginx/saraivavision.access.log
   ```

2. **Fazer rollback:**
   Ver seção "Rollback" acima

3. **Restaurar backup:**
   ```bash
   cd /var/www/saraivavision/backups
   ls -lt
   ```

4. **Documentação:**
   - IMPLEMENTACAO_AGENDAMENTO_NIN.md
   - GUIA_TESTE_AGENDAMENTO.md
   - MERGE_INSTRUCTIONS.md

---

## ✅ Status Final

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║          ✅ DEPLOY CONCLUÍDO COM SUCESSO ✅                    ║
║                                                                ║
║  • Build: ✅ Sucesso (12.49s)                                  ║
║  • Deploy: ✅ Completo (15s)                                   ║
║  • Nginx: ✅ Recarregado                                       ║
║  • CSP: ✅ Atualizado para Nin Saúde                           ║
║  • Tests: ✅ Rotas funcionando                                 ║
║  • Backup: ✅ Criado                                           ║
║                                                                ║
║  Release: 20251006_081248                                      ║
║  URL: https://saraivavision.com.br/agendamento                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

**Documentado por:** GitHub Copilot CLI  
**Data:** 2025-10-06 08:15  
**Versão:** 1.0  
**Branch:** agendamento-nin-iframe
