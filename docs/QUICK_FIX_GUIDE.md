# 🚨 Guia Rápido de Correção - Chunk Loading Errors

**Tempo Estimado**: 5-10 minutos
**Downtime**: Zero (reload Nginx é graceful)
**Reversível**: Sim (backup automático)

---

## ⚡ Execução Rápida (Script Automatizado)

### Opção 1: Script Automatizado (RECOMENDADO)

```bash
# SSH no VPS
ssh root@31.97.129.78

# Executar script de correção
cd /home/saraiva-vision-site
sudo bash scripts/fix-cache-headers.sh

# O script vai:
# 1. ✅ Criar backup automático
# 2. ✅ Aplicar correções de cache
# 3. ✅ Validar sintaxe Nginx
# 4. ✅ Reload graceful (zero downtime)
# 5. ✅ Verificar headers aplicados
```

### Opção 2: Manual (3 comandos)

```bash
# SSH no VPS
ssh root@31.97.129.78

# 1. Backup
sudo cp /etc/nginx/sites-available/saraivavision \
       /etc/nginx/sites-available/saraivavision.backup.$(date +%Y%m%d_%H%M%S)

# 2. Editar e aplicar nova config
sudo nano /etc/nginx/sites-available/saraivavision
# Colar config de docs/LAZY_LOADING_ERROR_DIAGNOSIS.md seção "NGINX - Cache Headers"

# 3. Test e reload
sudo nginx -t && sudo systemctl reload nginx
```

---

## ✅ Validação Imediata (2 minutos)

```bash
# Teste 1: HTML deve ter no-cache
curl -sI https://saraivavision.com.br/ | grep Cache-Control
# Esperado: "no-store, no-cache, must-revalidate"

# Teste 2: Assets devem ter cache imutável
curl -sI https://saraivavision.com.br/assets/index-Ct4Rw6XG.js | grep Cache-Control
# Esperado: "public, immutable, max-age=31536000"

# Teste 3: Nginx status
sudo systemctl status nginx
# Esperado: "active (running)"
```

**No Navegador**:
1. Hard refresh: `Ctrl+Shift+R` (3x)
2. Abrir: https://saraivavision.com.br/blog
3. DevTools > Network > Verificar:
   - ✅ Todos *.js retornam 200
   - ✅ Sem erros no console
   - ✅ Cache-Control correto

---

## 🆘 Problemas?

### Erro 1: "nginx: [emerg] syntax error"
```bash
# Restaurar backup
sudo cp /etc/nginx/sites-available/saraivavision.backup.* \
       /etc/nginx/sites-available/saraivavision
sudo systemctl reload nginx
```

### Erro 2: Ainda vejo chunks antigos
```bash
# Purge de cache no navegador
DevTools > Application > Clear storage > Clear site data
Hard refresh: Ctrl+Shift+R

# Purge de CDN (se aplicável)
# Cloudflare: Dashboard > Caching > Purge Everything
```

### Erro 3: 502 Bad Gateway
```bash
# Verificar sintaxe e reload
sudo nginx -t
sudo systemctl restart nginx

# Ver logs
sudo tail -50 /var/log/nginx/error.log
```

---

## 📊 O Que Foi Corrigido?

| Antes | Depois | Impacto |
|-------|--------|---------|
| HTML: `max-age=3600` (1h cache) | HTML: `no-store, no-cache` | ✅ HTML sempre fresco |
| Assets: `max-age=3600` (1h cache) | Assets: `immutable, max-age=31536000` | ✅ Assets cached agressivamente |
| Chunks 404 causavam erro fatal | ErrorBoundary + Retry automático | ✅ Graceful fallback |

**Resultado**: Usuários sempre recebem HTML atualizado que referencia chunks corretos.

---

## 🎯 Próximos Deploys

Para evitar esse problema no futuro:

```bash
# Sempre após npm run build:
1. Deploy assets primeiro
2. Deploy HTML por último
3. Nginx reload
4. Purge de CDN/cache (se aplicável)
5. Hard refresh no navegador
```

**CI/CD** (futuro):
```yaml
steps:
  - npm run build
  - rsync dist/assets/ vps:/var/www/html/assets/
  - rsync dist/*.html vps:/var/www/html/
  - ssh vps "sudo systemctl reload nginx"
```

---

Para diagnóstico completo e prevenção, consulte: **docs/LAZY_LOADING_ERROR_DIAGNOSIS.md**