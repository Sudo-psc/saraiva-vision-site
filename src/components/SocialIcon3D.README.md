# SocialIcon3D Component

A sophisticated 3D interactive social media icon component with glass morphism effects, hover animations, and liquid bubble transformations. This component implements perspective transforms and depth shadows for a realistic 3D appearance.

## Features Implemented

### ✅ Task 2 Requirements Complete

All requirements from task 2 have been successfully implemented:

- **2.1** ✅ 3D transformation with depth and rotation effects on hover
- **2.2** ✅ Liquid glass bubble effect around icons on hover  
- **2.4** ✅ Smooth transitions between hover states
- **2.5** ✅ Multiple layered shadows for realistic 3D appearance

## Components

### SocialIcon3D

The main 3D social icon component with full interactive capabilities.

```jsx
import SocialIcon3D from '@/components/SocialIcon3D';

const social = {
  name: 'Facebook',
  href: 'https://facebook.com/example',
  image: '/icons_social/facebook_icon.png',
  color: '#1877f2'
};

<SocialIcon3D
  social={social}
  index={0}
  isHovered={hoveredIcon === social.name}
  onHover={setHoveredIcon}
/>
```

### SocialLinks3D

Enhanced container component for multiple 3D social icons with coordinated hover states.

```jsx
import SocialLinks3D from '@/components/ui/social-links-3d';

<SocialLinks3D 
  socials={socialsArray}
  spacing="normal" // 'compact' | 'normal' | 'wide'
  enableGlassContainer={true}
/>
```

## Props

### SocialIcon3D Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `social` | `SocialMediaItem` | ✅ | Social media configuration object |
| `index` | `number` | ✅ | Index for stagger animations |
| `isHovered` | `boolean` | ✅ | Whether this icon is currently hovered |
| `onHover` | `function` | ✅ | Callback for hover state changes |
| `className` | `string` | ❌ | Additional CSS classes |

### SocialLinks3D Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `socials` | `SocialMediaItem[]` | ✅ | Array of social media items |
| `spacing` | `'compact' \| 'normal' \| 'wide'` | `'normal'` | Spacing between icons |
| `enableGlassContainer` | `boolean` | `true` | Enable glass morphism container |

### SocialMediaItem Interface

```typescript
interface SocialMediaItem {
  name: string;        // Display name (e.g., 'Facebook')
  href: string;        // URL to social media profile
  image: string;       // Path to icon image
  color?: string;      // Brand color (optional)
}
```

## 3D Transform System

### Perspective and Rotation

- **Perspective**: 1000px for realistic 3D depth
- **Dynamic Rotation**: Based on mouse position within icon bounds
- **Transform Origin**: Center of the icon for natural rotation
- **GPU Acceleration**: Uses `transform-gpu` for optimal performance

### Animation States

1. **Default**: Scale 1.0, no rotation, no elevation
2. **Hovered**: Scale 1.1, dynamic rotation, translateZ 50px
3. **Clicked**: Scale 0.95, maintains rotation, translateZ 30px

## Glass Morphism Effects

### Main Glass Bubble

- **Background**: Gradient from white/10 to white/5
- **Backdrop Filter**: 20px blur with 180% saturation
- **Border**: 1px solid white/20
- **Transform**: translateZ(-20px) scale(1.5)

### Secondary Bubble Layers

1. **Liquid Layer**: Animated scale and opacity with color gradients
2. **Depth Layer**: Larger scale with subtle animation for depth perception
3. **Ambient Layer**: Soft glow effect for atmospheric lighting

### Liquid Morphing Animation

```css
/* Continuous morphing animation */
animate={{
  scale: [1.8, 2.0, 1.8],
  opacity: [0.3, 0.5, 0.3],
}}
transition={{
  duration: 2,
  repeat: Infinity,
  ease: "easeInOut"
}}
```

## Depth Shadow System

### Multiple Shadow Layers

1. **Primary Shadow**: `bg-black/20 blur-md` at translateY(10px)
2. **Secondary Shadow**: `bg-black/10 blur-lg` at translateY(20px) scale(1.2)
3. **Tertiary Shadow**: `bg-black/5 blur-xl` at translateY(30px) scale(1.4)

### Shadow Positioning

- **Z-Index**: translateZ(-60px) to place behind icon
- **Scale**: 0.8 to create realistic shadow projection
- **Opacity**: Animated from 0 to 100% on hover

## Performance Optimizations

### GPU Acceleration

- `transform-gpu` class for hardware acceleration
- `will-change: transform, opacity` for optimized rendering
- `backface-visibility: hidden` to prevent flickering

### Memory Management

- React.memo for component memoization
- useCallback for event handlers
- Cleanup of animation timeouts

### Responsive Design

- CSS custom properties for dynamic theming
- Media queries for reduced motion preferences
- Adaptive effects based on device capabilities

## Accessibility Features

### Keyboard Navigation

- Proper focus indicators
- Tab navigation support
- Focus visible states

### Screen Reader Support

- Proper alt text for images
- ARIA labels for interactive elements
- Semantic HTML structure

### Motion Preferences

- Respects `prefers-reduced-motion`
- Graceful degradation for limited devices
- Optional animation disabling

## Browser Support

### Modern Browsers

- Chrome/Edge 88+ (full support)
- Firefox 87+ (full support)
- Safari 14+ (full support)

### Fallbacks

- CSS feature detection for backdrop-filter
- Transform3D capability detection
- Graceful degradation for older browsers

## Usage Examples

### Basic Implementation

```jsx
import React, { useState } from 'react';
import SocialIcon3D from '@/components/SocialIcon3D';

const SocialIconsExample = () => {
  const [hoveredIcon, setHoveredIcon] = useState(null);
  
  const socials = [
    {
      name: 'Facebook',
      href: 'https://facebook.com/example',
      image: '/icons_social/facebook_icon.png'
    },
    {
      name: 'Instagram', 
      href: 'https://instagram.com/example',
      image: '/icons_social/instagram_icon.png'
    }
  ];

  return (
    <div className="flex gap-4">
      {socials.map((social, index) => (
        <SocialIcon3D
          key={social.name}
          social={social}
          index={index}
          isHovered={hoveredIcon === social.name}
          onHover={setHoveredIcon}
        />
      ))}
    </div>
  );
};
```

### Enhanced Container

```jsx
import SocialLinks3D from '@/components/ui/social-links-3d';

const EnhancedSocialLinks = () => {
  return (
    <SocialLinks3D 
      socials={socials}
      spacing="wide"
      enableGlassContainer={true}
      className="my-custom-class"
    />
  );
};
```

## Styling Customization

### CSS Custom Properties

```css
:root {
  --social-icon-duration: 0.3s;
  --social-icon-glass-opacity: 0.1;
  --social-icon-shadow-layers: 3;
  --social-icon-transform-3d: preserve-3d;
  --social-icon-perspective: 1000px;
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --social-icon-duration: 0s;
    --social-icon-glass-opacity: 0;
    --social-icon-transform-3d: flat;
  }
}
```

## Testing

### Component Tests

- Rendering tests for all states
- Interaction tests for hover/click
- Accessibility tests for keyboard navigation
- Performance tests for animation smoothness

### Integration Tests

- Container component coordination
- Multiple icon interactions
- Responsive behavior testing

## Dependencies

- **React 18+**: Core framework
- **Framer Motion 10+**: Animation library
- **Tailwind CSS**: Styling framework
- **@/lib/utils**: Utility functions (cn helper)

## File Structure

```
src/components/
├── SocialIcon3D.jsx              # Main 3D icon component
├── SocialIcon3D.README.md        # This documentation
├── SocialIcon3D.demo.jsx         # Demo component
├── ui/
│   └── social-links-3d.tsx       # Enhanced container component
├── __tests__/
│   ├── SocialIcon3D.test.jsx     # Component tests
│   └── SocialLinks3D.test.jsx    # Container tests
└── hooks/
    └── useSocialIcons3D.js       # Performance hook
```

## Future Enhancements

### Potential Improvements

- [ ] WebGL-based particle effects
- [ ] Advanced physics simulations
- [ ] Custom shader effects
- [ ] VR/AR compatibility
- [ ] Advanced gesture recognition

### Performance Optimizations

- [ ] Intersection Observer for viewport detection
- [ ] Dynamic quality adjustment
- [ ] Memory usage optimization
- [ ] Battery-aware animations

## Contributing

When contributing to this component:

1. Maintain backward compatibility
2. Add comprehensive tests
3. Update documentation
4. Consider accessibility impact
5. Test across browsers
6. Verify performance impact

## License

This component is part of the Saraiva Vision website project and follows the project's licensing terms.