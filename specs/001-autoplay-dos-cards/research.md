# Research: Autoplay do Carrossel de Serviços

**Date**: 2025-09-10 | **Phase 0** | **Feature**: 001-autoplay-dos-cards

## Research Findings

### 1. Optimal Autoplay Timing Intervals for Medical Website Carousels

**Decision**: 4-5 segundos entre transições para carrosseis médicos

**Rationale**:
- Websites médicos requerem mais tempo de leitura devido à natureza informativa do conteúdo
- Usuários precisam de tempo para absorver informações sobre serviços de saúde
- Estudos de UX indicam que carrosseis informativos (não publicitários) precisam de 4-6 segundos por slide
- Tempo suficiente para leitura de títulos e descrições curtas sem pressionar o usuário
- Balanceamento entre engajamento e usabilidade para público-alvo (pacientes de oftalmologia)

**Alternatives Considered**:
- 3 segundos: Muito rápido para absorção de informações médicas
- 6+ segundos: Pode parecer lento, reduzindo engajamento
- Timing adaptativo baseado no conteúdo: Complexidade desnecessária para este escopo

**Implementation Details**:
- Default: 4500ms (4.5 segundos)
- Configurável via prop para ajustes futuros
- Pausar durante hover/focus para permitir leitura completa

### 2. Accessible Carousel Autoplay with React and Framer Motion

**Decision**: Implementar padrão de acessibilidade com prefers-reduced-motion e controles explícitos

**Rationale**:
- WCAG 2.1 Guideline 2.2.2: Moving content deve ser pausável
- Público médico inclui pessoas com sensibilidades vestibulares
- Framer Motion tem suporte nativo para `prefers-reduced-motion`
- React permite controle granular do estado de autoplay

**Best Practices Found**:
1. **Controles de usuário obrigatórios**:
   - Hover/focus pausa autoplay
   - Navegação manual reseta timing
   - Botão de pause/play visível (se solicitado)

2. **Indicadores visuais**:
   - Progress bar ou dots indicando progresso atual
   - Transição suave sem movimento brusco

3. **Acessibilidade**:
   - `aria-live="polite"` para anunciar mudanças
   - `aria-label` descritivo para navegação
   - Tab navigation funcional
   - Respeitar `prefers-reduced-motion: reduce`

4. **Padrões do Framer Motion**:
   ```javascript
   const variants = {
     initial: { opacity: 0, x: 50 },
     animate: { opacity: 1, x: 0 },
     exit: { opacity: 0, x: -50 }
   };

   // Respect user preferences
   const shouldReduceMotion = useReducedMotion();
   const transition = shouldReduceMotion
     ? { duration: 0 }
     : { duration: 0.3, ease: "easeOut" };
   ```

**Alternatives Considered**:
- CSS-only animations: Menor controle sobre acessibilidade
- JavaScript manual: Mais código, menos otimizado que Framer Motion
- Bibliotecas externas (Swiper, etc.): Overhead desnecessário

### 3. prefers-reduced-motion Browser Support and Implementation

**Decision**: Implementar com fallback gracioso para navegadores antigos

**Rationale**:
- Suporte moderno: 96%+ dos navegadores (Can I Use data)
- Chrome 74+, Firefox 63+, Safari 10.1+, Edge 79+
- Fallback: autoplay habilitado por padrão em navegadores sem suporte
- CSS media query + JavaScript hook para detecção completa

**Implementation Strategy**:
```javascript
// React hook for reduced motion detection
const useReducedMotion = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const listener = (e) => setShouldReduceMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return shouldReduceMotion;
};

// Usage in autoplay logic
const autoplayEnabled = !useReducedMotion() && userHasNotDisabled;
```

**CSS Fallback**:
```css
@media (prefers-reduced-motion: reduce) {
  .carousel-container {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Alternatives Considered**:
- JavaScript-only detection: Não pega mudanças dinâmicas de preferência
- CSS-only: Não permite desabilitar autoplay completamente
- Polyfill para navegadores antigos: Overhead desnecessário

### 4. Performance: requestAnimationFrame vs setInterval for Autoplay

**Decision**: requestAnimationFrame para transições suaves + setTimeout para timing de autoplay

**Rationale**:
- RAF: Melhor para animações visuais (60fps, pausa quando tab inativa)
- setTimeout: Melhor para timing preciso de intervalos longos (4+ segundos)
- Combinação oferece melhor performance e precisão

**Performance Analysis**:

**requestAnimationFrame**:
- ✅ Sincronizado com refresh rate do monitor
- ✅ Pausa automaticamente em tabs inativas
- ✅ Melhor para animações contínuas
- ❌ Impreciso para intervalos longos
- ❌ Continua executando mesmo sem animação

**setTimeout/setInterval**:
- ✅ Preciso para intervalos específicos
- ✅ Pode ser facilmente pausado/cancelado
- ✅ Menor overhead para timing simples
- ❌ Não sincronizado com refresh rate
- ❌ Pode executar em tabs inativas (dependendo do browser)

**Hybrid Approach** (escolhido):
```javascript
// Timing control with setTimeout
const startAutoplay = () => {
  if (autoplayTimer) clearTimeout(autoplayTimer);

  autoplayTimer = setTimeout(() => {
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  }, AUTOPLAY_INTERVAL);
};

// Smooth transitions with Framer Motion (uses RAF internally)
<motion.div
  key={currentIndex}
  variants={slideVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.3, ease: "easeOut" }}
>
```

**Alternatives Considered**:
- Pure RAF: Complexo para implementar timing preciso
- Pure setTimeout: Transições menos suaves
- setInterval: Mais difícil de pausar/resetar

### 5. Interaction Patterns and State Management

**Decision**: Estado centralizado com useReducer para gerenciar complexidade de interações

**Rationale**:
- Múltiplas fontes de interação: hover, click, keyboard, touch
- Estados interdependentes: isPlaying, isPaused, currentIndex, userInteracting
- useReducer oferece previsibilidade e debugging melhor que múltiplos useState

**State Model**:
```javascript
const autoplayReducer = (state, action) => {
  switch (action.type) {
    case 'PLAY':
      return { ...state, isPlaying: true, isPaused: false };
    case 'PAUSE':
      return { ...state, isPlaying: false, isPaused: true };
    case 'USER_INTERACT_START':
      return { ...state, userInteracting: true, isPlaying: false };
    case 'USER_INTERACT_END':
      return { ...state, userInteracting: false };
    case 'NAVIGATE_TO':
      return {
        ...state,
        currentIndex: action.index,
        lastUserNavigation: Date.now()
      };
    default:
      return state;
  }
};
```

**Interaction Priority**:
1. prefers-reduced-motion: Highest (disables autoplay completely)
2. User interaction (hover/touch): Pauses autoplay temporarily
3. Manual navigation: Resets autoplay timer
4. Tab visibility: Pauses when tab inactive
5. Autoplay timer: Lowest priority

**Alternatives Considered**:
- Multiple useState hooks: Dificulta sincronização de estados
- External state library (Zustand): Overhead para escopo limitado
- Context API: Desnecessário para componente isolado

## Resolved Clarifications

### Timing Configuration (from spec NEEDS CLARIFICATION)
- **Default interval**: 4500ms (4.5 segundos)
- **Pause duration on hover**: Imediato (sem delay)
- **Resume delay after interaction**: 1000ms (1 segundo)
- **Transition duration**: 300ms
- **Manual navigation reset delay**: 2000ms (2 segundos antes de retomar autoplay)

### Performance Targets (from spec NEEDS CLARIFICATION)
- **Animation frame rate**: 60fps (via Framer Motion optimization)
- **Transition timing**: <300ms para mudança de slide
- **Memory footprint**: <5MB adicional (principalmente timers e state)
- **Bundle size impact**: ~2KB adicional (hook + utils)

### Browser Compatibility (from spec NEEDS CLARIFICATION)
- **Primary targets**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Graceful degradation**: Autoplay disabled em navegadores sem Intersection Observer
- **prefers-reduced-motion**: Suportado com fallback para navegadores antigos
- **Touch events**: Suporte completo via Framer Motion gesture handlers

### Accessibility Compliance Details (from spec NEEDS CLARIFICATION)
- **WCAG 2.1 AA compliance**: ✅ Via pausa em hover e prefers-reduced-motion
- **Screen reader announcements**: aria-live="polite" para mudanças de slide
- **Keyboard navigation**: Tab, Enter, Space, Arrow keys suportadas
- **Focus management**: Focus trap dentro do carrossel durante navegação por teclado
- **High contrast mode**: CSS custom properties para compatibilidade

---

**Next Phase**: Phase 1 (Design & Contracts) - todas as questões de clarificação foram resolvidas
