# 🚀 INSTRUÇÕES DE DEPLOY - Saraiva Vision

**Tempo Estimado**: 5 minutos
**Downtime**: Zero (reload Nginx é graceful)
**Reversível**: Sim (backup automático criado)

---

## ✅ PRÉ-REQUISITOS

- [x] Acesso SSH ao VPS (root@31.97.129.78)
- [x] Script de deploy criado e commitado
- [x] Novo build pronto (index-BBFraBW_.js)

---

## 🎯 EXECUÇÃO DO DEPLOY

### Opção 1: Script Automatizado (RECOMENDADO) ⭐

Conecte no VPS e execute **apenas um comando**:

```bash
# SSH no VPS
ssh root@31.97.129.78

# Execute o script completo
sudo bash /home/saraiva-vision-site/DEPLOY_NOW.sh
```

**O script vai automaticamente**:
1. ✅ Fazer pull do código atualizado
2. ✅ Aplicar correção de cache headers do Nginx
3. ✅ Criar backup da produção atual
4. ✅ Deploy do novo build (index-BBFraBW_.js)
5. ✅ Configurar permissões corretas
6. ✅ Validar deployment com testes
7. ✅ Verificar cache headers aplicados

---

## ✅ VALIDAÇÃO PÓS-DEPLOY

### Teste 1: Cache Headers Corretos

```bash
# HTML deve ter no-cache
curl -sI https://saraivavision.com.br/ | grep Cache-Control
# ✅ Esperado: "no-store, no-cache, must-revalidate"

# Assets devem ter cache imutável
curl -sI https://saraivavision.com.br/assets/index-BBFraBW_.js | grep Cache-Control
# ✅ Esperado: "public, immutable, max-age=31536000"
```

### Teste 2: No Navegador

1. **Abrir**: https://saraivavision.com.br/blog
2. **Hard refresh**: Ctrl+Shift+R (fazer 3 vezes)
3. **DevTools**: Network tab > Verificar todos *.js retornam 200 ✅

---

## 🔄 ROLLBACK (Se Necessário)

```bash
# Restaurar backup
sudo cp -r /var/www/html.backup/* /var/www/html/
sudo systemctl reload nginx
```

---

**Status**: ✅ Pronto para deploy
**Build**: index-BBFraBW_.js
**Script**: `/home/saraiva-vision-site/DEPLOY_NOW.sh`
