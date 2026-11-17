---
version: alpha
name: Saraiva Vision Studio
description: Sanity Studio em studio.saraivavision.com.br — UI padrão do Sanity, Inter, sem tema customizado no sanity.config.js.
omitted:
  - section: colors
    reason: "Nenhum tema de cor do projeto em sanity.config.js; a paleta é a padrão do Sanity Studio e não foi inventada aqui."
  - section: spacing
    reason: "Sem escala de espaço própria no repositório do Studio."
  - section: rounded
    reason: "Sem raios próprios no repositório do Studio."
  - section: components
    reason: "Sem componentes de marca definidos no projeto; a UI é a do Sanity."
typography:
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-mono:
    fontFamily: SF Mono
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
---

# DESIGN.md — Sanity Studio (studio.saraivavision.com.br)

Este Studio vive no repositório `Sudo-psc/saraiva-vision-site`, pasta `sanity/`. O `sanity.config.js` define `name: saraiva-vision-blog`, `title: Saraiva Vision Blog`, `projectId` e plugins (`structureTool`, `visionTool`). **Não há `theme` nem tokens de cor/espaço/raio do projeto.** O comentário de nginx no deploy cita o build `git 5ec7ff8b` (25/03/2026).

Conferência no ar em 17/11/2026 (America/Sao_Paulo), `https://studio.saraivavision.com.br/`: o HTML declara `@font-face` para **Inter** e as pilhas:

- UI: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Liberation Sans', Helvetica, Arial, system-ui, sans-serif`
- Mono: `-apple-system-ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace`

O título da página é “Sanity Studio”. Cabeçalhos `X-Robots-Tag` de noindex fazem parte da operação, não do visual.

Títulos de seção e chaves em inglês (spec). Prosa em português. `version: alpha` é o formato. As seções Colors, Layout, Shapes e Components foram omitidas de propósito (`omitted` no front matter) para não inventar a paleta interna do Sanity.

## Overview

Ferramenta interna de CMS (Sanity Studio v4, build estático). A identidade visual é a do produto Sanity, com Inter. Não é a vitrine de saraivavision.com.br e não deve herdar, por suposição, o azul petróleo do site institucional. Qualquer tema de marca só deve entrar neste arquivo depois de existir no `sanity.config.js` (ou equivalente) e ser conferido no ar.

## Typography

Inter é a única família customizada observada no HTML no ar (vários `@font-face`). As pilhas de fallback de UI e mono estão citadas acima, literais. Não há escala de tamanho de título definida no repositório; o token `body-md` usa 16px / 1.5 apenas como corpo base convencional da UI, e deve ser tratado como aproximação da UI padrão — **TODO: confirmar tamanhos reais no CSS do Studio se o projeto ganhar um tema.** O token `body-mono` usa o nome principal da pilha mono observada (`SF Mono`).

## Do's and Don'ts

- Faça manter o Studio com a UI padrão do Sanity até existir um `theme` no config.
- Não copie para este arquivo as cores de saraivavision.com.br, olhossecos.com.br ou de qualquer outro site.
- Não invente paleta, raios ou componentes “para ficar completo”.
- Faça entregar mudanças deste arquivo no repositório `saraiva-vision-site` (por exemplo em `sanity/DESIGN.md`), em branch nova, sem merge e sem deploy.
