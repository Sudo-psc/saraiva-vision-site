# 🔧 Guia de Solução de Problemas - Saraiva Vision

Soluções rápidas para problemas comuns durante o desenvolvimento, build e deploy.

## 🚨 Problemas Críticos (Fix Imediato)

### ❌ Site não carrega (localhost:5173)

**Sintomas**: Página em branco, erro de conexão
```bash
# Diagnóstico
curl http://localhost:5173  # Deve retornar HTML

# Soluções
# 1. Verificar se o processo está rodando
ps aux | grep vite

# 2. Matar processo conflitante
pkill -f vite
npm run dev

# 3. Usar porta alternativa
npm run dev -- --port 3000

# 4. Limpar cache e reinstalar
rm -rf node_modules .vite dist
npm install --legacy-peer-deps
npm run dev
```

### ❌ Build falha com erro de memória

**Sintomas**: `JavaScript heap out of memory`
```bash
# Solução 1: Aumentar limite de memória
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Solução 2: Build em modo de desenvolvimento
npm run build -- --mode development

# Solução 3: Verificar chunk size warnings
npm run build | grep "larger than 500"
```

### ❌ Testes falhando massivamente

**Sintomas**: Vários testes com timeout ou erro DOM
```bash
# Diagnóstico
npm run test:run 2>&1 | grep -E "(FAIL|ERROR|timeout)"

# Soluções
# 1. Limpar cache de teste
npm run test -- --run --reporter=verbose

# 2. Executar testes específicos
npm run test -- --run Contact  # Exemplo: só componente Contact

# 3. Verificar setup de teste
cat src/test/setup.js

# 4. Reset de ambiente de teste
rm -rf coverage node_modules/.vitest
npm install --legacy-peer-deps
```

## ⚠️ Problemas de Desenvolvimento

### 🐛 Hot Reload não funciona

**Sintomas**: Mudanças no código não refletem no browser
```bash
# Soluções
# 1. Verificar se arquivo está sendo assistido
# Salve um arquivo e veja output do terminal

# 2. Reiniciar servidor
Ctrl+C
npm run dev

# 3. Limpar cache do browser
# Ctrl+Shift+R (hard refresh)

# 4. Verificar se arquivo está em pasta correta
ls -la src/components/  # Deve listar seus arquivos
```

### 🎨 Estilos Tailwind não aplicam

**Sintomas**: Classes CSS não têm efeito visual
```bash
# Diagnóstico
# Verificar se Tailwind está carregando
curl http://localhost:5173 | grep -i tailwind

# Soluções
# 1. Verificar import do CSS
grep -r "index.css" src/

# 2. Verificar configuração do Tailwind
cat tailwind.config.js | grep -A 5 content

# 3. Purge cache do Tailwind
rm -rf .vite
npm run dev

# 4. Testar classe básica
# Adicionar `className="bg-red-500"` e ver se fica vermelho
```

### 🔤 Traduções (i18n) não funcionam

**Sintomas**: Textos aparecem com chaves `{{key}}` ou em inglês
```bash
# Diagnóstico
# Verificar arquivos de tradução
ls -la src/locales/
cat src/locales/pt.json | head -10

# Soluções
# 1. Verificar se chave existe
grep -r "minha.chave" src/locales/

# 2. Verificar configuração i18n
grep -r "i18next" src/lib/

# 3. Debug de namespace
# No código: console.log(t('namespace:key'))

# 4. Força reload de traduções
# No browser: localStorage.clear()
```

### 📱 Componente não renderiza

**Sintomas**: Componente aparece vazio ou erro no console
```jsx
// Diagnóstico
// 1. Verificar exportação
export default MeuComponente;  // ✅
export MeuComponente;          // ❌

// 2. Verificar importação
import MeuComponente from './MeuComponente';  // ✅
import { MeuComponente } from './MeuComponente';  // ❌ se export default

// 3. Verificar props
const MeuComponente = ({ children, ...props }) => {
  console.log('Props recebidas:', props);
  return <div>{children}</div>;
};

// 4. Verificar conditional rendering
{condition && <MeuComponente />}  // condition pode ser false
```

## 🧪 Problemas de Teste

### ❌ Teste de componente falha

**Sintomas**: `TestingLibraryElementError: Unable to find element`
```javascript
// Problema comum: elemento não existe ou texto não confere
// ❌ Problemático
expect(screen.getByText('Endereço')).toBeInTheDocument();

// ✅ Soluções
// 1. Debug o que está sendo renderizado
screen.debug();

// 2. Usar queries mais flexíveis
expect(screen.getByText(/endereço/i)).toBeInTheDocument();

// 3. Aguardar elemento aparecer
await waitFor(() => 
  expect(screen.getByText(/endereço/i)).toBeInTheDocument()
);

// 4. Verificar se componente foi renderizado
const { container } = render(<MeuComponente />);
expect(container.firstChild).toBeInTheDocument();
```

### ⏱️ Testes com timeout

**Sintomas**: `Test timed out in 5000ms`
```javascript
// Soluções
// 1. Aumentar timeout específico
test('meu teste', async () => {
  // código do teste
}, 10000);  // 10 segundos

// 2. Mock de APIs lentas
vi.mock('../api/reviews', () => ({
  getReviews: vi.fn().mockResolvedValue([])
}));

// 3. Aguardar loading states
await waitFor(() => 
  expect(screen.queryByText('Carregando...')).not.toBeInTheDocument()
);
```

### 🔍 Testes de SEO falhando

**Sintomas**: Meta tags ou structured data não encontrados
```javascript
// Verificar se Helmet está configurado
// 1. Mock do react-helmet-async
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => children,
  HelmetProvider: ({ children }) => children
}));

// 2. Testar meta tags diretamente
const metaTags = document.querySelectorAll('meta[property^="og:"]');
expect(metaTags.length).toBeGreaterThan(0);
```

## 🚀 Problemas de Build e Deploy

### 📦 Bundle muito grande

**Sintomas**: Warning sobre chunks > 500kB
```bash
# Análise
npm run build | grep -A 10 "larger than 500"

# Soluções
# 1. Verificar imports desnecessários
grep -r "import.*from.*react" src/ | grep -v hooks

# 2. Verificar se lazy loading está funcionando
grep -r "lazy(" src/

# 3. Analisar bundle
npm install --save-dev rollup-plugin-visualizer
# Adicionar plugin no vite.config.js

# 4. Manual chunks (vite.config.js)
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast']
      }
    }
  }
}
```

### 🌐 Deploy falha

**Sintomas**: Erro durante `./deploy.sh` ou build de produção
```bash
# Diagnóstico completo
npm run verify 2>&1 | tee debug.log

# Problemas comuns e soluções

# 1. Variáveis de ambiente faltando
cp .env.example .env
echo "Configurar variáveis reais no .env"

# 2. Permissões do deploy script
chmod +x deploy.sh

# 3. Nginx não configurado
sudo systemctl status nginx
sudo nginx -t  # Testar configuração

# 4. Firewall bloqueando
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443

# 5. SSL certificates
sudo certbot certificates
```

### 📝 HTML validation falha

**Sintomas**: `html-validate` reporta erros
```bash
# Diagnóstico
npm run verify:html 2>&1 | grep -E "(error|warning)"

# Problemas comuns
# 1. img sem alt
<img src="..." alt="" />  # ✅ alt vazio é ok para decoração
<img src="..." alt="Descrição" />  # ✅ alt descritivo

# 2. Elementos aninhados incorretamente
<button><div>texto</div></button>  # ❌
<button><span>texto</span></button>  # ✅

# 3. IDs duplicados
<div id="map"></div>
<div id="map"></div>  # ❌

# Fix: usar refs ou classes
```

## 🔗 Problemas de Links e Navegação

### 🌐 Links quebrados

**Sintomas**: `linkinator` reporta 404s
```bash
# Diagnóstico específico
npm run verify:links | grep -A 5 "404"

# Soluções
# 1. Verificar rotas do React Router
cat src/App.jsx | grep -A 2 "path="

# 2. Verificar links internos
grep -r "href=" src/ | grep -v "http"

# 3. Verificar arquivos públicos
ls -la public/

# 4. Configurar redirects (nginx.conf)
location /old-page {
  return 301 /new-page;
}
```

### 📱 Navegação mobile não funciona

**Sintomas**: Menu hamburguer não abre/fecha
```javascript
// Verificar state do menu
const [isOpen, setIsOpen] = useState(false);

// Debug no console
console.log('Menu state:', isOpen);

// Verificar event handlers
<button 
  onClick={() => {
    console.log('Clique detectado');
    setIsOpen(!isOpen);
  }}
>
```

## 🎯 Problemas de Performance

### 🐌 Site carrega devagar

**Sintomas**: Lighthouse score baixo, CLS alto
```bash
# Diagnóstico
npm run verify:lighthouse

# Soluções por problema
# 1. Imagens não otimizadas
npm run images:build  # Gerar WebP

# 2. CSS/JS não minificado
npm run build  # Verificar se minification está ativa

# 3. Fonts bloqueando render
# No HTML: <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

# 4. Layout shift
# Sempre definir width/height para imagens
<img src="..." width="300" height="200" alt="..." />
```

### 🔄 Service Worker problemas

**Sintomas**: Cache não atualiza, versão antiga permanece
```javascript
// No browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(sw => sw.unregister());
});

// Limpar cache manualmente
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});

// Verificar se SW está ativo
navigator.serviceWorker.ready.then(registration => {
  console.log('SW ready:', registration);
});
```

## 📊 Debug Tools e Comandos

### 🔍 Análise rápida de problemas
```bash
# Health check completo
echo "=== SYSTEM HEALTH CHECK ==="
node --version && npm --version
git status --porcelain
npm list --depth=0 2>/dev/null | grep -E "(WARN|ERR)"
npm run build 2>&1 | tail -20
npm run test:run --reporter=basic 2>&1 | tail -10

# Performance check
npm run verify:lighthouse | grep -A 10 "Performance"

# Security check  
npm audit --audit-level moderate

# Bundle analysis
npm run build | grep -E "(kB|MB)"
```

### 🧰 Reset completo (último recurso)
```bash
#!/bin/bash
echo "🚨 RESET COMPLETO - Use apenas se necessário"
read -p "Continuar? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git checkout .
  rm -rf node_modules package-lock.json .vite dist coverage
  npm cache clean --force
  npm install --legacy-peer-deps
  npm run build
  npm run test:run
  echo "✅ Reset completo finalizado"
fi
```

## 📞 Quando Pedir Ajuda

### ✅ Antes de pedir ajuda, tente:
- [ ] Consultar este troubleshooting
- [ ] Verificar documentação relevante em [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
- [ ] Reproduzir em ambiente limpo (`rm -rf node_modules && npm install`)
- [ ] Verificar se problema existe na branch main

### 📝 Informações para incluir no pedido de ajuda:
- **Sistema**: `uname -a` (Linux/Mac) ou versão Windows
- **Node/NPM**: `node --version && npm --version`
- **Comando que falhou**: comando exato executado
- **Erro completo**: output completo do erro
- **Contexto**: o que estava tentando fazer
- **Já tentou**: quais soluções deste guia já testou

---

*Mantenha este guia atualizado com novos problemas descobertos*