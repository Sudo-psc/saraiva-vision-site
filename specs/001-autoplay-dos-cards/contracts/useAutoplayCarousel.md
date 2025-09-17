# API Contracts: useAutoplayCarousel Hook

**Date**: 2025-09-10 | **Phase 1** | **Feature**: 001-autoplay-dos-cards

## Hook Interface Contract

### Primary Hook: useAutoplayCarousel

```typescript
interface UseAutoplayCarouselProps {
  totalSlides: number;
  config?: Partial<AutoplayConfig>;
  onSlideChange?: (index: number, direction: 'forward' | 'backward') => void;
  initialIndex?: number;
}

interface UseAutoplayCarouselReturn {
  // Current State
  currentIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isEnabled: boolean;
  direction: 'forward' | 'backward';

  // Controls
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;

  // Event Handlers (bind to DOM elements)
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
  };

  // Configuration
  updateConfig: (config: Partial<AutoplayConfig>) => void;
  config: AutoplayConfig;

  // Progress Info (for UI indicators)
  progress: number; // 0-1 progress to next slide
  timeRemaining: number; // ms remaining for current slide
}

// Hook signature
declare function useAutoplayCarousel(
  props: UseAutoplayCarouselProps
): UseAutoplayCarouselReturn;
```

### Contract Specifications

#### 1. Initialization Contract
```typescript
// MUST initialize with valid parameters
const carousel = useAutoplayCarousel({
  totalSlides: 5,
  initialIndex: 0,
  config: {
    defaultInterval: 4500,
    pauseOnHover: true
  }
});

// MUST return initial state
expect(carousel.currentIndex).toBe(0);
expect(carousel.isPlaying).toBe(false); // Starts paused
expect(carousel.isEnabled).toBe(true); // Unless prefers-reduced-motion
```

#### 2. State Management Contract
```typescript
// MUST handle state transitions correctly
carousel.play();
expect(carousel.isPlaying).toBe(true);
expect(carousel.isPaused).toBe(false);

carousel.pause();
expect(carousel.isPlaying).toBe(false);
expect(carousel.isPaused).toBe(true);

// MUST respect totalSlides boundary
carousel.goTo(carousel.totalSlides); // Invalid index
expect(carousel.currentIndex).toBe(0); // Should not change

carousel.goTo(-1); // Invalid index
expect(carousel.currentIndex).toBe(0); // Should not change
```

#### 3. Navigation Contract
```typescript
// MUST navigate correctly
const initialIndex = carousel.currentIndex;

carousel.next();
expect(carousel.currentIndex).toBe((initialIndex + 1) % totalSlides);
expect(carousel.direction).toBe('forward');

carousel.previous();
expect(carousel.currentIndex).toBe(initialIndex);
expect(carousel.direction).toBe('backward');

// MUST wrap around boundaries
carousel.goTo(totalSlides - 1);
carousel.next();
expect(carousel.currentIndex).toBe(0); // Wraps to beginning
```

#### 4. Event Handlers Contract
```typescript
// MUST provide bound event handlers
expect(typeof carousel.handlers.onMouseEnter).toBe('function');
expect(typeof carousel.handlers.onMouseLeave).toBe('function');
expect(typeof carousel.handlers.onFocus).toBe('function');
expect(typeof carousel.handlers.onBlur).toBe('function');

// MUST pause on interaction
carousel.play();
carousel.handlers.onMouseEnter();
expect(carousel.isPlaying).toBe(false);

// MUST resume after interaction (with delay)
carousel.handlers.onMouseLeave();
// Wait for resumeDelay...
await waitFor(() => expect(carousel.isPlaying).toBe(true));
```

#### 5. Configuration Contract
```typescript
// MUST accept partial config updates
carousel.updateConfig({
  defaultInterval: 6000,
  pauseOnHover: false
});

expect(carousel.config.defaultInterval).toBe(6000);
expect(carousel.config.pauseOnHover).toBe(false);
// Other config values should remain unchanged

// MUST validate config changes
expect(() => {
  carousel.updateConfig({ defaultInterval: 500 }); // Below minimum
}).toThrow('defaultInterval must be >= 1000ms');
```

#### 6. Accessibility Contract
```typescript
// MUST respect prefers-reduced-motion
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    matches: true, // prefers-reduced-motion: reduce
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
});

const carousel = useAutoplayCarousel({ totalSlides: 5 });
expect(carousel.isEnabled).toBe(false);
expect(carousel.isPlaying).toBe(false);

// MUST not start autoplay when disabled
carousel.play();
expect(carousel.isPlaying).toBe(false);
```

#### 7. Progress Tracking Contract
```typescript
// MUST provide progress information
carousel.play();
expect(carousel.progress).toBeGreaterThanOrEqual(0);
expect(carousel.progress).toBeLessThanOrEqual(1);
expect(carousel.timeRemaining).toBeGreaterThan(0);
expect(carousel.timeRemaining).toBeLessThanOrEqual(carousel.config.defaultInterval);

// MUST update progress over time
const initialProgress = carousel.progress;
await waitFor(() => {
  expect(carousel.progress).toBeGreaterThan(initialProgress);
});
```

#### 8. Callback Contract
```typescript
// MUST call onSlideChange when slide changes
const onSlideChange = jest.fn();
const carousel = useAutoplayCarousel({
  totalSlides: 5,
  onSlideChange
});

carousel.next();
expect(onSlideChange).toHaveBeenCalledWith(1, 'forward');

carousel.previous();
expect(onSlideChange).toHaveBeenCalledWith(0, 'backward');

// MUST call with correct parameters for autoplay
carousel.play();
// Wait for autoplay transition...
await waitFor(() => {
  expect(onSlideChange).toHaveBeenCalledWith(
    expect.any(Number),
    'forward'
  );
});
```

## Supporting Hooks Contracts

### useReducedMotion Hook

```typescript
interface UseReducedMotionReturn {
  shouldReduceMotion: boolean;
  isSupported: boolean;
}

declare function useReducedMotion(): UseReducedMotionReturn;

// Contract
const { shouldReduceMotion, isSupported } = useReducedMotion();
expect(typeof shouldReduceMotion).toBe('boolean');
expect(typeof isSupported).toBe('boolean');

// MUST detect media query changes
// (Implementation will test with media query mocking)
```

### usePageVisibility Hook

```typescript
interface UsePageVisibilityReturn {
  isVisible: boolean;
  visibilityState: 'visible' | 'hidden' | 'prerender';
}

declare function usePageVisibility(): UsePageVisibilityReturn;

// Contract
const { isVisible, visibilityState } = usePageVisibility();
expect(typeof isVisible).toBe('boolean');
expect(['visible', 'hidden', 'prerender']).toContain(visibilityState);

// MUST respond to visibility changes
// (Implementation will test with document.visibilityState mocking)
```

## Error Handling Contracts

### Invalid Parameters Contract
```typescript
// MUST throw for invalid totalSlides
expect(() => {
  useAutoplayCarousel({ totalSlides: 0 });
}).toThrow('totalSlides must be > 0');

expect(() => {
  useAutoplayCarousel({ totalSlides: -1 });
}).toThrow('totalSlides must be > 0');

// MUST throw for invalid initialIndex
expect(() => {
  useAutoplayCarousel({
    totalSlides: 5,
    initialIndex: 5 // >= totalSlides
  });
}).toThrow('initialIndex must be < totalSlides');

expect(() => {
  useAutoplayCarousel({
    totalSlides: 5,
    initialIndex: -1
  });
}).toThrow('initialIndex must be >= 0');
```

### Configuration Validation Contract
```typescript
// MUST validate configuration values
expect(() => {
  useAutoplayCarousel({
    totalSlides: 5,
    config: { defaultInterval: 500 } // Below minimum
  });
}).toThrow('defaultInterval must be >= 1000ms');

expect(() => {
  useAutoplayCarousel({
    totalSlides: 5,
    config: { transitionDuration: -100 } // Negative
  });
}).toThrow('transitionDuration must be >= 0');

expect(() => {
  useAutoplayCarousel({
    totalSlides: 5,
    config: { resumeDelay: 15000 } // Above maximum
  });
}).toThrow('resumeDelay must be <= 10000ms');
```

## Performance Contracts

### Memory Management Contract
```typescript
// MUST cleanup timers on unmount
const { unmount } = renderHook(() => useAutoplayCarousel({ totalSlides: 5 }));

// Start autoplay to create timers
const carousel = result.current;
carousel.play();

// Unmount should clean up
unmount();

// Verify no memory leaks (implementation specific)
// All timers should be cleared
// All event listeners should be removed
```

### Timer Precision Contract
```typescript
// MUST respect timing intervals (within tolerance)
const carousel = useAutoplayCarousel({
  totalSlides: 5,
  config: { defaultInterval: 2000 } // 2 seconds for testing
});

carousel.play();
const startTime = Date.now();

await waitFor(() => {
  expect(carousel.currentIndex).toBe(1);
}, { timeout: 2500 }); // Allow 500ms tolerance

const elapsed = Date.now() - startTime;
expect(elapsed).toBeGreaterThanOrEqual(1800); // At least 1.8s
expect(elapsed).toBeLessThan(2500); // Less than 2.5s
```

---

**Usage Example**:
```typescript
// In Services.jsx component
const carousel = useAutoplayCarousel({
  totalSlides: services.length,
  config: {
    defaultInterval: 4500,
    pauseOnHover: true,
    respectReducedMotion: true
  },
  onSlideChange: (index, direction) => {
    // Update UI, analytics, etc.
    console.log(`Navigated to slide ${index} (${direction})`);
  }
});

// In JSX
<div
  className="carousel-container"
  {...carousel.handlers}
>
  {/* Carousel content */}
</div>
```

**Contract Test Coverage**: All contracts above must have corresponding failing tests before implementation begins.
