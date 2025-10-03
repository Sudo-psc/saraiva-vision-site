/**
 * PageTransition Component
 * Smooth page transitions for route changes
 * Jovem Profile - Modern and dynamic
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { pageTransition } from '../../../lib/animations/variants';
import { useReducedMotion } from '../../../lib/animations/hooks';

export interface PageTransitionProps {
  children: React.ReactNode;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Transition mode (default: 'wait')
   */
  mode?: 'sync' | 'wait' | 'popLayout';
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  mode = 'wait'
}) => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={location.pathname}
        className={className}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
