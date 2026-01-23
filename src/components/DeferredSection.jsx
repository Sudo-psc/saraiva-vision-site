import { useEffect, useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const DeferredSection = ({ children, className = '', rootMargin = '200px', threshold = 0.1 }) => {
  const [ref, isVisible] = useIntersectionObserver({ rootMargin, threshold });
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible && !shouldRender) {
      setShouldRender(true);
    }
  }, [isVisible, shouldRender]);

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : null}
    </div>
  );
};

export default DeferredSection;
