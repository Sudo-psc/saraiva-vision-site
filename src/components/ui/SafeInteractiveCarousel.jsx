import React from 'react';
import InteractiveCarousel from './InteractiveCarousel';

/**
 * SafeInteractiveCarousel - Wrapper component that safely handles empty items
 * Prevents errors when items array is undefined, null or empty
 */
const SafeInteractiveCarousel = ({ items, ...props }) => {
  // Safely handle undefined, null or empty items
  const safeItems = React.useMemo(() => {
    if (!items) {
      console.warn('SafeInteractiveCarousel: items is undefined or null');
      return [];
    }
    
    if (!Array.isArray(items)) {
      console.warn('SafeInteractiveCarousel: items is not an array:', items);
      return [];
    }
    
    if (items.length === 0) {
      console.info('SafeInteractiveCarousel: items array is empty');
    }
    
    return items;
  }, [items]);
  
  // Don't render carousel if there are no items
  if (safeItems.length === 0) {
    // Return a placeholder or null depending on your needs
    if (props.showEmptyState) {
      return (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <p>{props.emptyStateMessage || 'Nenhum item disponível no momento'}</p>
        </div>
      );
    }
    return null;
  }
  
  // Render the carousel with safe items
  return <InteractiveCarousel items={safeItems} {...props} />;
};

SafeInteractiveCarousel.displayName = 'SafeInteractiveCarousel';

export default SafeInteractiveCarousel;