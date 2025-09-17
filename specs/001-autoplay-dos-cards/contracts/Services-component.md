# API Contracts: Services Component Enhancement

**Date**: 2025-09-10 | **Phase 1** | **Feature**: 001-autoplay-dos-cards

## Component API Contract

### Enhanced Services Component

```typescript
interface ServicesProps {
  // Existing props (maintain backward compatibility)
  className?: string;

  // New autoplay props
  autoplay?: boolean;                    // Enable/disable autoplay (default: true)
  autoplayConfig?: Partial<AutoplayConfig>; // Override default config
  onSlideChange?: (index: number, direction: 'forward' | 'backward') => void;

  // Accessibility props
  'aria-label'?: string;                 // Carousel container label
  'aria-describedby'?: string;          // Description element ID
}

// Component signature (maintains existing interface)
declare function Services(props: ServicesProps): JSX.Element;
```

### Contract Specifications

#### 1. Backward Compatibility Contract
```tsx
// MUST render without any new props (existing behavior)
const { container } = render(<Services />);
expect(container.querySelector('.services-grid')).toBeInTheDocument();

// MUST maintain existing CSS classes and structure
expect(container.querySelector('.service-card')).toBeInTheDocument();
expect(container.querySelector('.services-title')).toBeInTheDocument();

// MUST maintain existing i18n keys
expect(screen.getByText(/services\.title/)).toBeInTheDocument();
```

#### 2. Autoplay Integration Contract
```tsx
// MUST enable autoplay by default
const { container } = render(<Services />);
const carouselContainer = container.querySelector('[data-autoplay="true"]');
expect(carouselContainer).toBeInTheDocument();

// MUST respect autoplay prop
render(<Services autoplay={false} />);
const noAutoplayContainer = container.querySelector('[data-autoplay="false"]');
expect(noAutoplayContainer).toBeInTheDocument();

// MUST not start autoplay when disabled
const carousel = container.querySelector('.carousel-container');
expect(carousel).not.toHaveAttribute('data-playing', 'true');
```

#### 3. Configuration Override Contract
```tsx
// MUST apply custom configuration
const customConfig = {
  defaultInterval: 6000,
  pauseOnHover: false
};

render(<Services autoplayConfig={customConfig} />);

// Verify config is applied (implementation will check internal state)
// This would be tested via integration tests or data attributes
const carousel = screen.getByTestId('services-carousel');
expect(carousel).toHaveAttribute('data-interval', '6000');
expect(carousel).toHaveAttribute('data-pause-on-hover', 'false');
```

#### 4. Event Handling Contract
```tsx
// MUST call onSlideChange callback
const onSlideChange = jest.fn();
render(<Services onSlideChange={onSlideChange} />);

// Simulate autoplay transition or manual navigation
const nextButton = screen.getByLabelText(/next slide/i);
fireEvent.click(nextButton);

expect(onSlideChange).toHaveBeenCalledWith(1, 'forward');
```

#### 5. Accessibility Contract
```tsx
// MUST have proper ARIA attributes
render(<Services aria-label="Services carousel" />);

const carousel = screen.getByLabelText('Services carousel');
expect(carousel).toHaveAttribute('role', 'region');
expect(carousel).toHaveAttribute('aria-live', 'polite');

// MUST have keyboard navigation
const carouselContainer = screen.getByRole('region');
expect(carouselContainer).toHaveAttribute('tabindex', '0');

// MUST respond to keyboard events
fireEvent.keyDown(carouselContainer, { key: 'ArrowRight' });
// Verify slide changed
expect(onSlideChange).toHaveBeenCalledWith(1, 'forward');

fireEvent.keyDown(carouselContainer, { key: 'ArrowLeft' });
expect(onSlideChange).toHaveBeenCalledWith(0, 'backward');
```

#### 6. Responsive Behavior Contract
```tsx
// MUST adapt to different screen sizes
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 768, // Tablet size
});

render(<Services />);

// Verify mobile-specific behavior
const carousel = screen.getByTestId('services-carousel');
expect(carousel).toHaveClass('carousel-mobile');

// MUST show different number of slides per view
const visibleSlides = container.querySelectorAll('.service-card:not([aria-hidden="true"])');
expect(visibleSlides).toHaveLength(2); // 2 slides on tablet
```

#### 7. Touch/Gesture Contract
```tsx
// MUST handle touch gestures
render(<Services />);

const carousel = screen.getByTestId('services-carousel');

// Simulate swipe left (next slide)
fireEvent.touchStart(carousel, {
  touches: [{ clientX: 100, clientY: 100 }]
});
fireEvent.touchMove(carousel, {
  touches: [{ clientX: 50, clientY: 100 }]
});
fireEvent.touchEnd(carousel);

// MUST navigate to next slide
await waitFor(() => {
  expect(onSlideChange).toHaveBeenCalledWith(1, 'forward');
});

// MUST pause autoplay during touch
expect(carousel).toHaveAttribute('data-playing', 'false');
```

#### 8. Reduced Motion Contract
```tsx
// MUST respect prefers-reduced-motion
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    matches: true, // prefers-reduced-motion: reduce
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
});

render(<Services />);

const carousel = screen.getByTestId('services-carousel');
expect(carousel).toHaveAttribute('data-autoplay-enabled', 'false');
expect(carousel).toHaveAttribute('data-reduced-motion', 'true');

// MUST use instant transitions
const transitions = container.querySelectorAll('[style*="transition"]');
transitions.forEach(element => {
  expect(element.style.transitionDuration).toBe('0.01ms');
});
```

## Data Attributes Contract

### Required Data Attributes for Testing/Styling

```tsx
// Carousel container attributes
<div
  data-testid="services-carousel"
  data-autoplay={autoplay}
  data-playing={isPlaying}
  data-autoplay-enabled={isEnabled}
  data-reduced-motion={shouldReduceMotion}
  data-current-index={currentIndex}
  data-total-slides={totalSlides}
  data-interval={config.defaultInterval}
  data-pause-on-hover={config.pauseOnHover}
>

// Individual slide attributes
<div
  data-testid={`service-slide-${index}`}
  data-slide-index={index}
  data-active={index === currentIndex}
  aria-hidden={index !== currentIndex}
>

// Navigation controls
<button
  data-testid="carousel-prev"
  aria-label={t('carousel.previous')}
  disabled={!canNavigatePrev}
>

<button
  data-testid="carousel-next"
  aria-label={t('carousel.next')}
  disabled={!canNavigateNext}
>

// Progress indicators
<div
  data-testid="carousel-progress"
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin="0"
  aria-valuemax="100"
>
```

## Integration Points Contract

### 1. Existing Services Data Integration
```tsx
// MUST work with existing services data structure
const services = [
  {
    id: 'consultation',
    icon: ConsultationIcon,
    titleKey: 'services.consultation.title',
    descriptionKey: 'services.consultation.description'
  },
  // ... other services
];

// MUST render all services correctly
render(<Services />);
services.forEach((service, index) => {
  const slide = screen.getByTestId(`service-slide-${index}`);
  expect(slide).toBeInTheDocument();
  expect(screen.getByText(t(service.titleKey))).toBeInTheDocument();
});
```

### 2. i18n Integration Contract
```tsx
// MUST use existing translation keys
render(<Services />);

// Verify new translation keys are used
expect(screen.getByLabelText(t('carousel.controls.previous'))).toBeInTheDocument();
expect(screen.getByLabelText(t('carousel.controls.next'))).toBeInTheDocument();
expect(screen.getByLabelText(t('carousel.controls.playPause'))).toBeInTheDocument();

// MUST announce slide changes to screen readers
const announcement = screen.getByRole('status');
expect(announcement).toHaveTextContent(
  t('carousel.announcements.slideChanged', {
    current: 1,
    total: services.length
  })
);
```

### 3. Framer Motion Integration Contract
```tsx
// MUST use Framer Motion for animations
render(<Services />);

const slides = container.querySelectorAll('[data-slide-index]');
slides.forEach(slide => {
  // Should have motion props
  expect(slide).toHaveAttribute('style');
  // Animation variants should be applied
  expect(slide.className).toMatch(/motion-/);
});

// MUST handle animation completion
const activeSlide = container.querySelector('[data-active="true"]');
expect(activeSlide).toHaveClass('motion-slide-active');
```

### 4. Scroll Utilities Integration Contract
```tsx
// MUST integrate with existing scroll utilities
import { scrollToElement } from '@/utils/scrollUtils';

render(<Services />);

// MUST use existing scroll behavior
const carousel = screen.getByTestId('services-carousel');
const mockScrollTo = jest.spyOn(Element.prototype, 'scrollTo');

// Trigger navigation
fireEvent.click(screen.getByTestId('carousel-next'));

expect(mockScrollTo).toHaveBeenCalledWith({
  left: expect.any(Number),
  behavior: 'smooth'
});
```

## Performance Contracts

### 1. Rendering Performance Contract
```tsx
// MUST not cause unnecessary re-renders
const renderSpy = jest.fn();
const TestComponent = () => {
  renderSpy();
  return <Services />;
};

render(<TestComponent />);
const initialRenderCount = renderSpy.mock.calls.length;

// Trigger autoplay progression
await waitFor(() => {
  expect(screen.getByTestId('services-carousel')).toHaveAttribute('data-current-index', '1');
});

// Should not have caused extra re-renders of parent
expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
```

### 2. Memory Cleanup Contract
```tsx
// MUST cleanup on unmount
const { unmount } = render(<Services />);

// Start autoplay
const playButton = screen.getByLabelText(/play/i);
fireEvent.click(playButton);

// Unmount component
unmount();

// Verify cleanup (implementation specific)
// All timers cleared, event listeners removed
expect(mockClearTimeout).toHaveBeenCalled();
expect(mockRemoveEventListener).toHaveBeenCalled();
```

### 3. Bundle Size Contract
```typescript
// MUST not significantly increase bundle size
// Implementation should monitor bundle size impact
// Target: < 5KB additional gzipped
const bundleAnalysis = {
  before: '245KB',
  after: '249KB', // < 5KB increase
  newFeatureSize: '3.8KB'
};

expect(bundleAnalysis.newFeatureSize).toBeLessThan('5KB');
```

---

**Integration Test Example**:
```tsx
describe('Services Component with Autoplay', () => {
  it('should provide complete autoplay functionality', async () => {
    const onSlideChange = jest.fn();

    render(
      <Services
        autoplay={true}
        autoplayConfig={{ defaultInterval: 2000 }}
        onSlideChange={onSlideChange}
        aria-label="Medical services carousel"
      />
    );

    // Initial state
    expect(screen.getByLabelText('Medical services carousel')).toBeInTheDocument();
    expect(screen.getByTestId('services-carousel')).toHaveAttribute('data-current-index', '0');

    // Start autoplay
    const playButton = screen.getByLabelText(/play/i);
    fireEvent.click(playButton);

    // Wait for autoplay progression
    await waitFor(() => {
      expect(onSlideChange).toHaveBeenCalledWith(1, 'forward');
    }, { timeout: 2500 });

    // Test pause on hover
    const carousel = screen.getByTestId('services-carousel');
    fireEvent.mouseEnter(carousel);

    expect(carousel).toHaveAttribute('data-playing', 'false');

    // Test manual navigation
    fireEvent.click(screen.getByTestId('carousel-next'));
    expect(onSlideChange).toHaveBeenCalledWith(2, 'forward');
  });
});
```

**Contract Test Coverage**: All contracts above must have corresponding failing tests before implementation begins.
