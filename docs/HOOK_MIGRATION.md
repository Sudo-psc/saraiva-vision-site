# Next.js Hook & Component Migration Guide

## Migration Summary

Successfully migrated custom React hooks and icon components to Next.js with TypeScript support.

### Migrated Files

1. **useAutoplayCarousel Hook**
   - Source: `src/hooks/useAutoplayCarousel.js`
   - Destination: `hooks/useAutoplayCarousel.ts`
   - Status: ✅ Migrated with full TypeScript types

2. **ServiceIcons Component**
   - Source: `src/components/icons/ServiceIcons.jsx`
   - Destination: `components/icons/ServiceIcons.tsx`
   - Status: ✅ Migrated with full TypeScript types

3. **Type Definitions**
   - New: `types/carousel.ts`
   - Status: ✅ Created shared types

---

## 1. useAutoplayCarousel Hook

### Overview
A comprehensive carousel autoplay hook with accessibility features, reduced motion support, and extensive configuration options.

### Features
- ✅ Automatic slide transitions with configurable intervals
- ✅ Manual controls (next, previous, goTo)
- ✅ Pause on hover/focus
- ✅ Reduced motion support
- ✅ Page visibility detection
- ✅ Progress tracking
- ✅ TypeScript support
- ✅ Next.js Client Component compatible

### Type Definitions

```typescript
interface AutoplayConfig {
  defaultInterval: number;
  transitionDuration: number;
  resumeDelay: number;
  manualResetDelay: number;
  pauseOnHover: boolean;
  pauseOnFocus: boolean;
  respectReducedMotion: boolean;
  resetOnManualNav: boolean;
  enableAriaLive: boolean;
  enableKeyboardControls: boolean;
  disableOnInactiveTab: boolean;
  useReducedMotion: boolean;
}

type Direction = 'forward' | 'backward';

interface UseAutoplayCarouselParams {
  totalSlides?: number;
  config?: Partial<AutoplayConfig>;
  onSlideChange?: (index: number, direction: Direction) => void;
  initialIndex?: number;
}

interface UseAutoplayCarouselReturn {
  currentIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isEnabled: boolean;
  direction: Direction;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
  handlers: CarouselHandlers;
  updateConfig: (newConfig: Partial<AutoplayConfig>) => void;
  config: AutoplayConfig;
  progress: number;
  timeRemaining: number;
}
```

### Usage Examples

#### Basic Usage

```tsx
'use client';

import { useAutoplayCarousel } from '@/hooks/useAutoplayCarousel';

export default function SimpleCarousel() {
  const slides = ['Slide 1', 'Slide 2', 'Slide 3'];
  
  const {
    currentIndex,
    isPlaying,
    handlers,
    next,
    previous,
    toggle
  } = useAutoplayCarousel({
    totalSlides: slides.length,
    initialIndex: 0
  });

  return (
    <div {...handlers}>
      <div className="carousel-content">
        {slides[currentIndex]}
      </div>
      
      <div className="controls">
        <button onClick={previous}>Previous</button>
        <button onClick={toggle}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={next}>Next</button>
      </div>
    </div>
  );
}
```

#### Advanced Usage with Custom Configuration

```tsx
'use client';

import { useAutoplayCarousel } from '@/hooks/useAutoplayCarousel';
import type { AutoplayConfig } from '@/hooks/useAutoplayCarousel';

export default function AdvancedCarousel() {
  const slides = [
    { id: 1, title: 'Slide 1', image: '/img/slide1.jpg' },
    { id: 2, title: 'Slide 2', image: '/img/slide2.jpg' },
    { id: 3, title: 'Slide 3', image: '/img/slide3.jpg' }
  ];

  const customConfig: Partial<AutoplayConfig> = {
    defaultInterval: 5000,
    pauseOnHover: true,
    pauseOnFocus: true,
    respectReducedMotion: true,
    disableOnInactiveTab: true
  };

  const {
    currentIndex,
    isPlaying,
    direction,
    progress,
    handlers,
    goTo,
    play,
    pause
  } = useAutoplayCarousel({
    totalSlides: slides.length,
    config: customConfig,
    initialIndex: 0,
    onSlideChange: (index, dir) => {
      console.log(`Slide changed to ${index}, direction: ${dir}`);
    }
  });

  return (
    <div className="carousel" {...handlers}>
      {/* Progress bar */}
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide content */}
      <div className="slide">
        <img src={slides[currentIndex].image} alt={slides[currentIndex].title} />
        <h2>{slides[currentIndex].title}</h2>
      </div>

      {/* Indicators */}
      <div className="indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={currentIndex === index ? 'active' : ''}
          />
        ))}
      </div>

      {/* Controls */}
      <button onClick={pause} disabled={!isPlaying}>
        Pause
      </button>
      <button onClick={play} disabled={isPlaying}>
        Play
      </button>
    </div>
  );
}
```

#### With TypeScript Strict Mode

```tsx
'use client';

import { useAutoplayCarousel } from '@/hooks/useAutoplayCarousel';
import type { 
  UseAutoplayCarouselParams, 
  Direction 
} from '@/hooks/useAutoplayCarousel';

interface Slide {
  id: number;
  title: string;
  content: string;
}

export default function TypeSafeCarousel() {
  const slides: Slide[] = [
    { id: 1, title: 'First', content: 'Content 1' },
    { id: 2, title: 'Second', content: 'Content 2' },
    { id: 3, title: 'Third', content: 'Content 3' }
  ];

  const handleSlideChange = (index: number, direction: Direction): void => {
    console.log(`Changed to slide ${index} going ${direction}`);
  };

  const params: UseAutoplayCarouselParams = {
    totalSlides: slides.length,
    config: {
      defaultInterval: 4500,
      pauseOnHover: true
    },
    onSlideChange: handleSlideChange,
    initialIndex: 0
  };

  const carousel = useAutoplayCarousel(params);

  return (
    <div {...carousel.handlers}>
      <h2>{slides[carousel.currentIndex].title}</h2>
      <p>{slides[carousel.currentIndex].content}</p>
    </div>
  );
}
```

---

## 2. ServiceIcons Component

### Overview
Collection of service icon components for ophthalmology services with i18n support.

### Features
- ✅ 12 pre-built service icons
- ✅ WebP image optimization
- ✅ Lazy loading support
- ✅ i18n integration
- ✅ TypeScript support
- ✅ Configurable className
- ✅ Icon mapping utilities

### Type Definitions

```typescript
interface ServiceIconProps {
  className?: string;
}

type ServiceIconType = React.FC<ServiceIconProps>;
```

### Available Icons

1. `ConsultationIcon` - Consultas Oftalmológicas
2. `RefractionIcon` - Exames de Refração
3. `SpecializedIcon` - Tratamentos Especializados
4. `SurgeryIcon` - Cirurgias Oftalmológicas
5. `PediatricIcon` - Acompanhamento Pediátrico
6. `ReportsIcon` - Laudos Especializados
7. `GonioscopyIcon` - Gonioscopia
8. `RetinaMappingIcon` - Mapeamento de Retina
9. `CornealTopographyIcon` - Topografia Corneana
10. `PachymetryIcon` - Paquimetria
11. `RetinographyIcon` - Retinografia
12. `VisualFieldIcon` - Campo Visual

### Usage Examples

#### Direct Icon Import

```tsx
'use client';

import { ConsultationIcon, SurgeryIcon } from '@/components/icons/ServiceIcons';

export default function ServicesPage() {
  return (
    <div className="services">
      <div className="service-item">
        <ConsultationIcon className="h-12 w-12" />
        <h3>Consultas</h3>
      </div>
      
      <div className="service-item">
        <SurgeryIcon className="h-12 w-12" />
        <h3>Cirurgias</h3>
      </div>
    </div>
  );
}
```

#### Using Icon Map

```tsx
'use client';

import { serviceIconMap } from '@/components/icons/ServiceIcons';
import type { ServiceIconType } from '@/components/icons/ServiceIcons';

export default function DynamicServices() {
  const services = [
    { id: 'consultas-oftalmologicas', name: 'Consultas' },
    { id: 'cirurgias-oftalmologicas', name: 'Cirurgias' },
    { id: 'exames-de-refracao', name: 'Exames' }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {services.map(service => {
        const IconComponent: ServiceIconType | undefined = serviceIconMap[service.id];
        
        return (
          <div key={service.id} className="service-card">
            {IconComponent && <IconComponent className="h-16 w-16" />}
            <h3>{service.name}</h3>
          </div>
        );
      })}
    </div>
  );
}
```

#### Using getServiceIcon Helper

```tsx
'use client';

import { getServiceIcon } from '@/components/icons/ServiceIcons';

interface Service {
  id: string;
  title: string;
  description: string;
}

export default function ServiceList({ services }: { services: Service[] }) {
  return (
    <div className="service-list">
      {services.map(service => (
        <div key={service.id} className="flex items-center gap-4">
          {getServiceIcon(service.id, { className: 'h-10 w-10' })}
          <div>
            <h4>{service.title}</h4>
            <p>{service.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Custom Styling

```tsx
'use client';

import { PediatricIcon, RetinographyIcon } from '@/components/icons/ServiceIcons';

export default function StyledIcons() {
  return (
    <div className="flex gap-6">
      <PediatricIcon className="h-20 w-20 opacity-80 hover:opacity-100 transition-opacity" />
      <RetinographyIcon className="h-20 w-20 grayscale hover:grayscale-0 transition-all" />
    </div>
  );
}
```

---

## Dependencies

### Required Dependencies
- `react` ^18.2.0
- `react-dom` ^18.2.0
- `next` ^15.5.4
- `framer-motion` ^12.23.19 (for useAutoplayCarousel)
- `react-i18next` ^14.1.3 (for ServiceIcons)

### Dev Dependencies
- `typescript` ^5.9.2
- `@types/react` ^19.1.13
- `@types/react-dom` ^19.1.9

---

## Migration Checklist

- [x] Convert JavaScript to TypeScript
- [x] Add proper type definitions
- [x] Add 'use client' directive for Next.js client components
- [x] Ensure compatibility with Next.js 15+
- [x] Maintain all original functionality
- [x] Add JSDoc comments (not added per project guidelines)
- [x] Export all types for external use
- [x] Update imports to use `@/` alias
- [x] Validate with TypeScript strict mode
- [x] Create usage documentation

---

## Notes

1. **Client Components**: Both files use `'use client'` directive as they rely on React hooks and browser APIs
2. **Type Safety**: All functions and components have explicit type definitions
3. **Backwards Compatibility**: API remains unchanged from original JavaScript versions
4. **Performance**: No performance degradation; TypeScript is compiled away at build time
5. **Accessibility**: useAutoplayCarousel respects `prefers-reduced-motion`

---

## Next Steps

1. Update existing components to import from new locations:
   ```tsx
   // Old
   import { useAutoplayCarousel } from '@/src/hooks/useAutoplayCarousel';
   
   // New
   import { useAutoplayCarousel } from '@/hooks/useAutoplayCarousel';
   ```

2. Add type annotations to consuming components
3. Consider creating unit tests with TypeScript
4. Update documentation in component files (if needed)
