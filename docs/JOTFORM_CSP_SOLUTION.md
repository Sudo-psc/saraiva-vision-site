# 🔐 Solução Completa: CSP e Integração JotForm AI Agent

**Data**: 2025-10-22  
**Problema**: Violações CSP bloqueando JotForm AI Agent  
**Status**: ✅ Solução completa documentada  

---

## 📊 Diagnóstico Detalhado

### Análise da Situação Atual

O site **saraivavision.com.br/planos** integrou o **JotForm AI Agent** (ID: `0199cb5550dc71e79d950163cd7d0d45fee0`) como chatbot via script embed. Atualmente, a política CSP está em **Report-Only mode** (linha 551 do Nginx config), o que significa que as violações são **logadas mas NÃO bloqueiam** os recursos. Porém, os erros no console indicam 4 problemas críticos:

**1. Carregamento Duplicado do Script**  
O componente `JotformChatbot.jsx` carrega o script via React Helmet, mas:
- Não verifica se o script já foi carregado
- Não previne múltiplas inicializações
- Causa erro `SyntaxError: Can't create duplicate variable: 'jfAgentCacheName'`
- O service worker SW pode estar interferindo no carregamento

**2. Violações CSP Projetadas**  
Quando o CSP for ativado (remover comentário da linha 551), bloqueará:
- `script-src`: Scripts de `cdn.jotfor.ms` e `cdn.jotfor.ms/s/ai-agent/`
- `connect-src`: Conexões para `events.jotform.com`, `www.jotform.com/API/`, `o61806.ingest.us.sentry.io`
- `frame-src`: iFrame de `form.jotform.com` e `agent.jotform.com`

**3. Erros HTTP 400/500**  
- **HTTP 400** em `/errors`: Endpoint não existe (não há `api/errors.js`)
- **HTTP 500** em `/google-reviews`: Erro 500 ocorre quando Google Places API key está ausente ou inválida (linha 111-114 do arquivo)

**4. Cross-Origin Issues**  
iFrame `form.jotform.com` tenta acessar DOM de `saraivavision.com.br`, violando Same-Origin Policy. Isso é **esperado e seguro** - o erro é inofensivo.

---

## 🎯 Solução CSP Completa

### A. Nginx CSP Header (Recomendado para Produção)

**Arquivo**: `/etc/nginx/sites-enabled/saraivavision`  
**Linha**: 551 (atualmente comentada)

#### Solução Implementável

```nginx
# CSP Otimizado para JotForm AI Agent + Analytics (2025-10-22)
# IMPORTANTE: Descomente esta linha quando estiver pronto para ativar CSP em modo enforce
add_header Content-Security-Policy "
    default-src 'self';
    
    script-src 'self' 'unsafe-inline' 'unsafe-eval'
        https://www.googletagmanager.com
        https://googletagmanager.com
        https://www.google-analytics.com
        https://ssl.google-analytics.com
        https://www.googleadservices.com
        https://googleads.g.doubleclick.net
        https://*.doubleclick.net
        https://*.google.com
        https://*.google-analytics.com
        https://*.googletagmanager.com
        https://*.gstatic.com
        https://*.supabase.co
        https://cdn.jsdelivr.net
        https://www.gstatic.com
        https://cdn.pulse.is
        https://cdn.jotfor.ms
        https://cdn.jotfor.ms/s/ai-agent/
        https://agent.jotform.com
        https://form.jotform.com
        https://pci.jotform.com;
    
    connect-src 'self'
        https://www.google-analytics.com
        https://analytics.google.com
        https://stats.g.doubleclick.net
        https://*.google-analytics.com
        https://*.googletagmanager.com
        https://*.doubleclick.net
        https://*.supabase.co
        https://api.resend.com
        wss://*.supabase.co
        https://lc.pulse.is
        https://maps.googleapis.com
        https://apolo.ninsaude.com
        https://*.ninsaude.com
        https://events.jotform.com
        https://www.jotform.com/API/
        https://agent.jotform.com
        https://o61806.ingest.us.sentry.io
        https://*.sentry.io;
    
    img-src 'self' data: https: blob:
        https://www.google-analytics.com
        https://www.googletagmanager.com
        https://*.google-analytics.com
        https://*.googletagmanager.com
        https://*.doubleclick.net
        https://cdn.jotfor.ms
        https://*.jotform.com;
    
    style-src 'self' 'unsafe-inline'
        https://fonts.googleapis.com
        https://fonts.gstatic.com
        https://www.gstatic.com
        https://cdn.jotfor.ms;
    
    font-src 'self'
        https://fonts.gstatic.com
        https://www.gstatic.com
        https://cdn.jotfor.ms
        data:;
    
    frame-src 'self'
        https://www.googletagmanager.com
        https://td.doubleclick.net
        https://www.google.com
        https://open.spotify.com
        https://*.spotify.com
        https://apolo.ninsaude.com
        https://*.ninsaude.com
        https://form.jotform.com
        https://pci.jotform.com
        https://agent.jotform.com;
    
    worker-src 'self' blob:;
    
    object-src 'none';
    
    base-uri 'self';
    
    form-action 'self'
        https://form.jotform.com
        https://pci.jotform.com
        https://agent.jotform.com;
    
    frame-ancestors 'none';
    
    upgrade-insecure-requests;
" always;
```

**Mudanças Chave**:
1. ✅ `script-src`: Adicionado `https://cdn.jotfor.ms`, `https://cdn.jotfor.ms/s/ai-agent/`, `https://agent.jotform.com`, `https://form.jotform.com`, `https://pci.jotform.com`
2. ✅ `connect-src`: Adicionado `https://events.jotform.com`, `https://www.jotform.com/API/`, `https://agent.jotform.com`, `https://o61806.ingest.us.sentry.io`, `https://*.sentry.io`
3. ✅ `img-src`: Adicionado `https://cdn.jotfor.ms`, `https://*.jotform.com`
4. ✅ `style-src`: Adicionado `https://cdn.jotfor.ms`
5. ✅ `font-src`: Adicionado `https://cdn.jotfor.ms`
6. ✅ `frame-src`: Adicionado `https://form.jotform.com`, `https://pci.jotform.com`, `https://agent.jotform.com`
7. ✅ `worker-src`: Adicionado `'self' blob:` para Service Workers
8. ✅ `form-action`: Adicionado domínios JotForm para permitir envio de formulários

---

### B. Meta Tag CSP (Alternativa para Teste)

Se quiser testar CSP sem modificar Nginx, adicione em `index.html`:

**Arquivo**: `/home/saraiva-vision-site/index.html`  
**Localização**: Dentro de `<head>`, após linha 84

```html
<!-- CSP via Meta Tag (apenas para testes - use Nginx em produção) -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jotfor.ms https://cdn.jotfor.ms/s/ai-agent/ https://agent.jotform.com https://form.jotform.com https://pci.jotform.com https://www.googletagmanager.com https://googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://*.doubleclick.net https://*.google.com https://*.gstatic.com https://*.supabase.co;
  connect-src 'self' https://events.jotform.com https://www.jotform.com/API/ https://agent.jotform.com https://o61806.ingest.us.sentry.io https://*.sentry.io https://www.google-analytics.com https://*.google-analytics.com https://*.supabase.co https://maps.googleapis.com wss://*.supabase.co;
  img-src 'self' data: https: blob: https://cdn.jotfor.ms https://*.jotform.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jotfor.ms;
  font-src 'self' https://fonts.gstatic.com https://cdn.jotfor.ms data:;
  frame-src 'self' https://form.jotform.com https://pci.jotform.com https://agent.jotform.com https://www.googletagmanager.com https://open.spotify.com;
  worker-src 'self' blob:;
  object-src 'none';
">
```

**⚠️ Limitações da Meta Tag CSP**:
- Não suporta `frame-ancestors` (use X-Frame-Options no Nginx)
- Não suporta `report-uri` para logging de violações
- Menos flexível que header HTTP

---

## 🔧 Correção: Carregamento Duplicado do Script

### Problema Diagnosticado

O componente `JotformChatbot.jsx` carrega o script sem verificar:
1. Se já foi carregado (navegação SPA)
2. Se já está em execução
3. Conflitos com Service Worker

### Solução: Component Melhorado

**Arquivo**: `/home/saraiva-vision-site/src/components/JotformChatbot.jsx`

```javascript
import { useEffect, useState } from 'react';

/**
 * Jotform AI Agent Chatbot Widget
 * 
 * Carrega o chatbot do JotForm com:
 * - Prevenção de duplicação de script
 * - Cleanup automático
 * - Detecção de inicialização
 * - Compatibilidade com SPA
 * 
 * @component
 * @example
 * <JotformChatbot />
 */
const JotformChatbot = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // ID único do agente JotForm
  const AGENT_ID = '0199cb5550dc71e79d950163cd7d0d45fee0';
  const SCRIPT_URL = `https://cdn.jotfor.ms/agent/embedjs/${AGENT_ID}/embed.js`;
  const SCRIPT_ID = `jotform-agent-${AGENT_ID}`;

  useEffect(() => {
    // Guard 1: Verifica se já está carregado globalmente
    if (window.jfAgentLoaded) {
      console.log('[JotForm] Agent já carregado globalmente');
      setIsLoaded(true);
      return;
    }

    // Guard 2: Verifica se script já existe no DOM
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      console.log('[JotForm] Script já existe no DOM');
      setIsLoaded(true);
      return;
    }

    // Guard 3: Verifica se variável global já existe (mesmo sem nosso flag)
    if (typeof window.jfAgentCacheName !== 'undefined') {
      console.log('[JotForm] Variável jfAgentCacheName já existe - script carregado externamente');
      window.jfAgentLoaded = true;
      setIsLoaded(true);
      return;
    }

    console.log('[JotForm] Carregando script do chatbot...');

    // Cria script element
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_URL;
    script.async = true;

    // Listeners de sucesso/erro
    script.onload = () => {
      console.log('[JotForm] Script carregado com sucesso');
      window.jfAgentLoaded = true;
      setIsLoaded(true);
    };

    script.onerror = (error) => {
      console.error('[JotForm] Erro ao carregar script:', error);
      // Remove script com erro do DOM
      script.remove();
      setIsLoaded(false);
    };

    // Adiciona ao DOM
    document.head.appendChild(script);

    // Cleanup ao desmontar componente
    return () => {
      // NÃO remove o script se foi carregado com sucesso
      // Permite que o chatbot persista durante navegação SPA
      
      // Apenas remove se deu erro e está órfão
      if (!window.jfAgentLoaded) {
        const scriptToRemove = document.getElementById(SCRIPT_ID);
        if (scriptToRemove) {
          console.log('[JotForm] Removendo script não carregado');
          scriptToRemove.remove();
        }
      }
    };
  }, []); // Execute apenas uma vez no mount

  // Componente não renderiza nada visualmente
  // O chatbot é injetado globalmente pelo script
  return null;
};

export default JotformChatbot;
```

**Benefícios**:
- ✅ **Previne duplicação**: 3 guards verificam se já está carregado
- ✅ **Persistência SPA**: Script persiste entre navegações React Router
- ✅ **Error handling**: Remove scripts com erro
- ✅ **Logging estruturado**: Facilita debugging
- ✅ **Performance**: Carrega apenas 1x por sessão

---

## 🚨 Correção: Erros HTTP 400/500

### 1. Erro 400 em `/errors`

**Problema**: Endpoint não existe.

**Causa**: Service Worker (`public/sw.js` linha 61) tenta enviar erros para `/api/sw-errors`, mas:
- Não há arquivo `api/errors.js` ou `api/sw-errors.js`
- URL está incorreta

**Solução A: Criar Endpoint** (Recomendado)

**Arquivo**: `/home/saraiva-vision-site/api/src/routes/errors.js` (novo arquivo)

```javascript
/**
 * Error Logging Endpoint
 * Recebe logs de erros do Service Worker e frontend
 */
import express from 'express';
const router = express.Router();

// In-memory error log (em produção, usar banco de dados)
const errorLog = [];
const MAX_LOG_SIZE = 1000; // Prevenir memory leak

/**
 * POST /api/errors
 * Log de erros do cliente
 */
router.post('/errors', async (req, res) => {
  try {
    const errorEntry = {
      ...req.body,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    // Adiciona ao log
    errorLog.unshift(errorEntry);

    // Limita tamanho do log
    if (errorLog.length > MAX_LOG_SIZE) {
      errorLog.pop();
    }

    // Em produção, salvar em banco de dados ou serviço de logging
    console.error('[CLIENT ERROR]', JSON.stringify(errorEntry, null, 2));

    res.status(200).json({
      success: true,
      message: 'Error logged',
      timestamp: errorEntry.timestamp
    });
  } catch (error) {
    console.error('[ERROR LOGGING] Failed to log client error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log error'
    });
  }
});

/**
 * POST /api/sw-errors
 * Log de erros do Service Worker
 */
router.post('/sw-errors', async (req, res) => {
  try {
    const errorEntry = {
      ...req.body,
      source: 'service-worker',
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    };

    errorLog.unshift(errorEntry);

    if (errorLog.length > MAX_LOG_SIZE) {
      errorLog.pop();
    }

    console.error('[SW ERROR]', JSON.stringify(errorEntry, null, 2));

    res.status(200).json({
      success: true,
      message: 'SW error logged',
      timestamp: errorEntry.timestamp
    });
  } catch (error) {
    console.error('[ERROR LOGGING] Failed to log SW error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log SW error'
    });
  }
});

/**
 * GET /api/errors
 * Retorna últimos erros (apenas para debug)
 */
router.get('/errors', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({
    success: true,
    errors: errorLog.slice(0, limit),
    total: errorLog.length
  });
});

export default router;
```

**Integrar no servidor Express**:

**Arquivo**: `/home/saraiva-vision-site/api/src/server.js`

```javascript
// Adicionar após outras importações de rotas
import errorRoutes from './routes/errors.js';

// Adicionar após outras rotas
app.use('/api', errorRoutes);
```

**Solução B: Desabilitar Logging** (Temporário)

Se não quiser criar o endpoint agora, desabilite o logging no Service Worker:

**Arquivo**: `/home/saraiva-vision-site/public/sw.js` (linha 59-69)

```javascript
// ANTES
static async reportError(entry) {
  try {
    await fetch('/api/sw-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  } catch (error) {
    console.error('[SW] Failed to report error', error);
  }
}

// DEPOIS (desabilitado)
static async reportError(entry) {
  // Logging desabilitado - apenas console
  console.error('[SW ERROR]', entry);
  
  // TODO: Implementar endpoint /api/sw-errors
  // await fetch('/api/sw-errors', { ... });
}
```

---

### 2. Erro 500 em `/google-reviews`

**Problema**: Google Places API key ausente ou inválida.

**Diagnóstico**: O arquivo `api/google-reviews.js` linha 111-114 retorna erro 500 quando:
```javascript
if (!apiKey || apiKey === 'your_google_maps_api_key_here' || ...) {
  return res.status(500).json({
    error: 'Google Places API key not configured.'
  });
}
```

**Soluções**:

**A. Verificar variáveis de ambiente**:

```bash
# Verificar se API key está configurada
echo $GOOGLE_PLACES_API_KEY
echo $VITE_GOOGLE_PLACES_API_KEY

# Se vazio, adicionar ao .env
nano /home/saraiva-vision-site/.env

# Adicionar linha:
GOOGLE_PLACES_API_KEY=sua_chave_aqui
VITE_GOOGLE_PLACES_API_KEY=sua_chave_aqui
```

**B. Restart do servidor API** (se rodar como serviço):

```bash
sudo systemctl restart saraiva-api
```

**C. Fallback Graceful** (se não quiser usar Google Reviews agora):

**Arquivo**: `/home/saraiva-vision-site/src/services/googleBusinessService.js` (ou onde chama `/google-reviews`)

```javascript
// Adicionar try-catch com fallback
const fetchGoogleReviews = async () => {
  try {
    const response = await fetch('/api/google-reviews?limit=5');
    
    if (!response.ok) {
      console.warn('[Google Reviews] API returned error, using fallback');
      return getFallbackReviews(); // Retorna dados mockados
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Google Reviews] Fetch failed:', error);
    return getFallbackReviews();
  }
};

// Dados mockados para fallback
const getFallbackReviews = () => ({
  success: true,
  data: {
    reviews: [],
    stats: {
      overview: {
        totalReviews: 0,
        averageRating: 4.9,
        recentReviews: 0,
        responseRate: 0
      }
    }
  },
  cached: false,
  fallback: true
});
```

---

## 🌐 Configuração Cross-Origin

### postMessage Security

O erro `Blocked a frame with origin "https://form.jotform.com" from accessing a cross-origin frame` é **esperado e seguro**. Navegadores bloqueiam acesso cross-origin por segurança.

**NÃO requer correção** - é comportamento correto do navegador.

Se JotForm precisar comunicar com seu site, use `postMessage`:

```javascript
// No seu site (parent window)
window.addEventListener('message', (event) => {
  // Validar origem
  if (event.origin !== 'https://form.jotform.com' &&
      event.origin !== 'https://agent.jotform.com') {
    return; // Ignora mensagens de origens desconhecidas
  }

  // Processar mensagem
  console.log('[JotForm Message]', event.data);
  
  // Exemplo: JotForm envia evento quando formulário é enviado
  if (event.data.type === 'form-submitted') {
    // Executar ação no seu site
    console.log('Formulário JotForm enviado!');
  }
});
```

---

## ✅ Checklist de Implementação

Execute nesta ordem:

### Fase 1: CSP (30 min)

- [ ] **1.1** Backup do Nginx config:
  ```bash
  sudo cp /etc/nginx/sites-enabled/saraivavision /etc/nginx/sites-enabled/saraivavision.backup.$(date +%Y%m%d)
  ```

- [ ] **1.2** Editar Nginx CSP (linha 551):
  ```bash
  sudo nano /etc/nginx/sites-enabled/saraivavision
  # Substituir linha 551 pelo CSP fornecido acima
  ```

- [ ] **1.3** Validar sintaxe Nginx:
  ```bash
  sudo nginx -t
  ```

- [ ] **1.4** Recarregar Nginx:
  ```bash
  sudo systemctl reload nginx
  ```

### Fase 2: Correção JotformChatbot (10 min)

- [ ] **2.1** Backup do componente:
  ```bash
  cp src/components/JotformChatbot.jsx src/components/JotformChatbot.jsx.backup
  ```

- [ ] **2.2** Atualizar componente com código fornecido acima

- [ ] **2.3** Build e deploy:
  ```bash
  npm run build:vite
  sudo npm run deploy:quick
  ```

### Fase 3: Endpoint de Erros (20 min - opcional)

- [ ] **3.1** Criar arquivo `api/src/routes/errors.js`

- [ ] **3.2** Integrar no `api/src/server.js`

- [ ] **3.3** Restart API:
  ```bash
  sudo systemctl restart saraiva-api
  ```

### Fase 4: Google Reviews (5 min - se necessário)

- [ ] **4.1** Verificar variáveis de ambiente

- [ ] **4.2** Adicionar API key se ausente

- [ ] **4.3** Restart API

---

## 🧪 Testes de Validação

Execute após implementação:

### 1. Teste CSP

```bash
# Verificar se header CSP está ativo
curl -I https://www.saraivavision.com.br/planos | grep -i "content-security-policy"

# Deve retornar:
# Content-Security-Policy: default-src 'self'; script-src 'self' ...
```

**No navegador**:
1. Abra `https://www.saraivavision.com.br/planos`
2. F12 → Console
3. **NÃO deve haver** erros `Refused to load...` ou `Blocked by CSP`
4. JotForm chatbot deve aparecer (ícone no canto inferior direito)

### 2. Teste Carregamento Duplicado

**No navegador**:
1. Abra `https://www.saraivavision.com.br/planos`
2. F12 → Console
3. Procure logs `[JotForm] ...`
4. **Deve mostrar**: `[JotForm] Carregando script do chatbot...` (1x apenas)
5. **NÃO deve haver**: `SyntaxError: Can't create duplicate variable`
6. Navegue para outra página e volte para `/planos`
7. **Deve mostrar**: `[JotForm] Agent já carregado globalmente`

### 3. Teste Endpoint de Erros

```bash
# Testar POST
curl -X POST https://www.saraivavision.com.br/api/sw-errors \
  -H "Content-Type: application/json" \
  -d '{"level":"ERROR","message":"Test error"}'

# Deve retornar:
# {"success":true,"message":"SW error logged","timestamp":"..."}

# Testar GET
curl https://www.saraivavision.com.br/api/errors?limit=5

# Deve retornar:
# {"success":true,"errors":[...],"total":1}
```

### 4. Teste Google Reviews

```bash
curl https://www.saraivavision.com.br/api/google-reviews?limit=5

# Se erro 500:
# - Verificar variáveis de ambiente
# - Ver logs: sudo journalctl -u saraiva-api -n 50

# Se sucesso (200):
# {"success":true,"data":{"reviews":[...],...}}
```

### 5. Teste Chatbot Funcional

**No navegador** (`/planos`):
1. ✅ Chatbot aparece (ícone flutuante)
2. ✅ Clicar abre janela do chatbot
3. ✅ Pode enviar mensagens
4. ✅ Recebe respostas do AI Agent
5. ✅ Não há erros no console

---

## 📊 Matriz de Prioridades

| Problema | Prioridade | Impacto | Tempo | Status |
|----------|-----------|---------|-------|--------|
| **CSP para JotForm** | 🔴 CRÍTICO | JotForm não funciona quando CSP ativo | 30 min | Solução pronta |
| **Carregamento duplicado** | 🟡 ALTO | Console poluído, possível mau funcionamento | 10 min | Solução pronta |
| **Erro 400 /errors** | 🟢 MÉDIO | Apenas logs, não afeta usuário | 20 min | Solução pronta |
| **Erro 500 /google-reviews** | 🟢 MÉDIO | Fallback funciona, não afeta UX | 5 min | Diagnóstico completo |
| **Cross-origin warnings** | ⚪ BAIXO | Esperado, não afeta funcionamento | 0 min | Não requer ação |

---

## 🔒 Segurança: Análise de Risco

### `unsafe-inline` e `unsafe-eval`

**Presente no CSP atual**: Sim (linha 551)  
**Risco**: Médio (permite XSS se houver injeção)  
**Necessário para**: Google Tag Manager, alguns scripts analytics

**Mitigação**:
1. ✅ Usar `nonce` ou `hash` para scripts inline (avançado)
2. ✅ Mover scripts inline para arquivos externos
3. ✅ Usar Subresource Integrity (SRI) para CDNs

**Implementação de Nonce** (avançado, opcional):

```nginx
# Nginx: Gerar nonce aleatório
# Requer módulo ngx_http_headers_more_filter_module
set $csp_nonce $request_id;
add_header Content-Security-Policy "
    ...
    script-src 'self' 'nonce-$csp_nonce' https://cdn.jotfor.ms ...
    ...
" always;
```

```html
<!-- HTML: Usar nonce nos scripts inline -->
<script nonce="<?php echo $csp_nonce; ?>">
  // Script inline permitido
</script>
```

**Recomendação**: Manter `unsafe-inline` por enquanto (Google Tag Manager requer). Implementar nonce em fase futura.

---

## 📚 Referências Técnicas

### Content Security Policy
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator (Google)](https://csp-evaluator.withgoogle.com/)
- [W3C CSP Level 3 Spec](https://www.w3.org/TR/CSP3/)

### JotForm AI Agent
- [JotForm AI Agent Docs](https://www.jotform.com/help/770-ai-agent)
- [JotForm Embed Guide](https://www.jotform.com/help/360-how-to-embed-a-form-in-your-website)

### Same-Origin Policy
- [MDN: Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- [MDN: postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

---

## 🆘 Troubleshooting

### Problema: CSP ainda bloqueia JotForm

**Diagnóstico**:
```bash
# Verificar se CSP está ativo
curl -I https://www.saraivavision.com.br | grep -i csp

# Verificar logs Nginx
sudo tail -f /var/log/nginx/error.log
```

**Soluções**:
1. Verificar se linha 551 foi descomentada
2. Verificar se Nginx foi recarregado (`sudo systemctl reload nginx`)
3. Testar com meta tag CSP primeiro
4. Usar CSP report-only mode temporariamente:
   ```nginx
   add_header Content-Security-Policy-Report-Only "..." always;
   ```

### Problema: Script ainda carrega duplicado

**Diagnóstico**:
```javascript
// No console do navegador
console.log('jfAgentLoaded:', window.jfAgentLoaded);
console.log('jfAgentCacheName:', typeof window.jfAgentCacheName);
document.querySelectorAll('script[src*="jotfor.ms"]').length; // Deve ser 1
```

**Soluções**:
1. Hard refresh (Ctrl+Shift+R)
2. Limpar cache do navegador
3. Verificar se componente foi atualizado (`npm run build:vite`)
4. Adicionar mais logs no componente para debug

### Problema: Erro 400/500 persiste

**Diagnóstico**:
```bash
# Ver logs do servidor
sudo journalctl -u saraiva-api -f

# Testar endpoint manualmente
curl -v https://www.saraivavision.com.br/api/sw-errors
```

**Soluções**:
1. Verificar se arquivo `errors.js` foi criado
2. Verificar se rota foi adicionada no `server.js`
3. Verificar se servidor foi reiniciado
4. Verificar variáveis de ambiente para `/google-reviews`

---

**Status**: ✅ Documentação completa  
**Próximo passo**: Implementar Fase 1 (CSP)  
**Tempo estimado total**: ~1 hora  
**Rollback**: Backups criados em cada fase
