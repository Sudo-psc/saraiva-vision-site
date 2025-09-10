# Quickstart: Autoplay do Carrossel de Serviços

**Date**: 2025-09-10 | **Phase 1** | **Feature**: 001-autoplay-dos-cards

## Quick Demo & Validation

Este quickstart demonstra e valida todas as funcionalidades de autoplay implementadas no carrossel de serviços.

### Prerequisites

```bash
# 1. Ensure you're on the feature branch
git checkout 001-autoplay-dos-cards

# 2. Install dependencies (if not done)
npm install

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:5173
```

### Test Scenarios (Manual Validation)

#### Scenario 1: Basic Autoplay Functionality ⏯️

**Steps**:
1. Navigate to homepage (`/`)
2. Scroll to Services section
3. Observe carousel without interaction

**Expected Behavior**:
- ✅ Autoplay starts automatically after 1 second
- ✅ Slides advance every 4.5 seconds
- ✅ Smooth transitions with fade/slide effect
- ✅ Wraps to first slide after last slide
- ✅ Progress indicator shows timing

**Validation Commands**:
```javascript
// Open browser DevTools Console and run:

// Check if autoplay is active
const carousel = document.querySelector('[data-testid="services-carousel"]');
console.log('Autoplay enabled:', carousel.dataset.autoplayEnabled);
console.log('Currently playing:', carousel.dataset.playing);

// Monitor slide changes
let slideCount = 0;
const observer = new MutationObserver(() => {
  slideCount++;
  console.log(`Slide changed ${slideCount} times. Current: ${carousel.dataset.currentIndex}`);
});
observer.observe(carousel, { attributes: true, attributeFilter: ['data-current-index'] });
```

#### Scenario 2: Hover Pause Interaction 🖱️

**Steps**:
1. Start autoplay (from Scenario 1)
2. Hover mouse over any service card
3. Wait 3 seconds while hovering
4. Move mouse away from carousel
5. Wait for autoplay to resume

**Expected Behavior**:
- ✅ Autoplay pauses immediately on hover
- ✅ No slide transitions while hovering
- ✅ Visual indicator shows paused state
- ✅ Autoplay resumes 1 second after mouse leaves
- ✅ Timer resets (full interval before next slide)

**Validation Commands**:
```javascript
// Test hover behavior
const carousel = document.querySelector('[data-testid="services-carousel"]');
const serviceCard = document.querySelector('.service-card');

// Monitor pause/resume events
carousel.addEventListener('mouseover', () => console.log('Hover: Paused'));
carousel.addEventListener('mouseleave', () => console.log('Leave: Will resume in 1s'));

// Check pause state
console.log('Paused on hover:', carousel.dataset.playing === 'false');
```

#### Scenario 3: Manual Navigation Override 🔄

**Steps**:
1. Start autoplay
2. Click "Next" button or use right arrow key
3. Immediately click "Previous" button or left arrow key
4. Wait and observe timing reset

**Expected Behavior**:
- ✅ Manual navigation works instantly
- ✅ Autoplay pauses during manual interaction
- ✅ Timer resets to full interval after manual navigation
- ✅ Direction updates correctly (forward/backward)
- ✅ Keyboard navigation works (Arrow keys, Tab)

**Validation Commands**:
```javascript
// Test manual navigation
const nextBtn = document.querySelector('[data-testid="carousel-next"]');
const prevBtn = document.querySelector('[data-testid="carousel-prev"]');

// Monitor navigation events
nextBtn.addEventListener('click', () => console.log('Manual: Next clicked'));
prevBtn.addEventListener('click', () => console.log('Manual: Previous clicked'));

// Test keyboard navigation
const carousel = document.querySelector('[data-testid="services-carousel"]');
carousel.focus();
// Then press Arrow keys
console.log('Keyboard focus ready - try Arrow keys');
```

#### Scenario 4: Accessibility Compliance ♿

**Steps**:
1. Enable screen reader (if available)
2. Tab navigate to Services section
3. Use keyboard to navigate slides
4. Check reduced motion settings

**Expected Behavior**:
- ✅ Screen reader announces slide changes
- ✅ Tab navigation reaches all controls
- ✅ ARIA labels are descriptive
- ✅ Respects `prefers-reduced-motion: reduce`
- ✅ Focus management works correctly

**Validation Commands**:
```javascript
// Check accessibility attributes
const carousel = document.querySelector('[data-testid="services-carousel"]');
console.log('ARIA label:', carousel.getAttribute('aria-label'));
console.log('ARIA live:', carousel.getAttribute('aria-live'));
console.log('Tab index:', carousel.getAttribute('tabindex'));

// Check reduced motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
console.log('Prefers reduced motion:', prefersReduced);
console.log('Autoplay disabled due to preference:', carousel.dataset.reducedMotion);

// Test ARIA announcements
const liveRegion = document.querySelector('[aria-live="polite"]');
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      console.log('ARIA announcement:', mutation.target.textContent);
    }
  });
});
observer.observe(liveRegion, { childList: true, subtree: true });
```

#### Scenario 5: Mobile Touch Gestures 📱

**Steps (on mobile device or DevTools mobile simulation)**:
1. Open DevTools → Toggle device simulation
2. Choose mobile device (iPhone/Android)
3. Navigate to Services section
4. Swipe left/right on carousel
5. Pinch to zoom and test interaction

**Expected Behavior**:
- ✅ Swipe left advances to next slide
- ✅ Swipe right goes to previous slide
- ✅ Touch interactions pause autoplay
- ✅ Smooth touch animations
- ✅ Proper touch targets (44px minimum)

**Validation Commands**:
```javascript
// Simulate touch events for testing
const carousel = document.querySelector('[data-testid="services-carousel"]');

// Monitor touch events
['touchstart', 'touchmove', 'touchend'].forEach(event => {
  carousel.addEventListener(event, (e) => {
    console.log(`Touch event: ${event}`, e.touches.length);
  });
});

// Check touch targets size
const touchTargets = document.querySelectorAll('[data-testid*="carousel-"]');
touchTargets.forEach(target => {
  const rect = target.getBoundingClientRect();
  console.log(`Target size: ${rect.width}x${rect.height}px`);
});
```

#### Scenario 6: Performance Validation ⚡

**Steps**:
1. Open DevTools → Performance tab
2. Start recording
3. Let autoplay run for 30 seconds
4. Stop recording and analyze

**Expected Behavior**:
- ✅ No memory leaks visible
- ✅ Consistent 60fps during transitions
- ✅ No layout thrashing
- ✅ Minimal CPU usage during idle
- ✅ No console errors

**Validation Commands**:
```javascript
// Monitor performance
let frameCount = 0;
let lastTime = performance.now();

function monitorFPS() {
  frameCount++;
  const currentTime = performance.now();

  if (currentTime - lastTime >= 1000) {
    console.log(`FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = currentTime;
  }

  requestAnimationFrame(monitorFPS);
}
monitorFPS();

// Monitor memory usage (Chrome DevTools)
console.log('Memory usage:', performance.memory);

// Check for errors
window.addEventListener('error', (e) => {
  console.error('JavaScript error:', e.message);
});
```

### API Usage Examples

#### Basic Usage (Default Configuration)
```jsx
// Minimal setup - uses all defaults
import { Services } from '@/components/Services';

function HomePage() {
  return (
    <main>
      <Services />
    </main>
  );
}
```

#### Custom Configuration
```jsx
// Custom autoplay settings
import { Services } from '@/components/Services';

function HomePage() {
  const handleSlideChange = (index, direction) => {
    console.log(`Slide ${index} (${direction})`);

    // Analytics tracking
    gtag('event', 'carousel_navigation', {
      slide_index: index,
      direction: direction,
      component: 'services'
    });
  };

  return (
    <Services
      autoplay={true}
      autoplayConfig={{
        defaultInterval: 6000,      // 6 seconds between slides
        pauseOnHover: true,         // Pause on hover
        resumeDelay: 1500,          // 1.5s delay before resuming
        respectReducedMotion: true  // Honor accessibility preferences
      }}
      onSlideChange={handleSlideChange}
      aria-label="Available medical services"
    />
  );
}
```

#### Disabled Autoplay
```jsx
// Manual control only
import { Services } from '@/components/Services';

function HomePage() {
  return (
    <Services
      autoplay={false}
      aria-label="Medical services (manual navigation)"
    />
  );
}
```

#### Hook Usage (Advanced)
```jsx
// Using the hook directly for custom implementations
import { useAutoplayCarousel } from '@/hooks/useAutoplayCarousel';

function CustomCarousel({ items }) {
  const carousel = useAutoplayCarousel({
    totalSlides: items.length,
    config: {
      defaultInterval: 5000,
      pauseOnHover: true
    },
    onSlideChange: (index, direction) => {
      console.log(`Custom carousel: ${index} (${direction})`);
    }
  });

  return (
    <div {...carousel.handlers}>
      <div className="carousel-content">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={index === carousel.currentIndex ? 'active' : 'hidden'}
          >
            {item.content}
          </div>
        ))}
      </div>

      <div className="carousel-controls">
        <button onClick={carousel.previous}>Previous</button>
        <button onClick={carousel.toggle}>
          {carousel.isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={carousel.next}>Next</button>
      </div>

      <div className="carousel-progress">
        Progress: {Math.round(carousel.progress * 100)}%
      </div>
    </div>
  );
}
```

### Testing Commands

#### Run Automated Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testNamePattern="autoplay"
npm test -- --testNamePattern="Services"
npm test -- --testNamePattern="useAutoplayCarousel"

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run accessibility tests
npm run test:a11y
```

#### Lint and Format
```bash
# Check code style
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

#### Build and Deploy
```bash
# Production build
npm run build

# Preview production build
npm run preview

# Deploy to local nginx (if configured)
npm run deploy:local
```

### Success Criteria Validation

**✅ All scenarios above pass without errors**
**✅ Lighthouse accessibility score remains 100**
**✅ No console errors or warnings**
**✅ Performance metrics remain within targets**
**✅ All automated tests pass**
**✅ Visual design matches existing components**

### Troubleshooting

#### Common Issues

**1. Autoplay not starting**
```javascript
// Debug autoplay state
const carousel = document.querySelector('[data-testid="services-carousel"]');
console.log({
  enabled: carousel.dataset.autoplayEnabled,
  playing: carousel.dataset.playing,
  reducedMotion: carousel.dataset.reducedMotion,
  totalSlides: carousel.dataset.totalSlides
});
```

**2. Animations not smooth**
```javascript
// Check for performance issues
console.log('GPU acceleration:', window.getComputedStyle(carousel).transform);
console.log('Will-change property:', window.getComputedStyle(carousel).willChange);
```

**3. Accessibility issues**
```javascript
// Validate ARIA attributes
const a11yChecker = {
  hasLabel: !!carousel.getAttribute('aria-label'),
  hasLive: !!carousel.getAttribute('aria-live'),
  hasFocus: carousel.tabIndex !== -1,
  announcements: document.querySelector('[aria-live]')?.textContent
};
console.log('Accessibility check:', a11yChecker);
```

#### Reset to Clean State
```bash
# Reset git state
git checkout -- .

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear dev server cache
rm -rf .vite
npm run dev
```

---

**Next Steps**: After validation, proceed to `/tasks` command to generate implementation tasks.

**Time Estimate**: 15-20 minutes for complete validation
**Prerequisites**: React dev environment, modern browser with DevTools
