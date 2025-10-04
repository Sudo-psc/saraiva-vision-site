# 🔧 Next.js Migration Scripts

Scripts de verificação e diagnóstico para a migração React → Next.js App Router.

---

## 📜 Scripts Disponíveis

### 1. detect-client-components.sh

Detecta componentes que usam hooks do React mas não têm a diretiva `'use client'`.

**Uso:**
```bash
# Via npm
npm run nextjs:detect-client

# Direto
bash scripts/detect-client-components.sh
```

**O que verifica:**
- Busca arquivos em `app/` e `src/components/`
- Identifica uso de hooks: `useState`, `useEffect`, `useContext`, etc.
- Verifica se o arquivo tem `'use client'` no início

**Saída esperada:**
```
🔍 Buscando componentes que precisam de 'use client'...

⚠️  app/jovem/assinatura/checkout/page.tsx
   └─ Usa hooks mas não tem 'use client'

⚠️  Encontrados 1 arquivos que podem precisar de 'use client'
```

---

### 2. validate-metadata.sh

Verifica se todas as páginas do Next.js têm metadata configurada (importante para SEO).

**Uso:**
```bash
# Via npm
npm run nextjs:validate-metadata

# Direto
bash scripts/validate-metadata.sh
```

**O que verifica:**
- Busca arquivos `page.tsx` em `app/`
- Verifica se têm `export const metadata` ou `generateMetadata`

**Saída esperada:**
```
🔍 Verificando metadata em rotas do Next.js...

✅ app/blog/page.tsx
❌ app/jovem/assinatura/checkout/page.tsx (falta metadata)

📊 Resumo:
   ✅ Com metadata: 23
   ❌ Sem metadata: 4
```

---

### 3. check-unoptimized-images.sh

Busca tags `<img>` não otimizadas que deveriam usar `next/image`.

**Uso:**
```bash
# Via npm
npm run nextjs:check-images

# Direto
bash scripts/check-unoptimized-images.sh
```

**O que verifica:**
- Busca `<img` em `app/` e `src/`
- Identifica imagens que não usam `next/image`

**Saída esperada:**
```
🔍 Buscando <img> tags não otimizadas...

⚠️  app/blog/page.tsx: <img src="/hero.jpg" />

💡 Sugestão: Migre para <Image> do next/image
```

---

### 4. Validação Completa

Executa todos os scripts de uma vez.

**Uso:**
```bash
npm run nextjs:validate-all
```

Equivalente a:
```bash
npm run nextjs:detect-client && \
npm run nextjs:validate-metadata && \
npm run nextjs:check-images
```

---

## 🎯 Quando Usar

### Durante Desenvolvimento
```bash
# Antes de commitar
npm run nextjs:validate-all

# Verificar componente específico
bash scripts/detect-client-components.sh | grep "MeuComponente"
```

### No CI/CD
```bash
# Adicionar ao pipeline
- name: Validate Next.js Migration
  run: npm run nextjs:validate-all
```

### Debugging
```bash
# Identificar causa de hydration errors
npm run nextjs:detect-client

# Verificar SEO antes de deploy
npm run nextjs:validate-metadata
```

---

## 📚 Documentação Relacionada

- [Guia Completo de Depuração](../docs/NEXTJS_MIGRATION_DEBUG_GUIDE.md)
- [Quick Reference](../docs/NEXTJS_QUICK_REFERENCE.md)
- [Next.js App Router Docs](https://nextjs.org/docs/app)

---

## 🛠️ Customização

### Modificar Paths de Busca

Edite os scripts para ajustar quais diretórios verificar:

```bash
# Em detect-client-components.sh, linha ~6
find app src/components -name "*.tsx" -o -name "*.ts"

# Adicionar mais diretórios:
find app src/components components lib -name "*.tsx"
```

### Adicionar Novos Hooks

Para detectar hooks customizados, edite a linha do grep:

```bash
# detect-client-components.sh, linha ~10
grep -q "useState\|useEffect\|useMeuHook" "$file"
```

### Filtrar Falsos Positivos

Adicione exclusões com `grep -v`:

```bash
# Ignorar diretório de testes
find app -name "*.tsx" | grep -v "__tests__"
```

---

## 🚀 Melhorias Futuras

- [ ] Adicionar suporte para JSON output (para CI)
- [ ] Criar versão para Windows (PowerShell)
- [ ] Integrar com ESLint custom rules
- [ ] Adicionar auto-fix para problemas simples

---

**Última Atualização**: Outubro 2025  
**Responsável**: Equipe Saraiva Vision
