# Plano de Rollout - Correções de Erros Front-end

## 📅 Timeline de Implementação

### **Fase 1: Preparação** (Semana 1)
**Objetivo**: Setup de infraestrutura e feature flags

#### Tarefas
1. **Feature Flags Setup**
   ```javascript
   // src/lib/feature-flags.js
   export const FEATURES = {
     ROBUST_WEBSOCKET: localStorage.getItem('ff_robust_ws') === 'true',
     FETCH_RETRY: localStorage.getItem('ff_fetch_retry') === 'true',
     ERROR_TRACKER: localStorage.getItem('ff_error_tracker') === 'true',
     SECURE_FORMS: localStorage.getItem('ff_secure_forms') === 'true',
     PORT_MANAGER: localStorage.getItem('ff_port_manager') === 'true'
   };
   ```

2. **Monitoramento Setup**
   - Dashboard de métricas (Grafana/Datadog)
   - Alertas configurados
   - Log aggregation (ELK/Splunk)

3. **Baseline Metrics** (7 dias antes do deploy)
   - Taxa de erro atual: ____%
   - Tempo médio de reconexão: ____s
   - Analytics success rate: ____%
   - WebSocket uptime: ____%
   - Form submission rate: ____%

#### Deliverables
- [ ] Feature flags implementados
- [ ] Dashboards configurados
- [ ] Baseline metrics coletados
- [ ] Rollback script testado
- [ ] On-call team treinado

---

### **Fase 2: Deploy Staging** (Semana 2)
**Objetivo**: Validar em ambiente controlado

#### Atividades
1. **Deploy para Staging**
   ```bash
   # Build com feature flags habilitados
   VITE_FF_ROBUST_WS=true \
   VITE_FF_FETCH_RETRY=true \
   VITE_FF_ERROR_TRACKER=true \
   npm run build:vite

   # Deploy staging
   npm run deploy:staging
   ```

2. **Testes Automatizados**
   - Cypress E2E suite completa
   - Playwright browser tests
   - Load testing (Artillery/k6)
   - Security scanning (OWASP ZAP)

3. **Testes Manuais** (QA team)
   - Seguir checklist completo
   - Testar em todos os navegadores
   - Validar mobile (iOS/Android)
   - Testar com ad blockers

#### Critérios de Sucesso
- [ ] 100% dos testes automatizados passando
- [ ] 0 erros críticos (P0) no console
- [ ] Performance dentro de SLA (<3s load time)
- [ ] QA sign-off completo

#### Rollback Plan
- Reverter para versão anterior em staging
- Analisar logs e identificar causa raiz
- Fix e repetir Fase 2

---

### **Fase 3: Canary Deploy** (Semana 3 - Dia 1-2)
**Objetivo**: Validar em produção com tráfego limitado

#### Setup
```nginx
# Nginx canary config
upstream backend_stable {
  server 127.0.0.1:3001 weight=9;
}

upstream backend_canary {
  server 127.0.0.1:3002 weight=1;
}

server {
  location / {
    # 90% stable, 10% canary
    split_clients "${remote_addr}${http_user_agent}" $backend {
      90%     backend_stable;
      *       backend_canary;
    }

    proxy_pass http://$backend;
  }
}
```

#### Métricas a Monitorar (tempo real)
| Métrica | Threshold | Alert |
|---------|-----------|-------|
| Error Rate | <0.1% | >0.5% |
| Reconnection Time | <2s avg | >5s |
| Analytics Success | >98% | <95% |
| Form Submit Success | >99% | <97% |
| CPU Usage | <70% | >85% |
| Memory Usage | <80% | >90% |

#### Duração
- **Mínimo**: 2 horas sem incidentes
- **Recomendado**: 24 horas
- **Máximo**: 48 horas antes de full rollout

#### Go/No-Go Criteria
**GO** se:
- ✅ Todas as métricas dentro do threshold
- ✅ Nenhum incidente P0/P1
- ✅ Error rate canary ≤ error rate stable
- ✅ Feedback positivo do on-call team

**NO-GO** se:
- ❌ Error rate > 0.5%
- ❌ Incidentes P0 ou múltiplos P1
- ❌ Circuit breakers sempre abertos
- ❌ Performance degradation >20%

#### Rollback Plan
```bash
# Rollback imediato
nginx -s stop
# Revert to stable version
cd /var/www/saraivavision
ln -sfn releases/stable current
nginx -s start

# Verificar
curl -I https://saraivavision.com.br
```

---

### **Fase 4: Gradual Rollout** (Semana 3 - Dia 3-7)
**Objetivo**: Aumentar tráfego gradualmente

#### Plano de Rollout
| Dia | % Tráfego | Duração | Rollback Window |
|-----|-----------|---------|-----------------|
| D+3 | 25% | 6h | Immediate |
| D+4 | 50% | 12h | <15min |
| D+5 | 75% | 24h | <30min |
| D+6 | 90% | 24h | <1h |
| D+7 | 100% | - | <2h |

#### Configuração Nginx por Fase
```nginx
# 25% canary
split_clients "${remote_addr}${http_user_agent}" $backend {
  75%     backend_stable;
  *       backend_canary;
}

# 50% canary
split_clients "${remote_addr}${http_user_agent}" $backend {
  50%     backend_stable;
  *       backend_canary;
}

# etc...
```

#### Checkpoints
**A cada aumento de %**:
1. Atualizar Nginx config
2. Reload Nginx: `sudo systemctl reload nginx`
3. Monitorar por duração mínima
4. Validar métricas
5. Aprovar próximo incremento ou rollback

#### Alertas Automatizados
```yaml
# Alertmanager config
- alert: ErrorRateHigh
  expr: rate(http_errors_total[5m]) > 0.01
  for: 5m
  annotations:
    summary: "Error rate above 1% for 5 minutes"
    action: "Consider rollback"

- alert: ReconnectionLooping
  expr: rate(websocket_reconnections_total[1m]) > 10
  for: 2m
  annotations:
    summary: "WebSocket reconnecting >10/min"
    action: "Investigate connection stability"

- alert: CircuitBreakerOpen
  expr: circuit_breaker_state{state="open"} == 1
  for: 5m
  annotations:
    summary: "Circuit breaker open for 5+ minutes"
    action: "Check downstream service health"
```

---

### **Fase 5: Post-Rollout** (Semana 4)
**Objetivo**: Validar estabilidade e otimizar

#### Atividades

**Dia 1-2: Monitoramento Intensivo**
- [ ] On-call 24/7 por 48h
- [ ] Dashboards em tela grande
- [ ] Slack channel #rollout-monitoring ativo
- [ ] Incident response team standby

**Dia 3-5: Análise de Dados**
- [ ] Comparar métricas antes/depois
- [ ] Identificar regressões ou melhorias
- [ ] Coletar feedback de usuários
- [ ] Review de logs e errors

**Dia 6-7: Otimizações**
- [ ] Ajustar thresholds de retry/backoff
- [ ] Tunning de circuit breaker
- [ ] Otimizar buffer sizes
- [ ] Remover feature flags (hardcode enabled)

#### Métricas de Sucesso

| Métrica | Baseline | Target | Resultado |
|---------|----------|--------|-----------|
| Error Rate | 2.5% | <0.5% | ____% |
| Uncaught Errors | 150/dia | 0 | ____ |
| WebSocket Uptime | 95% | >99% | ____% |
| Analytics Success | 92% | >98% | ____% |
| Form Submit Rate | 85% | >99% | ____% |
| Avg Reconnect Time | 15s | <2s | ____s |
| Circuit Breaker Trips | N/A | <5/dia | ____ |

#### Deliverables
- [ ] Relatório de métricas (before/after)
- [ ] Post-mortem de incidentes (se houver)
- [ ] Documentação atualizada
- [ ] Runbook atualizado
- [ ] Lessons learned doc

---

## 📊 Monitoramento Contínuo

### Dashboards

**Dashboard 1: Error Tracking**
- Total errors (24h window)
- Errors by category (network, adblock, 4xx, 5xx, etc)
- Error rate trend (7d)
- Top 10 error messages
- Errors by browser/OS

**Dashboard 2: Connection Health**
- WebSocket connections (active)
- Reconnection rate (per minute)
- Avg reconnection time
- Circuit breaker states
- Port manager reconnections

**Dashboard 3: Analytics Performance**
- GA/GTM success rate
- Buffered events count
- Flush rate
- 503 errors trend
- Analytics latency (p50, p95, p99)

**Dashboard 4: Form Submissions**
- Form submit success rate
- CSRF token generation rate
- 403 errors (CSRF failures)
- Validation errors by field
- Submit latency

### Alertas

**P0 (Critical - Page Immediately)**
- Error rate >5%
- WebSocket down >10min
- Circuit breakers all open
- Forms completely broken (0 success)

**P1 (High - Notify in 15min)**
- Error rate >1%
- Reconnection time >10s avg
- Analytics buffer not draining (>5min)
- Form success rate <90%

**P2 (Medium - Notify in 1h)**
- Error rate >0.5%
- Circuit breaker open >30min
- Performance degradation >20%

**P3 (Low - Notify in 4h)**
- Error rate >0.1%
- Minor regressions detected
- Warnings in logs

---

## 🔄 Rollback Procedures

### Automatic Rollback (CI/CD)
```yaml
# .github/workflows/auto-rollback.yml
name: Auto Rollback on High Error Rate

on:
  schedule:
    - cron: '*/5 * * * *' # Every 5 minutes

jobs:
  check-health:
    runs-on: ubuntu-latest
    steps:
      - name: Query metrics
        run: |
          ERROR_RATE=$(curl -s "$METRICS_API/error-rate?window=5m")

          if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
            echo "Error rate $ERROR_RATE > 1%, triggering rollback"
            curl -X POST "$DEPLOY_API/rollback" \
              -H "Authorization: Bearer $DEPLOY_TOKEN"
            exit 1
          fi
```

### Manual Rollback
```bash
#!/bin/bash
# scripts/manual-rollback.sh

set -e

echo "🔄 Starting manual rollback..."

# 1. Switch symlink to previous release
cd /var/www/saraivavision
CURRENT=$(readlink current)
PREVIOUS=$(ls -t releases | grep -v "$(basename $CURRENT)" | head -1)

echo "Rolling back from $CURRENT to $PREVIOUS"
ln -sfn "releases/$PREVIOUS" current

# 2. Reload Nginx
sudo systemctl reload nginx

# 3. Restart backend if needed
sudo systemctl restart saraiva-api

# 4. Verify
sleep 5
curl -f https://saraivavision.com.br/health || exit 1

echo "✅ Rollback completed successfully"
echo "📊 Check metrics: https://monitoring.saraivavision.com.br"
```

---

## 📝 Communication Plan

### Stakeholders
- **Dev Team**: Slack #engineering
- **QA Team**: Slack #quality
- **Product Team**: Slack #product
- **Leadership**: Email summary
- **Users**: Status page (se necessário)

### Templates

**Pré-Rollout Announcement**
```
🚀 Rollout Starting - Error Fixes

We're deploying significant error handling improvements:
- Robust WebSocket reconnection
- Analytics fallback & retry logic
- Enhanced error tracking
- Secure form submissions

Timeline:
- Canary: Today 10am-2pm (10% traffic)
- Gradual: Mon-Fri (25%, 50%, 75%, 100%)

Monitoring: https://monitoring.saraivavision.com.br
Questions: #rollout-help
```

**Rollout Update (cada fase)**
```
✅ Rollout Phase Complete - 25% Traffic

Metrics (vs baseline):
- Error rate: 2.5% → 0.3% (88% reduction)
- WebSocket uptime: 95% → 99.5%
- Analytics success: 92% → 98%

No incidents. Proceeding to 50% tomorrow at 10am.
```

**Rollout Complete**
```
🎉 Rollout Complete - 100% Traffic

All error fixes deployed successfully!

Results:
- 90% reduction in console errors
- 99.5% WebSocket uptime
- 98% analytics delivery rate
- 0 critical incidents

Thanks to the team for the smooth rollout!

Post-mortem: [link]
```

---

## 🎯 Success Criteria Summary

### Must Have (Go-Live Blockers)
- ✅ 0 P0/P1 incidents during canary
- ✅ Error rate <0.5%
- ✅ All critical paths tested
- ✅ Rollback tested and working
- ✅ On-call team briefed

### Nice to Have
- ✅ Performance improvements visible
- ✅ Positive user feedback
- ✅ Clean dashboards
- ✅ Documentation complete

### Post-Launch Goals (Week 4)
- ✅ Error rate <0.1% sustained
- ✅ 99.9% uptime
- ✅ All feature flags removed
- ✅ Team trained on new systems
- ✅ Lessons learned documented

---

## 📞 Emergency Contacts

| Role | Name | Phone | Slack |
|------|------|-------|-------|
| Dev Lead | _______ | _______ | @______ |
| DevOps | _______ | _______ | @______ |
| On-Call Engineer | _______ | _______ | @______ |
| Product Manager | _______ | _______ | @______ |
| CTO | _______ | _______ | @______ |

**Escalation Path**: Dev Lead → DevOps → CTO

**War Room**: #incident-response (Slack)

---

## 📚 References

- [QA Checklist](./Error-Fixes-QA-Checklist.md)
- [Error Tracking Guide](./Error-Tracking-Guide.md)
- [Architecture Docs](./Architecture.md)
- [Runbook](./Runbook.md)
- [Post-Mortem Template](./Post-Mortem-Template.md)
