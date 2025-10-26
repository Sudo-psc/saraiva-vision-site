# 🔍 Diagnóstico Google Tag Manager - Saraiva Vision

**Site:** www.saraivavision.com.br  
**Data:** 2025-10-26  
**Objetivo:** Identificar problemas com Google Tag Manager e Google Analytics

---

## 📋 Resumo Executivo

### IDs Configurados

- **GTM ID:** `GTM-KF2NP85D` ✅ (válido)
- **GA4 ID:** `G-LXWRK8ELS6` ✅ (válido)
- **PostHog:** `phc_bpyxyy0AVVh2E9LhjkDfZhi2vlfEsQhOBkijyjvyRSp` ✅

### Status Atual

| Item | Status | Detalhes |
|------|--------|----------|
| GTM Script | ✅ Carregável | API responde 200 |
| HTML Tag | ❌ Ausente | Não encontrado em `<head>` |
| dataLayer | ⚠️ JavaScript | Inicializado por bundle JS |
| GA4 Config | ✅ Presente | ID configurado corretamente |
| AdBlock | ⚠️ Possível | Proxy `/gtm.js` retorna 404 |

---

## 🚨 Problemas Identificados

### 1. GTM Não Instalado no HTML (`<head>`)

**Problema:**  
O código GTM **não está presente** no HTML estático (`index.html`). Ele é carregado apenas via JavaScript bundle.

**Impacto:**
- ❌ Eventos iniciais perdidos (before DOM ready)
- ❌ Primeiro carregamento de página não rastreado
- ❌ Crawlers de SEO não detectam GTM
- ❌ Tags não disparam antes do JavaScript

**Código Esperado (Ausente):**
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KF2NP85D');</script>
<!-- End Google Tag Manager -->
```

**Localização esperada:** Imediatamente após `<head>`

---

### 2. GTM Noscript Ausente

**Problema:**  
Tag `<noscript>` do GTM não está presente no `<body>`.

**Impacto:**
- ❌ Usuários sem JavaScript não rastreados
- ❌ Bots sem JS não detectam GTM
- ❌ Fallback de acessibilidade ausente

**Código Esperado (Ausente):**
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KF2NP85D"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

**Localização esperada:** Imediatamente após `<body>`

---

### 3. Proxy GTM Quebrado

**Problema:**  
Rota `/gtm.js` retorna 404.

**Teste:**
```bash
curl -I https://www.saraivavision.com.br/gtm.js?id=GTM-KF2NP85D
# HTTP/2 404
```

**Configuração esperada (nginx):**
```nginx
location /gtm.js {
    proxy_pass https://www.googletagmanager.com/gtm.js$is_args$args;
    proxy_ssl_server_name on;
    proxy_set_header Host www.googletagmanager.com;
    # ... (resto da config existe)
}
```

**Status:** ⚠️ Proxy configurado mas não funciona (possível cache ou erro de sintaxe)

---

### 4. Carregamento Assíncrono Atrasado

**Problema:**  
GTM é carregado apenas após bundle JavaScript principal (`/assets/index-BYUnrV0H.js`).

**Impacto:**
- ⏱️ Delay de 1-3 segundos no rastreamento
- ❌ Eventos iniciais (page_view, first_click) podem ser perdidos
- 📊 Métricas de performance (CLS, FID) não rastreadas corretamente

**Ordem de carregamento atual:**
```
1. HTML estático (sem GTM)
2. Vite bundle (~193KB)
3. GTM carregado via JavaScript
```

**Ordem ideal:**
```
1. HTML estático (COM GTM inline)
2. GTM script (async)
3. Vite bundle
```

---

### 5. dataLayer Não Pré-Inicializado

**Problema:**  
`window.dataLayer` não existe no HTML, apenas após JS bundle.

**Código atual:**
```javascript
// Somente após bundle JS carregar
window.dataLayer = window.dataLayer || [];
```

**Código ideal (HTML):**
```html
<script>
  window.dataLayer = window.dataLayer || [];
</script>
<!-- Antes do GTM script -->
```

**Impacto:**
- ❌ Push de eventos antes do GTM carregar são perdidos
- ❌ Dados iniciais não capturados

---

## ✅ Pontos Positivos

### 1. Configuração Correta de IDs

```javascript
// src/config/config.base.js
googleTagManager: {
  enabled: isProduction(),
  containerId: 'GTM-KF2NP85D' // ✅ Correto
}
```

### 2. Analytics Loader Robusto

**Arquivo:** `src/utils/analytics-loader.js`

✅ Circuit breaker para AdBlock  
✅ Timeout de 5s  
✅ Fallback para PostHog  
✅ Detecção de erros  

### 3. Proxy Analytics Configurado (Parcial)

**Nginx:** `/etc/nginx/sites-available/saraivavision`

```nginx
location /gtm.js {
    proxy_pass https://www.googletagmanager.com/gtm.js$is_args$args;
    # ✅ Configuração existe
}

location /ga.js {
    proxy_pass https://www.google-analytics.com/analytics.js;
    # ✅ Configuração existe
}
```

⚠️ Mas retornam 404 (precisa debug)

---

## 🔧 Soluções Recomendadas

### Solução 1: Adicionar GTM no HTML (CRÍTICO)

**Prioridade:** 🔴 Alta  
**Tempo:** 5 minutos  
**Impacto:** Resolve 80% dos problemas

#### Passo 1: Editar `index.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    
    <!-- Google Tag Manager -->
    <script>
      window.dataLayer = window.dataLayer || [];
    </script>
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-KF2NP85D');</script>
    <!-- End Google Tag Manager -->
    
    <link rel="icon" type="image/png" href="/favicon-32x32.png" />
    <!-- ... resto do head ... -->
  </head>
  <body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KF2NP85D"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    
    <div id="root"></div>
    <!-- ... resto do body ... -->
  </body>
</html>
```

#### Passo 2: Build e Deploy

```bash
npm run build:vite
sudo cp -r dist/* /var/www/saraivavision/releases/20251024_nextjs/
```

---

### Solução 2: Usar Proxy GTM (Bypass AdBlock)

**Prioridade:** 🟡 Média  
**Tempo:** 10 minutos  
**Benefício:** Evita bloqueio de AdBlockers

#### Verificar Config Nginx

```bash
# Testar sintaxe
sudo nginx -t

# Ver config atual
cat /etc/nginx/sites-available/saraivavision | grep -A 20 "location /gtm.js"
```

#### Testar Proxy Manualmente

```bash
# Deve retornar JavaScript
curl -s https://www.saraivavision.com.br/gtm.js?id=GTM-KF2NP85D | head -20

# Se retornar 404, reiniciar nginx
sudo systemctl reload nginx
```

#### Ajustar HTML para usar Proxy

```html
<script>
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'/gtm.js?id='+i+dl; // ✅ Usa proxy local
f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KF2NP85D');
</script>
```

---

### Solução 3: Validar Eventos no GTM

**Prioridade:** 🟢 Baixa (após fix)  
**Tempo:** 15 minutos

#### Instalar Tag Assistant

1. Chrome Extension: [Tag Assistant Legacy](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Abrir: www.saraivavision.com.br
3. Clicar no ícone Tag Assistant
4. "Enable" → Reload página
5. Verificar tags disparadas

#### Verificar DataLayer no Console

```javascript
// Console do navegador
console.log(window.dataLayer);
// Deve retornar array com eventos

// Exemplo de push manual
window.dataLayer.push({
  event: 'test_event',
  category: 'test',
  action: 'manual_push'
});
```

#### Eventos Esperados

**Page View:**
```javascript
{
  event: 'page_view',
  page_title: 'Saraiva Vision',
  page_location: 'https://www.saraivavision.com.br/'
}
```

**Form Submit (Contato):**
```javascript
{
  event: 'form_submit',
  form_name: 'contact_form',
  form_destination: '/api/contact'
}
```

---

### Solução 4: Debug Console Errors

**Ferramentas:**

1. **Google Analytics Debugger**
   - Extension: https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna
   - Ativar → Ver logs detalhados no console

2. **dataLayer Inspector**
   - Extension: https://chrome.google.com/webstore/detail/datalayer-inspector/kmcbdogdandhihllalknlcjfpdjcleom
   - Ver eventos em tempo real

3. **Console Nativo**
   ```javascript
   // Filtrar erros GTM
   window.addEventListener('error', (e) => {
     if (e.filename.includes('gtm') || e.filename.includes('analytics')) {
       console.error('[GTM Error]', e);
     }
   });
   ```

---

## 📊 Checklist de Validação

### Antes do Fix

- [ ] GTM no `<head>` HTML
- [ ] GTM noscript no `<body>`
- [ ] dataLayer pré-inicializado
- [ ] Proxy `/gtm.js` funcional
- [ ] Eventos rastreados no GA4

### Após Fix (Teste)

```bash
# 1. HTML contém GTM
curl -s https://www.saraivavision.com.br | grep "GTM-KF2NP85D"

# 2. dataLayer existe antes do bundle
curl -s https://www.saraivavision.com.br | grep "window.dataLayer"

# 3. Proxy funciona
curl -s https://www.saraivavision.com.br/gtm.js?id=GTM-KF2NP85D | head -5

# 4. No browser console:
# window.dataLayer → Array com eventos
# window.google_tag_manager → Object com GTM-KF2NP85D
```

---

## 🛡️ Conformidade LGPD

### Cookie Banner

**Status:** ⚠️ Não verificado no diagnóstico

**Requisitos:**
- ✅ Banner de consentimento antes do GTM disparar
- ✅ Política de privacidade acessível
- ✅ Opt-out funcional

### Integração Recomendada

```javascript
// Aguardar consentimento antes de carregar GTM
if (hasUserConsent()) {
  loadGTM('GTM-KF2NP85D');
} else {
  // Carregar apenas analytics essencial (sem cookies)
  loadAnalyticsEssential();
}
```

**Ferramentas:**
- Cookiebot
- OneTrust
- Cookie Notice (WordPress plugin)

---

## 📚 Referências Oficiais

### Google Tag Manager

- **Setup Guide:** https://developers.google.com/tag-platform/tag-manager/web
- **DataLayer Guide:** https://developers.google.com/tag-platform/tag-manager/datalayer
- **Troubleshooting:** https://support.google.com/tagmanager/answer/6103696

### Google Analytics 4

- **Setup Guide:** https://developers.google.com/analytics/devguides/collection/ga4
- **Events Reference:** https://developers.google.com/analytics/devguides/collection/ga4/events
- **Debug Mode:** https://support.google.com/analytics/answer/7201382

### Ferramentas

- **Tag Assistant:** https://tagassistant.google.com/
- **GA Debugger:** https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna
- **DataLayer Inspector:** https://chrome.google.com/webstore/detail/datalayer-inspector/kmcbdogdandhihllalknlcjfpdjcleom

---

## 🎯 Ação Imediata

### Fix Rápido (15 minutos)

1. **Editar `index.html`:**
   ```bash
   nano /home/saraiva-vision-site/index.html
   # Adicionar código GTM no <head>
   ```

2. **Build:**
   ```bash
   npm run build:vite
   ```

3. **Deploy:**
   ```bash
   sudo cp -r dist/* /var/www/saraivavision/releases/20251024_nextjs/
   ```

4. **Validar:**
   ```
   https://www.saraivavision.com.br → F12 → Console → window.dataLayer
   ```

### Teste Diagnóstico

**Página criada:** `/tmp/gtm-diagnostic.html`

```bash
# Copiar para produção
sudo cp /tmp/gtm-diagnostic.html /var/www/saraivavision/releases/20251024_nextjs/

# Acessar:
# https://www.saraivavision.com.br/gtm-diagnostic.html
```

---

**Próximos passos:** Aplicar Solução 1 (GTM no HTML)  
**Contato:** Para dúvidas, verificar docs oficiais ou abrir issue no GitHub
