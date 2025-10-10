# 🛠️ Correções de Erros Front-end - Guia de Implementação

## 📚 Visão Geral

Este pacote fornece soluções robustas para todos os erros identificados no front-end da aplicação Saraiva Vision, incluindo:

- ✅ Extension ports com suporte a BFCache
- ✅ WebSocket robusto com reconexão automática
- ✅ Fetch com retry, backoff e circuit breaker
- ✅ Error tracking com classificação e serialização segura
- ✅ Form submit seguro com CSRF
- ✅ Service Worker robusto (Manifest V3)

---

## 📂 Estrutura de Arquivos

```
saraiva-vision-site/
├── scripts/
│   ├── chrome-extension-port-manager.js    # Gerenciamento de extensão Chrome
│   ├── robust-websocket.js                 # WebSocket com reconexão
│   ├── fetch-with-retry.js                 # Fetch com retry e circuit breaker
│   ├── error-tracker.js                    # Error tracking robusto
│   ├── secure-form-submit.js               # Form submit com CSRF
│   └── robust-service-worker.js            # Service Worker (Manifest V3)
│
├── docs/
│   ├── Error-Fixes-README.md               # Este arquivo
│   ├── Error-Fixes-QA-Checklist.md         # Checklist completo de QA
│   ├── Rollout-Plan.md                     # Plano de rollout detalhado
│   └── Recommended-Configurations.md       # Configs de headers, caching, etc
│
└── api/
    └── src/
        └── routes/
            ├── csrf.js                      # Endpoint CSRF token
            └── contact.js                   # Endpoint contact form
```

---

## 🚀 Instalação Rápida

### 1. Copiar Scripts

Os scripts já foram criados em `/home/saraiva-vision-site/scripts/`. Não é necessário copiar manualmente.

### 2. Importar em sua Aplicação

**Extension Port Manager** (se usar extensão Chrome):
```javascript
// src/main.jsx ou src/App.jsx
import { ExtensionPortManager } from '@/scripts/chrome-extension-port-manager.js';

if (typeof chrome !== 'undefined' && chrome.runtime) {
  window.portManager = new ExtensionPortManager('saraiva-vision');

  portManager.on('connected', () => {
    console.log('✅ Extension connected');
  });

  portManager.on('message', (message) => {
    console.log('📩 Message received:', message);
  });
}
```

**Robust WebSocket** (Pulse.is, chat, notifications):
```javascript
// src/services/pulse.js
import RobustWebSocket from '@/scripts/robust-websocket.js';

export const pulseWS = new RobustWebSocket('wss://lc.pulse.is/live-chat', {
  maxReconnectAttempts: 10,
  baseDelay: 1000,
  heartbeatInterval: 30000
});

pulseWS.on('open', () => {
  console.log('✅ Pulse connected');
});

pulseWS.on('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('📩 Pulse message:', data);
});
```

**Fetch with Retry** (Analytics):
```javascript
// src/services/analytics.js
import { AnalyticsService } from '@/scripts/fetch-with-retry.js';

export const analytics = new AnalyticsService();

// Enviar eventos
analytics.sendGA({
  event: 'pageview',
  page: window.location.pathname
});

analytics.sendGTM({
  event: 'click',
  label: 'contact_button'
});
```

**Error Tracker**:
```javascript
// src/main.jsx (inicializar no bootstrap)
import ErrorTracker from '@/scripts/error-tracker.js';

window.errorTracker = new ErrorTracker({
  endpoint: '/api/errors',
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
  enabled: true
});

console.log('✅ Error tracker initialized');
```

**Secure Form Submit**:
```javascript
// src/components/ContactForm.jsx
import { useEffect, useRef } from 'react';
import SecureFormSubmit from '@/scripts/secure-form-submit.js';

export function ContactForm() {
  const formRef = useRef(null);

  useEffect(() => {
    if (!formRef.current) return;

    const formHandler = new SecureFormSubmit({
      endpoint: 'https://saraivavision.com.br/api/contact',
      csrfTokenEndpoint: 'https://saraivavision.com.br/api/csrf-token'
    });

    formHandler.createFormHandler(formRef.current);
  }, []);

  return (
    <form ref={formRef} id="contact-form">
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit">Enviar</button>
    </form>
  );
}
```

**Service Worker**:
```javascript
// public/sw.js (copiar de scripts/robust-service-worker.js)
// Registrar no main.jsx:

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('✅ Service Worker registered:', reg.scope);
      })
      .catch(err => {
        console.error('❌ Service Worker registration failed:', err);
      });
  });
}
```

---

## 🔧 Configuração do Backend

### 1. CSRF Token Endpoint

Criar `/api/src/routes/csrf.js`:
```javascript
import express from 'express';
import crypto from 'crypto';

const router = express.Router();
const tokens = new Map();

router.get('/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = req.sessionID || req.ip;

  tokens.set(sessionId, {
    token,
    expiresAt: Date.now() + 300000
  });

  res.json({
    token,
    expiresIn: 300000
  });
});

export function validateCSRF(req, res, next) {
  const token = req.headers['x-csrf-token'];
  const sessionId = req.sessionID || req.ip;

  if (!token) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  const storedData = tokens.get(sessionId);

  if (!storedData || Date.now() > storedData.expiresAt) {
    tokens.delete(sessionId);
    return res.status(403).json({ error: 'CSRF token invalid or expired' });
  }

  if (storedData.token !== token) {
    return res.status(403).json({ error: 'CSRF token mismatch' });
  }

  tokens.delete(sessionId);
  next();
}

export default router;
```

### 2. Contact Form Endpoint

Atualizar `/api/src/routes/contact.js`:
```javascript
import express from 'express';
import { validateCSRF } from './csrf.js';

const router = express.Router();

router.post('/contact', validateCSRF, async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Processar formulário (enviar email, salvar no DB)
    console.log('Contact form:', { name, email, message });

    res.json({
      success: true,
      message: 'Form submitted successfully'
    });
  } catch (error) {
    console.error('Form processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### 3. Registrar Rotas

Em `/api/src/server.js`:
```javascript
import csrfRouter from './routes/csrf.js';
import contactRouter from './routes/contact.js';

app.use('/api', csrfRouter);
app.use('/api', contactRouter);
```

---

## 🧪 Testando as Implementações

### 1. Teste Manual Rápido

Abra o DevTools Console e execute:

```javascript
// Test Error Tracker
throw new Error('Test error from console');
// ✅ Deve aparecer: [ErrorTracker] Captured exception

// Test WebSocket
window.pulseWS?.send(JSON.stringify({ type: 'ping' }));
// ✅ Deve ver log: [RobustWS] Message sent

// Test Analytics
window.analytics?.sendGA({ event: 'test', label: 'manual' });
// ✅ Deve ver log: [Analytics] Event sent successfully

// Test Form CSRF
fetch('/api/csrf-token')
  .then(r => r.json())
  .then(data => console.log('CSRF Token:', data.token));
// ✅ Deve retornar token válido
```

### 2. Teste de Reconexão

1. Abra o DevTools → Network tab
2. Throttle to "Offline"
3. Aguarde 5 segundos
4. Throttle to "Online"
5. Verificar logs de reconexão no Console

**Esperado**:
```
[RobustWS] Closed { code: 1006, reason: '' }
[RobustWS] Scheduling reconnect { delay: 1000, attempt: 1 }
[RobustWS] Connecting... { attempt: 1 }
[RobustWS] Connected
[RobustWS] Flushing message queue { count: 3 }
```

### 3. Teste de BFCache

1. Navegar para página principal
2. Clicar em link interno (ex: /lentes)
3. Clicar no botão "Voltar" do navegador
4. Verificar logs no Console

**Esperado**:
```
[PortManager] pagehide { persisted: true }
[PortManager] Disconnected
[PortManager] pageshow { persisted: true }
[PortManager] Connecting... { attempt: 0 }
[PortManager] Connected successfully
```

### 4. Teste de Circuit Breaker

Simular falhas repetidas:
```javascript
// Simular 6 falhas consecutivas
for (let i = 0; i < 6; i++) {
  await fetch('/api/fake-endpoint').catch(() => {});
}

// Verificar estado do circuit breaker
// ✅ Deve abrir após 5 falhas: [CircuitBreaker] Threshold reached
```

---

## 📊 Monitoramento

### Métricas Chave

1. **Error Rate**
   - Baseline: ~2.5%
   - Target: <0.5%
   - Alert: >1%

2. **WebSocket Reconnection Time**
   - Baseline: ~15s
   - Target: <2s
   - Alert: >5s

3. **Analytics Success Rate**
   - Baseline: ~92%
   - Target: >98%
   - Alert: <95%

4. **Form Submission Rate**
   - Baseline: ~85%
   - Target: >99%
   - Alert: <97%

### Dashboards

Criar dashboards com:
- Grafana
- Datadog
- New Relic
- Custom (Prometheus + Grafana)

**Query examples** (Prometheus):
```promql
# Error rate
rate(http_errors_total[5m]) > 0.01

# WebSocket reconnections
rate(websocket_reconnections_total[1m]) > 10

# Circuit breaker state
circuit_breaker_state{state="open"} == 1
```

---

## 🔍 Troubleshooting

### Problema: "Unchecked runtime.lastError" ainda aparece

**Causa**: Port manager não está verificando `chrome.runtime.lastError` após postMessage

**Solução**:
```javascript
// Em chrome-extension-port-manager.js, linha 93
this.port.postMessage(message);

// Adicionar verificação:
if (chrome.runtime.lastError) {
  console.error('[PortManager] postMessage error', chrome.runtime.lastError);
  this.handleDisconnect();
  return false;
}
```

### Problema: WebSocket em loop infinito de reconexão

**Causa**: URL incorreto ou servidor não responde

**Solução**:
```javascript
// Verificar URL
console.log('WebSocket URL:', pulseWS.url);

// Resetar tentativas manualmente
pulseWS.reconnectAttempts = 0;
pulseWS.connect();

// Ou desabilitar reconexão temporariamente
pulseWS.shouldReconnect = false;
pulseWS.close();
```

### Problema: Analytics não está enviando

**Causa**: Circuit breaker aberto ou endpoint offline

**Solução**:
```javascript
// Verificar estado do circuit breaker
const circuitBreaker = analytics.fetcher.getCircuitBreaker('/api/analytics/ga');
console.log('Circuit breaker state:', circuitBreaker.state);

// Resetar manualmente
circuitBreaker.reset();

// Forçar flush do buffer
analytics.flushBuffer();
```

### Problema: Formulário retorna 403 CSRF

**Causa**: Token expirado ou não enviado

**Solução**:
```javascript
// Limpar token e tentar novamente
contactForm.csrfToken = null;
contactForm.csrfTokenExpiry = null;

// Regenerar token
const token = await contactForm.ensureCSRFToken();
console.log('New CSRF token:', token);

// Tentar submit novamente
await contactForm.submit(formData);
```

---

## 📖 Documentação Adicional

- [QA Checklist Completo](./Error-Fixes-QA-Checklist.md)
- [Plano de Rollout Detalhado](./Rollout-Plan.md)
- [Configurações Recomendadas](./Recommended-Configurations.md)

---

## 🆘 Suporte

Em caso de problemas:

1. **Verificar logs** no console do navegador
2. **Checar dashboards** de monitoramento
3. **Consultar troubleshooting** acima
4. **Abrir issue** no repositório com:
   - Descrição do problema
   - Logs do console
   - Steps to reproduce
   - Navegador/versão
   - URL afetada

---

## ✅ Checklist de Implementação

- [ ] Scripts copiados para `/scripts/`
- [ ] Imports adicionados nos arquivos relevantes
- [ ] Backend configurado (CSRF, contact form)
- [ ] Service Worker registrado
- [ ] Testes manuais realizados
- [ ] Monitoramento configurado
- [ ] Documentação lida
- [ ] QA checklist revisado
- [ ] Plano de rollout definido
- [ ] On-call team treinado

---

## 🎯 Próximos Passos

1. **Fase 1**: Implementar feature flags (semana 1)
2. **Fase 2**: Deploy staging e testes (semana 2)
3. **Fase 3**: Canary deploy 10% (semana 3, dia 1-2)
4. **Fase 4**: Rollout gradual 25% → 100% (semana 3, dia 3-7)
5. **Fase 5**: Monitoramento e otimização (semana 4)

**Good luck! 🚀**
