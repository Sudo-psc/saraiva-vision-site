# 🔄 SANITY STUDIO - LIMPAR CACHE DO BROWSER

## ✅ O QUE FOI FEITO

1. **Configuração Corrigida**
   - ✅ Adicionado `apiVersion: '2024-01-01'` em `sanity.config.js`
   - ✅ Build limpo e regenerado
   - ✅ Novo build: 6.8MB (12:59 UTC)

2. **Problema**
   - ⚠️ Browser ainda está usando build antigo em cache
   - ⚠️ Erro: "Workspace: missing context value"

---

## 🔧 SOLUÇÃO: LIMPAR CACHE DO BROWSER

### Opção 1: Hard Refresh (RECOMENDADO)

**Chrome/Edge/Brave:**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Firefox:**
```
Windows/Linux: Ctrl + F5
Mac: Cmd + Shift + R
```

**Safari:**
```
Cmd + Option + R
```

---

### Opção 2: Limpar Cache Completo

**Chrome/Edge/Brave:**
1. Pressione: `Ctrl + Shift + Del` (ou `Cmd + Shift + Del` no Mac)
2. Selecione: "Imagens e arquivos em cache"
3. Período: "Última hora"
4. Clique: "Limpar dados"

**Firefox:**
1. Pressione: `Ctrl + Shift + Del` (ou `Cmd + Shift + Del` no Mac)
2. Selecione: "Cache"
3. Período: "Última hora"
4. Clique: "Limpar agora"

---

### Opção 3: Modo Anônimo/Privado

**Abrir em modo anônimo:**
```
Chrome/Edge: Ctrl + Shift + N
Firefox: Ctrl + Shift + P
Safari: Cmd + Shift + N
```

**Acessar:**
```
https://studio.saraivavision.com.br
```

Se funcionar no modo anônimo, confirma que é cache!

---

### Opção 4: DevTools (Para Desenvolvedores)

**Chrome/Edge:**
1. Abra DevTools: `F12`
2. Clique com botão direito no ícone de reload
3. Selecione: "Empty Cache and Hard Reload"

---

## 🔍 VERIFICAR SE RESOLVEU

Após limpar cache, verifique:

1. **Acesse**: https://studio.saraivavision.com.br
2. **Aguarde** carregar completamente
3. **Verifique console** (F12 → Console)
4. **NÃO deve ter** erro "Workspace: missing context value"
5. **Deve mostrar** tela de login do Sanity

---

## 🐛 SE AINDA NÃO FUNCIONAR

### Verificar Versão do Arquivo

Abra DevTools (F12) → Network → Recarregue (F5)

**Procure por:**
```
sanity-[HASH].js
```

**Hash deve ser diferente** do anterior (`Do7q0DKe`)

Se o hash for o mesmo, cache não foi limpo!

---

### Forçar Download Novo

**Adicione parâmetro na URL:**
```
https://studio.saraivavision.com.br?v=20251029
```

Isso força o browser a buscar nova versão.

---

## 📊 CHECKLIST

```
[ ] 1. Hard refresh (Ctrl+Shift+R)
[ ] 2. Verificar se erro sumiu
[ ] 3. Se não funcionou: Limpar cache completo
[ ] 4. Se não funcionou: Testar modo anônimo
[ ] 5. Se modo anônimo funciona: É cache!
[ ] 6. Limpar cache do browser principal
[ ] 7. Acessar novamente
```

---

## 🎯 POR QUE ISSO ACONTECEU?

**Cache agressivo do browser:**
- Assets JavaScript ficam em cache
- Browser não percebe que arquivo mudou
- Precisa de hard refresh

**Solução permanente:**
- Cache busting automático (já implementado no build)
- Headers de cache do Nginx (já configurados)
- Após primeira vez, não deve acontecer mais

---

## ✅ APÓS RESOLVER

**Você deve ver:**
- ✅ Tela de login do Sanity Studio
- ✅ Sem erros no console
- ✅ Logo do Sanity
- ✅ Campos de login (Google/GitHub/Email)

**Faça login e comece a usar!**

