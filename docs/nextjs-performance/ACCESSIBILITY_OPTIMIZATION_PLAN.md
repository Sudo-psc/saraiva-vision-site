# Accessibility Optimization Plan - Multi-Profile Next.js Application

**Versão**: 1.0.0 | **Data**: Outubro 2025 | **Status**: Planejamento

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos de Acessibilidade por Perfil](#requisitos-de-acessibilidade-por-perfil)
3. [WCAG 2.1 Compliance Strategy](#wcag-21-compliance-strategy)
4. [Profile-Specific Features](#profile-specific-features)
5. [Screen Reader Optimization](#screen-reader-optimization)
6. [Keyboard Navigation](#keyboard-navigation)
7. [Testing Strategy](#testing-strategy)
8. [Implementation Checklist](#implementation-checklist)

---

## 🎯 Visão Geral

Este documento detalha a estratégia de acessibilidade para os três perfis de usuário:

- **Familiar (Padrão)**: WCAG 2.1 AA compliance
- **Jovem**: WCAG 2.1 AA compliance + modern UX
- **Sênior**: WCAG 2.1 AAA compliance + enhanced accessibility

### Compliance Targets

| Profile | WCAG Level | Screen Reader | Keyboard Nav | Color Contrast | Font Size | Focus Indicators |
|---------|------------|---------------|--------------|----------------|-----------|------------------|
| **Familiar** | AA | NVDA, JAWS | 100% | 4.5:1 normal, 3:1 large | 16px base | 2px outline |
| **Jovem** | AA | NVDA, JAWS | 100% | 4.5:1 normal, 3:1 large | 16px base | 2px + motion |
| **Sênior** | AAA | NVDA, JAWS, Voice Control | 100% | 7:1 normal, 4.5:1 large | 20px base | 4px high-contrast |

---

## 📊 Requisitos de Acessibilidade por Perfil

### WCAG 2.1 Level AA Requirements (Familiar + Jovem)

#### 1. Perceivable

**1.1 Text Alternatives**
- [ ] All images have meaningful alt text
- [ ] Decorative images marked with alt=""
- [ ] Complex images have extended descriptions
- [ ] Form inputs have associated labels

**1.2 Time-based Media**
- [ ] Audio/video content has captions
- [ ] Transcripts available for podcasts
- [ ] No auto-playing media (or with controls)

**1.3 Adaptable**
- [ ] Semantic HTML structure (headings, lists, landmarks)
- [ ] Content order makes sense when CSS disabled
- [ ] Form instructions programmatically associated
- [ ] Sensory characteristics not sole indicator

**1.4 Distinguishable**
- [ ] Color contrast ratio ≥ 4.5:1 (normal text)
- [ ] Color contrast ratio ≥ 3:1 (large text ≥18pt or bold ≥14pt)
- [ ] Color not sole means of conveying information
- [ ] Text resizable up to 200% without loss of functionality
- [ ] No images of text (except logos)
- [ ] Focus visible with 2px outline minimum

#### 2. Operable

**2.1 Keyboard Accessible**
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Keyboard shortcuts documented
- [ ] Skip links available

**2.2 Enough Time**
- [ ] No time limits (or adjustable/extendable)
- [ ] Pause/stop for moving content
- [ ] No auto-updating content (or controls provided)

**2.3 Seizures and Physical Reactions**
- [ ] No content flashes more than 3 times per second
- [ ] Animations can be disabled (prefers-reduced-motion)

**2.4 Navigable**
- [ ] Skip navigation links
- [ ] Page titles descriptive and unique
- [ ] Focus order logical
- [ ] Link purpose clear from context
- [ ] Multiple ways to find pages (nav, search, sitemap)
- [ ] Headings and labels descriptive
- [ ] Focus indicator visible

**2.5 Input Modalities**
- [ ] Touch targets ≥ 44×44px
- [ ] Pointer cancellation available
- [ ] Labels match accessible names
- [ ] Motion actuation can be disabled

#### 3. Understandable

**3.1 Readable**
- [ ] Page language identified (lang="pt-BR")
- [ ] Language changes marked
- [ ] Reading level appropriate (8th grade max)

**3.2 Predictable**
- [ ] Focus doesn't cause unexpected changes
- [ ] Input doesn't cause unexpected changes
- [ ] Consistent navigation
- [ ] Consistent identification

**3.3 Input Assistance**
- [ ] Error identification clear
- [ ] Form labels and instructions provided
- [ ] Error suggestions provided
- [ ] Error prevention for legal/financial/data actions

#### 4. Robust

**4.1 Compatible**
- [ ] Valid HTML (no parsing errors)
- [ ] ARIA used correctly (names, roles, states)
- [ ] Status messages use ARIA live regions

### WCAG 2.1 Level AAA Requirements (Sênior Profile)

**Enhanced Requirements Beyond AA:**

- [ ] **1.4.6 Contrast (Enhanced)**: 7:1 for normal text, 4.5:1 for large text
- [ ] **1.4.8 Visual Presentation**:
  - Line height ≥ 1.5
  - Paragraph spacing ≥ 2× font size
  - Text can be resized to 200% without horizontal scrolling
  - Line length ≤ 80 characters
  - Text not justified
  - Background/foreground colors user-selectable
- [ ] **2.2.3 No Timing**: No time limits on interactions
- [ ] **2.2.4 Interruptions**: Interruptions can be postponed/suppressed
- [ ] **2.2.5 Re-authenticating**: No data loss on re-authentication
- [ ] **2.3.2 Three Flashes**: No flashing content
- [ ] **2.4.8 Location**: User can determine current location in site
- [ ] **2.4.9 Link Purpose (Link Only)**: Link purpose from link text alone
- [ ] **2.4.10 Section Headings**: Section headings organize content
- [ ] **3.1.3 Unusual Words**: Definitions for jargon/idioms
- [ ] **3.1.4 Abbreviations**: Expanded forms available
- [ ] **3.1.5 Reading Level**: Simplified version when text requires advanced reading
- [ ] **3.1.6 Pronunciation**: Pronunciation available when needed
- [ ] **3.2.5 Change on Request**: Context changes only on user request
- [ ] **3.3.5 Help**: Context-sensitive help available
- [ ] **3.3.6 Error Prevention (All)**: Confirmation/review for all submissions

---

## 🎨 Profile-Specific Features

### Familiar Profile (WCAG AA)

```typescript
// src/styles/profiles/familiar.css

:root[data-profile="familiar"] {
  /* Base font size */
  font-size: 16px;

  /* Color contrast ratios (WCAG AA) */
  --text-primary: #0B0E0F;        /* 15.8:1 on white */
  --text-secondary: #4B5563;      /* 8.6:1 on white */
  --text-link: #1E4D4C;          /* 7.2:1 on white */
  --text-link-hover: #0F3B3A;    /* 11.5:1 on white */

  /* Touch targets */
  --min-touch-size: 44px;

  /* Focus indicators */
  --focus-outline-width: 2px;
  --focus-outline-color: #1E4D4C;
  --focus-outline-offset: 2px;

  /* Spacing */
  --line-height: 1.6;
  --paragraph-spacing: 1.5em;
}

/* Focus styles */
:root[data-profile="familiar"] *:focus-visible {
  outline: var(--focus-outline-width) solid var(--focus-outline-color);
  outline-offset: var(--focus-outline-offset);
  border-radius: 2px;
}

/* Skip link */
:root[data-profile="familiar"] .skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--text-primary);
  color: white;
  padding: 8px 16px;
  z-index: 100;
  text-decoration: none;
}

:root[data-profile="familiar"] .skip-link:focus {
  top: 0;
}
```

### Jovem Profile (WCAG AA + Modern UX)

```typescript
// src/styles/profiles/jovem.css

:root[data-profile="jovem"] {
  /* Inherit Familiar profile settings */
  @import './familiar.css';

  /* Enhanced focus with animation */
  --focus-outline-width: 2px;
  --focus-outline-color: #1DB954; /* Spotify green */
  --focus-ring-animation: focus-pulse 2s ease-in-out infinite;

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    --focus-ring-animation: none;
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

/* Animated focus indicator */
:root[data-profile="jovem"] *:focus-visible {
  outline: var(--focus-outline-width) solid var(--focus-outline-color);
  outline-offset: var(--focus-outline-offset);
  animation: var(--focus-ring-animation);
  border-radius: 4px;
}

@keyframes focus-pulse {
  0%, 100% {
    outline-color: var(--focus-outline-color);
    outline-width: 2px;
  }
  50% {
    outline-color: rgba(29, 185, 84, 0.5);
    outline-width: 3px;
  }
}

/* Glassmorphism accessible focus */
:root[data-profile="jovem"] .glass-card:focus-within {
  box-shadow:
    0 0 0 3px rgba(29, 185, 84, 0.3),
    0 8px 32px rgba(30, 77, 76, 0.08);
}
```

### Sênior Profile (WCAG AAA)

```typescript
// src/styles/profiles/senior.css

:root[data-profile="senior"] {
  /* Larger base font size (AAA requirement) */
  font-size: 20px;

  /* High contrast colors (7:1 ratio minimum) */
  --text-primary: #000000;        /* 21:1 on white */
  --text-secondary: #2C2C2C;      /* 12.6:1 on white */
  --text-link: #0F3B3A;          /* 11.5:1 on white */
  --text-link-hover: #071F1E;    /* 17.9:1 on white */

  /* Background options */
  --bg-default: #FFFFFF;
  --bg-high-contrast: #000000;
  --text-high-contrast: #FFFF00; /* Yellow on black: 19.6:1 */

  /* Large touch targets */
  --min-touch-size: 48px;

  /* Enhanced focus indicators */
  --focus-outline-width: 4px;
  --focus-outline-color: #0F3B3A;
  --focus-outline-offset: 4px;

  /* Enhanced spacing (AAA requirement 1.4.8) */
  --line-height: 1.8;
  --paragraph-spacing: 2.5em;
  --letter-spacing: 0.12em;
  --word-spacing: 0.16em;

  /* Typography */
  font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif;
  font-weight: 600;
}

/* High contrast mode toggle */
:root[data-profile="senior"][data-high-contrast="true"] {
  background: var(--bg-high-contrast);
  color: var(--text-high-contrast);

  /* Invert all content */
  filter: invert(0); /* Reset, apply selectively */
}

:root[data-profile="senior"][data-high-contrast="true"] * {
  border-color: var(--text-high-contrast) !important;
  color: var(--text-high-contrast) !important;
}

:root[data-profile="senior"][data-high-contrast="true"] img,
:root[data-profile="senior"][data-high-contrast="true"] video {
  filter: invert(1); /* Re-invert media */
}

/* Extra large touch targets */
:root[data-profile="senior"] button,
:root[data-profile="senior"] a,
:root[data-profile="senior"] input,
:root[data-profile="senior"] select {
  min-height: var(--min-touch-size);
  min-width: var(--min-touch-size);
  padding: 12px 24px;
  font-size: 1.2rem;
  font-weight: 700;
}

/* Enhanced focus with high contrast border */
:root[data-profile="senior"] *:focus-visible {
  outline: var(--focus-outline-width) solid var(--focus-outline-color);
  outline-offset: var(--focus-outline-offset);
  border: 2px solid var(--focus-outline-color);
  border-radius: 4px;
  box-shadow: 0 0 0 2px rgba(15, 59, 58, 0.3);
}

/* Text presentation (AAA 1.4.8) */
:root[data-profile="senior"] p {
  max-width: 80ch;
  line-height: var(--line-height);
  margin-bottom: var(--paragraph-spacing);
  text-align: left; /* Never justified */
  letter-spacing: var(--letter-spacing);
  word-spacing: var(--word-spacing);
}

/* Underline all links */
:root[data-profile="senior"] a {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
  font-weight: 700;
}

:root[data-profile="senior"] a:hover {
  text-decoration-thickness: 3px;
  background-color: rgba(15, 59, 58, 0.1);
}
```

### Profile Switcher Component

```typescript
// src/components/ProfileSwitcher.tsx

'use client';

import { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';

export function ProfileSwitcher() {
  const { profile, setProfile } = useProfile();
  const [highContrast, setHighContrast] = useState(false);

  const handleProfileChange = (newProfile: UserProfile) => {
    setProfile(newProfile);

    // Save to cookie for SSR
    document.cookie = `user-profile=${newProfile}; path=/; max-age=31536000`;

    // Announce change to screen readers
    const announcement = document.getElementById('sr-announcement');
    if (announcement) {
      announcement.textContent = `Perfil alterado para ${getProfileName(newProfile)}`;
    }
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.setAttribute(
      'data-high-contrast',
      String(!highContrast)
    );
  };

  return (
    <div role="region" aria-label="Configurações de Acessibilidade">
      <fieldset>
        <legend className="text-lg font-semibold mb-4">
          Escolha seu Perfil
        </legend>

        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded hover:bg-gray-100">
            <input
              type="radio"
              name="profile"
              value="familiar"
              checked={profile === 'familiar'}
              onChange={() => handleProfileChange('familiar')}
              className="w-5 h-5"
            />
            <div>
              <div className="font-semibold">Familiar</div>
              <div className="text-sm text-gray-600">
                Experiência padrão e equilibrada
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded hover:bg-gray-100">
            <input
              type="radio"
              name="profile"
              value="jovem"
              checked={profile === 'jovem'}
              onChange={() => handleProfileChange('jovem')}
              className="w-5 h-5"
            />
            <div>
              <div className="font-semibold">Jovem</div>
              <div className="text-sm text-gray-600">
                Interface moderna com animações
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded hover:bg-gray-100">
            <input
              type="radio"
              name="profile"
              value="senior"
              checked={profile === 'senior'}
              onChange={() => handleProfileChange('senior')}
              className="w-5 h-5"
            />
            <div>
              <div className="font-semibold">Sênior</div>
              <div className="text-sm text-gray-600">
                Textos grandes e alto contraste
              </div>
            </div>
          </label>
        </div>
      </fieldset>

      {/* High Contrast Toggle (Sênior profile only) */}
      {profile === 'senior' && (
        <div className="mt-6 pt-6 border-t">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={toggleHighContrast}
              className="w-6 h-6"
              aria-describedby="high-contrast-description"
            />
            <div>
              <div className="font-semibold">Alto Contraste</div>
              <div id="high-contrast-description" className="text-sm text-gray-600">
                Fundo preto com texto amarelo (melhor contraste)
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Screen reader announcements */}
      <div
        id="sr-announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
}

function getProfileName(profile: UserProfile): string {
  const names = {
    familiar: 'Familiar',
    jovem: 'Jovem',
    senior: 'Sênior',
  };
  return names[profile];
}
```

---

## 🔊 Screen Reader Optimization

### ARIA Landmarks and Roles

```typescript
// src/components/layout/AccessibleLayout.tsx

export function AccessibleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Skip navigation */}
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>

      {/* Main navigation landmark */}
      <nav aria-label="Navegação principal" role="navigation">
        <ul>
          <li><a href="/">Início</a></li>
          <li><a href="/servicos">Serviços</a></li>
          <li><a href="/sobre">Sobre</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
      </nav>

      {/* Search landmark */}
      <div role="search" aria-label="Busca no site">
        <form onSubmit={handleSearch}>
          <label htmlFor="search-input" className="sr-only">
            Pesquisar no site
          </label>
          <input
            id="search-input"
            type="search"
            placeholder="Buscar..."
            aria-describedby="search-hint"
          />
          <span id="search-hint" className="sr-only">
            Digite sua busca e pressione Enter
          </span>
          <button type="submit" aria-label="Executar busca">
            <SearchIcon aria-hidden="true" />
          </button>
        </form>
      </div>

      {/* Main content landmark */}
      <main id="main-content" role="main" aria-label="Conteúdo principal">
        {children}
      </main>

      {/* Complementary content */}
      <aside role="complementary" aria-label="Informações adicionais">
        <h2>Informações Úteis</h2>
        {/* Sidebar content */}
      </aside>

      {/* Footer landmark */}
      <footer role="contentinfo" aria-label="Rodapé">
        <p>&copy; 2025 Saraiva Vision. Todos os direitos reservados.</p>
      </footer>
    </>
  );
}
```

### ARIA Live Regions

```typescript
// src/components/LiveAnnouncer.tsx

'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface LiveAnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const LiveAnnouncerContext = createContext<LiveAnnouncerContextType | null>(null);

export function LiveAnnouncerProvider({ children }: { children: React.ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage(message);
      // Clear after announcement
      setTimeout(() => setAssertiveMessage(''), 1000);
    } else {
      setPoliteMessage(message);
      setTimeout(() => setPoliteMessage(''), 1000);
    }
  }, []);

  return (
    <LiveAnnouncerContext.Provider value={{ announce }}>
      {children}

      {/* Screen reader only live regions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>

      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveAnnouncerContext.Provider>
  );
}

export function useLiveAnnouncer() {
  const context = useContext(LiveAnnouncerContext);
  if (!context) {
    throw new Error('useLiveAnnouncer must be used within LiveAnnouncerProvider');
  }
  return context;
}

// Usage example
function MyComponent() {
  const { announce } = useLiveAnnouncer();

  const handleAction = () => {
    // Do something
    announce('Ação concluída com sucesso', 'polite');
  };

  return <button onClick={handleAction}>Executar Ação</button>;
}
```

### Semantic HTML Structure

```typescript
// src/components/blog/BlogPost.tsx

export function BlogPost({ post }: { post: BlogPost }) {
  return (
    <article
      aria-labelledby={`post-title-${post.id}`}
      itemScope
      itemType="https://schema.org/MedicalArticle"
    >
      {/* Article header */}
      <header>
        <h1 id={`post-title-${post.id}`} itemProp="headline">
          {post.title}
        </h1>

        <div className="post-meta">
          <time
            dateTime={post.publishedAt}
            itemProp="datePublished"
            aria-label={`Publicado em ${formatDate(post.publishedAt)}`}
          >
            {formatDate(post.publishedAt)}
          </time>

          <address
            className="author"
            itemProp="author"
            itemScope
            itemType="https://schema.org/Physician"
          >
            <span itemProp="name">{post.author.name}</span>
            {post.author.crm && (
              <span className="crm" aria-label="CRM do autor">
                {post.author.crm}
              </span>
            )}
          </address>
        </div>
      </header>

      {/* Article content */}
      <div
        className="prose"
        itemProp="articleBody"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* CFM Compliance Warning */}
      {post.cfmCompliance && (
        <aside
          role="complementary"
          aria-label="Aviso médico importante"
          className="medical-disclaimer"
        >
          <h2>Aviso Importante</h2>
          <p>
            Este conteúdo possui caráter informativo e não substitui avaliação médica.
            Consulte sempre um oftalmologista qualificado.
          </p>
        </aside>
      )}

      {/* Related articles */}
      <nav aria-label="Artigos relacionados">
        <h2>Você também pode gostar</h2>
        <ul>
          {post.relatedPosts?.map(related => (
            <li key={related.id}>
              <a href={`/blog/${related.slug}`}>
                {related.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
```

---

## ⌨️ Keyboard Navigation

### Focus Management

```typescript
// src/hooks/useFocusTrap.ts

import { useEffect, useRef } from 'react';

export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when trap activates
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab: going backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: going forward
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [active]);

  return containerRef;
}

// Usage in Modal
function AccessibleModal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useFocusTrap(isOpen);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className={isOpen ? 'modal-open' : 'modal-closed'}
    >
      <h2 id="modal-title">Modal Title</h2>
      {children}
      <button onClick={onClose}>Fechar</button>
    </div>
  );
}
```

### Keyboard Shortcuts

```typescript
// src/hooks/useKeyboardShortcuts.ts

import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(
        shortcut =>
          shortcut.key.toLowerCase() === e.key.toLowerCase() &&
          !!shortcut.ctrlKey === e.ctrlKey &&
          !!shortcut.shiftKey === e.shiftKey &&
          !!shortcut.altKey === e.altKey
      );

      if (matchingShortcut) {
        e.preventDefault();
        matchingShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

// Keyboard shortcuts help component
export function KeyboardShortcutsHelp({ shortcuts }: { shortcuts: Shortcut[] }) {
  return (
    <div
      role="region"
      aria-label="Atalhos de teclado disponíveis"
      className="shortcuts-help"
    >
      <h2>Atalhos de Teclado</h2>
      <table>
        <caption className="sr-only">
          Lista de atalhos de teclado e suas funções
        </caption>
        <thead>
          <tr>
            <th scope="col">Tecla</th>
            <th scope="col">Ação</th>
          </tr>
        </thead>
        <tbody>
          {shortcuts.map((shortcut, index) => (
            <tr key={index}>
              <td>
                <kbd>
                  {shortcut.ctrlKey && 'Ctrl + '}
                  {shortcut.shiftKey && 'Shift + '}
                  {shortcut.altKey && 'Alt + '}
                  {shortcut.key.toUpperCase()}
                </kbd>
              </td>
              <td>{shortcut.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Usage
function App() {
  const shortcuts: Shortcut[] = [
    {
      key: '/',
      action: () => document.getElementById('search-input')?.focus(),
      description: 'Focar na busca',
    },
    {
      key: 'h',
      action: () => router.push('/'),
      description: 'Ir para a página inicial',
    },
    {
      key: '?',
      shiftKey: true,
      action: () => setShowShortcutsHelp(true),
      description: 'Mostrar atalhos de teclado',
    },
    {
      key: 'Escape',
      action: () => closeCurrentModal(),
      description: 'Fechar modal/diálogo',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return (
    <>
      <main>...</main>
      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </>
  );
}
```

### Roving Tabindex

```typescript
// src/hooks/useRovingTabindex.ts

import { useState, useEffect, useRef } from 'react';

export function useRovingTabindex() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsRef = useRef<HTMLElement[]>([]);

  const registerItem = (element: HTMLElement | null) => {
    if (element && !itemsRef.current.includes(element)) {
      itemsRef.current.push(element);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { key } = e;
    const items = itemsRef.current;

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setCurrentIndex((prevIndex) =>
          prevIndex < items.length - 1 ? prevIndex + 1 : 0
        );
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setCurrentIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : items.length - 1
        );
        break;

      case 'Home':
        e.preventDefault();
        setCurrentIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setCurrentIndex(items.length - 1);
        break;
    }
  };

  useEffect(() => {
    itemsRef.current[currentIndex]?.focus();
  }, [currentIndex]);

  return { registerItem, handleKeyDown, currentIndex };
}

// Usage in a menu
function AccessibleMenu({ items }: { items: MenuItem[] }) {
  const { registerItem, handleKeyDown, currentIndex } = useRovingTabindex();

  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="menuitem"
          ref={registerItem}
          tabIndex={index === currentIndex ? 0 : -1}
          onClick={item.onClick}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

---

## 🧪 Testing Strategy

### Automated Accessibility Testing

```typescript
// src/__tests__/accessibility/a11y.test.tsx

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HomePage } from '@/app/page';
import { ProfileProvider } from '@/contexts/ProfileContext';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('Familiar Profile (WCAG AA)', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ProfileProvider initialProfile="familiar">
          <HomePage />
        </ProfileProvider>
      );

      const results = await axe(container, {
        rules: {
          // WCAG 2.1 Level AA rules
          'color-contrast': { enabled: true },
          'duplicate-id': { enabled: true },
          'heading-order': { enabled: true },
          'image-alt': { enabled: true },
          'label': { enabled: true },
          'link-name': { enabled: true },
          'list': { enabled: true },
          'region': { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('Sênior Profile (WCAG AAA)', () => {
    it('should have no accessibility violations at AAA level', async () => {
      const { container } = render(
        <ProfileProvider initialProfile="senior">
          <HomePage />
        </ProfileProvider>
      );

      const results = await axe(container, {
        rules: {
          // WCAG 2.1 Level AAA rules
          'color-contrast-enhanced': { enabled: true }, // 7:1 ratio
          'focus-order-semantics': { enabled: true },
          'heading-order': { enabled: true },
          'landmark-unique': { enabled: true },
          'link-in-text-block': { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('should have minimum 7:1 color contrast', async () => {
      const { container } = render(
        <ProfileProvider initialProfile="senior">
          <HomePage />
        </ProfileProvider>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast-enhanced': { enabled: true },
        },
      });

      expect(results.violations).toHaveLength(0);
    });

    it('should have text size at least 20px', () => {
      const { container } = render(
        <ProfileProvider initialProfile="senior">
          <HomePage />
        </ProfileProvider>
      );

      const rootElement = container.querySelector('[data-profile="senior"]');
      const fontSize = window.getComputedStyle(rootElement!).fontSize;

      expect(parseInt(fontSize)).toBeGreaterThanOrEqual(20);
    });
  });
});
```

### Manual Testing Checklist

```markdown
# Manual Accessibility Testing Checklist

## Screen Reader Testing

### NVDA (Windows)
- [ ] Navigate through all headings (H key)
- [ ] Navigate through all landmarks (D key)
- [ ] Navigate through all links (K key)
- [ ] Navigate through all form fields (F key)
- [ ] Test forms announcement and error messages
- [ ] Test ARIA live regions announcements
- [ ] Verify table structure is announced correctly
- [ ] Test modal/dialog behavior

### JAWS (Windows)
- [ ] Same tests as NVDA
- [ ] Test virtual cursor navigation
- [ ] Test forms mode
- [ ] Verify ARIA roles and states

### VoiceOver (macOS/iOS)
- [ ] Navigate with VO+Arrow keys
- [ ] Test rotor navigation (VO+U)
- [ ] Test gestures on iOS
- [ ] Verify all interactive elements are reachable

## Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Shift+Tab to navigate backwards
- [ ] Enter/Space to activate buttons and links
- [ ] Arrow keys in menus and dropdowns
- [ ] Escape to close modals/dropdowns
- [ ] No keyboard traps
- [ ] Focus indicators always visible
- [ ] Skip navigation links work

## Visual Testing
- [ ] Test at 200% zoom (no horizontal scrolling)
- [ ] Test with Windows High Contrast Mode
- [ ] Test with browser dark mode
- [ ] Test color contrast ratios with tools
- [ ] Verify focus indicators are visible
- [ ] Check touch target sizes (min 44x44px AA, 48x48px AAA)

## Profile-Specific
### Familiar Profile
- [ ] 4.5:1 color contrast minimum
- [ ] 44px minimum touch targets
- [ ] 2px focus outlines visible

### Jovem Profile
- [ ] Animations respect prefers-reduced-motion
- [ ] Glassmorphism doesn't reduce contrast
- [ ] Animated focus indicators accessible

### Sênior Profile
- [ ] 7:1 color contrast minimum (AAA)
- [ ] 48px minimum touch targets
- [ ] 20px base font size
- [ ] OpenDyslexic font loaded correctly
- [ ] High contrast mode toggle works
- [ ] Line height ≥ 1.8
- [ ] Paragraph spacing ≥ 2× font size
- [ ] All links underlined
```

### Continuous Integration Testing

```yaml
# .github/workflows/a11y-tests.yml

name: Accessibility Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  accessibility:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        profile: [familiar, jovem, senior]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          PROFILE: ${{ matrix.profile }}

      - name: Run axe accessibility tests
        run: npm run test:a11y -- --profile=${{ matrix.profile }}

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun --config=lighthouserc-${{ matrix.profile }}.json

      - name: Upload accessibility report
        uses: actions/upload-artifact@v3
        with:
          name: a11y-report-${{ matrix.profile }}
          path: ./a11y-reports/

      - name: Comment PR with results
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('./a11y-reports/summary.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Accessibility Report (${{ matrix.profile }})\n\n${report}`
            });
```

---

## ✅ Implementation Checklist

### WCAG AA Compliance (Familiar + Jovem)

**Perceivable**
- [ ] All images have alt text
- [ ] Color contrast ≥ 4.5:1 (normal), ≥ 3:1 (large)
- [ ] Content structured with semantic HTML
- [ ] Forms have proper labels
- [ ] No auto-playing media

**Operable**
- [ ] 100% keyboard accessible
- [ ] Skip navigation links
- [ ] Touch targets ≥ 44×44px
- [ ] No keyboard traps
- [ ] Focus indicators visible (2px outline)
- [ ] Animations respect prefers-reduced-motion

**Understandable**
- [ ] lang="pt-BR" on html element
- [ ] Error messages clear and helpful
- [ ] Consistent navigation
- [ ] Form validation accessible

**Robust**
- [ ] Valid HTML
- [ ] ARIA used correctly
- [ ] Compatible with assistive technologies

### WCAG AAA Compliance (Sênior)

**Enhanced Perceivable**
- [ ] Color contrast ≥ 7:1 (normal), ≥ 4.5:1 (large)
- [ ] Line height ≥ 1.8
- [ ] Paragraph spacing ≥ 2× font size
- [ ] Max line length 80 characters
- [ ] Text not justified
- [ ] No images of text

**Enhanced Operable**
- [ ] Touch targets ≥ 48×48px
- [ ] No time limits
- [ ] No flashing content
- [ ] Enhanced focus indicators (4px outline)
- [ ] Location information available

**Enhanced Understandable**
- [ ] Simplified text when possible
- [ ] Abbreviations expanded
- [ ] Context-sensitive help
- [ ] Confirmation for all submissions

### Testing
- [ ] Automated tests with jest-axe
- [ ] Manual testing with NVDA
- [ ] Manual testing with JAWS
- [ ] Manual testing with VoiceOver
- [ ] Keyboard navigation tested
- [ ] 200% zoom tested
- [ ] High contrast mode tested
- [ ] Lighthouse accessibility score ≥ 95
- [ ] CI/CD pipeline includes a11y tests

---

**Próximo Documento**: [Bundle Analysis Strategy](./BUNDLE_ANALYSIS_STRATEGY.md)

**Última Atualização**: Outubro 2025
**Autor**: Equipe Saraiva Vision
**Status**: Em Planejamento
