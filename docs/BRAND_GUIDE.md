# Guia de Marca e Identidade Visual — Saraiva Vision

Este guia consolida princípios de marca, identidade visual e diretrizes práticas para manter consistência em todo o site e materiais digitais da Clínica Saraiva Vision.

## Essência da Marca
- Propósito: cuidado oftalmológico de alta qualidade, humano e acessível.
- Valores: confiança, precisão clínica, empatia e clareza.
- Tom de voz: claro, acolhedor e responsável (sem jargões desnecessários).

## Paleta de Cores (Tailwind)
Use os tokens definidos em `tailwind.config.js` para garantir consistência e acessibilidade.

- Primária: `brand-blue` (principal: `brand-blue-600` #0284c7; alternativa CTA: `brand-blue-500` #0ea5e9)
- Apoio/Ênfase: `trust-green` (principal: `trust-green-600` #16a34a; feedbacks positivos/êxito)
- Neutros: `soft-gray` (conteúdo, separadores, fundos sutis)

Recomendações de uso:
- 60% neutros (fundos, textos padrão)
- 30% azul (identidade, cabeçalhos, links, componentes principais)
- 10% verde (realces, estados de sucesso, badges)

Contraste: mantenha relação mínima 4.5:1 para textos (WCAG AA). Prefira `brand-blue-700`/`800` em fundos claros para títulos.

## Tipografia
- Família padrão: Inter (com fallbacks do sistema) — já configurada em Tailwind.
- Hierarquia recomendada:
  - H1: `text-display-sm|md|lg` (linha ~1.2)
  - H2: `text-heading-xl|lg` (linha ~1.25)
  - H3: `text-heading-md|sm` (linha ~1.3)
  - Corpo: `text-body-lg|xl` (linha ~1.6)
- Legibilidade: limite parágrafos a `max-w-prose` ou `max-w-prose-wide`.

Exemplos:
```jsx
<h1 className="text-display-sm md:text-display-md text-soft-gray-900">Título</h1>
<p className="text-body-lg text-soft-gray-700 max-w-prose">Parágrafo…</p>
<a className="text-brand-blue-700 hover:underline">Saiba mais</a>
```

## Grid e Espaçamentos
- Sistema 8pt (tokens em Tailwind `spacing`).
- Seções: `py-section|section-lg|section-xl` (64–128px).
- Blocos internos: `space-y-6|8` para respiro entre textos e componentes.

## Componentes e Estados
- Botões:
  - Primário: fundo `brand-blue-600`, hover `brand-blue-700`, texto branco.
  - Secundário: borda `soft-gray-300`, texto `brand-blue-700`, hover com leve `bg-soft-gray-50`.
  - Perigo: `destructive` tokens.
  - Acessibilidade: foco visível com `ring-2 ring-brand-blue-500`.
  
Exemplo:
```jsx
<button className="px-5 py-3 rounded-md bg-brand-blue-600 hover:bg-brand-blue-700 text-white ring-offset-2 focus:outline-none focus:ring-2 focus:ring-brand-blue-500">Agendar consulta</button>
```

- Cards: fundo `white|soft-gray-50`, borda `soft-gray-200`, sombra suave, raio consistente (`rounded-lg`).
- Formulários: rótulos claros, validação com mensagens curtas; erro em `destructive` e ajuda em `soft-gray-600`.

## Iconografia e Ilustrações
- Ícones: Lucide (traço limpo). Tamanhos 20–24px, peso consistente.
- Imagens: priorizar fotos clínicas autênticas e humanizadas (sem sobrecarga visual). Evitar imagens de olhos sensíveis sem contexto.
- Consentimento: somente publicar imagens de pacientes com autorização explícita.

## Movimento (Motion)
- Animações discretas (200–600ms). Use os utilitários já configurados: `fade-in`, `slide-in-*`, `scale-in`.
- Respeitar `prefers-reduced-motion` quando aplicável; não bloquear leitura.

## Acessibilidade
- Foco visível em todos os elementos interativos.
- Alts descritivos em imagens; sem texto “decorativo” redundante.
- Tamanho mínimo de alvo: 44px para botões/links críticos.

## Logo e Uso de Marca
- Margem de segurança: pelo menos 0.5× a altura do logotipo ao redor.
- Tamanhos mínimos: 32px favicons; 180px Apple Touch; 192–512px ícones PWA.
- Variações: preferir versão em fundo claro; para fundos escuros, usar versão com contraste adequado.
- Não distorcer, inclinar, inverter cores não oficiais nem aplicar sombras exageradas.

## Padrões de Conteúdo
- Estrutura: 1 título claro, 1 parágrafo curto, CTA objetivo.
- Densidade de informação: modular; quebra de conteúdo com intertítulos (H2/H3).
- Multilíngue: sem textos “hardcoded”; use i18n (`src/locales`).

## Identidade PWA
- `theme_color` deve refletir `brand-blue` (ícones/splash consistentes com `site.webmanifest`).
- Ícones com margens seguras e fundo consistente; evitar transparência total em símbolos finos.

## Exemplos de Classes Compostas
```jsx
// Cabeçalho de seção
<header className="mb-10 md:mb-12">
  <h2 className="text-heading-xl text-soft-gray-900">Serviços oftalmológicos</h2>
  <p className="mt-3 text-body-lg text-soft-gray-700 max-w-prose">Descrição curta…</p>
  <div className="mt-6">
    <a className="inline-flex items-center gap-2 text-brand-blue-700 hover:text-brand-blue-800 hover:underline">Ver todos</a>
  </div>
  </header>
```

## Governança
- Responsável visual: design/front-end.
- Mudanças de token: via PR com validação de contraste e impacto.
- Revisões trimestrais para consistência e acessibilidade.

