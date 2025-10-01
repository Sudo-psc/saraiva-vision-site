# 🚀 Guia de Integração - Blog UX/UI

## ⚡ Quick Start (5 minutos)

### 1. Atualizar BlogPage.jsx

```jsx
// src/pages/BlogPage.jsx
import BlogPostLayout from '@/components/blog/BlogPostLayout';
import BlogSEO from '@/components/blog/BlogSEO';
import { StickyAppointmentCTA } from '@/components/blog/ConversionElements';
import { SkipLink } from '@/components/blog/AccessibleComponents';

// Quando renderizar um post individual:
{currentPost && (
  <>
    <SkipLink targetId="main-content" />
    <BlogSEO post={currentPost} />
    
    <BlogPostLayout post={currentPost}>
      <div dangerouslySetInnerHTML={{ __html: currentPost.content }} />
    </BlogPostLayout>
    
    <StickyAppointmentCTA />
  </>
)}
```

### 2. Adicionar CTAs Inline no Conteúdo

```jsx
// Opção A: Inserir via markdown (recomendado)
// Em cada arquivo .md, adicionar após ~50% do conteúdo:

<InlineAppointmentCTA />

// Opção B: Inserir programaticamente
import { InlineAppointmentCTA } from '@/components/blog/ConversionElements';

// Dividir conteúdo e inserir CTA no meio
const paragraphs = currentPost.content.split('</p>');
const midPoint = Math.floor(paragraphs.length / 2);
paragraphs.splice(midPoint, 0, '<InlineAppointmentCTA />');
```

### 3. Adicionar Callouts nos Posts

```markdown
<!-- Em arquivos .md -->

## Sintomas de Catarata

<Callout type="warning" title="Atenção aos Sinais">
Se você perceber visão embaçada progressiva ou dificuldade para enxergar à noite, agende uma consulta oftalmológica.
</Callout>

## Tratamento

<Callout type="success" title="Taxa de Sucesso">
A cirurgia de catarata tem 98% de taxa de sucesso e recuperação rápida.
</Callout>
```

### 4. Adicionar Quick Facts

```markdown
<!-- Em arquivos .md -->

<QuickFacts 
  title="Fatos sobre Glaucoma"
  facts={[
    "É a principal causa de cegueira irreversível no mundo",
    "Não apresenta sintomas nas fases iniciais",
    "Diagnóstico precoce previne perda visual em 90% dos casos"
  ]}
/>
```

---

## 📝 Checklist de Integração

### Para Cada Post de Blog:

- [ ] 1. Adicionar `BlogSEO` no topo
- [ ] 2. Envolver conteúdo com `BlogPostLayout`
- [ ] 3. Adicionar `SkipLink` como primeiro elemento
- [ ] 4. Inserir `InlineAppointmentCTA` após 50% do conteúdo
- [ ] 5. Adicionar `StickyAppointmentCTA` no layout global
- [ ] 6. Usar `Callout` para avisos e dicas importantes
- [ ] 7. Adicionar `QuickFacts` quando aplicável
- [ ] 8. Verificar alt text em todas as imagens
- [ ] 9. Revisar hierarquia de headings (H1 > H2 > H3)
- [ ] 10. Testar navegação por teclado (Tab, Enter, Space)

### Para Posts de Saúde/Médicos:

- [ ] Disclaimer médico é adicionado automaticamente
- [ ] Verificar credenciais do autor estão corretas
- [ ] Adicionar `EmergencyNotice` se for condição urgente
- [ ] Usar `DefinitionBox` para termos médicos complexos

---

## 🎨 Componentes Prontos para Uso

### Callouts (Avisos e Dicas)

```jsx
import { Callout } from '@/components/blog/AccessibleComponents';

// Informativo (azul)
<Callout type="info" title="Sabia que?">
  90% das cegueiras por glaucoma poderiam ser evitadas com diagnóstico precoce.
</Callout>

// Aviso (amarelo)
<Callout type="warning" title="Atenção">
  Não use colírios sem prescrição médica.
</Callout>

// Dica (verde)
<Callout type="tip" title="Dica do Especialista">
  Use óculos de sol com proteção UV400 diariamente.
</Callout>

// Perigo (vermelho)
<Callout type="danger" title="Emergência">
  Perda súbita de visão requer atendimento médico imediato.
</Callout>

// Sucesso (verde escuro)
<Callout type="success" title="Resultado Positivo">
  Taxa de sucesso da cirurgia: 98%
</Callout>
```

### Quick Facts

```jsx
import { QuickFacts } from '@/components/blog/AccessibleComponents';

<QuickFacts 
  title="Números da Catarata"
  facts={[
    "Afeta 50% das pessoas acima de 65 anos",
    "Cirurgia leva apenas 15-20 minutos",
    "Recuperação completa em 2-4 semanas",
    "98% de taxa de sucesso"
  ]}
/>
```

### Definition Box (Termos Médicos)

```jsx
import { DefinitionBox } from '@/components/blog/AccessibleComponents';

<DefinitionBox 
  term="Astigmatismo"
  definition="Erro refrativo causado por curvatura irregular da córnea, resultando em visão distorcida ou embaçada em todas as distâncias."
/>
```

### Highlight Box (Destaque)

```jsx
import { HighlightBox } from '@/components/blog/AccessibleComponents';

<HighlightBox 
  title="Importante Saber"
  color="blue"
  icon="💡"
>
  Exames oftalmológicos anuais são recomendados após os 40 anos, mesmo sem sintomas.
</HighlightBox>
```

### Emergency Notice

```jsx
import { EmergencyNotice } from '@/components/blog/ConversionElements';

// Adicionar em posts sobre condições urgentes
<EmergencyNotice />
```

### Reviews Highlight

```jsx
import { ReviewsHighlight } from '@/components/blog/ConversionElements';

<ReviewsHighlight rating={4.9} count={127} />
```

### Services CTA

```jsx
import { ServicesCTA } from '@/components/blog/ConversionElements';

<ServicesCTA 
  services={[
    { name: "Cirurgia de Catarata", icon: "👁️", slug: "catarata" },
    { name: "Tratamento de Glaucoma", icon: "💧", slug: "glaucoma" },
    { name: "Exame de Retina", icon: "🔍", slug: "retina" }
  ]}
/>
```

---

## 🧪 Testes Obrigatórios

### Antes de Publicar:

```bash
# 1. Build sem erros
npm run build

# 2. Lighthouse (mínimo 90+)
# Chrome DevTools > Lighthouse > Run

# 3. Acessibilidade (WAVE)
# https://wave.webaim.org/

# 4. Schema.org Validation
# https://validator.schema.org/

# 5. Open Graph Preview
# https://www.opengraph.xyz/
```

### Testes Manuais:

1. **Navegação por Teclado**
   - Tab através de todos os links e botões
   - Enter ativa links/botões
   - Skip link funciona

2. **Screen Reader** (opcional mas recomendado)
   - NVDA (Windows) ou VoiceOver (Mac)
   - Verificar landmarks (article, nav, aside)
   - Verificar alt text de imagens

3. **Responsividade**
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1280px+)

4. **CTAs**
   - CTA primário visível acima do fold
   - CTA flutuante aparece após 50% scroll
   - WhatsApp abre corretamente
   - Todos os links funcionam

---

## 📊 Monitoramento Pós-Deploy

### Google Analytics

Eventos a rastrear:
- `blog_post_view` - Visualização de post
- `cta_click` - Clique em CTAs
- `whatsapp_click` - Clique no WhatsApp
- `scroll_depth` - Profundidade de scroll (25%, 50%, 75%, 100%)
- `reading_time` - Tempo de leitura

### Google Search Console

Verificar semanalmente:
- Impressões orgânicas
- Posição média
- CTR
- Erros de indexação
- Core Web Vitals

### Heatmaps (Hotjar ou similar)

Analisar:
- Onde usuários clicam mais
- Scroll depth
- CTAs mais efetivos
- Dead zones (áreas ignoradas)

---

## 🐛 Problemas Comuns e Soluções

### 1. CTA Flutuante Não Aparece

**Problema**: StickyAppointmentCTA não é exibido

**Solução**:
```jsx
// Verificar z-index do componente
<StickyAppointmentCTA /> // deve ter z-50 ou superior

// Verificar se está dentro de um container com overflow: hidden
// Mover para fora se necessário
```

### 2. Skip Link Não Funciona

**Problema**: Clicar no skip link não pula para o conteúdo

**Solução**:
```jsx
// Garantir que o main-content tem id e tabIndex
<article id="main-content" tabIndex={-1}>
  {/* conteúdo */}
</article>
```

### 3. Schema.org Não Valida

**Problema**: Rich Results Test mostra erros

**Solução**:
- Usar URLs absolutas (https://saraivavision.com.br/...)
- Verificar formato de datas (ISO 8601)
- Confirmar todas as propriedades obrigatórias

### 4. Lighthouse Score Baixo

**Possíveis Causas**:
- Imagens sem width/height
- Falta de lazy loading
- Bundle JS muito grande
- Falta de cache headers

**Soluções**:
```jsx
// Sempre usar width/height em imagens
<OptimizedImage 
  src="..." 
  alt="..." 
  width={1920} 
  height={1080} 
/>

// Lazy loading em imagens abaixo do fold
loading="lazy"

// Code splitting de componentes pesados
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

---

## 📚 Recursos Úteis

### Ferramentas

- **WAVE**: https://wave.webaim.org/ (teste de acessibilidade)
- **axe DevTools**: https://www.deque.com/axe/devtools/ (extensão Chrome)
- **Lighthouse**: Integrado no Chrome DevTools
- **Schema Validator**: https://validator.schema.org/
- **Rich Results Test**: https://search.google.com/test/rich-results
- **OG Preview**: https://www.opengraph.xyz/

### Documentação

- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **Schema.org BlogPosting**: https://schema.org/BlogPosting
- **Tailwind CSS**: https://tailwindcss.com/docs
- **MDN Web Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility

---

## 🎯 Metas de Performance

### Lighthouse Scores (Mínimo)

- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

### Core Web Vitals

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Engajamento

- Tempo médio na página: > 3 minutos
- Taxa de rejeição: < 60%
- Scroll depth: > 75%
- Taxa de conversão (CTA): > 5%

---

## ✅ Conclusão

Com esses componentes implementados, você tem:

✅ **Acessibilidade WCAG 2.1 AA compliant**  
✅ **SEO otimizado** com Schema.org  
✅ **Conversão maximizada** com CTAs estratégicos  
✅ **UX premium** com tipografia e espaçamento otimizados  
✅ **Mobile-first** responsivo  

**Próximos passos**: Testar, monitorar métricas e iterar baseado em dados reais.

---

**Dúvidas?** Consulte `docs/BLOG_UX_IMPLEMENTATION.md` para documentação completa.
