# Guia de Deploy - Saraiva Vision

## ⚠️ IMPORTANTE - Comando de Build Correto

Este projeto usa **Vite** para build de produção, NÃO Next.js!

```bash
# ✅ CORRETO
npm run build:vite

# ❌ ERRADO (gera arquivos Next.js que não são servidos)
npm run build
```

## 📋 Scripts de Deploy Disponíveis

### 1. Deploy Rápido (Recomendado para updates menores)
```bash
sudo npm run deploy:quick
# ou
sudo ./scripts/quick-deploy.sh
```

**O que faz:**
- Build com Vite (`npm run build:vite`)
- Copia arquivos para `/var/www/saraivavision/current/`
- Recarrega Nginx
- ⚡ Rápido (~30 segundos)

### 2. Deploy Atômico (Recomendado para releases importantes)
```bash
sudo ./scripts/deploy-atomic.sh
```

**O que faz:**
- Clona código do GitHub
- Build com Vite
- Cria release timestampada
- Deploy atômico (zero downtime)
- Healthcheck automático
- Rollback automático em caso de falha
- ⏱️ Completo (~2-3 minutos)

### 3. Deploy Atômico Local
```bash
sudo ./scripts/deploy-atomic-local.sh
```

**O que faz:**
- Usa código local (não GitHub)
- Ideal para testar mudanças antes de commitar
- Mesmo processo do deploy atômico

## 🏗️ Estrutura de Build

```
/home/saraiva-vision-site/
├── src/                  # Código fonte React
├── dist/                 # Build gerado pelo Vite ✅
└── .next/                # Build Next.js (NÃO usado) ❌

/var/www/saraivavision/
├── current/              # Symlink para release ativa
├── releases/
│   └── 20251005_214500/  # Releases timestampadas
│       └── dist/         # Build Vite deployado
└── repo_cache/           # Cache do Git
```

## 🔍 Verificação de Deploy

### Verificar qual bundle está sendo servido:
```bash
curl -s "https://saraivavision.com.br/" | grep -o 'src="[^"]*index[^"]*\.js"'
```

### Verificar URL de agendamento no bundle:
```bash
grep -o 'onlineSchedulingUrl:"[^"]*"' /var/www/saraivavision/current/assets/index-*.js
```

### Verificar arquivos deployados:
```bash
ls -lh /var/www/saraivavision/current/assets/
```

## 🐛 Troubleshooting

### Problema: Mudanças não aparecem no site

**Causa:** Build com comando errado ou cache do navegador

**Solução:**
```bash
# 1. Verificar último build
ls -lh /home/saraiva-vision-site/dist/assets/

# 2. Rebuild correto
cd /home/saraiva-vision-site
npm run build:vite

# 3. Deploy
sudo cp -r dist/* /var/www/saraivavision/current/

# 4. Limpar cache Nginx (opcional)
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx

# 5. Cliente: CTRL+SHIFT+R (hard refresh)
```

### Problema: Site fora do ar após deploy

**Causa:** Build falhou ou arquivo corrompido

**Solução - Rollback manual:**
```bash
# Listar releases
ls -lt /var/www/saraivavision/releases/

# Apontar para release anterior
sudo ln -sfn /var/www/saraivavision/releases/TIMESTAMP_ANTERIOR/dist /var/www/saraivavision/current

# Recarregar Nginx
sudo systemctl reload nginx
```

## 📝 Checklist de Deploy

- [ ] Código commitado e testado localmente
- [ ] `npm run build:vite` executa sem erros
- [ ] Arquivos em `/dist/` foram gerados
- [ ] index.html existe em `/dist/`
- [ ] Bundle JS tem tamanho razoável (< 1MB)
- [ ] Deploy executado com sudo
- [ ] Site acessível após deploy
- [ ] Hard refresh no navegador (CTRL+SHIFT+R)

## 🔐 Permissões

Todos os scripts de deploy devem ser executados com `sudo`:
- Precisam escrever em `/var/www/`
- Precisam recarregar Nginx
- Precisam ajustar ownership para `www-data`

## 📊 Logs

Logs de deploy ficam em:
```
/home/saraiva-vision-site/claudelogs/deploy/deploy_TIMESTAMP.log
```

## 🚀 Workflow Recomendado

1. **Desenvolvimento:**
   ```bash
   npm run dev:vite
   ```

2. **Teste local:**
   ```bash
   npm run build:vite
   npm run preview
   ```

3. **Deploy:**
   ```bash
   git add .
   git commit -m "feat: descrição"
   git push
   sudo ./scripts/deploy-atomic.sh
   ```

4. **Verificação:**
   - Acesse https://saraivavision.com.br
   - Teste funcionalidades críticas
   - Verifique logs se necessário

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs
2. Faça rollback se necessário
3. Execute `npm run build:vite` manualmente
4. Verifique permissões dos arquivos

---

**Última atualização:** 2025-10-05
**Versão do projeto:** 2.0.1
