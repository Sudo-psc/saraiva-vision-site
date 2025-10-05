# CLAUDE.md - Instruções para IA

## 🚨 REGRA CRÍTICA DE BUILD

**ESTE PROJETO USA VITE, NÃO NEXT.JS EM PRODUÇÃO!**

```bash
# ✅ SEMPRE USE (produção)
npm run build:vite

# ❌ NUNCA USE para deploy (apenas Next.js API routes)
npm run build
```

## Contexto do Projeto

- **Nome**: Saraiva Vision Site
- **Tipo**: SPA React com Vite
- **Build Tool**: Vite (produção) + Next.js (apenas backend)
- **Deploy**: `/var/www/saraivavision/current/`
- **Nginx**: Serve arquivos de `/var/www/saraivavision/current/`

## Build e Deploy

### Build Commands
- `npm run dev:vite` - Desenvolvimento local
- `npm run build:vite` - Build de produção (SEMPRE usar este)
- `npm run preview` - Preview do build local

### Deploy Commands
- `sudo npm run deploy:quick` - Deploy rápido
- `sudo ./scripts/deploy-atomic.sh` - Deploy atômico (GitHub)
- `sudo ./scripts/deploy-atomic-local.sh` - Deploy atômico (local)

## Estrutura de Arquivos

```
Código fonte → Build → Deploy
/home/saraiva-vision-site/src → /home/saraiva-vision-site/dist → /var/www/saraivavision/current/
```

### Arquivos Importantes

**Build Output (Vite):**
- `/home/saraiva-vision-site/dist/` - Build Vite ✅ USAR
- `/home/saraiva-vision-site/.next/` - Build Next.js ❌ NÃO USAR

**Produção:**
- `/var/www/saraivavision/current/` - Servido pelo Nginx
- `/var/www/saraivavision/current/assets/index-*.js` - Bundle principal
- `/var/www/saraivavision/current/index.html` - Entry point

**Configuração:**
- `src/lib/clinicInfo.js` - Config frontend
- `api/src/lib/clinicInfo.js` - Config backend
- `vite.config.js` - Config Vite
- `next.config.js` - Config Next.js (apenas API routes)

## Verificação de Deploy

### Após mudanças no código:

```bash
# 1. Build correto
cd /home/saraiva-vision-site
npm run build:vite

# 2. Verificar bundle gerado
ls -lh dist/assets/index-*.js

# 3. Verificar conteúdo
grep "TEXTO_ESPERADO" dist/assets/index-*.js

# 4. Deploy
sudo cp -r dist/* /var/www/saraivavision/current/

# 5. Verificar produção
curl -s "https://saraivavision.com.br/" | grep -o 'src="[^"]*index[^"]*\.js"'
grep "TEXTO_ESPERADO" /var/www/saraivavision/current/assets/index-*.js

# 6. Reload Nginx
sudo systemctl reload nginx
```

## Comandos de Build Corretos

### ✅ Para Deploy (Vite)
```json
{
  "build:vite": "vite build && node scripts/prerender-pages.js",
  "build:norender": "vite build"
}
```

### ❌ NÃO usar para deploy
```json
{
  "build": "next build"  // Gera .next/ que não é servido!
}
```

## Scripts de Deploy

Todos os scripts foram atualizados para usar `npm run build:vite`:
- ✅ `scripts/deploy-atomic.sh`
- ✅ `scripts/deploy-atomic-local.sh`
- ✅ `scripts/deploy-local.sh`
- ✅ `scripts/quick-deploy.sh`

## Troubleshooting

### Mudanças não aparecem no site

**Problema:** Build com comando errado ou arquivo antigo não removido

**Diagnóstico:**
```bash
# Verificar qual bundle está servido
curl -s "https://saraivavision.com.br/" | grep 'index-.*\.js'

# Listar bundles no servidor
ls -lh /var/www/saraivavision/current/assets/index-*.js

# Verificar conteúdo
strings /var/www/saraivavision/current/assets/index-*.js | grep "URL_ESPERADA"
```

**Solução:**
1. Build correto: `npm run build:vite`
2. Remover bundles antigos: `rm /var/www/saraivavision/current/assets/index-*.js`
3. Deploy novo: `cp -r dist/* /var/www/saraivavision/current/`
4. Reload Nginx: `systemctl reload nginx`

## Configuração Nginx

O Nginx serve arquivos de:
```nginx
root /var/www/saraivavision/current;
location / {
    try_files $uri $uri/ /index.html;
}
```

## Testes

```bash
# Build test
npm run build:vite && ls -lh dist/

# Deploy test
sudo npm run deploy:quick

# Production test
curl -I https://saraivavision.com.br
```

## Documentação Adicional

- `DEPLOY.md` - Guia completo de deploy
- `AGENTS.md` - Comandos de build/lint/test
- `package.json` - Scripts disponíveis

## Checklist para IA

Ao fazer mudanças no código:

- [ ] Editar arquivos fonte em `/home/saraiva-vision-site/src/`
- [ ] Build com `npm run build:vite` (NÃO `npm run build`)
- [ ] Verificar `/home/saraiva-vision-site/dist/` foi gerado
- [ ] Deploy para `/var/www/saraivavision/current/`
- [ ] Remover bundles antigos se necessário
- [ ] Reload Nginx
- [ ] Verificar produção com curl/grep
- [ ] Instruir usuário a fazer hard refresh (CTRL+SHIFT+R)

---

**Atualizado:** 2025-10-05
**Versão:** 2.0.1
