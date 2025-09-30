# PostPageTemplate - Visual Reference Guide

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    ▓▓▓ Progress Bar ▓▓▓                         │ ← Fixed Top
├─────────────────────────────────────────────────────────────────┤
│                         Navbar                                   │
├─────────────────────────────────────────────────────────────────┤
│  Breadcrumbs: Home / Blog / Post Title                          │
│  ← Back to Blog                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                             │  │
│  │           🖼️ HERO IMAGE (Parallax)                         │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ 🏷️ Category Badge                                   │   │  │
│  │  │                                                       │   │  │
│  │  │ 📰 Post Title (H1, Glassmorphism)                   │   │  │
│  │  │                                                       │   │  │
│  │  │ 👤 Author | 📅 Date | ⏱️ 5 min | 👁️ 234 views      │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │  MAIN CONTENT (8 cols)  │  │  SIDEBAR (4 cols, Sticky)   │  │
│  │  ─────────────────────  │  │  ─────────────────────────  │  │
│  │                         │  │                             │  │
│  │  📚 Learning Summary   │  │  📑 Table of Contents      │  │
│  │  ├─ ✅ Point 1         │  │  ├─ Section 1 (active)     │  │
│  │  ├─ ✅ Point 2         │  │  ├─ Section 2             │  │
│  │  └─ ✅ Point 3         │  │  └─ Section 3             │  │
│  │                         │  │                             │  │
│  │  📝 Post Content       │  │  👨‍⚕️ Author Profile        │  │
│  │  (Glassmorphism Card)  │  │  ├─ Photo & Name          │  │
│  │                         │  │  ├─ CRM                   │  │
│  │  ├─ H2 Section 1       │  │  └─ Bio                   │  │
│  │  ├─ Paragraph          │  │                             │  │
│  │  ├─ H2 Section 2       │  │  🏥 Action Buttons        │  │
│  │  ├─ Paragraph          │  │  ├─ 📅 Agendar            │  │
│  │  └─ ...                │  │  ├─ 💬 WhatsApp           │  │
│  │                         │  │  └─ 📞 Telefone          │  │
│  │  ⚠️ Info Boxes         │  │                             │  │
│  │  ├─ Tip                │  │  📚 Education Sidebar     │  │
│  │  └─ Warning            │  │                             │  │
│  │                         │  └─────────────────────────────┘  │
│  │  🏷️ Tags               │                                   │
│  │  #tag1 #tag2 #tag3     │                                   │
│  │                         │                                   │
│  │  🎙️ Podcasts           │                                   │
│  │  [Spotify Embeds]      │                                   │
│  │                         │                                   │
│  │  ❓ FAQ Section         │                                   │
│  │  ├─ Question 1         │                                   │
│  │  └─ Question 2         │                                   │
│  │                         │                                   │
│  │  📤 Share Section      │                                   │
│  │  [Twitter] [Facebook]  │                                   │
│  │                         │                                   │
│  └─────────────────────────┘                                   │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  🔗 Related Posts (Full Width)                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                        │
│  │ Post 1  │  │ Post 2  │  │ Post 3  │                        │
│  └─────────┘  └─────────┘  └─────────┘                        │
├─────────────────────────────────────────────────────────────────┤
│                       Footer                                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│ FLOATING ACTIONS │ ← Fixed Bottom Right
├──────────────────┤
│  ⬆️ Scroll Top   │
│  📤 Share Menu   │
│  🖨️ Print        │
└──────────────────┘
```

---

## 🎨 Visual Elements Guide

### 1. Hero Section (Parallax)

```
┌─────────────────────────────────────────┐
│                                         │
│         [IMAGE WITH PARALLAX]           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ┌──────────────────────────────┐ │ │ ← Dark gradient
│  │ │ 🏷️ Category Badge (Glass)   │ │ │   overlay
│  │ │                              │ │ │
│  │ │ AMAZING POST TITLE           │ │ │ ← White text
│  │ │ With Glassmorphism Effect    │ │ │   with shadow
│  │ │                              │ │ │
│  │ │ 👤 Dr. Name  📅 01 Jan 2025 │ │ │ ← Glass pills
│  │ └──────────────────────────────┘ │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
      ↑ Moves slower on scroll
```

### 2. Progress Bar

```
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░│ ← Blue → Purple
└─────────────────────────────────────────┘   gradient
     40% scrolled
```

### 3. Glass Card (Main Content)

```
┌─────────────────────────────────────────┐
│ ╔═══════════════════════════════════╗ │ ← 3D Shadow
│ ║                                   ║ │   (blur effect)
│ ║  Content with glassmorphism      ║ │
│ ║  ───────────────────────────────  ║ │
│ ║                                   ║ │ ← White/70 opacity
│ ║  • Backdrop blur                 ║ │   backdrop blur
│ ║  • Border with transparency      ║ │   border white/50
│ ║  • Liquid gradient overlay       ║ │
│ ║                                   ║ │
│ ╚═══════════════════════════════════╝ │
└─────────────────────────────────────────┘
```

### 4. Table of Contents (Sticky)

```
┌─────────────────────────────────┐
│ 📑 Índice                       │
├─────────────────────────────────┤
│ ▶ Introduction                 │
│ █ What is Glassmorphism ◄─────────── Active
│ ▶ How to Implement             │
│ ▶ Best Practices               │
│ ▶ Conclusion                   │
└─────────────────────────────────┘
     ↑ Highlights as you scroll
     ↑ Smooth scroll on click
```

### 5. Glass Pills (Meta Info)

```
┌──────────────┐  ┌────────────┐  ┌──────────────┐
│ 👤 Dr. Name  │  │ 📅 Jan 01  │  │ ⏱️ 5 min    │
└──────────────┘  └────────────┘  └──────────────┘
  ↑ White/20 opacity with backdrop blur
  ↑ Border white/30
  ↑ Shadow-lg
```

### 6. Floating Actions (Bottom Right)

```
          ┌─────┐
          │  ⬆  │ ← Scroll to top
          └─────┘   (appears after 500px)
          ┌─────┐
          │  📤  │ ← Share menu
          └─────┘   (opens dropdown)
          ┌─────┐
          │  🖨  │ ← Print
          └─────┘
              ↑ 3D glow on hover
```

### 7. Share Menu (Dropdown)

```
          ┌─────┐
          │  📤  │
          └──┬──┘
             │
        ┌────▼───────────┐
        │ 🐦 Twitter     │
        │ 👍 Facebook    │
        │ 💼 LinkedIn    │
        │ 📱 WhatsApp    │
        │ 📋 Copy Link   │
        └────────────────┘
          ↑ Glass dropdown
          ↑ Backdrop blur
```

---

## 🎨 Color Scheme Visual

### Gradient Examples

**Primary Gradient (Blue → Purple)**
```
┌──────────────────────────────────────┐
│ ████████████████████████████████████ │
│ Blue 600 ──────────→ Purple 600      │
└──────────────────────────────────────┘
  #0284c7              #9333ea
```

**Glass Effect**
```
┌──────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← White/70
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │ ← Backdrop blur
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Border white/50
└──────────────────────────────────────┘
```

**3D Shadow Layers**
```
┌──────────────────────────────────────┐
│                                      │
│          [CONTENT]                   │
│                                      │
└──────────────────────────────────────┘
   ╚════════════════════════╝ ← Layer 1 (lightest)
    ╚═══════════════════════╝ ← Layer 2
     ╚══════════════════════╝ ← Layer 3 (darkest)
```

---

## 📱 Responsive Breakpoints Visual

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────┐
│                                                       │
│  ┌─────────────────────────┐  ┌─────────────────┐  │
│  │                         │  │                 │  │
│  │      MAIN CONTENT       │  │    SIDEBAR      │  │
│  │        (8 cols)         │  │    (4 cols)     │  │
│  │                         │  │                 │  │
│  └─────────────────────────┘  └─────────────────┘  │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌───────────────────────────────────────┐
│                                       │
│  ┌──────────────┐  ┌──────────────┐  │
│  │              │  │              │  │
│  │    MAIN      │  │   SIDEBAR    │  │
│  │  (adjusted)  │  │ (narrower)   │  │
│  │              │  │              │  │
│  └──────────────┘  └──────────────┘  │
│                                       │
└───────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────┐
│                     │
│   MAIN CONTENT      │
│   (full width)      │
│                     │
├─────────────────────┤
│                     │
│   SIDEBAR CONTENT   │
│   (below main)      │
│                     │
└─────────────────────┘
```

---

## 🎭 Animation States

### Hover Effects

**Before Hover**
```
┌───────────────┐
│   Button      │
└───────────────┘
  scale: 1
  shadow: lg
```

**On Hover**
```
┌─────────────────┐
│    Button       │ ← Slightly larger
└─────────────────┘
   ╚═══════════╝ ← Enhanced shadow
  scale: 1.05
  shadow: 2xl
  glow: visible
```

### Parallax Scroll

**Top of Page (scrollY: 0)**
```
┌─────────────────────┐
│  [HERO IMAGE]       │
│  Position: 0px      │
└─────────────────────┘
```

**Scrolled (scrollY: 300)**
```
┌─────────────────────┐
│  [HERO IMAGE]       │
│  Position: 100px ↓  │ ← Image moved less
└─────────────────────┘
     User scrolled 300px
     Image moved 100px
```

---

## 🔤 Typography Hierarchy

```
H1 (Post Title)
  ├─ Size: 3xl → 6xl (responsive)
  ├─ Weight: Extrabold (800)
  ├─ Color: White (on hero)
  └─ Shadow: 2xl with glow

H2 (Sections)
  ├─ Size: 3xl
  ├─ Weight: Bold (700)
  ├─ Color: Gray-900
  ├─ Border: Bottom blue-200
  └─ Margin: Top 10, Bottom 6

H3 (Subsections)
  ├─ Size: 2xl
  ├─ Weight: Bold (700)
  ├─ Color: Gray-900
  └─ Margin: Top 8, Bottom 4

Body Text
  ├─ Size: lg
  ├─ Weight: Regular (400)
  ├─ Color: Gray-700
  └─ Line height: Relaxed (1.75)

Code
  ├─ Font: Monospace
  ├─ Size: sm
  ├─ Color: Pink-600
  └─ Background: Gray-100
```

---

## 🎯 Interactive States

### Focus State (Keyboard Navigation)
```
┌─────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━┓ │ ← Blue ring
│ ┃   Focused Element     ┃ │   (2px width)
│ ┗━━━━━━━━━━━━━━━━━━━━━━━┛ │   Ring offset 2px
└─────────────────────────────┘
```

### Active State (Click)
```
┌───────────────┐
│   Button      │
└───────────────┘
  scale: 0.95 ← Pressed down
  transition: 150ms
```

---

## 📐 Spacing System

```
Component Padding:
┌─ p-6 ──────────────────┐  ← Mobile
│                        │
│                        │
└────────────────────────┘

┌─ md:p-8 ───────────────┐  ← Tablet
│                        │
│                        │
│                        │
└────────────────────────┘

┌─ lg:p-12 ──────────────┐  ← Desktop
│                        │
│                        │
│                        │
│                        │
└────────────────────────┘

Section Margins:
  mb-8       ← Mobile
  md:mb-10   ← Tablet
  lg:mb-12   ← Desktop
```

---

## 🎨 Glass Effect Anatomy

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌───────────────────────────────────────┐ │ 1. Container
│  │ ┌─────────────────────────────────┐   │ │
│  │ │                                 │   │ │ 2. Background (white/70)
│  │ │  ┌───────────────────────────┐  │   │ │
│  │ │  │                           │  │   │ │ 3. Backdrop blur (xl)
│  │ │  │     CONTENT               │  │   │ │
│  │ │  │                           │  │   │ │ 4. Border (white/50)
│  │ │  └───────────────────────────┘  │   │ │
│  │ │                                 │   │ │ 5. Shadow (glass-lg)
│  │ └─────────────────────────────────┘   │ │
│  │                                       │ │ 6. Liquid overlay (gradient)
│  └───────────────────────────────────────┘ │
│                                             │ 7. 3D shadow (blur)
└─────────────────────────────────────────────┘
```

---

## 🔍 Zoom Interaction

### Normal State
```
┌─────────────┐
│             │
│   [IMAGE]   │
│             │
└─────────────┘
  scale: 1
```

### Hover State
```
┌─────────────┐
│ ┌─────────┐ │
│ │ [IMAGE] │ │ ← Slightly zoomed
│ └─────────┘ │
└─────────────┘
  scale: 1.1
  transition: 700ms
```

---

## 📊 Loading States

### Content Loading
```
┌─────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░  │ ← Skeleton
│  ░░░░░░░░░░░░              │   (shimmer animation)
│  ░░░░░░░░░░░░░░░░░░░░░░    │
│  ░░░░░░░░░░░░              │
└─────────────────────────────┘
```

---

## 🎬 Animation Timeline

```
Time:  0ms     200ms    400ms    600ms    800ms
       │       │        │        │        │
Hero:  ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░ (Fade in + parallax)
       │       │        │        │        │
Title: ░░░░░░░░▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░ (Slide up)
       │       │        │        │        │
Meta:  ░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓░░░░░░░░░░ (Scale in)
       │       │        │        │        │
TOC:   ░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓░░ (Slide right)
```

---

## 🎨 Print Layout

```
┌─────────────────────────────┐
│  LOGO                       │ ← Header
├─────────────────────────────┤
│  Post Title                 │
│  Author | Date               │
├─────────────────────────────┤
│                             │
│  Full Content               │
│  (No glass effects)         │
│  (Black text on white)      │
│  (Standard spacing)         │
│                             │
├─────────────────────────────┤
│  Page 1 of N                │ ← Footer
└─────────────────────────────┘
```

---

This visual reference guide provides a comprehensive overview of the PostPageTemplate's visual structure, animations, and interactive states.

**For code implementation details, see the integration guide.**

---

**Last Updated**: 2025-09-30
**Document Version**: 1.0.0
