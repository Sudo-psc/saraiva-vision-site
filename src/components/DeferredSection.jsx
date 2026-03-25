import { useEffect, useState, useMemo } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const DeferredSection = ({ children, className = '', rootMargin: propRootMargin, threshold = 0.1 }) => {
  // Use smaller rootMargin on mobile to delay loading until closer to viewport
  const rootMargin = useMemo(() => {
    if (propRootMargin) return propRootMargin;
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return '100px'; // Mobile default
    }
    return '200px'; // Desktop default
  }, [propRootMargin]);

  const [ref, isVisible] = useIntersectionObserver({ rootMargin, threshold });
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible && !shouldRender) {
      setShouldRender(true);
    }
  }, [isVisible, shouldRender]);

  return (
    <div
      ref={ref}
      className={className}
      style={shouldRender ? { contentVisibility: 'auto' } : { contain: 'layout' }}
    >
      {shouldRender ? children : null}
    </div>
  );
};

export default DeferredSection;
