# Data Model: Autoplay do Carrossel de Serviços

**Date**: 2025-09-10 | **Phase 1** | **Feature**: 001-autoplay-dos-cards

## Core Entities

### 1. AutoplayState
**Purpose**: Estado central do autoplay com todas as propriedades necessárias para controle completo

```javascript
interface AutoplayState {
  // Playback Control
  isPlaying: boolean;           // Se autoplay está ativo
  isPaused: boolean;            // Se foi pausado pelo usuário
  isEnabled: boolean;           // Se autoplay está habilitado (prefers-reduced-motion)

  // Navigation State
  currentIndex: number;         // Índice atual do slide (0-based)
  totalSlides: number;          // Total de slides disponíveis
  direction: 'forward' | 'backward'; // Direção da navegação

  // Timing Control
  interval: number;             // Intervalo entre transições (ms)
  lastTransition: number;       // Timestamp da última transição
  lastUserNavigation: number;   // Timestamp da última interação do usuário
  resumeDelay: number;          // Delay para retomar após interação

  // Interaction Tracking
  userInteracting: boolean;     // Se usuário está interagindo (hover/touch)
  manualNavigation: boolean;    // Se navegação foi manual
  tabVisible: boolean;          // Se tab está visível

  // Configuration
  config: AutoplayConfig;       // Configurações do autoplay
}
```

**Validation Rules**:
- `currentIndex`: 0 ≤ currentIndex < totalSlides
- `interval`: interval ≥ 1000 (mínimo 1 segundo)
- `totalSlides`: totalSlides > 0
- `lastTransition`, `lastUserNavigation`: Valid timestamps ou 0
- `resumeDelay`: 0 ≤ resumeDelay ≤ 10000 (máximo 10 segundos)

**State Transitions**:
```
IDLE → PLAYING (quando autoplay inicia)
PLAYING → PAUSED (hover, manual navigation, tab hidden)
PAUSED → PLAYING (após resumeDelay)
PLAYING → DISABLED (prefers-reduced-motion detectado)
DISABLED → IDLE (prefers-reduced-motion removido)
```

### 2. AutoplayConfig
**Purpose**: Configuração imutável do comportamento do autoplay

```javascript
interface AutoplayConfig {
  // Timing Settings
  defaultInterval: number;      // Intervalo padrão (4500ms)
  transitionDuration: number;   // Duração da transição (300ms)
  resumeDelay: number;         // Delay para retomar (1000ms)
  manualResetDelay: number;    // Delay após navegação manual (2000ms)

  // Behavior Settings
  pauseOnHover: boolean;       // Pausar no hover (true)
  pauseOnFocus: boolean;       // Pausar no focus (true)
  respectReducedMotion: boolean; // Respeitar prefers-reduced-motion (true)
  resetOnManualNav: boolean;   // Resetar timer na navegação manual (true)

  // Accessibility Settings
  enableAriaLive: boolean;     // Anúncios para screen readers (true)
  enableKeyboardControls: boolean; // Controles por teclado (true)

  // Performance Settings
  disableOnInactiveTab: boolean; // Pausar em tab inativa (true)
  useReducedMotion: boolean;   // Detectado automaticamente
}
```

**Default Configuration**:
```javascript
const DEFAULT_AUTOPLAY_CONFIG: AutoplayConfig = {
  defaultInterval: 4500,
  transitionDuration: 300,
  resumeDelay: 1000,
  manualResetDelay: 2000,
  pauseOnHover: true,
  pauseOnFocus: true,
  respectReducedMotion: true,
  resetOnManualNav: true,
  enableAriaLive: true,
  enableKeyboardControls: true,
  disableOnInactiveTab: true,
  useReducedMotion: false // Detectado em runtime
};
```

### 3. CarouselController
**Purpose**: Interface de controle para ações do carrossel

```javascript
interface CarouselController {
  // Playback Control
  play(): void;                // Inicia autoplay
  pause(): void;               // Pausa autoplay
  toggle(): void;              // Alterna play/pause
  stop(): void;                // Para e reseta

  // Navigation Control
  next(): void;                // Próximo slide
  previous(): void;            // Slide anterior
  goTo(index: number): void;   // Navegar para índice específico

  // State Queries
  isPlaying(): boolean;        // Se está reproduzindo
  isPaused(): boolean;         // Se está pausado
  getCurrentIndex(): number;   // Índice atual
  getTotalSlides(): number;    // Total de slides

  // Configuration
  updateConfig(config: Partial<AutoplayConfig>): void;
  getConfig(): AutoplayConfig;

  // Event Handlers (para componente)
  handleMouseEnter(): void;    // Mouse enter
  handleMouseLeave(): void;    // Mouse leave
  handleFocus(): void;         // Focus
  handleBlur(): void;          // Blur
  handleVisibilityChange(visible: boolean): void; // Tab visibility
}
```

### 4. InteractionTracker
**Purpose**: Rastreamento de interações do usuário para pausar/retomar autoplay

```javascript
interface InteractionTracker {
  // State
  isHovering: boolean;         // Mouse over carrossel
  isFocused: boolean;          // Carrossel tem focus
  isTouching: boolean;         // Touch em andamento
  isDragging: boolean;         // Drag em andamento

  // Timestamps
  lastHover: number;           // Último hover
  lastFocus: number;           // Último focus
  lastTouch: number;           // Último touch
  lastDrag: number;            // Último drag

  // Methods
  startHover(): void;
  endHover(): void;
  startFocus(): void;
  endFocus(): void;
  startTouch(): void;
  endTouch(): void;
  startDrag(): void;
  endDrag(): void;

  // Queries
  isUserInteracting(): boolean; // Qualquer interação ativa
  shouldPauseAutoplay(): boolean; // Se deve pausar baseado nas interações
  getLastInteractionTime(): number; // Timestamp da última interação
}
```

### 5. AutoplayTimer
**Purpose**: Gerenciamento de timers para autoplay com controle preciso

```javascript
interface AutoplayTimer {
  // State
  isActive: boolean;           // Se timer está ativo
  timeRemaining: number;       // Tempo restante para próxima transição
  nextTransitionTime: number;  // Timestamp da próxima transição

  // Control
  start(interval: number): void; // Inicia timer
  pause(): void;               // Pausa timer (mantém tempo restante)
  resume(): void;              // Retoma timer
  reset(): void;               // Reseta timer
  stop(): void;                // Para e limpa timer

  // Configuration
  setInterval(interval: number): void; // Atualiza intervalo
  setCallback(callback: () => void): void; // Define callback de transição

  // Queries
  getTimeRemaining(): number;  // Tempo restante em ms
  getProgress(): number;       // Progresso 0-1
  isRunning(): boolean;        // Se está executando
}
```

## Relationships

### State Management Flow
```
AutoplayConfig (imutable) → useAutoplayCarousel hook
                         ↓
AutoplayState (gerenciado pelo reducer) ← InteractionTracker
                         ↓
CarouselController (interface) ← AutoplayTimer
                         ↓
Services Component (UI)
```

### Event Flow
```
User Interaction → InteractionTracker → AutoplayState Update → Timer Control
Tab Visibility → AutoplayState Update → Timer Control
Manual Navigation → AutoplayState Update → Timer Reset
Autoplay Timer → AutoplayState Update → Slide Transition
```

### Dependencies
```
useAutoplayCarousel (hook)
├── AutoplayState (useReducer)
├── AutoplayTimer (custom hook)
├── InteractionTracker (custom hook)
├── useReducedMotion (detection hook)
└── usePageVisibility (tab visibility hook)

Services Component
├── useAutoplayCarousel
├── Framer Motion (animations)
└── React i18next (translations)
```

## Validation Schema

### Runtime Validation (Development)
```javascript
const validateAutoplayState = (state: AutoplayState): string[] => {
  const errors: string[] = [];

  if (state.currentIndex < 0 || state.currentIndex >= state.totalSlides) {
    errors.push(`Invalid currentIndex: ${state.currentIndex} (total: ${state.totalSlides})`);
  }

  if (state.interval < 1000) {
    errors.push(`Interval too short: ${state.interval}ms (minimum: 1000ms)`);
  }

  if (state.totalSlides <= 0) {
    errors.push(`Invalid totalSlides: ${state.totalSlides}`);
  }

  if (state.resumeDelay < 0 || state.resumeDelay > 10000) {
    errors.push(`Invalid resumeDelay: ${state.resumeDelay}ms (range: 0-10000ms)`);
  }

  return errors;
};
```

### Configuration Validation
```javascript
const validateAutoplayConfig = (config: AutoplayConfig): string[] => {
  const errors: string[] = [];

  if (config.defaultInterval < 1000) {
    errors.push(`defaultInterval too short: ${config.defaultInterval}ms`);
  }

  if (config.transitionDuration < 0 || config.transitionDuration > 2000) {
    errors.push(`Invalid transitionDuration: ${config.transitionDuration}ms`);
  }

  if (config.resumeDelay < 0) {
    errors.push(`Invalid resumeDelay: ${config.resumeDelay}ms`);
  }

  return errors;
};
```

## State Persistence

**Scope**: Session only (não persistir entre reloads)

**Rationale**:
- Autoplay é comportamento de interface, não preferência do usuário
- Melhor experiência resetar estado a cada página carregada
- Evita estados inconsistentes ao voltar para página
- Preferências de acessibilidade (prefers-reduced-motion) são detectadas automaticamente

**Storage**: Component state apenas (useReducer + custom hooks)

---

**Next**: Contracts generation based on entities and relationships defined above
