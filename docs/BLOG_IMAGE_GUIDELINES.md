# Diretrizes de Imagens de Capa - Blog Saraiva Vision

**Versão:** 1.0
**Última atualização:** 30 de Setembro, 2025
**Responsável:** Equipe de Conteúdo Saraiva Vision

---

## 📋 Índice

1. [Identidade Visual](#identidade-visual)
2. [Especificações Técnicas](#especificações-técnicas)
3. [Paleta de Cores](#paleta-de-cores)
4. [Composição e Design](#composição-e-design)
5. [Categoria Visual](#categoria-visual)
6. [Tipografia em Imagens](#tipografia-em-imagens)
7. [Elementos Proibidos](#elementos-proibidos)
8. [Checklist de Aprovação](#checklist-de-aprovação)
9. [Exemplos e Templates](#exemplos-e-templates)

---

## 🎨 Identidade Visual

### Conceito

As imagens de capa do blog Saraiva Vision devem refletir:

- **Profissionalismo médico** com abordagem humanizada
- **Confiança e credibilidade** oftalmológica
- **Modernidade e tecnologia** em saúde ocular
- **Acessibilidade e clareza** visual
- **Conexão emocional** com pacientes

### Estilo Fotográfico

**✅ Recomendado:**
- Fotografia profissional e de alta qualidade
- Iluminação natural e suave
- Foco nítido e bem definido
- Composição limpa e minimalista
- Contexto médico/oftalmológico autêntico

**❌ Evitar:**
- Imagens de banco de imagens clichês
- Fotografia amadora ou de baixa qualidade
- Iluminação artificial excessiva ou cores saturadas
- Elementos visuais poluídos ou confusos
- Contextos irrelevantes à oftalmologia

---

## 📐 Especificações Técnicas

### Dimensões e Formatos

| Contexto | Dimensão Ideal | Aspect Ratio | Formato | Tamanho Max |
|----------|---------------|--------------|---------|-------------|
| **Card Principal (Grid)** | 1200x800px | 3:2 | JPG/WebP | 250KB |
| **Featured Image (Post)** | 1920x1080px | 16:9 | JPG/WebP | 400KB |
| **Hero Header** | 1920x1280px | 3:2 | JPG/WebP | 500KB |
| **Posts Relacionados** | 800x600px | 4:3 | JPG/WebP | 200KB |
| **Mobile Otimizado** | 800x600px | 4:3 | WebP | 150KB |

### Requisitos Técnicos

```yaml
Formato preferencial: WebP (fallback: JPG)
Compressão: 80-85% (balanceamento qualidade/performance)
Espaço de cor: sRGB
Resolução: 72 DPI (web)
Perfil ICC: sRGB IEC61966-2.1

# Performance
LCP (Largest Contentful Paint): < 2.5s
CLS (Cumulative Layout Shift): < 0.1
Lazy loading: Habilitado para cards
Eager loading: Featured images do post individual
```

### Otimização

- **Compressão:** TinyPNG, ImageOptim, Squoosh
- **Conversão WebP:** cwebp CLI ou Photoshop plugin
- **Responsive:** Gerar variações para mobile (800x600px)
- **CDN:** Servir via Vercel Image Optimization ou similar
- **Alt Text:** Sempre incluir descrição acessível em português

---

## 🎨 Paleta de Cores

### Cores Primárias (Baseadas em Tailwind Config)

```css
/* Azul Primário - Confiança e Tecnologia */
--primary-50: #f0f9ff;   /* Backgrounds suaves */
--primary-100: #e0f2fe;  /* Hover states */
--primary-500: #0ea5e9;  /* CTAs e destaques */
--primary-600: #0284c7;  /* Links e badges */
--primary-700: #0369a1;  /* Headers e títulos */
--primary-900: #0c4a6e;  /* Textos de alto contraste */

/* Cinza Secundário - Elegância e Leitura */
--secondary-50: #f8fafc;  /* Backgrounds claros */
--secondary-100: #f1f5f9; /* Cards e containers */
--secondary-500: #64748b; /* Textos secundários */
--secondary-600: #475569; /* Textos padrão */
--secondary-700: #334155; /* Textos de ênfase */
--secondary-900: #0f172a; /* Títulos e headers */
```

### Cores por Categoria

```yaml
Prevenção:
  principal: '#10b981'      # Emerald-500
  secundária: '#d1fae5'     # Emerald-100
  acento: '#059669'         # Emerald-600
  uso: Backgrounds, badges, gradientes

Tratamento:
  principal: '#0ea5e9'      # Blue-500
  secundária: '#dbeafe'     # Blue-100
  acento: '#0284c7'         # Blue-600
  uso: Backgrounds, overlays, CTAs

Tecnologia:
  principal: '#a855f7'      # Purple-500
  secundária: '#f3e8ff'     # Purple-100
  acento: '#9333ea'         # Purple-600
  uso: Badges, ícones, destaques

Dúvidas Frequentes:
  principal: '#f59e0b'      # Amber-500
  secundária: '#fef3c7'     # Amber-100
  acento: '#d97706'         # Amber-600
  uso: Alerts, avisos, destaques
```

### Gradientes Recomendados

```css
/* Gradiente Primário - Azul Suave */
background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);

/* Gradiente Secundário - Cinza Neutro */
background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);

/* Overlay Escuro para Imagens */
background: linear-gradient(
  to top,
  rgba(0, 0, 0, 0.7) 0%,
  rgba(0, 0, 0, 0.3) 50%,
  transparent 100%
);

/* Overlay Azul para Hero */
background: linear-gradient(
  to bottom right,
  rgba(14, 165, 233, 0.1) 0%,
  rgba(14, 165, 233, 0.05) 100%
);
```

---

## 🖼️ Composição e Design

### Regras de Composição

#### Regra dos Terços
- Posicionar elementos-chave nos pontos de intersecção
- Horizonte no terço superior ou inferior
- Evitar centralização excessiva

#### Espaço Negativo
- Mínimo 30% da imagem deve ser espaço "respirável"
- Facilita leitura de texto sobreposto
- Cria sensação de profissionalidade e calma

#### Hierarquia Visual
1. **Ponto focal principal** (60% da atenção)
2. **Elementos de apoio** (30% da atenção)
3. **Background/Contexto** (10% da atenção)

### Área de Segurança (Safe Zone)

```
┌──────────────────────────────────┐
│ MARGEM: 80px                     │
│  ┌────────────────────────────┐  │
│  │                            │  │
│  │    SAFE ZONE               │  │
│  │    (Texto e elementos)     │  │
│  │                            │  │
│  └────────────────────────────┘  │
│ MARGEM: 80px                     │
└──────────────────────────────────┘
```

**Motivo:** Imagens podem ser cortadas em diferentes viewports. A safe zone garante que elementos importantes nunca sejam cortados.

### Profundidade de Campo

- **Desfoque de background (Bokeh):** Recomendado para destacar sujeito
- **Foco seletivo:** Usar para direcionar atenção
- **Profundidade rasa:** f/2.8 - f/4 para retratos médicos
- **Profundidade ampla:** f/8 - f/11 para ambientes clínicos

### Iluminação

**Preferencial:**
- Luz natural difusa (golden hour: 1h após nascer do sol / 1h antes do pôr do sol)
- Iluminação lateral suave (3-point lighting em estúdio)
- Evitar sombras duras e contrastes extremos

**Temperatura de Cor:**
- 5000K - 6000K (luz natural neutra)
- Evitar tons amarelados (<4500K) ou muito frios (>7000K)

---

## 📂 Categoria Visual

### Prevenção (Emerald)

**Conceito:** Cuidado proativo, saúde preventiva, bem-estar

**Elementos Visuais:**
- Óculos de sol / Proteção UV
- Pessoas ao ar livre em ambientes saudáveis
- Consultas médicas preventivas
- Exames oftalmológicos de rotina
- Natureza, luz natural, ambientes arejados

**Composição de Cor:**
- Background: Gradiente emerald-50 → white
- Overlay: Emerald-500 com 10% de opacidade
- Badge: Emerald-100 com texto emerald-800

**Exemplo de Fotografia:**
```
📷 Mulher sorrindo usando óculos de sol em ambiente externo
   com vegetação desfocada ao fundo (bokeh)
   Iluminação: Golden hour
   Cores: Verde natural + azul céu
```

---

### Tratamento (Blue)

**Conceito:** Cuidado médico, expertise, tecnologia, confiança

**Elementos Visuais:**
- Equipamentos oftalmológicos modernos
- Médico oftalmologista em atendimento
- Procedimentos e cirurgias (contexto educativo)
- Tecnologia diagnóstica avançada
- Ambientes clínicos profissionais

**Composição de Cor:**
- Background: Gradiente blue-50 → white
- Overlay: Blue-600 com 15% de opacidade
- Badge: Blue-100 com texto blue-800

**Exemplo de Fotografia:**
```
📷 Dr. utilizando equipamento de diagnóstico moderno
   Foco no equipamento + médico desfocado ao fundo
   Iluminação: Luz difusa de LED clínico
   Cores: Azul tecnológico + branco hospitalar
```

---

### Tecnologia (Purple)

**Conceito:** Inovação, precisão, futuro da oftalmologia

**Elementos Visuais:**
- Equipamentos de alta tecnologia (OCT, topografia)
- Interfaces digitais e telas de diagnóstico
- Cirurgias a laser (LASIK, PRK)
- Inteligência artificial aplicada à saúde ocular
- Ambiente moderno e futurista

**Composição de Cor:**
- Background: Gradiente purple-50 → white
- Overlay: Purple-500 com 12% de opacidade
- Badge: Purple-100 com texto purple-800

**Exemplo de Fotografia:**
```
📷 Tela de equipamento de topografia ocular com dados coloridos
   Foco na interface digital + reflexo do olho sendo examinado
   Iluminação: Luz LED de equipamento + ambiente escurecido
   Cores: Purple e azul digital + tons de verde (dados)
```

---

### Dúvidas Frequentes (Amber)

**Conceito:** Educação, esclarecimento, acessibilidade

**Elementos Visuais:**
- Paciente fazendo perguntas ao médico
- Materiais educativos e ilustrações
- Gestos de explicação e comunicação
- Ambiente acolhedor de consultório
- Expressões de compreensão e confiança

**Composição de Cor:**
- Background: Gradiente amber-50 → white
- Overlay: Amber-500 com 10% de opacidade
- Badge: Amber-100 com texto amber-800

**Exemplo de Fotografia:**
```
📷 Médico explicando com modelo de olho anatômico
   Foco nas mãos + modelo + paciente desfocado ouvindo
   Iluminação: Luz natural de janela (difusa)
   Cores: Tons quentes (amber) + branco + madeira
```

---

## ✍️ Tipografia em Imagens

### Quando Usar Texto em Imagens

**✅ Recomendado:**
- Hero images com título do post sobreposto
- Citações destacadas (pull quotes)
- Estatísticas importantes
- Chamadas de ação visuais

**❌ Não recomendado:**
- Texto excessivo que prejudica a leitura
- Fontes decorativas ou difíceis de ler
- Textos muito pequenos (<16px equivalente)
- Contraste insuficiente com background

### Especificações de Texto

```yaml
Fonte: Inter (mesma do site)
Pesos:
  - Título: 700 (Bold) ou 800 (ExtraBold)
  - Subtítulo: 600 (SemiBold)
  - Corpo: 400 (Regular) ou 500 (Medium)

Tamanhos (equivalentes em design):
  - Hero Title: 48-72px
  - Card Title: 24-32px
  - Subtítulo: 16-20px

Cores de Texto:
  - Sobre fundo claro: #0f172a (secondary-900)
  - Sobre fundo escuro: #ffffff (white)
  - Com overlay: Sempre garantir contraste WCAG AA (4.5:1)

Sombra de Texto (para legibilidade):
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
```

### Posicionamento de Texto

**Alinhamento:**
- Esquerda: Para títulos longos (mais de 3 palavras)
- Centro: Para títulos curtos e impactantes
- Evitar: Alinhamento à direita (dificulta leitura em PT-BR)

**Margem de Segurança:**
- Desktop: 80px de todas as bordas
- Mobile: 40px de todas as bordas

---

## 🚫 Elementos Proibidos

### Imagens Inadequadas

**❌ NUNCA usar:**

1. **Conteúdo genérico de banco de imagens:**
   - Modelos obviamente posados
   - Cenários artificiais e exagerados
   - Expressões forçadas ou irreais

2. **Conteúdo médico inadequado:**
   - Imagens gráficas de cirurgias sem contexto educativo
   - Patologias oculares chocantes
   - Equipamentos médicos intimidadores em close

3. **Elementos visuais poluídos:**
   - Múltiplos pontos focais competindo
   - Cores saturadas ou neon
   - Gradientes arco-íris ou efeitos excessivos
   - Clipart ou gráficos vetoriais amadores

4. **Questões de direitos autorais:**
   - Imagens sem licença comercial
   - Fotos de terceiros sem autorização
   - Logos ou marcas de concorrentes
   - Conteúdo protegido por copyright

5. **Problemas de representatividade:**
   - Falta de diversidade étnica/racial
   - Estereótipos de gênero ou idade
   - Representações excludentes

### Elementos Técnicos Proibidos

**❌ Evitar:**

- Imagens pixeladas ou de baixa resolução
- Compressão excessiva com artefatos visíveis
- Distorção de aspect ratio (imagens esticadas)
- Ruído digital excessivo (ISO alto sem tratamento)
- Balanço de branco incorreto (tons esverdeados/amarelados)
- Vinheta excessiva ou efeitos vintage artificiais

---

## ✅ Checklist de Aprovação

Antes de publicar qualquer imagem de capa, verifique:

### Técnico

- [ ] Dimensões corretas para o contexto (card, featured, hero)
- [ ] Formato otimizado (WebP com fallback JPG)
- [ ] Tamanho de arquivo dentro do limite (máx 500KB)
- [ ] Compressão adequada (80-85%)
- [ ] Espaço de cor sRGB
- [ ] Alt text descritivo em português
- [ ] Testado em dispositivos móveis

### Design

- [ ] Segue a identidade visual da categoria
- [ ] Paleta de cores consistente com o brand
- [ ] Composição seguindo regra dos terços
- [ ] Espaço negativo adequado (mín. 30%)
- [ ] Profundidade de campo apropriada
- [ ] Iluminação profissional e suave
- [ ] Foco nítido e bem definido

### Conteúdo

- [ ] Relevante ao tema do artigo
- [ ] Contexto médico/oftalmológico autêntico
- [ ] Sem elementos proibidos ou inadequados
- [ ] Direitos de uso garantidos (licença comercial)
- [ ] Representatividade e inclusão adequadas
- [ ] Profissionalismo e credibilidade transmitidos

### Acessibilidade

- [ ] Contraste adequado para texto sobreposto (WCAG AA: 4.5:1)
- [ ] Legibilidade em dispositivos móveis
- [ ] Não depende apenas de cor para transmitir informação
- [ ] Alt text fornece contexto completo
- [ ] Imagem carrega com lazy loading (cards) ou eager (featured)

### Performance

- [ ] LCP < 2.5s (Largest Contentful Paint)
- [ ] CLS < 0.1 (Cumulative Layout Shift)
- [ ] Imagem otimizada para Core Web Vitals
- [ ] Fallback de erro configurado (`onError`)

---

## 🎯 Exemplos e Templates

### Template de Nomeação de Arquivos

```
Padrão: [categoria]-[slug-do-post]-[variacao].[formato]

Exemplos:
- prevencao-cuidados-visuais-esportes-featured.webp
- prevencao-cuidados-visuais-esportes-featured.jpg (fallback)
- tratamento-cirurgia-catarata-card.webp
- tecnologia-lasik-moderna-hero.webp
- duvidas-glaucoma-explicado-related.webp

Variações:
- featured: Imagem principal do post (1920x1080)
- card: Imagem de card no grid (1200x800)
- hero: Imagem hero com overlay (1920x1280)
- related: Posts relacionados (800x600)
- mobile: Versão otimizada mobile (800x600)
```

### Estrutura de Diretório

```
public/
└── img/
    └── blog/
        ├── prevencao/
        │   ├── cuidados-visuais-esportes-featured.webp
        │   ├── cuidados-visuais-esportes-featured.jpg
        │   └── cuidados-visuais-esportes-card.webp
        ├── tratamento/
        │   ├── cirurgia-catarata-featured.webp
        │   └── cirurgia-catarata-card.webp
        ├── tecnologia/
        │   ├── lasik-moderna-featured.webp
        │   └── lasik-moderna-card.webp
        └── duvidas/
            ├── glaucoma-explicado-featured.webp
            └── glaucoma-explicado-card.webp
```

### Exemplo de Implementação (React/JSX)

```jsx
// Componente de Imagem de Blog
<div className="relative w-full h-48 sm:h-52 md:h-56 lg:h-60 overflow-hidden bg-gradient-to-br from-blue-100 to-gray-100">
  <img
    src="/img/blog/prevencao/cuidados-visuais-esportes-card.webp"
    alt="Atleta protegendo os olhos com óculos de sol durante prática esportiva ao ar livre"
    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
    loading="lazy"
    decoding="async"
    style={{ maxWidth: '100%', display: 'block' }}
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = '/img/blog/prevencao/cuidados-visuais-esportes-card.jpg';
    }}
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
</div>
```

---

## 📚 Recursos Recomendados

### Bancos de Imagens (Licença Comercial)

1. **Unsplash** (unsplash.com)
   - Buscar: "ophthalmology", "eye care", "medical technology"
   - Licença gratuita para uso comercial

2. **Pexels** (pexels.com)
   - Buscar: "doctor", "medical consultation", "healthcare"
   - Licença gratuita para uso comercial

3. **Freepik** (freepik.com) - Premium
   - Recursos médicos profissionais
   - Ilustrações vetoriais de alta qualidade

4. **iStock** (istockphoto.com) - Premium
   - Fotografia médica autêntica
   - Diversidade de modelos e contextos

### Ferramentas de Edição

1. **Photoshop / Affinity Photo**
   - Edição profissional completa
   - Ajustes de cor, contraste, recorte

2. **Canva Pro**
   - Templates pré-configurados
   - Fácil aplicação de gradientes e overlays

3. **Figma**
   - Design de mockups
   - Prototipagem de layouts

### Ferramentas de Otimização

1. **TinyPNG** (tinypng.com)
   - Compressão inteligente PNG/JPG
   - API disponível para automação

2. **Squoosh** (squoosh.app)
   - Conversão WebP
   - Comparação lado a lado

3. **ImageOptim** (imageoptim.com) - MacOS
   - Batch processing
   - Otimização lossless

4. **cwebp** (Google CLI)
   ```bash
   cwebp -q 85 input.jpg -o output.webp
   ```

### Ferramentas de Verificação

1. **WebAIM Contrast Checker** (webaim.org/resources/contrastchecker)
   - Verificar contraste WCAG

2. **Google PageSpeed Insights** (pagespeed.web.dev)
   - Testar performance de imagens

3. **Lighthouse** (Chrome DevTools)
   - Auditoria de acessibilidade e performance

---

## 🔄 Controle de Versão

### Versionamento de Diretrizes

| Versão | Data | Mudanças | Responsável |
|--------|------|----------|-------------|
| 1.0 | 30/09/2025 | Criação inicial das diretrizes | Equipe Saraiva Vision |

### Revisão Periódica

- **Frequência:** Trimestral
- **Responsável:** Designer + Gerente de Conteúdo
- **Próxima revisão:** 30/12/2025

---

## 📞 Contato e Dúvidas

**Para esclarecimentos sobre estas diretrizes:**

- **Email:** contato@saraivavision.com.br
- **Telefone/WhatsApp:** (33) 98420-7437
- **Documentação técnica:** `/docs/BLOG_IMAGE_GUIDELINES.md`

---

**Última atualização:** 30 de Setembro, 2025
**Saraiva Vision** - Clínica Oftalmológica | Caratinga, MG
**CRM-MG 69.870** | Dr. Philipe Saraiva Cruz