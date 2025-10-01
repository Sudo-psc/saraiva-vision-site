# Checklist de Implementação - Refatoração do Blog

**Projeto:** Saraiva Vision - Página de Artigo Acessível  
**Data Início:** 01/10/2025  
**Status:** 🟡 Em Implementação

---

## 📋 Fase 1: Preparação e Revisão

### ✅ Arquivos Criados
- [x] `src/components/blog/PostPageTemplateRefactored.jsx` (template principal)
- [x] `src/components/CookieConsentModal.jsx` (modal de cookies)
- [x] `docs/POST_REFACTORING_REPORT.md` (documentação completa)
- [x] `docs/accessibility-rules.css` (regras CSS para acessibilidade)
- [x] `docs/IMPLEMENTATION_CHECKLIST.md` (este arquivo)

### 🔄 Próximas Ações
- [ ] Revisar código com equipe de desenvolvimento
- [ ] Aprovar design com stakeholders
- [ ] Validar textos de confiança (CRM, CNPJ, endereço)

---

## 📋 Fase 2: Integração no Projeto

### 2.1 Adicionar CSS de Acessibilidade
```bash
# Copiar regras para src/index.css
cat docs/accessibility-rules.css >> src/index.css
```

**Checklist:**
- [ ] Adicionar regras `@media (prefers-reduced-motion)`
- [ ] Adicionar classe `.sr-only` para screen readers
- [ ] Adicionar estilos de foco `:focus-visible`
- [ ] Adicionar estilos de impressão `@media print`
- [ ] Testar em Chrome/Firefox/Safari

### 2.2 Atualizar Rotas do Blog
**Arquivo:** `src/App.jsx` ou `src/main.jsx`

```jsx
// Substituir import
// import PostPageTemplate from './components/blog/PostPageTemplate';
import PostPageTemplateRefactored from './components/blog/PostPageTemplateRefactored';

// Atualizar rota
<Route path="/blog/:slug" element={<PostPageTemplateRefactored slug={slug} />} />
```

**Checklist:**
- [ ] Importar componente refatorado
- [ ] Atualizar rota do blog
- [ ] Testar navegação `/blog/amaurose-congenita-leber-tratamento-genetico`
- [ ] Verificar que não quebrou outras rotas

### 2.3 Atualizar EnhancedFooter
**Arquivo:** `src/components/EnhancedFooter.jsx`

Adicionar prop para abrir modal de cookies:

```jsx
const EnhancedFooter = ({ onManageCookies }) => {
  return (
    <footer>
      {/* ... conteúdo existente ... */}
      <button onClick={onManageCookies}>
        Gerenciar Cookies
      </button>
    </footer>
  );
};
```

**Checklist:**
- [ ] Adicionar prop `onManageCookies`
- [ ] Criar botão "Gerenciar Cookies"
- [ ] Simplificar texto legal (remover instruções de teclado verbosas)
- [ ] Testar abertura do modal

### 2.4 Adicionar Skip Link no Layout Principal
**Arquivo:** `src/App.jsx` ou component layout principal

```jsx
<a href="#main-content" className="skip-link">
  Pular para o conteúdo principal
</a>

<main id="main-content">
  {/* Conteúdo */}
</main>
```

**Checklist:**
- [ ] Adicionar skip link no topo do layout
- [ ] Adicionar `id="main-content"` no `<main>`
- [ ] Testar com Tab (deve aparecer no primeiro Tab)

---

## 📋 Fase 3: Testes de Qualidade

### 3.1 Testes Funcionais
**Navegação e Interatividade:**
- [ ] Breadcrumb redireciona corretamente (Início → Blog → Post)
- [ ] TOC (Índice) scroll funciona com offset correto
- [ ] Seção ativa no TOC é destacada durante scroll
- [ ] Botões de compartilhamento abrem em nova aba
- [ ] Copiar link mostra ícone de CheckCircle por 2.5s
- [ ] CTA "Agendar consulta" abre WhatsApp
- [ ] CTA "Ver no Google Maps" abre Maps em nova aba
- [ ] Link de telefone `tel:+5533998601427` funciona em mobile
- [ ] Botão "Ver todos os posts" volta para `/blog`

**Modal de Cookies:**
- [ ] Modal abre ao clicar em "Gerenciar Cookies"
- [ ] Toggle "Analíticos" alterna estado
- [ ] Toggle "Marketing" alterna estado
- [ ] "Necessários" não pode ser desativado
- [ ] "Aceitar Todos" salva {necessary: true, analytics: true, marketing: true}
- [ ] "Rejeitar Todos" salva {necessary: true, analytics: false, marketing: false}
- [ ] "Salvar Preferências" persiste estado atual
- [ ] localStorage `cookieConsent` é gravado corretamente
- [ ] Modal fecha ao clicar no X
- [ ] Modal fecha ao pressionar Esc (adicionar handler)

### 3.2 Testes de Acessibilidade

#### 3.2.1 Navegação por Teclado
**Testar com Tab / Shift+Tab:**
- [ ] Ordem de tabulação lógica (breadcrumb → conteúdo → sidebar → footer)
- [ ] Skip link aparece no primeiro Tab
- [ ] Todos os links têm foco visível (anel teal)
- [ ] Todos os botões têm foco visível
- [ ] TOC navegável por teclado
- [ ] Modal de cookies navegável por teclado
- [ ] Esc fecha o modal de cookies
- [ ] Foco retorna ao botão "Gerenciar Cookies" após fechar modal

**Comandos de Teclado:**
- [ ] Enter/Space ativa botões
- [ ] Enter/Space ativa toggles do modal
- [ ] Arrow keys navegam links (comportamento padrão do navegador)

#### 3.2.2 Leitor de Tela (NVDA/VoiceOver)
**Estrutura Semântica:**
- [ ] Header anunciado como "banner"
- [ ] Main anunciado como "main content"
- [ ] Nav breadcrumb anunciado como "navigation, breadcrumb"
- [ ] Article anunciado como "article"
- [ ] Aside anunciado como "complementary, informações adicionais"
- [ ] Footer anunciado como "contentinfo"

**Conteúdo:**
- [ ] H1 lido corretamente
- [ ] Metadados (autor, data, tempo) lidos em sequência
- [ ] TOC lido como "navigation, índice do artigo"
- [ ] Botões de compartilhamento lidos com aria-label correto
- [ ] Card do autor lido corretamente
- [ ] CTA "Agendar consulta" lido como link/button
- [ ] Modal de cookies:
  - [ ] Anunciado como "dialog"
  - [ ] Título "Preferências de Cookies" lido
  - [ ] Toggles anunciados com estado (on/off)

#### 3.2.3 Contraste de Cores (WebAIM Contrast Checker)
**Combinações a Validar:**
- [ ] `#0f172a` (slate-900) em `#f8fafc` (slate-50): ≥ 7:1 (AAA)
- [ ] `#334155` (slate-700) em `#ffffff`: ≥ 4.5:1 (AA)
- [ ] `#14b8a6` (teal-600) em `#ffffff`: ≥ 4.5:1 (AA)
- [ ] `#ffffff` em `#14b8a6`: ≥ 4.5:1 (AA)
- [ ] `#ffffff` em `#0ea5e9` (blue-600): ≥ 4.5:1 (AA)
- [ ] Botões secondary (blue-600) em slate-50: ≥ 3:1 (AA Large)

**Ferramenta:** https://webaim.org/resources/contrastchecker/

#### 3.2.4 Ferramentas Automatizadas

**AXE DevTools (Chrome Extension):**
```bash
# Instalar: https://chrome.google.com/webstore/detail/axe-devtools-web-accessibility/lhdoppojpmngadmnindnejefpokejbdd
```
- [ ] Executar scan na página do post
- [ ] 0 erros críticos (Critical)
- [ ] < 3 erros sérios (Serious)
- [ ] Revisar avisos (Moderate)
- [ ] Exportar relatório JSON

**Lighthouse (Chrome DevTools):**
```bash
# Abrir DevTools → Lighthouse → Analyze page
```
- [ ] Performance: ≥ 90
- [ ] Accessibility: ≥ 95
- [ ] Best Practices: ≥ 90
- [ ] SEO: ≥ 95
- [ ] Capturar screenshot do relatório

**WAVE (Web Accessibility Evaluation Tool):**
```bash
# Instalar: https://wave.webaim.org/extension/
```
- [ ] Executar análise
- [ ] 0 erros (red icons)
- [ ] Revisar alertas (yellow icons)
- [ ] Verificar estrutura de headings

### 3.3 Testes de Responsividade

**Mobile (375px - iPhone SE):**
- [ ] Layout empilhado (sidebar abaixo do conteúdo)
- [ ] Imagens redimensionam corretamente
- [ ] Texto legível sem zoom
- [ ] Botões têm altura mínima de 44px
- [ ] TOC acessível e funcional
- [ ] Modal de cookies preenche 95% da tela

**Tablet (768px - iPad):**
- [ ] Layout intermediário funcional
- [ ] TOC visível ou collapse
- [ ] Breadcrumb não quebra

**Desktop (1440px+):**
- [ ] Grid 8+4 (artigo + sidebar) alinhado
- [ ] Sidebar sticky funciona
- [ ] Conteúdo centralizado (max-w-7xl)

**Testar em:**
- [ ] Chrome (mobile emulation)
- [ ] Firefox (responsive design mode)
- [ ] Safari (real device ou simulador)
- [ ] Edge (opcional)

### 3.4 Testes de Performance

**Core Web Vitals (Google PageSpeed Insights):**
```bash
# URL: https://pagespeed.web.dev/
```
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1
- [ ] Mobile score: ≥ 80
- [ ] Desktop score: ≥ 90

**Otimizações Verificadas:**
- [ ] Imagens lazy-loaded
- [ ] Fonts preloaded (se aplicável)
- [ ] Scripts diferidos (defer/async)
- [ ] CSS crítico inline (se aplicável)
- [ ] Compression (gzip/brotli) habilitada no Nginx

### 3.5 Testes de SEO

**Validação de Schema (Google Rich Results Test):**
```bash
# URL: https://search.google.com/test/rich-results
```
- [ ] Article schema validado sem erros
- [ ] MedicalClinic schema validado sem erros
- [ ] Imagem detectada corretamente
- [ ] Data de publicação presente

**Meta Tags (View Page Source):**
- [ ] Title tag presente e único
- [ ] Meta description < 160 caracteres
- [ ] Canonical URL correto
- [ ] Open Graph tags completas
- [ ] Twitter Card tags completas

**NAP Consistency:**
- [ ] Nome: "Saraiva Vision" (consistente)
- [ ] Endereço: "Rua Catarina Maria Passos, 97 – Santa Zita, Caratinga/MG, CEP 35300-299"
- [ ] Telefone: "+55 33 99860-1427" ou "(33) 99860-1427"
- [ ] Verificar em: Artigo, Footer, Schema, Google My Business

**Google Search Console:**
- [ ] Submeter URL para indexação
- [ ] Verificar cobertura após 24-48h
- [ ] Confirmar que não há erros de rastreamento

---

## 📋 Fase 4: Deploy e Monitoramento

### 4.1 Deploy em Staging
- [ ] Build do projeto (`npm run build`)
- [ ] Deploy em ambiente de staging
- [ ] Smoke test (página carrega sem erros)
- [ ] Executar todos os testes da Fase 3
- [ ] Corrigir bugs encontrados

### 4.2 Deploy em Produção
**Pré-Deploy:**
- [ ] Backup do banco de dados (se aplicável)
- [ ] Backup dos arquivos atuais
- [ ] Plano de rollback documentado

**Deploy:**
```bash
# Comandos de deploy
npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

- [ ] Executar deploy
- [ ] Verificar que site está no ar (HTTP 200)
- [ ] Testar página do post em produção
- [ ] Verificar logs do Nginx/servidor (sem erros)

**Pós-Deploy:**
- [ ] Executar Lighthouse em produção
- [ ] Executar AXE DevTools em produção
- [ ] Monitorar Google Analytics (tráfego normal)
- [ ] Verificar Core Web Vitals no Search Console (após 24h)

### 4.3 Monitoramento (Primeira Semana)
**Métricas a Acompanhar:**
- [ ] Taxa de clique em "Agendar consulta" (GA4 event)
- [ ] Tempo médio na página (GA4)
- [ ] Taxa de rejeição (bounce rate)
- [ ] Scroll depth (% que leem até o fim)
- [ ] Erros JavaScript (Sentry/console)

**Alertas Configurados:**
- [ ] Alerta de erro 500/404 no servidor
- [ ] Alerta de queda de tráfego > 30%
- [ ] Alerta de CLS > 0.2 (Search Console)

---

## 📋 Fase 5: Documentação e Treinamento

### 5.1 Documentação Técnica
- [x] `POST_REFACTORING_REPORT.md` criado
- [x] `accessibility-rules.css` documentado
- [ ] Atualizar README.md do projeto
- [ ] Criar guia de estilo para futuros posts (template)

### 5.2 Treinamento da Equipe
- [ ] Apresentar nova estrutura para desenvolvedores
- [ ] Treinar marketing/conteúdo em boas práticas de acessibilidade
- [ ] Compartilhar checklist de acessibilidade para novos artigos

---

## 📋 Fase 6: Expansão (Futuro)

### 6.1 Aplicar a Todos os Posts
- [ ] Migrar post ID 24 (Pterígio)
- [ ] Migrar post ID 23 (...)
- [ ] Migrar todos os 25 posts
- [ ] Criar script de migração automatizado (se possível)

### 6.2 Melhorias Adicionais
- [ ] Implementar comentários acessíveis (se planejado)
- [ ] Adicionar modo escuro (dark mode)
- [ ] Integrar CRM para captura de leads
- [ ] A/B testing de CTAs

---

## 📊 Relatórios de Progresso

### Sprint 1 (Semana 1)
**Data:** 01/10/2025 - 07/10/2025  
**Status:** 🟡 Em Andamento

| Tarefa | Status | Responsável | Bloqueios |
|--------|--------|-------------|-----------|
| Criação de componentes | ✅ Completo | Claude | - |
| Integração no projeto | ⏳ Pendente | Dev Team | - |
| Testes de acessibilidade | ⏳ Pendente | QA | - |
| Deploy staging | ⏳ Pendente | DevOps | - |

### Sprint 2 (Semana 2)
**Data:** 08/10/2025 - 14/10/2025  
**Status:** ⏳ Aguardando

| Tarefa | Status | Responsável | Bloqueios |
|--------|--------|-------------|-----------|
| Deploy produção | ⏳ Aguardando | DevOps | Sprint 1 |
| Monitoramento | ⏳ Aguardando | Marketing | Sprint 1 |
| Ajustes pós-deploy | ⏳ Aguardando | Dev Team | Sprint 1 |

---

## 🎯 Critérios de Aceitação

Para considerar a refatoração **concluída**, todos os itens abaixo devem estar ✅:

### Funcionalidade
- [ ] Todas as interações funcionam sem erros
- [ ] Modal de cookies persiste preferências
- [ ] Links redirecionam corretamente

### Acessibilidade
- [ ] Lighthouse Accessibility ≥ 95
- [ ] 0 erros críticos no AXE
- [ ] Navegação por teclado 100% funcional
- [ ] Leitor de tela aprovado por usuário real (opcional mas recomendado)

### Performance
- [ ] Core Web Vitals dentro dos limites (verde)
- [ ] Lighthouse Performance ≥ 85 (mobile), ≥ 90 (desktop)

### SEO
- [ ] Schema validado sem erros
- [ ] Meta tags completas
- [ ] NAP consistente em todo o site

### Design
- [ ] Aprovado por stakeholder
- [ ] Paleta teal/azul aplicada consistentemente
- [ ] Responsivo em mobile/tablet/desktop

---

## 📞 Contatos

**Desenvolvedor:** [Nome]  
**QA:** [Nome]  
**DevOps:** [Nome]  
**Aprovador:** [Nome do responsável pela Saraiva Vision]

---

**Última atualização:** 01/10/2025  
**Próxima revisão:** 03/10/2025
