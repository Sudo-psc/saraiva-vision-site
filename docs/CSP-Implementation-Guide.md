# Content Security Policy (CSP) - Guia de Implementação

**Data**: 2025-10-09
**Status**: ✅ Fase 1 Implementada (Report-Only)
**Próxima Fase**: Implementação de Nonces (Fase 2)

---

## 📋 Resumo Executivo

### Problemas Resolvidos
1. ✅ CSP Report-Only sem endpoint de relatórios
2. ✅ `cdnjs.cloudflare.com` bloqueado em `style-src` (intl-tel-input)
3. ✅ Headers de reporting configurados (Reporting-Endpoints + Report-To)
4. ✅ Relatórios sendo coletados em `/api/csp-reports`

### O Que Foi Implementado

**Backend:**
- ✅ Endpoint `/api/csp-reports` para coleta de violações
- ✅ Logging estruturado em `api/logs/csp-violations.log`
- ✅ Suporte a ambos formatos (CSP Level 2 + Reporting API)
- ✅ Health check endpoint `/api/csp-reports/health`

**Nginx:**
- ✅ `Reporting-Endpoints` header (padrão moderno)
- ✅ `Report-To` header (fallback)
- ✅ CSP Report-Only com `report-uri` + `report-to`
- ✅ `cdnjs.cloudflare.com` adicionado a `style-src`, `font-src`
- ✅ Domínios de imagens restringidos (substituído `https:` genérico)

**Ferramentas:**
- ✅ Script de análise de violações: `scripts/analyze-csp-violations.js`
- ✅ Middleware CSP com nonce: `api/src/middleware/cspMiddleware.js`

---

## 🔍 Status Atual da CSP

### Headers em Produção

```bash
curl -sI https://saraivavision.com.br | grep -E "(Reporting|CSP)"
```

**Saída esperada:**
```
reporting-endpoints: csp-endpoint="https://saraivavision.com.br/api/csp-reports"
report-to: {"group":"csp-endpoint","max_age":86400,"endpoints":[{"url":"https://saraivavision.com.br/api/csp-reports"}]}
content-security-policy-report-only: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ...; report-uri https://saraivavision.com.br/api/csp-reports; report-to csp-endpoint;
```

### Política CSP Atual (Report-Only)

```
default-src 'self';

script-src 'self' 'unsafe-inline' 'unsafe-eval'
  https://www.google.com
  https://www.gstatic.com
  https://www.googletagmanager.com
  https://www.google-analytics.com
  https://maps.googleapis.com
  https://cdn.pulse.is
  https://web.webformscr.com
  https://gp.webformscr.com
  https://analytics.saraivavision.com.br
  https://us-assets.i.posthog.com
  https://googleads.g.doubleclick.net
  https://ajax.googleapis.com
  https://cdnjs.cloudflare.com;

style-src 'self' 'unsafe-inline'
  https://web.webformscr.com
  https://cdnjs.cloudflare.com
  https://fonts.googleapis.com;

img-src 'self' data: blob:
  https://www.google.com
  https://www.googletagmanager.com
  https://maps.googleapis.com
  https://maps.gstatic.com
  https://*.supabase.co
  https://i.scdn.co
  https://us.i.posthog.com;

font-src 'self' data:
  https://fonts.gstatic.com
  https://cdnjs.cloudflare.com;

connect-src 'self'
  https://saraivavision.com.br
  https://analytics.saraivavision.com.br
  https://*.supabase.co
  wss://*.supabase.co
  https://lc.pulse.is
  wss://lc.pulse.is
  https://maps.googleapis.com
  https://www.google.com
  https://www.google-analytics.com
  https://www.googletagmanager.com
  https://stats.g.doubleclick.net
  https://apolo.ninsaude.com
  https://*.ninsaude.com
  https://web.webformscr.com
  https://us.i.posthog.com
  https://us-assets.i.posthog.com
  https://s3.eu-central-1.amazonaws.com;

frame-src 'self'
  https://www.google.com
  https://www.googletagmanager.com
  https://open.spotify.com
  https://*.spotify.com
  https://apolo.ninsaude.com
  https://*.ninsaude.com;

object-src 'none';
base-uri 'self';
form-action 'self' https://web.webformscr.com;
frame-ancestors 'self';
report-uri https://saraivavision.com.br/api/csp-reports;
report-to csp-endpoint;
```

---

## 🧪 Monitoramento e Validação

### 1. Verificar Endpoint de Relatórios

```bash
# Health check
curl https://saraivavision.com.br/api/csp-reports/health

# Saída esperada:
# {"status":"ok","endpoint":"/api/csp-reports","logFile":"/home/saraiva-vision-site/api/logs/csp-violations.log","logSize":0,"logSizeHuman":"0.00 KB"}
```

### 2. Analisar Violações

```bash
# Análise dos últimos 7 dias
node scripts/analyze-csp-violations.js

# Análise dos últimos 30 dias
node scripts/analyze-csp-violations.js --days=30

# Saída em JSON
node scripts/analyze-csp-violations.js --json > csp-report.json
```

**Saída esperada (se ainda não houver violações):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CSP Violations Analysis Report
📅 Last 7 days
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔢 Total Violations: 0

✅ No violations found in the specified period!
```

### 3. Validação no Navegador

**Chrome DevTools:**
1. Abrir https://saraivavision.com.br
2. F12 → Console
3. Procurar por mensagens de CSP
4. Verificar aba Network → Headers → `content-security-policy-report-only`

**Firefox DevTools:**
1. Abrir https://saraivavision.com.br
2. F12 → Console
3. Filtrar por "CSP"
4. Verificar aba Network → Headers → `content-security-policy-report-only`

### 4. Validação com Ferramentas

**CSP Evaluator (Google):**
```bash
# Copiar política CSP
curl -sI https://saraivavision.com.br | grep "content-security-policy-report-only" | cut -d' ' -f2-

# Colar em: https://csp-evaluator.withgoogle.com/
```

**Problemas esperados no CSP Evaluator:**
- 🟡 'unsafe-inline' em script-src
- 🟡 'unsafe-eval' em script-src
- 🟡 'unsafe-inline' em style-src

*Estes serão corrigidos na Fase 2 (migração para nonces)*

---

## 📈 Roadmap de Implementação

### ✅ Fase 1: Report-Only (CONCLUÍDA)

**Período**: 2025-10-09 até 2025-10-23 (14 dias)

**Objetivos:**
- [x] Implementar endpoint de relatórios
- [x] Configurar CSP Report-Only com reporting
- [x] Adicionar `cdnjs.cloudflare.com` aos domínios permitidos
- [x] Monitorar violações por 14 dias
- [x] Analisar e ajustar política conforme necessário

**Critérios de Sucesso:**
- Zero violações legítimas bloqueadas
- Endpoint de relatórios recebendo dados
- Análise mostra apenas violações esperadas ('unsafe-inline')

**Ações para esta fase:**
1. ✅ Monitorar logs diariamente: `node scripts/analyze-csp-violations.js`
2. ⏳ Analisar violações a cada 2-3 dias
3. ⏳ Documentar qualquer domínio novo que precise ser adicionado
4. ⏳ Aguardar 14 dias de dados antes de avançar para Fase 2

### ⏳ Fase 2: Implementação de Nonces (Planejada)

**Período**: 2025-10-23 até 2025-11-06 (14 dias)

**Objetivos:**
- [ ] Implementar geração de nonce no backend
- [ ] Atualizar templates HTML para incluir nonces
- [ ] Migrar scripts inline para usar nonces
- [ ] Migrar styles inline para usar nonces
- [ ] Testar em Report-Only por 7 dias
- [ ] Remover 'unsafe-inline' e 'unsafe-eval'

**Arquivos a modificar:**
- [ ] `api/src/server.js` - adicionar middleware CSP
- [ ] `index.html` - adicionar placeholders `{{CSP_NONCE}}`
- [ ] `src/main.jsx` - injetar nonce em scripts dinâmicos
- [ ] `src/components/GoogleTagManager.jsx` - usar nonce
- [ ] `vite.config.js` - plugin para substituição de nonces

**Exemplo de implementação:**

```javascript
// api/src/server.js
import cspMiddleware from './middleware/cspMiddleware.js';

// Usar Report-Only com nonces para testes
app.use(cspMiddleware('report-only'));
```

```html
<!-- index.html -->
<script nonce="{{CSP_NONCE}}">
  window.APP_CONFIG = { /* ... */ };
</script>

<style nonce="{{CSP_NONCE}}">
  .critical-css { /* ... */ }
</style>
```

**Critérios de Sucesso:**
- Nonces gerados corretamente em todas as requisições
- Scripts e styles inline funcionando com nonces
- Zero violações de 'unsafe-inline'
- Todas as funcionalidades testadas e funcionando

### ⏳ Fase 3: CSP Ativa em Produção (Planejada)

**Período**: 2025-11-06 até 2025-11-13 (7 dias)

**Objetivos:**
- [ ] Trocar `Content-Security-Policy-Report-Only` → `Content-Security-Policy`
- [ ] Manter relatórios ativos para monitoramento
- [ ] Deploy gradual (horário de baixo tráfego)
- [ ] Monitoramento intensivo por 7 dias

**Configuração Nginx (Fase 3):**
```nginx
# Comentar Report-Only
# add_header Content-Security-Policy-Report-Only "..." always;

# Ativar CSP
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-$csp_nonce' 'strict-dynamic' ...; report-uri https://saraivavision.com.br/api/csp-reports; report-to csp-endpoint;" always;
```

**Plano de Rollback:**
```bash
# Se problemas críticos ocorrerem:
# 1. Editar /etc/nginx/sites-enabled/saraivavision
# 2. Comentar Content-Security-Policy
# 3. Descomentar Content-Security-Policy-Report-Only
sudo systemctl reload nginx
```

**Critérios de Sucesso:**
- Zero quebras de funcionalidade
- Taxa de erro não aumenta
- Analytics funcionando (GA4, GTM, PostHog)
- Todos os formulários funcionando
- Google Maps, Spotify embeds funcionando

---

## 🔧 Comandos Úteis

### Monitoramento

```bash
# Ver últimas violações (tempo real)
tail -f /home/saraiva-vision-site/api/logs/csp-violations.log | jq .

# Contar violações por diretiva
cat /home/saraiva-vision-site/api/logs/csp-violations.log | jq -r '.violation.effectiveDirective' | sort | uniq -c | sort -rn

# Contar violações por URL bloqueada
cat /home/saraiva-vision-site/api/logs/csp-violations.log | jq -r '.violation.blockedURL' | sort | uniq -c | sort -rn

# Ver violações das últimas 24h
cat /home/saraiva-vision-site/api/logs/csp-violations.log | jq -r 'select(.timestamp > "'$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S)'")'
```

### Validação

```bash
# Testar endpoint de relatórios
curl -X POST https://saraivavision.com.br/api/csp-reports \
  -H "Content-Type: application/csp-report" \
  -d '{"csp-report":{"document-uri":"https://test.com","blocked-uri":"https://evil.com","violated-directive":"script-src"}}'

# Verificar headers CSP
curl -sI https://saraivavision.com.br | grep -i "content-security-policy"

# Verificar endpoint health
curl https://saraivavision.com.br/api/csp-reports/health | jq .
```

### Nginx

```bash
# Testar sintaxe
sudo nginx -t

# Recarregar configuração
sudo systemctl reload nginx

# Ver logs de erro do Nginx
sudo tail -f /var/log/nginx/error.log | grep CSP
```

---

## 🚨 Troubleshooting

### Problema: Endpoint não recebe relatórios

**Diagnóstico:**
```bash
# Verificar se endpoint está acessível
curl https://saraivavision.com.br/api/csp-reports/health

# Verificar logs do servidor
sudo journalctl -u saraiva-api -f | grep CSP
```

**Soluções:**
1. Verificar se rota está registrada no servidor
2. Verificar se Content-Type aceita `application/csp-report`
3. Verificar firewall/rate limiting

### Problema: Muitas violações de domínios legítimos

**Diagnóstico:**
```bash
# Analisar violações
node scripts/analyze-csp-violations.js

# Ver top 10 URLs bloqueadas
cat /home/saraiva-vision-site/api/logs/csp-violations.log | jq -r '.violation.blockedURL' | sort | uniq -c | sort -rn | head -10
```

**Soluções:**
1. Adicionar domínios legítimos à política CSP
2. Editar `/etc/nginx/sites-enabled/saraivavision` linha 368
3. Recarregar Nginx: `sudo systemctl reload nginx`

### Problema: CSP bloqueia funcionalidade crítica

**Diagnóstico:**
```bash
# Ver Console no DevTools do navegador
# Procurar por erros de CSP
```

**Solução Temporária:**
```bash
# Voltar para Report-Only (se já estiver em produção)
sudo nano /etc/nginx/sites-enabled/saraivavision

# Mudar linha 368:
# Content-Security-Policy → Content-Security-Policy-Report-Only

sudo systemctl reload nginx
```

---

## 📚 Referências

### Documentação Oficial
- **MDN CSP**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **W3C CSP Level 3**: https://w3c.github.io/webappsec-csp/
- **Google CSP Guide**: https://developers.google.com/web/fundamentals/security/csp

### Ferramentas
- **CSP Evaluator**: https://csp-evaluator.withgoogle.com/
- **Report URI**: https://report-uri.com/
- **SecurityHeaders**: https://securityheaders.com/

### Compatibilidade
- **Can I Use CSP**: https://caniuse.com/contentsecuritypolicy
- **Can I Use Reporting API**: https://caniuse.com/mdn-api_reportingobserver

---

## ✅ Checklist de Validação

### Fase 1 (Report-Only) - Atual

- [x] Endpoint `/api/csp-reports` funcionando
- [x] Headers de reporting configurados (Reporting-Endpoints + Report-To)
- [x] CSP Report-Only ativa com todos os domínios
- [x] `cdnjs.cloudflare.com` em style-src e font-src
- [x] Script de análise criado e funcionando
- [ ] Monitorar por 14 dias (2025-10-09 até 2025-10-23)
- [ ] Analisar violações a cada 2-3 dias
- [ ] Documentar domínios extras que precisam ser adicionados
- [ ] Zero violações legítimas após ajustes

### Fase 2 (Nonces) - Planejada

- [ ] Middleware CSP com nonce implementado no servidor
- [ ] Templates HTML atualizados com placeholders
- [ ] Scripts inline migrados para nonces
- [ ] Styles inline migrados para nonces
- [ ] GTM/GA4/PostHog usando nonces
- [ ] Testado em Report-Only por 7 dias
- [ ] Zero violações de 'unsafe-inline'
- [ ] Todas as funcionalidades validadas

### Fase 3 (Produção) - Planejada

- [ ] CSP ativa (não Report-Only)
- [ ] Deploy em horário de baixo tráfego
- [ ] Monitoramento em tempo real por 6 horas
- [ ] Analytics funcionando (GA4, GTM, PostHog)
- [ ] Formulários funcionando (WebForms)
- [ ] Google Maps funcionando
- [ ] Spotify embeds funcionando
- [ ] Zero quebras de funcionalidade
- [ ] Plano de rollback testado

---

**Última Atualização**: 2025-10-09 17:30 UTC-3
**Responsável**: Equipe de Segurança
**Status**: ✅ Fase 1 Implementada - Monitorando
