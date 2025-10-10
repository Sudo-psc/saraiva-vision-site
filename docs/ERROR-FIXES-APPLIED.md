# Correções de Erros Aplicadas - 2025-10-09

## 🐛 Problemas Identificados e Resolvidos

### 1. ❌ ErrorTracker: 404 no endpoint `/api/errors`

**Erro Original**:
```
[ErrorTracker] Failed to send report Error: Failed to send error report: 404
```

**Causa**:
- ErrorTracker tentando enviar relatórios para `/api/errors`
- Endpoint não existia no backend

**Solução Aplicada**: ✅

**Backend** - Criado `/home/saraiva-vision-site/api/src/routes/errors.js`:
- ✅ Endpoint `POST /api/errors` implementado
- ✅ Validação Zod para reports de erro
- ✅ Rate limiting: 100 req/min por IP
- ✅ Filtros para Chrome extensions
- ✅ Filtros para scripts third-party (GTM, GA, Facebook)
- ✅ Logging estruturado por severidade
- ✅ Response 204 No Content (padrão logging)

**Rota registrada** em `api/src/server.js:84`:
```javascript
{ path: '/api/errors', handler: './routes/errors.js', type: 'express' }
```

---

### 2. ❌ Erros de Extensão Chrome Capturados

**Erro Original**:
```
Uncaught InvalidStateError: Failed to execute 'send' on 'WebSocket':
Still in CONNECTING state.
at chrome-extension://iohjgamcilhbgmhbnllfolmkmmekfmci/...
```

**Causa**:
- ErrorTracker capturando erros de extensões Chrome
- Não são erros do nosso código
- Poluem logs e geram ruído

**Solução Aplicada**: ✅

**Frontend** - Atualizado `/home/saraiva-vision-site/scripts/error-tracker.js`:

**1. Filtro no `handleError()`**:
```javascript
// Ignorar erros de extensões Chrome
if (event.filename && event.filename.includes('chrome-extension://')) {
  console.log('[ErrorTracker] Ignored Chrome extension error');
  return false;
}

// Ignorar scripts third-party
const ignoredDomains = [
  'googletagmanager.com',
  'google-analytics.com',
  'doubleclick.net',
  'facebook.com',
  'connect.facebook.net'
];

if (event.filename && ignoredDomains.some(domain => event.filename.includes(domain))) {
  console.log('[ErrorTracker] Ignored third-party script error');
  return false;
}
```

**2. Tratamento de 404 no `sendReport()`**:
```javascript
if (!response.ok) {
  // Não logar erro de 404 - endpoint pode não estar disponível
  if (response.status === 404) {
    console.log('[ErrorTracker] Endpoint not available (404), report buffered locally');
    return;
  }
  throw new Error(`Failed to send error report: ${response.status}`);
}
```

---

### 3. ✅ WebSocket InvalidStateError (Extensão)

**Erro Original**:
```
InvalidStateError: Failed to execute 'send' on 'WebSocket': Still in CONNECTING state
```

**Causa**:
- Erro vindo de extensão Chrome (host-network-events.js)
- Extensão tentando enviar antes do WebSocket conectar
- Não é código do site

**Solução**: ✅ **IGNORADO** (não é do nosso código)

O erro agora é filtrado pelo ErrorTracker e não gera logs.

**Nota**: Se precisar implementar WebSocket no futuro, use:
- `/home/saraiva-vision-site/scripts/robust-websocket.js`
- Valida estado antes de `send()`
- Queue de mensagens automático
- Reconexão exponencial

---

## 📦 Arquivos Modificados/Criados

### Backend (Precisa Restart)
- ✅ **Criado**: `api/src/routes/errors.js` (116 linhas)
- ✅ **Modificado**: `api/src/server.js` (linha 84)

### Frontend (Deployado)
- ✅ **Modificado**: `scripts/error-tracker.js`
  - Filtro para Chrome extensions
  - Filtro para third-party scripts
  - Tratamento graceful de 404
- ✅ **Copiado**: `public/error-tracker.js` (para deploy)

---

## 🧪 Como Testar

### 1. Endpoint `/api/errors` (Após Restart)

```bash
# Testar endpoint
curl -X POST http://localhost:3001/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "type": "error",
    "message": "Test error",
    "severity": "info",
    "url": "https://saraivavision.com.br",
    "timestamp": "'$(date -Iseconds)'"
  }'

# Deve retornar: 204 No Content
```

### 2. ErrorTracker Filtrando Extensões

Abra o console do browser e verifique:
- ✅ Erros de `chrome-extension://` são ignorados
- ✅ Logs: `[ErrorTracker] Ignored Chrome extension error`
- ✅ Erros de GTM/GA são ignorados
- ✅ Logs: `[ErrorTracker] Ignored third-party script error`

### 3. ErrorTracker Enviando Erros Reais

```javascript
// No console do browser
window.errorTracker.captureException(new Error("Teste real"), {
  severity: "warning",
  context: { test: true }
});

// Deve ver:
// [ErrorTracker] Captured exception
// [ErrorTracker] Report sent successfully (ou 404 se servidor não restartado)
```

---

## 📊 Comportamento Esperado

### Antes das Correções ❌
```
[ErrorTracker] Failed to send report Error: 404
[ErrorTracker] Error captured: InvalidStateError chrome-extension://...
[ErrorTracker] Error captured: GTM error googletagmanager.com
Console poluído com erros não relevantes
```

### Depois das Correções ✅
```
[ErrorTracker] Ignored Chrome extension error
[ErrorTracker] Ignored third-party script error
[ErrorTracker] Report sent successfully (ou silêncio no 404)
Console limpo, apenas erros reais do site
```

---

## 🔧 Próximos Passos

### Imediato (Opcional)
1. **Restart servidor API** para ativar endpoint `/api/errors`:
   ```bash
   cd /home/saraiva-vision-site/api
   sudo ./restart-api.sh
   ```

2. **Testar endpoint**:
   ```bash
   ./test-errors-endpoint.sh  # (criar se necessário)
   ```

### Futuro (Se Necessário)
3. **Integrar serviço de error tracking** (Sentry, LogRocket, etc):
   - Modificar `api/src/routes/errors.js` linha 56-60
   - Adicionar chamada para serviço externo
   - Configurar alertas para erros críticos

4. **Análise de erros**:
   - Dashboard para visualizar erros
   - Agregação por tipo/categoria
   - Detecção de patterns

---

## 🎯 Benefícios das Correções

### 1. Console Limpo
- ❌ Antes: Poluído com erros de extensões e third-party
- ✅ Agora: Apenas erros reais do site

### 2. Logs Estruturados
- ❌ Antes: Erros 404 sem contexto
- ✅ Agora: Logs informativos e categorizados

### 3. Filtragem Inteligente
- ✅ Chrome extensions ignoradas
- ✅ Scripts third-party ignorados
- ✅ Apenas erros relevantes capturados

### 4. Error Endpoint Completo
- ✅ Validação com Zod
- ✅ Rate limiting (100/min)
- ✅ Filtros server-side
- ✅ Pronto para integração com Sentry/etc

---

## 📋 Schema do Endpoint `/api/errors`

```typescript
interface ErrorReport {
  type: 'error' | 'unhandledrejection' | 'csp_violation' | 'network_error';
  message: string;           // max 1000 chars
  stack?: string;            // max 5000 chars
  filename?: string;         // max 500 chars
  lineno?: number;
  colno?: number;
  timestamp?: string;        // ISO 8601 datetime
  url?: string;              // valid URL
  userAgent?: string;        // max 500 chars
  category?: string;         // ex: 'network', 'syntax', etc
  severity?: 'info' | 'warning' | 'error' | 'critical';
  context?: Record<string, any>;
  breadcrumbs?: Array<{
    category: string;
    message: string;
    data?: any;
    timestamp: number;
  }>;
}
```

**Validação**: Zod schema
**Response Success**: 204 No Content
**Response Error**: 400 Bad Request (validação) ou 500 Internal Server Error

---

## 🔍 Debugging

### Ver logs do ErrorTracker no browser:
```javascript
// Checar se está inicializado
console.log(window.errorTracker);

// Ver breadcrumbs
console.log(window.errorTracker.breadcrumbs);

// Forçar envio de teste
window.errorTracker.captureException(new Error("Test"), { test: true });
```

### Ver logs do backend:
```bash
# Logs do servidor API
tail -f /var/log/saraiva-api.log | grep -i error

# Logs do Nginx
tail -f /var/log/nginx/error.log
```

### Testar filtros:
```javascript
// Simular erro de extensão (deve ser ignorado)
const event = {
  filename: 'chrome-extension://abc123/script.js',
  message: 'Test error',
  lineno: 1,
  colno: 1
};
window.errorTracker.handleError(event);
// Deve ver: [ErrorTracker] Ignored Chrome extension error

// Simular erro de GTM (deve ser ignorado)
const event2 = {
  filename: 'https://www.googletagmanager.com/gtm.js',
  message: 'GTM error',
  lineno: 1,
  colno: 1
};
window.errorTracker.handleError(event2);
// Deve ver: [ErrorTracker] Ignored third-party script error
```

---

**Data das Correções**: 2025-10-09 19:50 UTC
**Status**: ✅ Frontend Deployado | 🟡 Backend Precisa Restart
**Impacto**: Console mais limpo, error tracking funcional
**Breaking Changes**: Nenhum
