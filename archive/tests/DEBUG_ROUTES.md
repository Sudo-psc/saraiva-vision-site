# 🔍 Debug: Subpáginas Não Carregando

## 📋 Problema Relatado
As subpáginas de **lentes**, **serviços**, **podcast**, **sobre nós** e **FAQ** não estão carregando.

## ✅ Verificações Já Realizadas (Backend/Servidor)

### 1. **Nginx Configuração** ✅
```bash
# Configuração SPA correta
location / {
  try_files $uri $uri/ /index.html;
}
```

### 2. **Rotas Testadas via cURL** ✅
- `/lentes` → HTTP 200 ✅
- `/servicos` → HTTP 200 ✅
- `/sobre` → HTTP 200 ✅
- `/faq` → HTTP 200 ✅
- `/podcast` → HTTP 200 ✅
- `/podcasts` → HTTP 301 → `/podcast` ✅

### 3. **React Router Configurado** ✅
```jsx
// src/App.jsx (linhas 86-91, 105, 107-108)
<Route path="/servicos" element={<ServicesPage />} />
<Route path="/sobre" element={<AboutPage />} />
<Route path="/lentes" element={<LensesPage />} />
<Route path="/faq" element={<FAQPage />} />
<Route path="/podcast" element={<PodcastPageConsolidated />} />
```

### 4. **Exports dos Componentes** ✅
- `LensesPage.jsx` → `export default LensesPage` ✅
- `ServicesPage.jsx` → `export default ServicesPage` ✅
- `AboutPage.jsx` → `export default AboutPage` ✅
- `FAQPage.jsx` → `export default FAQPage` ✅

### 5. **Build e Deploy** ✅
- Bundle: `index-CVIi05pP.js` (175KB) ✅
- Build tool: **Vite** (correto) ✅
- Deploy: **2025-10-13 16:19 UTC** ✅

---

## 🔍 **Diagnóstico no Navegador (Cliente)**

### **Passo 1: Limpar Cache do Navegador**
**Problema comum**: Cache antigo impedindo JavaScript de executar.

**Solução**:
1. Pressione `Ctrl + Shift + Delete` (ou `Cmd + Shift + Delete` no Mac)
2. Selecione "Imagens e arquivos em cache"
3. Clique em "Limpar dados"
4. Ou pressione `Ctrl + Shift + R` (hard reload) na página

---

### **Passo 2: Verificar Console do Navegador**
**Como acessar**:
1. Pressione `F12` ou `Ctrl + Shift + I`
2. Vá para a aba **Console**
3. Recarregue a página (`F5`)

**Erros Esperados** (se houver problema):
- ❌ `ChunkLoadError: Loading chunk XXX failed`
- ❌ `Failed to fetch dynamically imported module`
- ❌ `SyntaxError: Unexpected token`
- ❌ `Uncaught ReferenceError: XXX is not defined`

**O que procurar**:
- Linhas em vermelho (erros)
- Linhas em amarelo (avisos)
- Mensagens relacionadas a "React Router", "chunk", ou "module"

---

### **Passo 3: Testar Navegação**
1. Abra `https://saraivavision.com.br/`
2. Clique em "Lentes" no menu
3. **Observe**:
   - URL muda para `/lentes`? ✅ ou ❌
   - Conteúdo da página muda? ✅ ou ❌
   - Console mostra erros? ✅ ou ❌

---

### **Passo 4: Testar Acesso Direto**
Abra uma aba anônima (`Ctrl + Shift + N`) e acesse diretamente:
- https://saraivavision.com.br/lentes
- https://saraivavision.com.br/servicos
- https://saraivavision.com.br/sobre
- https://saraivavision.com.br/faq
- https://saraivavision.com.br/podcast

**Resultado esperado**: Página específica deve carregar.
**Se não carregar**: Anote a mensagem de erro no console.

---

## 🐛 **Possíveis Causas e Soluções**

### **Causa 1: Cache do Navegador**
**Sintoma**: Páginas não mudam ao clicar nos links.
**Solução**: Hard reload (`Ctrl + Shift + R`) ou limpar cache.

### **Causa 2: Service Worker Antigo**
**Sintoma**: Mesmo após limpar cache, página não atualiza.
**Solução**:
1. Abra DevTools (`F12`)
2. Vá em **Application** → **Service Workers**
3. Clique em "Unregister" no service worker `sw.js`
4. Recarregue a página

### **Causa 3: Erro JavaScript no Console**
**Sintoma**: Console mostra erro `ChunkLoadError` ou similar.
**Solução**: Reportar o erro específico para debug.

### **Causa 4: Lazy Loading Falhou**
**Sintoma**: Console mostra "Failed to fetch dynamically imported module".
**Solução**:
```bash
# Verificar se todos os chunks existem
ls -lh /var/www/saraivavision/current/assets/
```

### **Causa 5: React Router Não Inicializou**
**Sintoma**: URL muda mas página não muda.
**Solução**: Verificar se `BrowserRouter` está importado corretamente.

---

## 📊 **Checklist de Debug**

- [ ] Limpei o cache do navegador
- [ ] Fiz hard reload (`Ctrl + Shift + R`)
- [ ] Desregistrei o Service Worker
- [ ] Abri o Console (`F12`) e verifiquei erros
- [ ] Testei em aba anônima
- [ ] Testei em outro navegador (Chrome, Firefox, Edge)
- [ ] Testei acesso direto às URLs
- [ ] Verifiquei se a URL muda ao clicar nos links

---

## 📝 **Como Reportar o Problema**

Se o problema persistir, reporte com as seguintes informações:

1. **Navegador e versão**: Chrome 120, Firefox 121, etc.
2. **Sistema operacional**: Windows 11, macOS, Linux
3. **URL testada**: Ex: https://saraivavision.com.br/lentes
4. **Comportamento observado**:
   - [ ] URL muda mas conteúdo não muda
   - [ ] URL não muda
   - [ ] Página mostra erro
   - [ ] Página fica em branco
5. **Erros no console**: Cole o texto completo dos erros em vermelho
6. **Screenshot**: Se possível, anexe screenshot do console

---

## 🔧 **Script de Teste Rápido**

Cole no console do navegador (`F12` → Console):

```javascript
// Teste se React Router está carregado
console.log('React Router:', window.React ? '✅ React carregado' : '❌ React não carregado');

// Teste se root está renderizado
const root = document.getElementById('root');
console.log('Root element:', root ? `✅ Renderizado (${root.children.length} filhos)` : '❌ Vazio');

// Teste navegação programática
console.log('Testando navegação para /lentes...');
window.location.pathname = '/lentes';
```

---

## 🚀 **Solução Rápida (90% dos casos)**

```bash
# No navegador:
1. Ctrl + Shift + Delete
2. Selecionar "Imagens e arquivos em cache"
3. Limpar dados
4. Ctrl + Shift + R (hard reload)
5. F12 → Application → Service Workers → Unregister
6. Recarregar página (F5)
```

---

**Última atualização**: 2025-10-13 16:20 UTC
**Bundle em produção**: `index-CVIi05pP.js`
**Deploy**: `/var/www/saraivavision/current/`
