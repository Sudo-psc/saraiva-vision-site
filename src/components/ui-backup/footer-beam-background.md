# FooterBeamBackground Component

A performance-optimized beam background animation system specifically designed for footer contexts. This component adapts the existing BeamBackground for footer use with brand-specific colors, reduced particle counts, and device capability detection.

## Features

- **Footer-Optimized**: Smaller beams, reduced particle count, and footer-specific sizing
- **Brand Integration**: Uses brand color palette (primary blues) with customizable color schemes
- **Performance Monitoring**: Automatic device capability detection and performance optimization
- **Accessibility**: Respects `prefers-reduced-motion` and provides graceful degradation
- **Responsive**: Adapts beam intensity and count based on screen size and device capabilities

## Usage

### Basic Usage

```jsx
import { FooterBeamBackground } from '@/components/ui/footer-beam-background';

function Footer() {
    return (
        <FooterBeamBackground>
            <footer className="py-16 px-8 bg-slate-800 text-white">
                {/* Your footer content */}
            </footer>
        </FooterBeamBackground>
    );
}
```

### Advanced Configuration

```jsx
<FooterBeamBackground 
    intensity="medium"
    colorScheme="brand"
    className="bg-slate-800"
>
    <footer>
        {/* Footer content */}
    </footer>
</FooterBeamBackground>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Footer content to render |
| `className` | `string` | - | Additional CSS classes |
| `intensity` | `'subtle' \| 'medium' \| 'strong'` | `'medium'` | Beam animation intensity |
| `colorScheme` | `'blue' \| 'purple' \| 'brand'` | `'brand'` | Color scheme for beams |

## Color Schemes

### Brand (Default)
- Primary: Hue 234 (matches #0ea5e9)
- Secondary: Hue 210
- Accent: Hue 200

### Blue
- Primary: Hue 220
- Secondary: Hue 240
- Accent: Hue 200

### Purple
- Primary: Hue 280
- Secondary: Hue 260
- Accent: Hue 300

## Performance Optimization

The component automatically optimizes performance based on:

### Device Capabilities
- **High-end devices**: Full beam count and effects
- **Medium devices**: 75% beam count, reduced opacity
- **Low-end devices**: 50% beam count, simplified effects

### Detection Criteria
- Device memory (`navigator.deviceMemory`)
- Hardware concurrency (`navigator.hardwareConcurrency`)
- Network connection type (`navigator.connection.effectiveType`)

### Performance Levels

```javascript
// Beam count by intensity and performance level
const beamCounts = {
    subtle: { high: 8, medium: 6, low: 4 },
    medium: { high: 12, medium: 9, low: 6 },
    strong: { high: 16, medium: 12, low: 8 }
};
```

## Accessibility

### Reduced Motion Support
- Automatically detects `prefers-reduced-motion: reduce`
- Disables all animations when reduced motion is preferred
- Falls back to static container

### Screen Reader Compatibility
- Uses `pointer-events: none` on animation layers
- Maintains proper z-index layering for content accessibility
- Preserves focus management for interactive elements

## Browser Support

### Modern Browsers (Full Support)
- Chrome/Edge 88+
- Firefox 87+
- Safari 14+

### Fallback Support
- Graceful degradation for older browsers
- Feature detection for `backdrop-filter`
- Canvas fallback for WebGL unavailability

## Implementation Details

### Canvas Animation
- Uses `requestAnimationFrame` for smooth 60fps animation
- Implements beam recycling to maintain consistent particle count
- Applies performance-appropriate blur filters

### Beam Properties
```javascript
interface FooterBeam {
    x: number;          // Horizontal position
    y: number;          // Vertical position
    width: number;      // Beam width (20-50px for footer)
    length: number;     // Beam length (1.5x container height)
    angle: number;      // Rotation angle (-25° to -10°)
    speed: number;      // Movement speed (0.2-0.5 for footer)
    opacity: number;    // Base opacity (0.06-0.14 for footer)
    hue: number;        // Color hue based on scheme
    pulse: number;      // Pulsing animation phase
    pulseSpeed: number; // Pulsing speed (0.015-0.035)
}
```

### Memory Management
- Automatic cleanup on component unmount
- Event listener removal for resize events
- Animation frame cancellation
- Timeout clearing for delayed initialization

## Testing

The component includes comprehensive tests covering:

- Rendering and basic functionality
- Device capability detection
- Performance optimization
- Accessibility features
- Error handling and edge cases

Run tests with:
```bash
npm test -- src/components/__tests__/FooterBeamBackground.test.jsx
```

## Performance Hook

The component can be used with the `useFooterBeamPerformance` hook for advanced performance monitoring:

```jsx
import { useFooterBeamPerformance } from '@/hooks/useFooterBeamPerformance';

function OptimizedFooter() {
    const { currentIntensity, performanceMetrics } = useFooterBeamPerformance('medium');
    
    return (
        <FooterBeamBackground intensity={currentIntensity}>
            <footer>
                {/* Content */}
                {performanceMetrics.isOptimizing && (
                    <div className="text-xs text-slate-500">
                        Optimizing performance...
                    </div>
                )}
            </footer>
        </FooterBeamBackground>
    );
}
```

## Examples

See `src/components/examples/FooterBeamExample.jsx` for complete usage examples including:
- Basic footer integration
- Interactive intensity controls
- Performance monitoring display
- Responsive design demonstrations

## Integration with Enhanced Footer

This component is designed to work seamlessly with the enhanced footer system:

```jsx
import { FooterBeamBackground } from '@/components/ui/footer-beam-background';
import { EnhancedFooter } from '@/components/EnhancedFooter';

function App() {
    return (
        <div>
            {/* Main content */}
            <FooterBeamBackground intensity="medium" colorScheme="brand">
                <EnhancedFooter />
            </FooterBeamBackground>
        </div>
    );
}
```

## Troubleshooting

### Common Issues

1. **Beams not appearing**: Check browser support for Canvas API
2. **Poor performance**: Component automatically reduces intensity on low-end devices
3. **No animation**: Verify `prefers-reduced-motion` setting
4. **Color issues**: Ensure correct color scheme prop value

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('footer-beam-debug', 'true');
```

This will log performance metrics and beam creation details to the console.