# 📋 ErrorTracker - Code Snippets Prontos para Usar

**Quick Reference** para debugging, testing e validação

---

## 🔍 1. Diagnóstico em Produção (DevTools Console)

### Testar Sanitização de URLs

```javascript
// Copiar e colar no DevTools Console

// Test 1: URLs inválidas
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
    console.log('✅ Valid:', url, '→', parsed.protocol);
  } catch (error) {
    console.error('❌ Invalid:', url, '→', error.message);
  }
});

// Test 2: Zod validation (se tiver acesso ao Zod)
import { z } from 'zod';
const urlSchema = z.string().url();

testUrls.forEach(url => {
  const result = urlSchema.safeParse(url);
  console.log(url, '→ Zod:', result.success ? '✅' : '❌', result.error?.message);
});
```

---

### Interceptar Requests do ErrorTracker

```javascript
// Copiar e colar no DevTools Console

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

---

### Verificar Payload Enviado

```javascript
// Copiar e colar no DevTools Console após erro

// Verificar último request
const lastRequest = performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/api/errors'))
  .pop();

console.log('Last Error Report:', lastRequest);

// OU verificar via Network tab
// 1. Abrir DevTools → Network
// 2. Filtrar por "errors"
// 3. Disparar erro: throw new Error('Test')
// 4. Inspecionar request payload
```

---

## 🧪 2. Testes Manuais no Navegador

### Test Suite Completo

```javascript
// Copiar e colar no DevTools Console

// Função de teste
const runTests = () => {
  const results = [];

  // Test 1: URL Sanitization
  console.group('🔍 Test 1: URL Sanitization');
  const invalidUrls = ['about:blank', 'chrome-extension://abc', 'blob:test'];
  invalidUrls.forEach(url => {
    try {
      errorTracker.sanitizeUrl(url);
      results.push({ test: 'URL Sanitization', status: '✅', url });
      console.log('✅', url, '→ Sanitized');
    } catch (error) {
      results.push({ test: 'URL Sanitization', status: '❌', url, error: error.message });
      console.error('❌', url, '→', error.message);
    }
  });
  console.groupEnd();

  // Test 2: Timestamp Normalization
  console.group('🔍 Test 2: Timestamp Normalization');
  const timestamps = [Date.now(), 1729350000, '2025-10-19T12:00:00.000Z', 'invalid'];
  timestamps.forEach(ts => {
    try {
      const normalized = errorTracker.normalizeTimestamp(ts);
      const isISO = /^\d{4}-\d{2}-\d{2}T/.test(normalized);
      results.push({ test: 'Timestamp Normalization', status: isISO ? '✅' : '❌', timestamp: ts });
      console.log(isISO ? '✅' : '❌', ts, '→', normalized);
    } catch (error) {
      results.push({ test: 'Timestamp Normalization', status: '❌', timestamp: ts, error: error.message });
      console.error('❌', ts, '→', error.message);
    }
  });
  console.groupEnd();

  // Test 3: End-to-end Error Tracking
  console.group('🔍 Test 3: End-to-end Error Tracking');
  try {
    window.location.href = 'about:blank'; // Simular URL inválida
    errorTracker.track(new Error('Test error from about:blank'));
    results.push({ test: 'E2E Tracking', status: '✅' });
    console.log('✅ Error tracked without SyntaxError');
  } catch (error) {
    results.push({ test: 'E2E Tracking', status: '❌', error: error.message });
    console.error('❌ Error:', error.message);
  }
  console.groupEnd();

  // Summary
  console.table(results);
  const passed = results.filter(r => r.status === '✅').length;
  const failed = results.filter(r => r.status === '❌').length;
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
};

// Execute
runTests();
```

---

## 📡 3. Testes de API (curl)

### Test 1: Endpoint com Payload Válido

```bash
curl -X POST https://saraivavision.com.br/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test error",
    "url": "https://saraivavision.com.br",
    "timestamp": "'$(date -Iseconds)'",
    "stack": "Error: Test\n    at <anonymous>:1:1",
    "userAgent": "curl/test"
  }'

# Esperado: 204 No Content
```

---

### Test 2: Endpoint com URL Inválida (Deve Rejeitar)

```bash
curl -X POST https://saraivavision.com.br/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test error",
    "url": "about:blank",
    "timestamp": "'$(date -Iseconds)'"
  }'

# Esperado: 400 Bad Request
# Response: {"error":"Invalid error report","details":[{"field":"url","message":"Invalid url"}]}
```

---

### Test 3: Batch de Erros

```bash
curl -X POST https://saraivavision.com.br/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "errors": [
      {
        "message": "Error 1",
        "url": "https://saraivavision.com.br",
        "timestamp": "'$(date -Iseconds)'"
      },
      {
        "message": "Error 2",
        "url": "https://saraivavision.com.br",
        "timestamp": "'$(date -Iseconds)'"
      }
    ],
    "batch": {
      "size": 2,
      "sessionId": "test-session-123",
      "timestamp": "'$(date -Iseconds)'"
    }
  }'

# Esperado: 204 No Content
```

---

## 🛠️ 4. Debugging Server-Side

### Ver Logs do API Server

```bash
# Logs em tempo real
sudo journalctl -u saraiva-api -f | grep "errors"

# Últimos 100 logs
sudo journalctl -u saraiva-api -n 100 | grep "errors"

# Logs com timestamp
sudo journalctl -u saraiva-api --since "10 minutes ago" | grep "errors"

# Filtrar erros 400
sudo journalctl -u saraiva-api -f | grep "400"
```

---

### Ver Logs do Nginx

```bash
# Access logs (requisições ao endpoint)
sudo tail -f /var/log/nginx/access.log | grep "/api/errors"

# Error logs
sudo tail -f /var/log/nginx/error.log

# Contar erros 400 nas últimas 24h
sudo grep "/api/errors" /var/log/nginx/access.log | grep " 400 " | wc -l
```

---

### Verificar Bundle JavaScript em Produção

```bash
# Verificar se sanitizeUrl está no bundle
strings /var/www/saraivavision/current/assets/index-*.js | grep "sanitizeUrl"

# Verificar tamanho dos bundles
ls -lh /var/www/saraivavision/current/assets/index-*.js

# Verificar se bundle foi atualizado
stat /var/www/saraivavision/current/assets/index-*.js
```

---

## 🧪 5. Testes Vitest (Executar Localmente)

### Rodar Todos os Testes

```bash
# Todos os testes
npm run test src/utils/__tests__/error-tracker.test.js

# Apenas testes de sanitização
npm run test src/utils/__tests__/error-tracker.test.js -t "sanitize"

# Apenas testes de normalização
npm run test src/utils/__tests__/error-tracker.test.js -t "normalize"

# Modo watch (rerun ao salvar)
npm run test:watch src/utils/__tests__/error-tracker.test.js
```

---

### Rodar com Coverage

```bash
# Gerar relatório de cobertura
npm run test:coverage src/utils/__tests__/error-tracker.test.js

# Abrir relatório HTML
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
```

---

## 📊 6. Métricas e Monitoramento

### Criar Dashboard de Métricas (pseudocode)

```javascript
// Exemplo de estrutura de métricas

const metrics = {
  errorReports: {
    attempted: 0,
    sent: 0,
    failed: 0,
    status400: 0,
    statusOther: 0
  },

  sanitization: {
    urlsSanitized: 0,
    timestampsNormalized: 0,
    messagesTruncated: 0,
    stacksTruncated: 0
  },

  performance: {
    avgLatency: 0,
    p95Latency: 0,
    p99Latency: 0
  }
};

// Incrementar métricas
metrics.errorReports.attempted++;
metrics.sanitization.urlsSanitized++;

// Calcular taxa de sucesso
const successRate = (metrics.errorReports.sent / metrics.errorReports.attempted) * 100;
console.log(`Taxa de sucesso: ${successRate.toFixed(2)}%`);

// Calcular taxa de erro 400
const error400Rate = (metrics.errorReports.status400 / metrics.errorReports.sent) * 100;
console.log(`Taxa de erro 400: ${error400Rate.toFixed(2)}%`);
```

---

### Alertas Automáticos (Exemplo)

```javascript
// Exemplo de sistema de alertas

const THRESHOLDS = {
  successRate: 95,  // %
  error400Rate: 2,   // %
  p95Latency: 500    // ms
};

function checkAlerts(metrics) {
  const alerts = [];

  const successRate = (metrics.errorReports.sent / metrics.errorReports.attempted) * 100;
  if (successRate < THRESHOLDS.successRate) {
    alerts.push({
      level: 'warning',
      message: `Taxa de sucesso baixa: ${successRate.toFixed(2)}% (threshold: ${THRESHOLDS.successRate}%)`
    });
  }

  const error400Rate = (metrics.errorReports.status400 / metrics.errorReports.sent) * 100;
  if (error400Rate > THRESHOLDS.error400Rate) {
    alerts.push({
      level: 'error',
      message: `Taxa de erro 400 alta: ${error400Rate.toFixed(2)}% (threshold: ${THRESHOLDS.error400Rate}%)`
    });
  }

  if (metrics.performance.p95Latency > THRESHOLDS.p95Latency) {
    alerts.push({
      level: 'warning',
      message: `P95 latency alta: ${metrics.performance.p95Latency}ms (threshold: ${THRESHOLDS.p95Latency}ms)`
    });
  }

  return alerts;
}

// Execute
const alerts = checkAlerts(metrics);
alerts.forEach(alert => {
  console[alert.level === 'error' ? 'error' : 'warn'](`🚨 ${alert.message}`);
});
```

---

## 🔄 7. Rollback e Deploy

### Deploy Completo

```bash
cd /home/saraiva-vision-site

# 1. Build
npm run build:vite

# 2. Verificar build
ls -lh dist/assets/index-*.js
grep -o 'src="[^"]*index[^"]*\.js"' dist/index.html

# 3. Deploy
sudo npm run deploy:quick

# 4. Health check
curl -I https://saraivavision.com.br
npm run deploy:health
```

---

### Rollback Rápido

```bash
# Opção 1: Desabilitar ErrorTracker via env
echo "VITE_ERROR_TRACKER_ENABLED=false" >> .env.production
npm run build:vite
sudo npm run deploy:quick

# Opção 2: Reverter deploy atômico
sudo ./scripts/deploy-atomic.sh rollback

# Opção 3: Reverter commit Git
git revert HEAD
npm run build:vite
sudo npm run deploy:quick
```

---

### Health Check Pós-Deploy

```bash
# Verificar se ErrorTracker está funcionando
curl -s "https://saraivavision.com.br/" | grep -o 'errorTracker'

# Testar endpoint
curl -X POST https://saraivavision.com.br/api/errors \
  -H "Content-Type: application/json" \
  -d '{"message":"Health check","url":"https://test.com","timestamp":"'$(date -Iseconds)'"}'

# Verificar logs
sudo journalctl -u saraiva-api --since "5 minutes ago" | grep "errors"
```

---

## 🎯 Conclusão

Todos os snippets acima estão prontos para copiar e colar.

**Uso Recomendado:**

1. **Diagnóstico**: Seção 1 e 2 (DevTools)
2. **Validação API**: Seção 3 (curl)
3. **Debugging**: Seção 4 (Server logs)
4. **Testes Local**: Seção 5 (Vitest)
5. **Monitoramento**: Seção 6 (Métricas)
6. **Deploy**: Seção 7 (Rollback/Deploy)

**Documentação Relacionada:**
- Diagnóstico: `claudedocs/ERROR_TRACKER_DIAGNOSIS.md`
- Solução: `claudedocs/ERROR_TRACKER_SOLUTION_IMPLEMENTED.md`
- Código: `src/utils/error-tracker.js`
- Testes: `src/utils/__tests__/error-tracker.test.js`
