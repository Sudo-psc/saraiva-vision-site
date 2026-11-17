---
version: alpha
name: Saraiva Vision
description: Sistema de design de saraivavision.com.br no repositório saraiva-vision-site — azul petróleo, teal complementar e Inter — extraído de tailwind.config.js e conferido no CSS público, com divergências da home "arquivo histórico" assinaladas.
colors:
  primary: "#1E4D4C"
  on-primary: "#ffffff"
  secondary: "#2C5F5B"
  tertiary: "#D9D3C7"
  primary-50: "#F1F5F4"
  primary-100: "#E0EBE9"
  primary-200: "#C1D7D3"
  primary-300: "#8FB5AD"
  primary-400: "#5D9387"
  primary-500: "#1E4D4C"
  primary-600: "#173F3E"
  primary-700: "#0F3B3A"
  primary-800: "#0B2E2D"
  primary-900: "#071F1E"
  secondary-50: "#F6F7F5"
  secondary-400: "#647A78"
  secondary-500: "#2C5F5B"
  accent-warm: "#D9D3C7"
  accent-sand: "#E8E3D8"
  accent-stone: "#C9C3B8"
  text-primary: "#0B0E0F"
  text-secondary: "#4B5563"
  text-muted: "#6B7280"
  text-light: "#9CA3AF"
  bg-primary: "#F6F7F5"
  bg-secondary: "#F1F5F4"
  bg-tertiary: "#ECEFF1"
  bg-card: "rgba(255, 255, 255, 0.7)"
  border-light: "#CBD5D1"
  border-medium: "#9BABAC"
  border-dark: "#647A78"
  error: "#EF4444"
  error-dark: "#991B1B"
  error-light: "#FEE2E2"
  success: "#10B981"
  warning: "#F59E0B"
  info: "#1E4D4C"
  spotify: "#1DB954"
typography:
  headline-display:
    fontFamily: Inter
    fontSize: 3.75rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.025em
  body-lg:
    fontFamily: Inter
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.75
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  label-button:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.25
rounded:
  soft: 8px
  medium: 10px
  comfortable: 12px
  sm: 8px
  md: 10px
  lg: 12px
spacing:
  3: 0.75rem
  4: 1rem
  6: 1.5rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-button}"
    rounded: "{rounded.soft}"
    padding: 0.75rem
  button-primary-hover:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.on-primary}"
---

# DESIGN.md — Saraiva Vision

Fonte normativa do repositório: `tailwind.config.js` (`theme.extend`) e `src/styles/design-system.css` / `src/index.css`, branch `main` (`640513d`, 05/02/2026). A família é **Inter** (`fontFamily.sans: Inter, system-ui, sans-serif`). Conferência no ar em 17/11/2026 (America/Sao_Paulo), CSS `/assets/index-Co0Za6fg.css` e CSS crítico da home.

Atenção: o site público atual é o **arquivo histórico da clínica fechada**, não a vitrine completa que o `main` de fevereiro descreve. Vários tokens do config ainda aparecem no bundle no ar (`#1E4D4C`, `#173F3E`, `#0F3B3A`, `#0B2E2D`, `#2C5F5B`, `#F6F7F5`, `#0B0E0F`, `#CBD5D1`, `#1DB954`). Dois tokens do config **não** foram encontrados no CSS no ar: `primary-900` `#071F1E` e `accent.warm` `#D9D3C7`. A home no ar, no CSS crítico, usa um tratamento distinto: fundo `#fff`, `h1` `#0f172a` (slate-900), botão primário `#0891b2` (cyan-600) com hover previsto `#0e7490`. Esses dois azis ciano **não** fazem parte da paleta petróleo do `tailwind.config.js`. O YAML abaixo documenta o sistema do repositório; as divergências da home no ar ficam nesta prosa e não foram promovidas a tokens de marca.

O SHA de release citado no nginx do KVM2 (`releases/20261004-live-cf495e8f`) **não existe** em nenhum repositório GitHub do dono. Não tratar `origin/main` (fevereiro) como cópia bit a bit do que está no ar desde outubro.

Títulos de seção e chaves em inglês (spec). Prosa em português. `version: alpha` é o formato.

## Overview

Identidade institucional da Saraiva Vision no código: azul petróleo (`#1E4D4C`) como primária, teal complementar (`#2C5F5B`), acentos de areia e fundos off-white (`#F6F7F5`), com Inter e uma camada de vidro (sombras e cards semitransparentes). Tom clínico-contemporâneo, não editorial como o portal de olho seco. O verde `#1DB954` no config é tema de podcast/Spotify, não a cor de marca.

## Colors

Escala primária (comentários do próprio config):

- 50 `#F1F5F4` … 500 `#1E4D4C` (base) … 800 `#0B2E2D` … 900 `#071F1E` (este último não visto no CSS no ar)
- Secundária 500 `#2C5F5B`
- Texto: `#0B0E0F`, `#4B5563`, `#6B7280`, `#9CA3AF`
- Fundos: `#F6F7F5`, `#F1F5F4`, `#ECEFF1`, card `rgba(255, 255, 255, 0.7)`
- Bordas: `#CBD5D1`, `#9BABAC`, `#647A78`
- Semânticas: success `#10B981`, warning `#F59E0B`, error `#EF4444`, info `#1E4D4C`

TODO: decidir se a home “arquivo histórico” no ar (`#0891b2` / `#0f172a` / fundo `#fff`) vira um tema próprio ou se deve voltar à paleta petróleo. Até lá, não misturar os dois conjuntos num único token `primary`.

## Typography

Stack do config: `Inter, system-ui, sans-serif`. No ar, a home declara também `'Inter Fallback'` (Arial, com `size-adjust: 107.64%`).

O plugin `typography` do config fixa o corpo de prosa em `fontSize: 1.0625rem` e `lineHeight: 1.75`, com h1 peso 700 e `letter-spacing: -0.025em`, h2 peso 600 e `-0.015em`. **Não há `fontSize` de h1/h2 no `theme.extend.fontSize`.** Os tokens de manchete usam os tamanhos observados no CSS crítico da home no ar, que coincidem com a escala padrão do Tailwind (`text-4xl` 2.25rem, `md:text-5xl` 3rem, `lg:text-6xl` 3.75rem, peso 700, `line-height: 1.2`). TODO: fixar uma escala de título no próprio repositório, em vez de depender só do CSS crítico da home atual.

`letterSpacing.relaxed` no config é `0.2px` (unidade `px`, válida). Não foi promovida a token de tipografia porque não está ligada a um nível de tipo nomeado.

## Layout

Não há `theme.extend.spacing` próprio. A home no ar limita o conteúdo do hero a `max-width: 1280px` com `padding: 0 1rem`. Navbar no CSS crítico: altura 64px (72px a partir de 1024px), fundo `rgba(255,255,255,0.9)`. Os tokens de espaço YAML registam só paddings de botão claramente medidos (`0.75rem` / `1.5rem`). TODO: documentar a grade completa quando houver tokens de layout no fonte.

## Elevation & Depth

Sombras do config (normativas para o sistema do repo):

- `soft`: `0 2px 8px rgba(0, 0, 0, 0.06)`
- `glass`: `0 8px 32px rgba(30, 77, 76, 0.08)`
- `glass-lg`: `0 12px 40px rgba(30, 77, 76, 0.12)`
- `glass-xl`: `0 20px 60px rgba(30, 77, 76, 0.16)`
- `3d` e `3d-hover`: camadas com rgba petróleo e preto

Cards usam `bg.card` semitransparente. A home no ar do arquivo histórico é mais plana (fundo branco sólido no CSS crítico).

## Shapes

Tokens do config: `soft 8px`, `medium 10px`, `comfortable 12px`. O botão da home no ar usa `border-radius: .5rem` (8px), igual a `soft`. Não inventar raios além desses três e da escala padrão do Tailwind quando uma classe utilitária aparecer no código.

## Components

No repositório, o primário de marca é `#1E4D4C`. O CSS crítico da home no ar define `.btn-primary` com `background: #0891b2`, `color: #fff`, `padding: .75rem 1.5rem`, `font-weight: 600`, `border-radius: .5rem`. O YAML do componente segue o sistema do repositório (petróleo + raio `soft` + o padding medido no ar, que é o mesmo `.75rem 1.5rem`). Ao implementar a home atual, respeitar o CSS crítico no ar até haver decisão sobre a paleta.

## Do's and Don'ts

- Faça tratar `#1E4D4C` como primária do design system do repositório.
- Não assuma que a home no ar (arquivo histórico, CTA ciano `#0891b2`) já foi reconciliada com o `main` de fevereiro.
- Faça usar só Inter na interface.
- Não promova o verde Spotify à cor de marca.
- Não invente `primary-900` ou areia `#D9D3C7` como “confirmados no ar”; no CSS público atual eles não apareceram.
- Faça qualquer alteração visual via PR em branch nova, sem merge e sem deploy, até o dono autorizar.
