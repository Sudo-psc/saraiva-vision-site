# 🚀 Deploy Simplificado - Saraiva Vision

## Formas de Atualizar o Site

### 1. ⚡ Deploy Rápido (Mais Comum)
```bash
npm run deploy:quick
```
**Quando usar**: Updates de conteúdo, correções pequenas, novos posts

### 2. 🔒 Deploy Completo (Seguro)
```bash
npm run deploy
```
**Quando usar**: Features novas, mudanças importantes
**Inclui**: Backup automático + verificações

### 3. 👁️ Watch Mode (Desenvolvimento)
```bash
sudo ./scripts/watch-deploy.sh
```
**Quando usar**: Desenvolvimento ativo - deploy automático ao salvar arquivos

## ❓ Precisa Mexer no Nginx?

### ❌ NÃO precisa para:
- Atualizar conteúdo (HTML/JS/CSS)
- Adicionar posts no blog
- Mudar imagens
- 99% dos casos

### ✅ SÓ precisa se:
- Mudar configuração do Nginx
- Adicionar redirects
- Configurar SSL/headers

## 📝 Exemplos Práticos

### Adicionar Post no Blog
```bash
# 1. Editar src/data/blogPosts.js
# 2. Deploy
npm run deploy:quick
```

### Update de Imagens
```bash
# 1. Copiar imagens para public/Blog/
# 2. Otimizar
npm run optimize:images
# 3. Deploy
npm run deploy:quick
```

### Desenvolver com Live Updates
```bash
# Terminal 1: Watch mode
sudo ./scripts/watch-deploy.sh

# Terminal 2: Editar arquivos normalmente
# Cada save faz deploy automático!
```

## 🎯 Um Único Comando

Para 90% dos casos:
```bash
npm run deploy:quick
```

Pronto! Site atualizado em ~20 segundos.

## 📚 Documentação Completa

Ver `docs/DEPLOY_GUIDE.md` para guia completo.
