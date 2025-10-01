# 🚀 INSTRUÇÕES DE DEPLOY - Saraiva Vision

**Tempo Estimado**: 2 minutos
**Downtime**: Zero (reload Nginx é graceful)
**Reversível**: Sim (backup automático criado)

---

## ✅ PRÉ-REQUISITOS

- [x] Estar logado no VPS
- [x] Novo build gerado (npm run build)
- [x] Git atualizado com última versão

---

## 🎯 EXECUÇÃO DO DEPLOY

### Script Automatizado (1 comando) ⭐

Execute direto no VPS:

```bash
sudo bash /home/saraiva-vision-site/DEPLOY_NOW.sh
```

**O script vai automaticamente**:
1. ✅ Verificar diretório do projeto
2. ✅ Aplicar correção de cache headers do Nginx
3. ✅ Criar backup da produção atual
4. ✅ Deploy do novo build (detecta hash automaticamente)
5. ✅ Configurar permissões corretas
6. ✅ Validar deployment com testes
7. ✅ Verificar cache headers aplicados

---

## ✅ VALIDAÇÃO PÓS-DEPLOY

### Teste 1: Verificar Output do Script

O script mostra automaticamente:
- ✅ Bundle deployado (ex: index-BBFraBW_.js)
- ✅ Cache headers HTML (no-cache)
- ✅ Cache headers Assets (immutable)
- ✅ Testes de carregamento de páginas

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

## 📝 WORKFLOW COMPLETO

### 1. Desenvolvimento Local
```bash
npm run build  # Gera novo build com hash
```

### 2. Deploy no VPS
```bash
# Já está no VPS
sudo bash /home/saraiva-vision-site/DEPLOY_NOW.sh
```

### 3. Validação
- Script mostra todos os testes automaticamente
- Testar no navegador com hard refresh

---

**Status**: ✅ Pronto para deploy
**Script**: `/home/saraiva-vision-site/DEPLOY_NOW.sh`
**Detecção**: Automática do hash do bundle
