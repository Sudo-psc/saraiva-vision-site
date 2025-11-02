# Relatório de Debug - Google Analytics e GTM
**Data:** 02/11/2025
**Autor:** Dr. Philipe Saraiva Cruz

## 🔍 Diagnóstico Realizado

### ✅ Configurações Corretas

1. **Variáveis de Ambiente**
   - `.env.production`: ✅ `VITE_GTM_ID=GTM-KF2NP85D`
   - `.env.production`: ✅ `VITE_GA_ID=G-LXWRK8ELS6`
   - `.env`: ✅ Adicionado agora

2. **CSP (Content Security Policy)**
   - ✅ Nginx permite todos os domínios Google necessários:
     - `script-src`: googletagmanager.com, google-analytics.com, gstatic.com
     - `connect-src`: google-analytics.com, googletagmanager.com
     - `img-src`: google-analytics.com, googletagmanager.com

3. **Proxies Nginx Anti-AdBlock**
   - ✅ `/gtm.js` → proxy para `www.googletagmanager.com/gtm.js`
   - ✅ `/ga.js` → proxy para `www.google-analytics.com/analytics.js`
   - ✅ Cache configurado (1h, background update)
   - ✅ CORS configurado

4. **Componente AnalyticsProxy**
   - ✅ Carrega via `App.jsx` (linha 62)
   - ✅ Tem fallback para carregamento direto
   - ✅ IDs corretos (GTM-KF2NP85D, G-LXWRK8ELS6)

---

## ❌ Problemas Identificados

### Problema 1: Rotas Incorretas no AnalyticsProxy

**Arquivo:** `src/components/AnalyticsProxy.jsx`

**Rotas usadas pelo código (ERRADAS):**
- `/t/gtm.js` ❌
- `/t/gtag.js` ❌
- `/t/collect` ❌
- `/t/ccm/collect` ❌

**Rotas disponíveis no Nginx (CORRETAS):**
- `/gtm.js` ✅
- `/ga.js` ✅

**Impacto:**
- Scripts de proxy falham (404)
- Fallback carrega scripts diretos do Google
- Proxy anti-adblock não funciona
- ~20% menos tracking (bloqueado por ad-blockers)

---

### Problema 2: Falta Proxy para gtag.js

**Nginx tem:**
- `/gtm.js` ✅ (Google Tag Manager)
- `/ga.js` ✅ (Google Analytics clássico)

**Nginx NÃO tem:**
- `/gtag.js` ❌ (Google Analytics 4 / gtag)
- `/collect` ❌ (Analytics collection endpoint)

**Solução:**
Adicionar proxies no Nginx ou usar endpoints da API do backend.

---

## 🔧 Soluções Propostas

### Opção 1: Atualizar AnalyticsProxy (Mais Rápido) ⭐

**Vantagens:**
- Mais rápido (apenas 1 arquivo)
- Usa proxies existentes
- Deploy imediato

**Mudanças:**
```javascript
// ANTES (ERRADO)
gtmScript.src = `/t/gtm.js?id=${GTM_ID}`;
gtagScript.src = `/t/gtag.js?id=${GA_ID}`;

// DEPOIS (CORRETO)
gtmScript.src = `/gtm.js?id=${GTM_ID}`;
gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
```

**Status:** ✅ Implementar esta opção

---

### Opção 2: Adicionar Proxies Completos no Nginx (Mais Completo)

**Vantagens:**
- Proxy completo anti-adblock
- Melhor taxa de tracking
- Maior resistência a bloqueadores

**Mudanças no Nginx:**
```nginx
# Proxy para gtag.js (GA4)
location /gtag.js {
    proxy_pass https://www.googletagmanager.com/gtag/js$is_args$args;
    proxy_ssl_server_name on;
    proxy_set_header Host www.googletagmanager.com;
    # ... (mesmo config que /gtm.js)
}

# Proxy para analytics collection
location /collect {
    proxy_pass https://www.google-analytics.com/collect$is_args$args;
    proxy_ssl_server_name on;
    proxy_set_header Host www.google-analytics.com;
    # ... (sem cache para dados de tracking)
}
```

**Status:** Opcional (para melhoria futura)

---

## 📋 Checklist de Implementação

### Fase 1: Correção Imediata ✅
- [x] Adicionar VITE_GTM_ID e VITE_GA_ID ao .env
- [ ] Atualizar AnalyticsProxy.jsx com rotas corretas
- [ ] Testar carregamento local
- [ ] Deploy e teste em produção

### Fase 2: Validação ✅
- [ ] Verificar no console do browser (F12)
- [ ] Confirmar `window.dataLayer` presente
- [ ] Confirmar `window.gtag` presente
- [ ] Testar event tracking
- [ ] Verificar Google Analytics Real-Time

### Fase 3: Melhoria Futura (Opcional) 🔄
- [ ] Adicionar proxy `/gtag.js` no Nginx
- [ ] Adicionar proxy `/collect` no Nginx
- [ ] Atualizar AnalyticsProxy para usar novos proxies
- [ ] Monitorar eficácia anti-adblock

---

## 🧪 Comandos de Teste

### Teste 1: Verificar Scripts Carregados
```bash
# Produção
curl -s https://saraivavision.com.br/ | grep -o "gtag\|dataLayer\|GTM-" | sort -u

# Deve retornar:
# GTM-KF2NP85D
# dataLayer
# gtag
```

### Teste 2: Verificar Proxies
```bash
# GTM proxy
curl -I https://saraivavision.com.br/gtm.js?id=GTM-KF2NP85D

# GA proxy
curl -I https://saraivavision.com.br/ga.js

# Ambos devem retornar: HTTP/2 200
```

### Teste 3: Console do Browser
```javascript
// Abrir DevTools (F12) e executar:
console.log('dataLayer:', window.dataLayer);
console.log('gtag:', window.gtag);
console.log('Google Analytics:', window.google_tag_manager);

// Todos devem estar definidos
```

### Teste 4: Event Tracking
```javascript
// No console do browser:
window.gtag('event', 'test_event', {
  event_category: 'debug',
  event_label: 'manual_test'
});

// Verificar no Google Analytics Real-Time
```

### Teste 5: Google Tag Assistant
1. Instalar extensão: https://tagassistant.google.com/
2. Acessar: https://saraivavision.com.br
3. Verificar tags detectadas:
   - ✅ GTM-KF2NP85D
   - ✅ G-LXWRK8ELS6

---

## 📊 Status Atual

| Componente | Status | Nota |
|-----------|--------|------|
| Variáveis Ambiente | ✅ OK | IDs corretos |
| CSP Headers | ✅ OK | Todos os domínios permitidos |
| Proxies Nginx | ⚠️ Parcial | /gtm.js e /ga.js OK, falta /gtag.js |
| AnalyticsProxy | ❌ Rotas erradas | Precisa correção |
| Carregamento | ⚠️ Via Fallback | Funciona mas sem proxy anti-adblock |

---

## 🚀 Próximos Passos

1. **Imediato:**
   - Corrigir AnalyticsProxy.jsx
   - Testar e fazer deploy

2. **Validação:**
   - Verificar Google Analytics Real-Time
   - Confirmar eventos sendo registrados

3. **Melhoria Futura:**
   - Adicionar proxies completos no Nginx
   - Monitorar taxa de tracking

---

## 📞 IDs de Tracking

- **GTM ID:** GTM-KF2NP85D
- **GA4 ID:** G-LXWRK8ELS6
- **Domínio:** saraivavision.com.br

---

## 🔗 Referências

- Google Analytics: https://analytics.google.com/
- Tag Manager: https://tagmanager.google.com/
- Tag Assistant: https://tagassistant.google.com/
- Real-Time: https://analytics.google.com/analytics/web/#/realtime

**Status Final:** 🟡 Problema identificado, solução pronta para implementação
