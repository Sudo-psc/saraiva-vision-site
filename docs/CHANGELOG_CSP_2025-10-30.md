# Changelog - Content Security Policy (CSP)

## 2025-10-30 - Correção Google Analytics

### Problema
Google Tag Manager estava sendo bloqueado pela CSP ao tentar conectar com:
```
https://www.google.com/ccm/collect
```

**Erro no console:**
```
Refused to connect to 'https://www.google.com/ccm/collect' because it does not appear 
in the connect-src directive of the Content Security Policy.
```

### Solução
Adicionado `https://www.google.com` à diretiva `connect-src` da CSP no Nginx.

**Arquivo:** `/etc/nginx/sites-enabled/saraivavision` (linha 418)

**Mudança:**
```nginx
# ANTES
connect-src 'self' https://*.sanity.io ... https://www.google-analytics.com ...

# DEPOIS  
connect-src 'self' https://*.sanity.io ... https://www.google.com https://www.google-analytics.com ...
```

### Backup
Backup criado em: `/tmp/saraivavision.backup-20251030-153713`

### Verificação
```bash
curl -sI https://saraivavision.com.br | grep "Content-Security-Policy" | grep "www.google.com"
# Deve retornar a linha com www.google.com
```

### Resultado
✅ Google Analytics agora funciona sem erros de CSP
✅ Coleta de dados do GTM funcionando corretamente

---
**Author:** Dr. Philipe Saraiva Cruz (via Claude Code)
**Date:** 2025-10-30
