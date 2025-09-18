# Testes e Verificação do Google Tag Manager (GTM)

Este documento explica como testar e verificar a integração do Google Tag Manager no projeto Saraiva Vision.

## 🏷️ GTM Configurado

- **GTM ID**: `GTM-KF2NP85D`
- **Implementação**: LGPD-compliant com Consent Mode v2
- **Carregamento**: Condicional após consentimento do usuário

## 🧪 Testes Disponíveis

### 1. Teste de Unidade GTM
```bash
npm run test:gtm
```

Executa testes unitários que verificam:
- Configuração correta do GTM ID
- Integração com sistema de consentimento
- Carregamento condicional
- Injeção de scripts
- Compliance com LGPD

### 2. Verificação de Deploy
```bash
npm run verify:gtm
```

Executa verificação completa que valida:
- ✅ **Bundle contém GTM ID**: Verifica se o GTM ID está presente nos assets JavaScript
- ✅ **Consent Mode ativo**: Confirma implementação do Consent Mode v2
- ✅ **GTM CDN acessível**: Testa conectividade com servidores do Google
- ✅ **Site deployado**: Verifica se o site está acessível e funcionando

### 3. Verificação Completa
```bash
npm run verify
```

Inclui verificação GTM no pipeline completo de validação (build + GTM + links + HTML + lighthouse).

## 🚀 Deploy Automático

O script de deploy (`./deploy.sh`) automaticamente executa a verificação GTM após cada deploy:

```bash
sudo ./deploy.sh
```

Saída esperada:
```
✅ Deploy completed
🏷️  Verificando integração GTM...
✅ GTM verificação passou - ID: GTM-KF2NP85D
```

## 🔍 Verificação Manual

### Via Browser
1. Acesse: `https://saraivavision.com.br/`
2. **Aceite os cookies** no banner de privacidade
3. Abra DevTools → Network → filtre por "googletagmanager"
4. O GTM deve carregar automaticamente

### Via Linha de Comando
```bash
# Verificar GTM no bundle local
grep -r "GTM-KF2NP85D" dist/assets/

# Verificar GTM no site em produção
curl -s https://saraivavision.com.br/assets/entry/index-*.js | grep -o "GTM-KF2NP85D"

# Testar conectividade GTM
curl -I https://www.googletagmanager.com/gtm.js?id=GTM-KF2NP85D
```

## 📊 Como Funciona a Implementação

### 1. Privacy-First Design
```javascript
// Por padrão, GTM NÃO carrega (respeitando privacidade)
gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied'
});
```

### 2. Carregamento Condicional
```javascript
// GTM só carrega quando usuário consente
window.addEventListener('consent-updated', (e) => {
  const consent = e.detail || {};
  if ((consent.analytics || consent.marketing) && !window.__GTM_LOADED__) {
    loadGTM(GTM_ID); // Carrega GTM-KF2NP85D
  }
});
```

### 3. Compliance LGPD
- ✅ Consentimento necessário para ativação
- ✅ Consent Mode v2 implementado
- ✅ Dados não coletados sem permissão
- ✅ Transparência total sobre uso de cookies

## ⚠️ Troubleshooting

### GTM Não Carrega
- **Causa**: Usuario não aceitou cookies
- **Solução**: Aceitar cookies no banner de privacidade

### Verificação Falha
```bash
# Re-executar verificação com debug
DIST_DIR="/var/www/saraivavision/current" node scripts/verify-gtm.js
```

### Ambiente Local vs Produção
```bash
# Local (usa dist/)
npm run verify:gtm

# Produção (usa release atual)
DIST_DIR="/var/www/saraivavision/current" npm run verify:gtm
```

## 🎯 Monitoramento Contínuo

### No Deploy
Toda vez que você executa `sudo ./deploy.sh`, a verificação GTM é executada automaticamente.

### No CI/CD
Se você configurar CI/CD, adicione:
```yaml
- name: Verify GTM Integration
  run: npm run verify:gtm
```

### Métricas de Sucesso
- 🟢 **100%**: Todas as verificações passaram
- 🟡 **75%**: GTM configurado mas algumas verificações falharam
- 🔴 **<75%**: Problema na implementação GTM

## 📈 Analytics e Tag Manager

Após o GTM carregar com sucesso:
1. **Google Analytics** será carregado automaticamente
2. **Tags personalizadas** configuradas no GTM serão executadas
3. **Eventos de conversão** começarão a ser rastreados
4. **Dados de consentimento** serão respeitados

O GTM `GTM-KF2NP85D` está configurado para máxima eficiência e compliance com a legislação brasileira (LGPD).