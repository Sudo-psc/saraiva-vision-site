

 # Checklist de QA - Correção de Erros Front-end

## ✅ Pré-Deploy

### 1. Build e Testes Locais
- [ ] `npm run build:vite` completa sem erros
- [ ] `npm run test:run` passa todos os testes
- [ ] `npm run lint` sem erros críticos
- [ ] Verificar tamanho dos bundles (<200KB por chunk)
- [ ] DevTools Console limpo (sem erros não tratados)

### 2. Verificação de Código
- [ ] Todos os scripts implementados presentes em `/scripts/`:
  - `chrome-extension-port-manager.js`
  - `robust-websocket.js`
  - `fetch-with-retry.js`
  - `error-tracker.js`
  - `secure-form-submit.js`
  - `robust-service-worker.js`
- [ ] Imports corretos em arquivos relevantes
- [ ] Feature flags configurados (se aplicável)
- [ ] Variáveis de ambiente configuradas

---

## 🧪 Testes Funcionais

### Extension Ports & BFCache
- [ ] **Teste 1**: Navegar para página → voltar com botão do navegador
  - Verificar no console: "[PortManager] pageshow { persisted: true }"
  - Verificar reconexão automática
  - Enviar mensagem após voltar → deve funcionar

- [ ] **Teste 2**: Abrir aba → minimizar janela → restaurar
  - Verificar: "[PortManager] Tab visible, reconnecting"
  - Port deve reconectar automaticamente

- [ ] **Teste 3**: Forçar desconexão (desabilitar extensão temporariamente)
  - Verificar tentativas de reconexão com backoff
  - Mensagens devem ser enfileiradas
  - Reabilitar extensão → flush da fila

- [ ] **Teste 4**: Verificar `chrome.runtime.lastError` tratado
  - Não deve aparecer "Unchecked runtime.lastError" no console

**Critério de Sucesso**: Sem erros "back/forward cache" ou "message channel closed"

---

### WebSocket Robustez
- [ ] **Teste 5**: Conectar ao WebSocket → desconectar WiFi → reconectar WiFi
  - Verificar reconexão automática com backoff
  - Mensagens enfileiradas durante offline devem ser enviadas após reconectar

- [ ] **Teste 6**: Enviar mensagem durante CONNECTING
  - Verificar: "[RobustWS] Still connecting, queueing message"
  - Mensagem deve ser enviada após conexão abrir

- [ ] **Teste 7**: Abrir DevTools Network → throttle to Offline → Online
  - WebSocket deve reconectar automaticamente
  - Heartbeat/ping deve retornar após reconexão

- [ ] **Teste 8**: Trocar de aba (visibilitychange)
  - Tab oculta: heartbeat deve parar
  - Tab visível: heartbeat deve retomar

**Critério de Sucesso**: Sem erros "InvalidStateError: send while CONNECTING/CLOSING"

---

### Fetch com Retry & Circuit Breaker
- [ ] **Teste 9**: Simular 503 em `/api/analytics/ga`
  - Verificar 3 tentativas de retry com backoff
  - Depois de 5 falhas: circuit breaker deve abrir
  - Verificar: "[CircuitBreaker] Threshold reached, opening circuit"

- [ ] **Teste 10**: Aguardar 1 minuto após circuit breaker abrir
  - Circuit breaker deve tentar HALF_OPEN
  - Se sucesso: fechar circuito novamente

- [ ] **Teste 11**: Requisição com timeout (>30s)
  - Deve abortar após 30 segundos
  - Verificar retry automático

- [ ] **Teste 12**: Analytics buffering offline
  - Desconectar internet
  - Enviar eventos de analytics → devem ser bufferizados
  - Reconectar internet
  - Verificar flush automático após 1 minuto

**Critério de Sucesso**: Sem erros 503 não tratados; fallback funcionando

---

### Error Tracker
- [ ] **Teste 13**: Lançar erro intencional no console
  ```js
  throw new Error('Test error');
  ```
  - Verificar captura automática
  - Verificar classificação correta
  - Verificar serialização (message, name, stack)

- [ ] **Teste 14**: Promise rejection não tratada
  ```js
  Promise.reject(new Error('Test rejection'));
  ```
  - Verificar captura em `unhandledrejection`
  - Verificar breadcrumbs registrados

- [ ] **Teste 15**: Erro de rede (desligar WiFi + fetch)
  - Classificação: `category: 'network'`
  - Severity: `'warning'`
  - `retryable: true`

- [ ] **Teste 16**: Erro de adblock (instalar uBlock Origin)
  - Verificar: `category: 'adblock'`
  - Severity: `'info'`
  - **Não deve enviar** para backend

- [ ] **Teste 17**: Sanitização de PII
  - Incluir CPF, email, telefone em erro
  - Verificar substituição por `[REDACTED]`

**Critério de Sucesso**: Todos os erros capturados, classificados e sem PII vazado

---

### Form Submit Seguro
- [ ] **Teste 18**: Submit de formulário de contato
  - Verificar obtenção de CSRF token
  - Verificar header `X-CSRF-Token` presente
  - Submit com sucesso

- [ ] **Teste 19**: Tentar submit com CSRF token expirado
  - Deve retornar erro 403
  - Token deve ser renovado automaticamente
  - Usuário deve tentar novamente

- [ ] **Teste 20**: Validação de campos
  - Nome < 2 caracteres → erro
  - Email inválido → erro
  - Mensagem < 10 caracteres → erro
  - XSS tentativo (`<script>alert(1)</script>`) → bloqueado

- [ ] **Teste 21**: Rate limiting (enviar 10 formulários em <1 segundo)
  - Deve retornar 429 "Too many requests"

**Critério de Sucesso**: Sem erros 403 JSONP; formulário com CSRF funcionando

---

## 🌐 Testes de Compatibilidade

### Navegadores
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

### Extensões
- [ ] uBlock Origin habilitado → sem erros críticos
- [ ] Privacy Badger habilitado → analytics com fallback
- [ ] AdBlock Plus habilitado → tracking de adblock correto

### Redes
- [ ] WiFi estável
- [ ] 4G/LTE (mobile)
- [ ] Throttled (Slow 3G no DevTools)
- [ ] Offline → Online transitions

---

## 📊 Métricas de Validação

### Console Errors (DevTools)
**Antes**:
- ❌ `sw.js:1458 Uncaught (in promise) Object`
- ❌ `Unchecked runtime.lastError: back/forward cache`
- ❌ `InvalidStateError: send while CONNECTING`
- ❌ `503 /api/analytics/ga`
- ❌ `404 lc.pulse.is/live-chat/.../messages`
- ❌ `403 web.webformscr.com/...jsonp-submit`
- ❌ `ERR_BLOCKED_BY_CLIENT`
- ❌ `Global error: Object`

**Depois**:
- ✅ **0 erros não tratados**
- ✅ Warnings informativos apenas (adblock, offline)
- ✅ Breadcrumbs registrados corretamente

### Performance
- [ ] Tempo de carregamento inicial: <3s (3G)
- [ ] Time to Interactive (TTI): <5s
- [ ] Reconexões WebSocket: <2s após reconectar rede
- [ ] Analytics buffer flush: <60s quando online

### Logs Estruturados
- [ ] `[PortManager]` logs presentes e legíveis
- [ ] `[RobustWS]` logs com estado correto
- [ ] `[FetchRetry]` logs com tentativas e delays
- [ ] `[CircuitBreaker]` logs com transições de estado
- [ ] `[SecureForm]` logs de CSRF e validação
- [ ] `[ErrorTracker]` logs com classificação

---

## 🔐 Segurança

- [ ] **CSRF Protection**: Token gerado e validado corretamente
- [ ] **PII Sanitization**: CPF, email, telefone removidos de erros
- [ ] **XSS Prevention**: `<script>`, `javascript:`, `on*=` bloqueados em forms
- [ ] **CORS**: Headers corretos em `/api/*` endpoints
- [ ] **Rate Limiting**: 403/429 retornados quando limite excedido
- [ ] **Secrets**: Nenhuma API key, token ou credencial no frontend

---

## 📱 Mobile Specific

- [ ] **BFCache Mobile**: Safari iOS back/forward funciona
- [ ] **Background Tab**: App retorna de background sem crash
- [ ] **Low Memory**: WebSocket reconecta após iOS matar app
- [ ] **Network Switch**: WiFi → 4G transition sem erros
- [ ] **Touch Events**: Formulários funcionam em mobile

---

## 🚀 Deploy Validation

### Pré-Production (Staging)
- [ ] Deploy em staging completo sem erros
- [ ] Smoke tests passando
- [ ] Métricas de erro < 0.1% (vs. baseline)
- [ ] Performance dentro de SLA

### Production (Canary)
- [ ] Deploy canário (10% tráfego)
- [ ] Monitorar por 1 hora
- [ ] Taxa de erro < 0.05%
- [ ] Rollback plan testado e pronto

### Production (Full)
- [ ] Rollout gradual: 10% → 25% → 50% → 100%
- [ ] Monitorar dashboards em tempo real
- [ ] On-call team notificado
- [ ] Documentação atualizada

---

## 📞 Rollback Criteria

**Rollback imediato se**:
- Taxa de erro > 1% (vs. baseline)
- Performance degradation > 20%
- Incidentes críticos (P0/P1) reportados
- Circuit breakers todos abertos (>80%)
- WebSocket reconnection loop infinito
- Analytics buffer não drena (>10min)

**Processo de Rollback**:
1. Notificar equipe
2. Executar `npm run deploy:rollback`
3. Verificar métricas retornando ao normal
4. Post-mortem agendado em 24h

---

## 📝 Sign-Off

- [ ] **Dev Lead**: Código revisado e aprovado
- [ ] **QA**: Todos os testes passando
- [ ] **Security**: Nenhuma vulnerabilidade crítica
- [ ] **Product**: Funcionalidades validadas
- [ ] **DevOps**: Infraestrutura pronta

**Assinaturas**:
- Dev: _________________ Data: _________
- QA: _________________ Data: _________
- Security: _________________ Data: _________

---

## 🔗 Links Úteis

- [Documentação de Erros](./Error-Tracking-Guide.md)
- [Plano de Rollout](./Rollout-Plan.md)
- [Dashboards de Monitoramento](https://monitoring.saraivavision.com.br)
- [Runbook de Incidentes](./Incident-Runbook.md)
