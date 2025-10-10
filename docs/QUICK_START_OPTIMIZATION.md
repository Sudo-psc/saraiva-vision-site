# 🚀 Guia Rápido de Otimização - Saraiva Vision

**Criado em:** 2025-10-06
**Tempo estimado:** 30-45 minutos para otimização de imagens

---

## ⚡ Passo a Passo Imediato

### 1️⃣ Otimizar Imagens (ALTA PRIORIDADE)

**Impacto:** Redução de 145MB → ~25MB (83% de economia)

```bash
cd /home/saraiva-vision-site

# Executar script de otimização
node scripts/optimize-all-images.js

# Aguardar processamento (pode levar 10-15 minutos)
# O script irá:
# - Comprimir PNG/JPEG existentes
# - Gerar versões WebP (compatibilidade 95%+)
# - Gerar versões AVIF (melhor compressão)
# - Criar backups em public/.image-backups/
```

**Verificar resultado:**
```bash
# Verificar tamanho antes/depois
du -sh public/Blog/
du -sh public/.image-backups/

# Listar arquivos gerados
ls -lh public/Blog/*.webp | head -10
ls -lh public/Blog/*.avif | head -10
```

### 2️⃣ Usar Componente OptimizedImage

**Arquivo criado:** `src/components/OptimizedImage.jsx`

**Substituir tags `<img>` nos componentes:**

**Antes:**
```jsx
<img src="/Blog/capa-catarata.png" alt="Cirurgia de Catarata" />
```

**Depois:**
```jsx
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
  src="/Blog/capa-catarata.png"
  alt="Cirurgia de Catarata"
  width={800}
  height={600}
  loading="lazy"
/>
```

**Para imagens críticas (hero/above-the-fold):**
```jsx
<OptimizedImage
  src="/img/hero-doctor.png"
  alt="Dr. Philipe Saraiva"
  width={1920}
  height={1080}
  priority={true}  // ⚠️ Desativa lazy loading
/>
```

### 3️⃣ Build de Produção Otimizado

```bash
cd /home/saraiva-vision-site

# Build com otimizações
npm run build:vite

# Verificar tamanho dos bundles
ls -lh dist/assets/*.js | sort -k5 -hr

# Verificar se tree-shaking funcionou (sem console.log)
grep -r "console.log" dist/assets/*.js && echo "⚠️ console.log found!" || echo "✅ No console.log"
```

**Resultado esperado:**
- Chunks principais < 150KB cada
- CSS separado por rota
- Assets estáticos otimizados

### 4️⃣ Deploy

```bash
# Deploy rápido
sudo npm run deploy:quick

# Ou deploy atômico (recomendado)
sudo ./scripts/deploy-atomic-local.sh
```

### 5️⃣ Validação Final

**Verificar no navegador:**
1. Abrir DevTools (F12)
2. Network tab → Reload (Ctrl+Shift+R)
3. Verificar:
   - Imagens carregando como WebP/AVIF
   - Lazy loading funcionando (scroll para ver)
   - Bundle JS < 2MB total

**Testar Performance:**
```bash
# Lighthouse
lighthouse https://saraivavision.com.br --view

# Ou online:
# https://pagespeed.web.dev/analysis?url=https://saraivavision.com.br
```

---

## 📊 Métricas Esperadas

### Antes das Otimizações
- **Tamanho total:** ~160MB
- **Tempo de carregamento (3G):** 12-15s
- **LCP:** > 4s
- **Lighthouse Score:** 40-50

### Depois das Otimizações
- **Tamanho total:** < 30MB
- **Tempo de carregamento (3G):** < 5s
- **LCP:** < 2.5s ✅
- **Lighthouse Score:** 85-95

---

## 🌐 Cloudflare CDN (Próximo Passo)

**Quando implementar:** Após validar otimizações locais funcionando

**Benefícios adicionais:**
- Cache global (200+ datacenters)
- Compressão Brotli automática
- DDoS protection
- SSL/TLS gratuito

**Documentação completa:** `/docs/PERFORMANCE_OPTIMIZATION.md` (seção CDN)

---

## ⚠️ Troubleshooting

### Problema: Script falha com erro "MODULE_NOT_FOUND"

**Solução:**
```bash
npm install sharp glob
```

### Problema: Imagens não aparecem no site

**Causa:** Caminhos incorretos ou permissões

**Solução:**
```bash
# Verificar permissões
sudo chown -R www-data:www-data /var/www/saraivavision/current/

# Verificar arquivos existem
ls -lh /var/www/saraivavision/current/Blog/*.webp | head -5
```

### Problema: Build Vite falha

**Solução:**
```bash
# Limpar cache
rm -rf .next/ dist/ node_modules/.vite/

# Reinstalar dependências
npm install

# Build novamente
npm run build:vite
```

---

## 📚 Documentação Completa

- **Performance Guide:** `/docs/PERFORMANCE_OPTIMIZATION.md`
- **Deploy Guide:** `/DEPLOY.md`
- **Component Docs:** `/src/components/OptimizedImage.jsx` (JSDoc inline)

---

## ✅ Checklist Final

- [ ] Script de otimização executado (`node scripts/optimize-all-images.js`)
- [ ] Imagens WebP/AVIF geradas (verificar `ls public/Blog/*.webp`)
- [ ] Componente OptimizedImage importado nas páginas principais
- [ ] Build de produção com Vite (`npm run build:vite`)
- [ ] Deploy realizado (`sudo npm run deploy:quick`)
- [ ] Validação no navegador (DevTools Network tab)
- [ ] Lighthouse score > 85
- [ ] (Opcional) Cloudflare CDN configurado

---

**Próxima ação recomendada:** Executar `node scripts/optimize-all-images.js` agora para começar a otimização de imagens.

**Economia estimada de tempo:** ~70% no tempo de carregamento (12s → 3-4s em 3G)
