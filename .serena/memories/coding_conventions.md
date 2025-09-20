# Coding Conventions - Saraiva Vision Site

## File Organization
- **Components**: `src/components/` - React components
- **Pages**: `src/pages/` - Page-level components with lazy loading
- **Utils**: `src/utils/` - Utility functions and helpers
- **Hooks**: `src/hooks/` - Custom React hooks
- **Config**: `src/config/` - Configuration files
- **Types**: `src/types/` - TypeScript type definitions
- **Styles**: `src/styles/` - CSS and styling files
- **Locales**: `src/locales/` - Internationalization files

## Naming Conventions
- **Components**: PascalCase (e.g., `HomePageLayout.jsx`, `ContactPage.jsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **CSS Classes**: Tailwind utility classes

## Code Style
- **Language**: JavaScript (JSX) with some TypeScript
- **Module System**: ES6 modules (`import`/`export`)
- **Component Style**: Functional components with hooks
- **Code Splitting**: Lazy loading for pages (`React.lazy()`)
- **Aliases**: `@/` for `src/` directory

## React Patterns
- Functional components with hooks
- Lazy loading for route-level components
- Context providers for global state (WidgetProvider)
- Custom hooks for reusable logic
- Suspense boundaries for lazy components

## Dependencies
- **UI Framework**: React 18.2.0
- **UI Components**: Radix UI with custom styling
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Routing**: React Router DOM v6
- **Internationalization**: i18next
- **Build Tool**: Vite

## Component Structure
```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

function ComponentName() {
  const { t } = useTranslation();
  
  return (
    <div className="tailwind-classes">
      {/* Component content */}
    </div>
  );
}

export default ComponentName;
```

## Performance Considerations
- Code splitting at route level
- Manual chunk splitting in Vite config
- Lazy loading for non-critical components
- Service Worker with Workbox for caching
- Image optimization with Sharp