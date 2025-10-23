# Planos Flex - Visual Design Guide

**Purpose:** Visual reference for design decisions and color usage across plan pages

---

## Color Theme Strategy

### Semantic Color Assignment

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  CYAN/SLATE THEME = Annual Plans (Commitment)      │
│  - Trust, Medical, Professional                    │
│  - from-cyan-600 to-cyan-700                       │
│  - Used in: PlansPage, PlanBasicoPage, etc.       │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                     │
│  GREEN THEME = Flex Plans (No Commitment)          │
│  - Flexibility, Freedom, "Go"                      │
│  - from-green-600 to-green-700                     │
│  - Used in: PlanosFlexPage                         │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                     │
│  GREEN + WIFI = Online Plans (Digital)             │
│  - Remote, Connected, Nationwide                   │
│  - from-green-600 to-green-700 + Wifi icon        │
│  - Used in: PlanosOnlinePage                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Visual Hierarchy

```
PRIMARY THEME (Site-wide)
├─ Cyan/Petróleo: #1E4D4C (primary-500)
├─ Slate/Teal: #2C5F5B (secondary-500)
└─ Used for: Headers, navigation, medical content

SECONDARY THEMES (Context-specific)
├─ Green: For flexibility/online indicators
│   ├─ Light: #DCFCE7 (green-100)
│   ├─ Medium: #16A34A (green-600)
│   └─ Dark: #15803D (green-700)
│
├─ Gray: For neutral/alternative options
│   ├─ Light: #F9FAFB (gray-50)
│   ├─ Medium: #6B7280 (gray-500)
│   └─ Dark: #1F2937 (gray-800)
│
└─ Gradient Combinations
    ├─ Cyan → Cyan-dark (trust)
    ├─ Green → Green-dark (flexibility)
    └─ Gray → Gray-dark (neutral)
```

---

## Component Patterns

### 1. Hero Badge Pattern

```jsx
// PATTERN: Badge with icon and label
// USAGE: Page identification and categorization
// VARIANTS: Cyan (annual), Green (flex), Green+Wifi (online)

<div className="inline-flex items-center gap-2 bg-gradient-to-r from-{color}-100 to-{color}-200 text-{color}-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-3 shadow-sm">
  <Icon className="w-4 h-4" />
  <span>Label Text</span>
</div>
```

**Visual Examples:**

```
┌─────────────────────────────────┐
│  📦 Planos de Assinatura        │  ← PlansPage (Cyan)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  📦 Sem Fidelidade              │  ← PlanosFlexPage (Green)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  📶 100% Online                 │  ← PlanosOnlinePage (Green)
└─────────────────────────────────┘
```

### 2. Hero Title Pattern

```jsx
// PATTERN: Large responsive heading with gradient text
// USAGE: Page main title (H1)
// CONSISTENCY: Same across all three pages

<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 via-cyan-900 to-cyan-800 bg-clip-text text-transparent">
  Page Title Here
</h1>
```

**Responsive Scale:**
```
Mobile (320px):   30px (text-3xl)
Tablet (768px):   36px (text-4xl)
Desktop (1024px): 48px (text-5xl)
```

### 3. Benefits Card Pattern

```jsx
// PATTERN: Glassmorphism card with icon and two-tier text
// USAGE: Feature highlights, benefits lists
// EFFECT: Depth and premium feel

<div className="flex items-start gap-2 bg-white/70 backdrop-blur-sm rounded-lg p-3">
  <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
  <div>
    <p className="font-semibold text-gray-900">Primary Text</p>
    <p className="text-sm text-gray-700">Secondary description</p>
  </div>
</div>
```

**Visual Breakdown:**
```
┌─────────────────────────────────────────┐
│  ✓  Sem Fidelidade                      │
│     Cancele quando quiser, sem multas   │
└─────────────────────────────────────────┘
  ↑   ↑              ↑
Icon  Bold Title    Description
```

### 4. CTA Box Pattern

```jsx
// PATTERN: Gradient background box with centered content
// USAGE: Cross-promotion between plan types
// VARIANTS: Green (flex/online), Gray (presencial), Cyan (annual)

<div className="max-w-4xl mx-auto bg-gradient-to-br from-{color}-50 to-{color}-100 border-2 border-{color}-300 rounded-2xl p-4 md:p-5 shadow-lg text-center">
  <h3 className="text-lg font-bold text-gray-900 mb-2">
    Compelling Question or Statement
  </h3>
  <p className="text-gray-600 mb-3">
    Supporting description with benefits
  </p>
  <Link to="/target-page" className="inline-flex items-center gap-2 bg-gradient-to-r from-{color}-600 to-{color}-700 hover:from-{color}-700 hover:to-{color}-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
    Action Text
    <ArrowRight className="w-4 h-4" />
  </Link>
</div>
```

**Visual Layout:**
```
┌──────────────────────────────────────────────┐
│                                              │
│         Prefere planos sem fidelidade?       │  ← H3 (Bold)
│                                              │
│  Conheça nossos planos presenciais flex:    │  ← Description
│  cancele quando quiser, sem multas          │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │  Ver Planos Sem Fidelidade        →  │  │  ← Button
│  └──────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

### 5. FAQ Card Pattern

```jsx
// PATTERN: Simple white card with question and answer
// USAGE: FAQ sections at bottom of pages
// STYLE: Clean, minimal, readable

<div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
  <h4 className="font-semibold text-gray-900 mb-1.5">Question?</h4>
  <p className="text-sm text-gray-600">Answer text goes here.</p>
</div>
```

**Visual Spacing:**
```
┌───────────────────────────────────────┐
│                                       │
│  Posso cancelar a qualquer momento?   │  ← Question (bold)
│                                       │
│  Sim! Não há fidelidade nem taxas    │  ← Answer (smaller)
│  de cancelamento...                   │
│                                       │
└───────────────────────────────────────┘
  ↑                                   ↑
  12px padding                        12px
```

---

## Typography System

### Font Hierarchy

```css
/* Headings */
H1: text-3xl md:text-4xl lg:text-5xl font-bold
    → 30px / 36px / 48px

H3: text-lg md:text-xl font-bold
    → 18px / 20px

H4: font-semibold text-gray-900
    → 16px (base size)

/* Body Text */
Paragraph: text-base md:text-lg
          → 16px / 18px

Description: text-sm
            → 14px

Small Text: text-xs
           → 12px
```

### Font Weights

```
font-bold      → 700 (Headings)
font-semibold  → 600 (Subheadings, labels)
font-medium    → 500 (Links, emphasis)
[default]      → 400 (Body text)
```

### Text Colors

```css
/* Primary Text Hierarchy */
text-gray-900  → #111827 (16.12:1 contrast) - Headings
text-gray-700  → #374151 (10.49:1 contrast) - Body text
text-gray-600  → #4B5563 (8.59:1 contrast)  - Secondary text
text-gray-500  → #6B7280 (5.74:1 contrast)  - Muted text

/* Colored Text */
text-cyan-700  → #0E7490 (Cyan theme)
text-green-700 → #15803D (Green theme)
text-white     → #FFFFFF (On colored backgrounds)
```

---

## Spacing System

### Container Margins

```jsx
// Responsive horizontal margins
mx-[4%]     // Mobile:  ~13px on 320px screen
md:mx-[6%]  // Tablet:  ~46px on 768px screen
lg:mx-[8%]  // Desktop: ~82px on 1024px screen
```

### Vertical Spacing

```css
/* Section Spacing */
!pt-0     → Top: 0 (override default)
!pt-6     → Top: 24px
!pb-8     → Bottom: 32px
mb-6      → Bottom margin: 24px

/* Component Spacing */
gap-3     → Grid/Flex gap: 12px
gap-2     → Smaller gap: 8px
space-y-3 → Vertical spacing: 12px between children

/* Padding */
p-3       → All sides: 12px
p-4       → All sides: 16px
p-5       → All sides: 20px
md:p-5    → Responsive: 20px on tablet+
```

### Grid Gaps

```css
/* Plans Grid */
gap-5 lg:gap-6
→ 20px mobile/tablet, 24px desktop

/* Benefits Grid */
gap-3
→ 12px all breakpoints
```

---

## Responsive Grid System

### Plans Grid (PlansPage)

```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
```

**Breakpoints:**
```
Mobile (< 1024px):
┌──────────┐
│  Plan 1  │
├──────────┤
│  Plan 2  │
├──────────┤
│  Plan 3  │
└──────────┘

Desktop (≥ 1024px):
┌──────┬──────┬──────┐
│ Plan │ Plan │ Plan │
│  1   │  2   │  3   │
└──────┴──────┴──────┘
```

### Benefits Grid (PlanosFlexPage)

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
```

**Breakpoints:**
```
Mobile (< 768px):
┌─────────────┐
│ Benefit 1   │
├─────────────┤
│ Benefit 2   │
├─────────────┤
│ Benefit 3   │
├─────────────┤
│ Benefit 4   │
└─────────────┘

Tablet/Desktop (≥ 768px):
┌────────────┬────────────┐
│ Benefit 1  │ Benefit 2  │
├────────────┼────────────┤
│ Benefit 3  │ Benefit 4  │
└────────────┴────────────┘
```

---

## Button Styles

### Primary Button (CTA)

```jsx
<Link className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
  Button Text
  <ArrowRight className="w-4 h-4" />
</Link>
```

**Visual States:**
```
Default:
┌────────────────────────────┐
│  Ver Planos Online      →  │
└────────────────────────────┘
  Green-600 → Green-700
  Shadow: md

Hover:
┌────────────────────────────┐
│  Ver Planos Online      →  │  ← Slightly darker
└────────────────────────────┘
  Green-700 → Green-800
  Shadow: lg (elevated)

Active (Clicked):
┌────────────────────────────┐
│  Ver Planos Online      →  │  ← Pressed state
└────────────────────────────┘
  Could add: active:scale-95
```

### Secondary Button (Info)

```jsx
<Link className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-700 hover:from-cyan-200 hover:to-cyan-300 font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
  Saiba Mais
  <ArrowRight className="w-4 h-4" />
</Link>
```

**Visual Difference:**
```
Primary (Strong Action):    Secondary (Soft Action):
Background: Solid gradient  Background: Light gradient
Text: White                Text: Colored
Shadow: md → lg            Shadow: sm → md
```

### Back Link

```jsx
<Link className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">
  <ArrowLeft className="w-4 h-4" />
  <span>Voltar para Planos Presenciais</span>
</Link>
```

**Visual Style:**
```
← Voltar para Planos Presenciais
↑ ↑
Icon  Text (no background, just colored text)
```

---

## Icon System

### Icon Sizes

```jsx
w-4 h-4   → 16px (Button adornments, small icons)
w-5 h-5   → 20px (List icons, feature indicators)
w-6 h-6   → 24px (Section headers, emphasis)
w-7 h-7   → 28px (Hero icons)
```

### Icon Usage by Type

```
Navigation Icons:
├─ ArrowLeft  (Back navigation)
├─ ArrowRight (Forward CTAs)
└─ Size: w-4 h-4

Feature Icons:
├─ CheckCircle (Benefits, confirmations)
├─ Package     (Plans, products)
├─ Wifi        (Online features)
├─ Video       (Video calls)
└─ Size: w-5 h-5

Section Icons:
├─ Award       (Benefits section headers)
├─ Star        (Premium features)
└─ Size: w-6 h-6 or w-7 h-7
```

### Icon Colors

```css
/* Icon color matches text color */
text-cyan-600   → CheckCircle in cyan theme
text-green-600  → CheckCircle in green theme
text-white      → Icons on colored backgrounds
text-cyan-200   → Icons on dark backgrounds (contrast)
```

---

## Shadow System

### Shadow Hierarchy

```css
/* Card/Component Shadows */
shadow-sm    → 0 1px 2px rgba(0,0,0,0.05)        - Subtle elevation
shadow-md    → 0 4px 6px rgba(0,0,0,0.1)         - Default cards
shadow-lg    → 0 10px 15px rgba(0,0,0,0.1)       - Elevated cards
shadow-xl    → 0 20px 25px rgba(0,0,0,0.1)       - Maximum elevation

/* Hover Progression */
shadow-sm → shadow-md    (FAQ cards)
shadow-md → shadow-lg    (CTA buttons)
shadow-lg → shadow-xl    (Hero elements)
```

### Drop Shadow Usage

```jsx
// Card at rest
className="shadow-sm"

// Card on hover
className="shadow-sm hover:shadow-md"

// Button at rest
className="shadow-md"

// Button on hover
className="shadow-md hover:shadow-lg"
```

---

## Border Radius System

```css
rounded-lg    → 8px   (Small cards)
rounded-xl    → 12px  (Standard cards, buttons)
rounded-2xl   → 16px  (Hero sections, large containers)
rounded-full  → 9999px (Badges, pills)
```

### Usage by Component

```
Badges:        rounded-full
Buttons:       rounded-xl
Cards:         rounded-xl
Sections:      rounded-2xl
Benefits Box:  rounded-lg
```

---

## Gradient Patterns

### Background Gradients

```css
/* Light Backgrounds (Sections) */
from-green-50 to-green-100   → Very light green
from-cyan-50 to-cyan-100     → Very light cyan
from-gray-50 to-gray-100     → Very light gray

/* Button Backgrounds */
from-green-600 to-green-700  → Solid green
from-cyan-600 to-cyan-700    → Solid cyan

/* Text Gradients */
from-gray-900 via-cyan-900 to-cyan-800
→ Dark text with cyan tint (brand)
```

### Hover State Gradients

```css
/* Buttons shift one shade darker on hover */
Default: from-green-600 to-green-700
Hover:   from-green-700 to-green-800

Default: from-cyan-100 to-cyan-200
Hover:   from-cyan-200 to-cyan-300
```

---

## Glassmorphism Effect

### Implementation

```jsx
<div className="bg-white/70 backdrop-blur-sm">
```

**Breakdown:**
```css
bg-white/70       → 70% opacity white
backdrop-blur-sm  → Blur background (8px)
```

**Visual Effect:**
```
┌─────────────────────────────┐
│  [Text appears sharp]       │  ← Content layer
│  ╔═══════════════════════╗  │
│  ║ [Blurred background]  ║  │  ← Backdrop blur
│  ║                       ║  │
│  ╚═══════════════════════╝  │
└─────────────────────────────┘
```

### Usage Context

```
Benefits Cards:    bg-white/70 backdrop-blur-sm
Hero Sections:     bg-white/80 backdrop-blur-md
Navigation:        bg-white/90 backdrop-blur-lg
```

---

## Transition System

### Duration

```css
transition-all duration-300
→ 300ms (standard for most interactions)

transition-colors duration-200
→ 200ms (quick color changes)

transition-shadow duration-300
→ 300ms (shadow elevation changes)
```

### Properties Animated

```jsx
// Button hover (multiple properties)
className="transition-all duration-300"
→ Animates: background, shadow, transform

// Link hover (color only)
className="transition-colors duration-200"
→ Animates: text color only (faster)
```

---

## Accessibility Guidelines

### Focus States (NEEDS IMPLEMENTATION)

```jsx
// Add to all interactive elements
className="focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 focus-visible:outline-none"
```

**Visual Effect:**
```
Default:
┌────────────────┐
│  Button Text   │
└────────────────┘

Focused (Tab key):
  ┌──────────────────┐
 ┌┴──────────────────┴┐
 │    Button Text     │
 └────────────────────┘
  ↑ Cyan ring (2px thick, 2px offset)
```

### ARIA Labels (NEEDS IMPLEMENTATION)

```jsx
// Decorative icons
<CheckCircle className="w-5 h-5" aria-hidden="true" />

// Interactive icons
<button aria-label="Ver detalhes do plano">
  <ArrowRight className="w-4 h-4" />
</button>

// Section landmarks
<section aria-labelledby="faq-heading">
  <h3 id="faq-heading">Perguntas Frequentes</h3>
</section>
```

---

## Animation Enhancements (FUTURE)

### Page Load Animation

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
```

### Stagger Animation (Future with Framer Motion)

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
  {/* Card content */}
</motion.div>
```

---

## Design Token Reference

### Colors (from tailwind.config.js)

```js
primary: {
  500: '#1E4D4C',  // Azul petróleo base
  600: '#173F3E',  // Darker
}

secondary: {
  500: '#2C5F5B',  // Teal complementar
}

Green (Flex/Online):
  50:  '#F0FDF4'   // Very light
  100: '#DCFCE7'   // Light
  600: '#16A34A'   // Standard
  700: '#15803D'   // Dark
```

### Spacing Scale

```
1   → 4px
2   → 8px
3   → 12px
4   → 16px
5   → 20px
6   → 24px
8   → 32px
```

### Font Sizes

```
xs  → 12px
sm  → 14px
base → 16px
lg  → 18px
xl  → 20px
2xl → 24px
3xl → 30px
4xl → 36px
5xl → 48px
```

---

## Component Extraction Opportunities

### Shared Components to Create

```jsx
// 1. PlanBadge.jsx
<PlanBadge
  icon={Package}
  label="Sem Fidelidade"
  variant="green"
/>

// 2. BenefitCard.jsx
<BenefitCard
  icon={CheckCircle}
  title="Sem Fidelidade"
  description="Cancele quando quiser"
/>

// 3. PlanCTA.jsx
<PlanCTA
  title="Prefere planos sem fidelidade?"
  description="Conheça nossos planos..."
  buttonText="Ver Planos"
  to="/planosflex"
  variant="green"
/>

// 4. FAQItem.jsx
<FAQItem
  question="Posso cancelar?"
  answer="Sim! Não há fidelidade..."
/>
```

---

## Quick Reference: Color Meanings

```
🔵 CYAN/SLATE    = Trust, Medical, Annual Plans
🟢 GREEN         = Flexibility, Freedom, No Commitment
🟢 GREEN + 📶    = Online, Digital, Remote
⚪ GRAY          = Neutral, Alternative
🟡 AMBER         = Warning, Important Notice
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-23
**Maintained by:** Frontend Team
