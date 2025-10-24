# Guia de Deployment - Correções Saraiva Vision

**Data:** 2025-10-24
**Autor:** Dr. Philipe Saraiva Cruz
**Status:** ✅ Pronto para deployment

## 📋 Resumo das Correções

Todas as 8 correções críticas foram implementadas e validadas:

| # | Issue | Arquivo | Status |
|---|-------|---------|--------|
| 1 | CSP descomentado + JotForm | nginx-saraivavision.conf | ✅ |
| 2 | Proxy cache configurado | nginx-gtm-proxy.conf | ✅ |
| 3 | IndexedDB analytics | sw.js.backup | ✅ |
| 4 | offline.html precache | sw.js.backup | ✅ |
| 5 | navigator.onLine removido | sw.js.backup | ✅ |
| 6 | Sed verification | fix-fetch-errors.sh | ✅ |
| 7 | Glob expansion fix | fix-fetch-errors.sh | ✅ |
| 8 | Glob expansion fix | fix-jotform-csp.sh | ✅ |

## 🚀 Deployment Automatizado

### Opção 1: Deployment Completo (Recomendado)

```bash
# Em staging/desenvolvimento
./scripts/deploy-fixes.sh --apply

# Validar em staging
npm run dev
# Testar GTM, GA, JotForm, analytics persistence

# Quando validado, deploy para produção
npm run build
npm run deploy  # ou seu comando de deploy
```

### Opção 2: Deployment Seletivo

```bash
# Apenas Service Worker
./scripts/deploy-fixes.sh --apply --skip-nginx

# Apenas Nginx
./scripts/deploy-fixes.sh --apply --skip-sw
```

### Opção 3: Dry-Run (Visualizar mudanças)

```bash
# Ver o que será alterado sem aplicar
./scripts/deploy-fixes.sh
```

## 📝 Deployment Manual

Se preferir aplicar manualmente:

### 1. Service Worker

```bash
# Backup do atual
cp public/sw.js public/sw.js.backup.$(date +%Y%m%d_%H%M%S)

# Aplicar versão corrigida
cp public/sw.js.backup.20251022_005207 public/sw.js

# Rebuild
npm run build
```

**Validar:** Verificar IndexedDB no DevTools → Application → IndexedDB → saraiva-analytics

### 2. Nginx Configuration

```bash
# Backup do atual
sudo cp /etc/nginx/sites-available/saraivavision /etc/nginx/sites-available/saraivavision.backup.$(date +%Y%m%d_%H%M%S)

# Aplicar versão corrigida
sudo cp backups/20251015_222018/nginx-saraivavision.conf /etc/nginx/sites-available/saraivavision

# Testar configuração
sudo nginx -t

# Se OK, reload
sudo systemctl reload nginx
```

**Validar:** Abrir DevTools → Console → Verificar ausência de CSP violations

### 3. Scripts (Nenhuma ação necessária)

Os scripts `fix-fetch-errors.sh` e `fix-jotform-csp.sh` já foram corrigidos e podem ser executados normalmente.

## ✅ Checklist de Validação

### Pré-Deployment
- [x] Todas as 8 correções implementadas
- [x] Sintaxe bash validada
- [x] Backup dos arquivos originais criado
- [ ] Testes em ambiente local executados

### Pós-Deployment (Staging)
- [ ] Service Worker instalado corretamente
- [ ] IndexedDB criado (DevTools → Application → IndexedDB)
- [ ] offline.html carregado no cache
- [ ] CSP ativo sem violations
- [ ] GTM/GA funcionando
- [ ] JotForm embed funcionando
- [ ] Analytics persistence testada (restart SW)

### Pós-Deployment (Produção)
- [ ] Monitorar CSP violations primeiras 24h
- [ ] Verificar IndexedDB quota usage
- [ ] Validar analytics sync rate
- [ ] Testes cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] Testes mobile (iOS Safari, Chrome Android)

## 🔍 Testes de Validação

### 1. Service Worker IndexedDB

```javascript
// No DevTools Console:
// 1. Abrir IndexedDB
indexedDB.databases().then(dbs => console.log(dbs));
// Deve mostrar: saraiva-analytics

// 2. Forçar evento analytics
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.controller.postMessage({
    type: 'analytics-event',
    data: { test: true }
  });
}

// 3. Verificar evento no DB
// DevTools → Application → IndexedDB → saraiva-analytics → events
```

### 2. CSP Validation

```bash
# Verificar header CSP
curl -I https://saraivavision.com.br | grep -i content-security

# Deve retornar header com JotForm domains
```

```javascript
// No console do browser (deve estar vazio se CSP OK)
console.log(window.cspViolations || []);
```

### 3. Offline Functionality

```javascript
// No DevTools:
// 1. Application → Service Workers → Offline checkbox
// 2. Recarregar página
// Deve mostrar /offline.html
```

### 4. Analytics Persistence

```javascript
// No DevTools Console:
// 1. Criar evento
fetch('/api/analytics/ga', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: true })
});

// 2. Matar Service Worker
// Application → Service Workers → Stop

// 3. Recarregar e verificar
// Events devem ainda estar no IndexedDB
```

## 🐛 Troubleshooting

### CSP Violations

**Sintoma:** Console mostra "Content Security Policy violation"

**Solução:**
```bash
# Verificar header CSP está ativo
curl -I https://saraivavision.com.br | grep -i content-security

# Se não aparecer, verificar nginx
sudo nginx -t
sudo systemctl status nginx
```

### IndexedDB Não Criado

**Sintoma:** IndexedDB "saraiva-analytics" não aparece no DevTools

**Solução:**
```javascript
// Verificar se SW está ativo
navigator.serviceWorker.ready.then(reg => {
  console.log('SW Ready:', reg);
});

// Forçar recriação
indexedDB.deleteDatabase('saraiva-analytics');
// Recarregar página
```

### Service Worker Não Atualiza

**Sintoma:** Alterações no SW não refletem no browser

**Solução:**
```javascript
// DevTools → Application → Service Workers
// 1. Marcar "Update on reload"
// 2. Click "Unregister"
// 3. Hard refresh (Ctrl+Shift+R)
```

### Nginx Não Reload

**Sintoma:** `sudo systemctl reload nginx` falha

**Solução:**
```bash
# Verificar erro específico
sudo nginx -t

# Ver logs
sudo tail -50 /var/log/nginx/error.log

# Se falhar, rollback
sudo cp /etc/nginx/sites-available/saraivavision.backup.TIMESTAMP /etc/nginx/sites-available/saraivavision
sudo systemctl reload nginx
```

## 📊 Monitoramento Pós-Deployment

### Métricas para Monitorar

1. **CSP Violations**
   - DevTools Console → Filtrar "Content-Security-Policy"
   - Objetivo: 0 violations

2. **IndexedDB Usage**
   - DevTools → Application → Storage → IndexedDB
   - Objetivo: < 5 MB

3. **Analytics Events**
   - IndexedDB → saraiva-analytics → events
   - Objetivo: Eventos sincronizam e são removidos

4. **Service Worker Updates**
   - DevTools → Application → Service Workers
   - Objetivo: Update automático em 24h

### Logs para Verificar

```bash
# Nginx access log
sudo tail -f /var/log/nginx/access.log | grep -E "(gtm|analytics|jotform)"

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Application logs (browser console)
# Filtrar: [SW:INFO], [SW:ERROR]
```

## 🔄 Rollback Plan

Se algo der errado após deployment:

### 1. Rollback Service Worker

```bash
# Restaurar backup
LATEST_BACKUP=$(ls -t public/sw.js.backup.* | head -1)
cp "$LATEST_BACKUP" public/sw.js

# Rebuild
npm run build
npm run deploy
```

### 2. Rollback Nginx

```bash
# Restaurar backup
LATEST_BACKUP=$(ls -t /etc/nginx/sites-available/saraivavision.backup.* | head -1)
sudo cp "$LATEST_BACKUP" /etc/nginx/sites-available/saraivavision

# Reload
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Forçar Limpeza Cache

```bash
# Limpar cache nginx
sudo rm -rf /var/cache/nginx/*

# Limpar cache browser (instruir usuários)
# Ctrl+Shift+Del → Clear cache
```

## 📚 Referências

- [Relatório de Validação](./FIXES_VALIDATION_REPORT.md)
- [Script de Deploy](../scripts/deploy-fixes.sh)
- [Documentação CSP JotForm](../docs/JOTFORM_CSP_SOLUTION.md)

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Verificar troubleshooting section acima
2. Consultar logs (nginx + browser console)
3. Revisar FIXES_VALIDATION_REPORT.md
4. Executar rollback se necessário

---

**Última Atualização:** 2025-10-24 02:58 UTC
**Versão:** 1.0.0
**Autor:** Dr. Philipe Saraiva Cruz
