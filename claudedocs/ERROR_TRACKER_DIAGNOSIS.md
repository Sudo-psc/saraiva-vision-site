# 🔍 ErrorTracker - Diagnóstico e Correção de Erro 400/SyntaxError

**Data**: 2025-10-19
**Autor**: Dr. Philipe Saraiva Cruz
**Prioridade**: P0 - Critical

---

## 📊 Resumo Executivo

**Problema**: ErrorTracker falha com erro 400 e SyntaxError ao enviar relatórios para `/api/errors`

**Causa Raiz**:
- `src/utils/error-tracker.js` não sanitiza URLs e timestamps antes de enviar
- Backend Zod valida estritamente URLs (`z.string().url()`) e timestamps (`z.string().datetime()`)
- Valores inválidos como `about:blank`, `chrome-extension://`, timestamps Unix causam rejeição

**Impacto**:
- 🔴 Perda de rastreamento de erros de produção
- 🔴 Loop infinito de erros (ErrorTracker tentando reportar próprio erro)
- 🟡 Degradação de performance (retry excessivo)

**Solução**: Sanitizar dados ANTES de enviar (validação defensiva client-side)

---

## 🔬 1. Hipóteses Priorizadas

### P0: URL Inválida no Payload

**Causa → Efeito:**
```
window.location.href retorna URL especial
  ↓
report.url = "about:blank" | "chrome-extension://..." | "blob:..."
  ↓
Backend Zod valida z.string().url()
  ↓
400 Bad Request: "Invalid url"
```

**Diagnóstico:**
```javascript
// Verificar valor atual de report.url
console.log('Current URL:', window.location.href);
console.log('Protocol:', window.location.protocol);

// Testar validação Zod
import { z } from 'zod';
const schema = z.string().url();
schema.parse('about:blank'); // ❌ Lança ZodError
schema.parse('chrome-extension://abc'); // ❌ Lança ZodError
schema.parse('https://saraivavision.com.br'); // ✅ OK
```

**Evidência em Código:**
- `api/src/routes/errors.js:21` - `url: z.string().url().optional()`
- `src/utils/error-tracker.js:159` - `enriched.pageUrl = window.location.href` (sem validação)

---

### P0: SyntaxError ao Construir Request

**Causa → Efeito:**
```
postJSON tenta criar new Request(url, { body: JSON.stringify(data) })
  ↓
data.url contém valor inválido
  ↓
Browser valida URL no construtor
  ↓
SyntaxError: "The string did not match the expected pattern"
```

**Diagnóstico:**
```javascript
// Reproduzir erro
try {
  const invalidUrl = 'about:blank';
  new Request('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: invalidUrl })
  });
} catch (error) {
  console.error('SyntaxError:', error.message);
  // Esperado: "Failed to execute 'Request' on..."
}

// Teste com URL() constructor
try {
  new URL('about:blank');
} catch (error) {
  console.error('URL Error:', error.message);
  // TypeError: Invalid URL
}
```

---

### P1: Timestamp Não-ISO

**Causa → Efeito:**
```
Date.now() retorna Unix timestamp (number)
  ↓
report.timestamp = 1729350000000
  ↓
Backend Zod valida z.string().datetime()
  ↓
400 Bad Request: "Invalid datetime string"
```

**Diagnóstico:**
```javascript
// Verificar formato atual
const timestamp = new Date().toISOString();
console.log('ISO:', timestamp); // ✅ "2025-10-19T12:00:00.000Z"

// Zod validation
const schema = z.string().datetime();
schema.parse(Date.now()); // ❌ Espera string, recebe number
schema.parse('2025-10-19T12:00:00.000Z'); // ✅ OK
```

---

### P1: Endpoint Inválido

**Causa → Efeito:**
```
ERROR_TRACKER_CONFIG.endpoint = '' | undefined
  ↓
new URL(endpoint, window.location.origin)
  ↓
TypeError: Invalid URL
```

**Diagnóstico:**
```javascript
// Verificar configuração
console.log('Endpoint:', ERROR_TRACKER_CONFIG.endpoint);

// Testar construção de URL
const endpoint = '';
try {
  new URL(endpoint, window.location.origin);
} catch (error) {
  console.error('Endpoint Error:', error.message);
}
```

---

## 🛠️ 2. Checklist de Diagnósticos (Passo a Passo)

### A. Verificar Construção de URL

**Objetivo**: Confirmar que URLs especiais causam erro

```javascript
// 1. Abrir DevTools Console na página de erro
// 2. Executar:
const testUrls = [
  'about:blank',
  'chrome-extension://abc',
  'blob:https://example.com/abc',
  'data:text/html,<h1>Test</h1>',
  'https://saraivavision.com.br'
];

testUrls.forEach(url => {
  try {
    const parsed = new URL(url);
    console.log('✅ Valid:', url, '→ Protocol:', parsed.protocol);
  } catch (error) {
    console.error('❌ Invalid:', url, '→', error.message);
  }
});

// 3. Testar com Zod
import { z } from 'zod';
const urlSchema = z.string().url();

testUrls.forEach(url => {
  const result = urlSchema.safeParse(url);
  console.log(url, '→ Zod:', result.success ? '✅' : '❌', result.error?.message);
});
```

**Resultado Esperado**:
- ❌ `about:blank` → Zod rejeita (protocol não é http/https)
- ❌ `chrome-extension://` → Zod rejeita
- ❌ `blob:` → Zod rejeita
- ✅ `https://` → Zod aceita

---

### B. Verificar Payload e Headers

**Objetivo**: Confirmar formato do payload enviado

```javascript
// Interceptar fetch com proxy
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;

  if (url.includes('/api/errors')) {
    console.log('🔍 ErrorTracker Request:', {
      url,
      method: options?.method,
      headers: options?.headers,
      body: options?.body ? JSON.parse(options.body) : null
    });
  }

  return originalFetch.apply(this, args);
};

// Disparar erro para capturar
throw new Error('Test error for diagnosis');
```

**Verificações**:
- ✅ `Content-Type: application/json`
- ✅ Body é JSON válido
- ❌ `report.url` contém protocolo inválido
- ❌ `report.timestamp` não é ISO string

---

### C. Verificar Schema do Endpoint

**Objetivo**: Confirmar validação Zod no backend

```bash
# 1. Verificar schema atual
grep -A 10 "errorReportSchema" api/src/routes/errors.js

# 2. Enviar request de teste via curl
curl -X POST https://saraivavision.com.br/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test error",
    "url": "about:blank",
    "timestamp": "2025-10-19T12:00:00.000Z"
  }'

# Esperado: 400 Bad Request com detalhes do Zod
```

**Resultado Esperado**:
```json
{
  "error": "Invalid error report",
  "details": [
    {
      "field": "url",
      "message": "Invalid url"
    }
  ]
}
```

---

### D. Inspecionar DevTools Network

**Passo a passo**:

1. Abrir DevTools → Network
2. Filtrar por `errors`
3. Disparar erro: `throw new Error('Test')`
4. Inspecionar request falhado:

**Headers:**
```
Request URL: https://saraivavision.com.br/api/errors
Request Method: POST
Status Code: 400 Bad Request
Content-Type: application/json
```

**Request Payload:**
```json
{
  "message": "Test",
  "stack": "Error: Test\n    at <anonymous>:1:7",
  "url": "about:blank",  // ❌ Problema aqui!
  "timestamp": "2025-10-19T12:00:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "sessionId": "session_1729350000_abc"
}
```

**Response:**
```json
{
  "error": "Invalid error report",
  "details": [
    {
      "field": "url",
      "message": "Invalid url"
    }
  ]
}
```

---

### E. Validar uso de URL(), URLSearchParams, Request

**Objetivo**: Confirmar se SyntaxError vem de construção inválida

```javascript
// Test 1: URL constructor
const testInvalidUrl = () => {
  try {
    new URL('about:blank');
    console.log('✅ URL() aceita about:blank');
  } catch (error) {
    console.error('❌ URL() rejeita:', error.name, error.message);
  }
};

// Test 2: Request constructor
const testInvalidRequest = () => {
  try {
    new Request('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'about:blank' })
    });
    console.log('✅ Request() aceita payload com about:blank');
  } catch (error) {
    console.error('❌ Request() rejeita:', error.name, error.message);
  }
};

// Test 3: URLSearchParams
const testInvalidParams = () => {
  try {
    const params = new URLSearchParams({ url: 'about:blank' });
    console.log('✅ URLSearchParams aceita:', params.toString());
  } catch (error) {
    console.error('❌ URLSearchParams rejeita:', error.name, error.message);
  }
};

testInvalidUrl();
testInvalidRequest();
testInvalidParams();
```

---

## 🔧 3. Cenários de Teste

### Cenário 1: Página about:blank

```javascript
// Simular navegação para about:blank
const iframe = document.createElement('iframe');
iframe.src = 'about:blank';
document.body.appendChild(iframe);

// Dentro do iframe, disparar erro
iframe.contentWindow.addEventListener('load', () => {
  iframe.contentWindow.eval(`
    throw new Error('Error from about:blank');
  `);
});

// Resultado esperado:
// ❌ ErrorTracker tenta enviar com url: "about:blank"
// ❌ Backend rejeita com 400
```

---

### Cenário 2: Extensão Chrome

```javascript
// Simular erro de extensão
const error = new Error('Extension error');
error.filename = 'chrome-extension://abc123/script.js';

window.dispatchEvent(new ErrorEvent('error', {
  error,
  filename: error.filename,
  message: error.message
}));

// Resultado esperado:
// ✅ ErrorTracker ignora (linha 65 de public/error-tracker.js)
// ✅ Não envia para backend
```

---

### Cenário 3: Timestamp Inválido

```javascript
// Forçar timestamp Unix em vez de ISO
const originalDate = Date.prototype.toISOString;
Date.prototype.toISOString = function() {
  return this.getTime(); // ❌ Retorna number em vez de string
};

throw new Error('Test with invalid timestamp');

// Restaurar
Date.prototype.toISOString = originalDate;

// Resultado esperado:
// ❌ Backend rejeita com "Invalid datetime string"
```

---

## 📦 4. Casos de Teste para Validação

### Test 1: URL Sanitization

```javascript
describe('URL Sanitization', () => {
  it('should replace invalid protocols with fallback', () => {
    const invalidUrls = [
      'about:blank',
      'chrome-extension://abc',
      'blob:https://example.com/abc',
      'data:text/html,<h1>Test</h1>',
      ''
    ];

    invalidUrls.forEach(url => {
      const sanitized = sanitizeUrl(url);
      expect(sanitized).toBe('https://saraivavision.com.br');
    });
  });

  it('should preserve valid HTTP(S) URLs', () => {
    const validUrls = [
      'https://saraivavision.com.br',
      'http://localhost:3000',
      'https://example.com/path?query=value'
    ];

    validUrls.forEach(url => {
      const sanitized = sanitizeUrl(url);
      expect(sanitized).toBe(url);
    });
  });
});
```

---

### Test 2: Timestamp Normalization

```javascript
describe('Timestamp Normalization', () => {
  it('should convert Unix timestamp to ISO', () => {
    const unixMs = 1729350000000;
    const normalized = normalizeTimestamp(unixMs);
    expect(normalized).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should preserve valid ISO strings', () => {
    const iso = '2025-10-19T12:00:00.000Z';
    const normalized = normalizeTimestamp(iso);
    expect(normalized).toBe(iso);
  });

  it('should handle invalid timestamps', () => {
    const invalid = 'not-a-date';
    const normalized = normalizeTimestamp(invalid);
    expect(normalized).toMatch(/^\d{4}-\d{2}-\d{2}T/); // Fallback to current time
  });
});
```

---

### Test 3: Request Construction

```javascript
describe('Request Construction', () => {
  it('should not throw SyntaxError with sanitized data', () => {
    const report = {
      message: 'Test error',
      url: 'https://saraivavision.com.br', // ✅ Sanitized
      timestamp: '2025-10-19T12:00:00.000Z' // ✅ Normalized
    };

    expect(() => {
      new Request('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
    }).not.toThrow();
  });

  it('should throw with unsanitized data', () => {
    const report = {
      message: 'Test error',
      url: 'about:blank', // ❌ Not sanitized
      timestamp: Date.now() // ❌ Not normalized
    };

    // Pode lançar ou não dependendo do browser
    // O problema real é no backend Zod
  });
});
```

---

### Test 4: Integration Test (E2E)

```javascript
describe('ErrorTracker Integration', () => {
  it('should successfully send error report', async () => {
    const mockServer = setupMockServer({
      endpoint: '/api/errors',
      response: { status: 204 }
    });

    await errorTracker.track(new Error('Test error'), {
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    const request = mockServer.getLastRequest();
    expect(request.body.url).toMatch(/^https?:\/\//);
    expect(request.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should handle 400 errors gracefully', async () => {
    const mockServer = setupMockServer({
      endpoint: '/api/errors',
      response: {
        status: 400,
        body: { error: 'Invalid url' }
      }
    });

    const consoleSpy = vi.spyOn(console, 'error');

    await errorTracker.track(new Error('Test error'));

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ErrorTracker] 400 Bad Request')
    );
  });
});
```

---

## 📊 5. Observabilidade e Logs

### Logs Estruturados

```javascript
// Before sanitization
console.debug('[ErrorTracker] Raw report:', {
  url: report.url,
  protocol: new URL(report.url).protocol, // Pode falhar!
  timestamp: report.timestamp,
  timestampType: typeof report.timestamp
});

// After sanitization
console.debug('[ErrorTracker] Sanitized report:', {
  url: sanitizedReport.url,
  urlValid: /^https?:\/\//.test(sanitizedReport.url),
  timestamp: sanitizedReport.timestamp,
  timestampValid: z.string().datetime().safeParse(sanitizedReport.timestamp).success
});

// On error
console.error('[ErrorTracker] Validation failed:', {
  endpoint: endpointUrl,
  reportUrl: report.url,
  error: error.message,
  stack: error.stack
});
```

---

### Métricas de Monitoramento

**Dashboards a criar:**

1. **Taxa de Sucesso de Error Reports**
   - Métrica: `error_reports_sent / error_reports_attempted`
   - Alvo: > 95%

2. **Taxa de Erro 400**
   - Métrica: `error_reports_400 / error_reports_sent`
   - Alvo: < 1%

3. **Taxa de SyntaxError**
   - Métrica: `syntax_errors / total_requests`
   - Alvo: 0%

4. **Latência de Error Reports**
   - Métrica: P50, P95, P99 do tempo de envio
   - Alvo: P95 < 200ms

---

## 🔄 6. Plano de Rollback e Feature Flag

### Feature Flag Configuration

```javascript
// .env
VITE_ERROR_TRACKER_ENABLED=true
VITE_ERROR_TRACKER_URL_SANITIZATION=true
VITE_ERROR_TRACKER_TIMESTAMP_NORMALIZATION=true

// error-tracker.js
const FEATURE_FLAGS = {
  enabled: import.meta.env.VITE_ERROR_TRACKER_ENABLED !== 'false',
  urlSanitization: import.meta.env.VITE_ERROR_TRACKER_URL_SANITIZATION !== 'false',
  timestampNormalization: import.meta.env.VITE_ERROR_TRACKER_TIMESTAMP_NORMALIZATION !== 'false'
};
```

---

### Rollback Procedure

**Se taxa de erro 400 > 5% após deploy:**

```bash
# 1. Desabilitar ErrorTracker via feature flag
echo "VITE_ERROR_TRACKER_ENABLED=false" >> .env.production

# 2. Rebuild e redeploy
npm run build:vite
sudo npm run deploy:quick

# 3. Ou reverter para versão anterior
sudo ./scripts/deploy-atomic.sh rollback

# 4. Investigar logs
sudo journalctl -u saraiva-api -n 1000 | grep "errors"

# 5. Verificar health do endpoint
curl -X POST https://saraivavision.com.br/api/errors \
  -H "Content-Type: application/json" \
  -d '{"message":"Health check","url":"https://test.com","timestamp":"'$(date -Iseconds)'"}'
```

---

### Gradual Rollout Plan

**Fase 1: Canary (5% users)**
- Deploy com feature flag
- Monitorar por 24h
- Verificar métricas de sucesso

**Fase 2: Ramp-up (25% users)**
- Aumentar gradualmente
- Monitorar taxa de 400 e SyntaxError
- Rollback se necessário

**Fase 3: Full Rollout (100% users)**
- Deploy completo
- Monitoramento contínuo
- Alertas automáticos

---

## 🎯 7. Critérios de Sucesso

**Pré-deployment:**
- ✅ Todos os testes unitários passando
- ✅ Testes de integração passando
- ✅ Validação manual em staging
- ✅ Code review aprovado

**Pós-deployment:**
- ✅ Taxa de erro 400 < 1%
- ✅ Taxa de SyntaxError = 0%
- ✅ Taxa de sucesso de reports > 95%
- ✅ Sem aumento de latência P95
- ✅ Sem reclamações de usuários

---

## 📚 Referências

- **Zod Validation**: https://github.com/colinhacks/zod
- **URL API**: https://developer.mozilla.org/en-US/docs/Web/API/URL
- **Request API**: https://developer.mozilla.org/en-US/docs/Web/API/Request
- **ISO 8601**: https://en.wikipedia.org/wiki/ISO_8601
- **Error Tracking Best Practices**: https://sentry.io/for/error-tracking/

---

**Status**: 🚧 Draft - Aguardando implementação
**Próximos Passos**: Implementar patches de código e testes
