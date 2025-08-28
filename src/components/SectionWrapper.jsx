import React from 'react';
import { motion } from 'framer-motion';

/**
 * SectionWrapper - Design System compliant section component
 * Implements content structure guidelines:
 * - Single headline per section
 * - One short paragraph (max 70 characters)
 * - Clear CTAs when needed
 * - 8pt spacing system
 * - Proper typography hierarchy
 */
const SectionWrapper = ({ 
  id,
  children,
  title,
  subtitle,
  overline,
  cta,
  className = "",
  spacing = "section", // section-sm, section, section-lg, section-xl, section-2xl
  background = "bg-white",
  maxWidth = "max-w-4xl",
  titleLevel = "h2", // h1, h2, h3, h4, h5, h6
  centerContent = true,
  titleSize = "heading-xl md:text-display-sm", // Use design tokens
  ...props
}) => {
  const TitleComponent = titleLevel;
  
  const spacingClass = `py-${spacing}`;
  const contentAlignment = centerContent ? "text-center" : "text-left";
  
  return (
    <section 
      id={id}
      className={`${spacingClass} ${background} ${className}`}
      {...props}
    >
      <div className="container mx-auto px-4 md:px-6">
        {(title || subtitle || overline) && (
          <div className={`${contentAlignment} mb-16 md:mb-24`}>
            {overline && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-overline font-medium mb-6 w-fit mx-auto"
              >
                {overline}
              </motion.div>
            )}
            
            {title && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <TitleComponent className={`text-${titleSize} font-bold leading-tight mb-6`}>
                  {title}
                </TitleComponent>
              </motion.div>
            )}
            
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`text-body-xl leading-loose ${maxWidth} mx-auto text-slate-600`}
              >
                {subtitle}
              </motion.p>
            )}
            
            {cta && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8"
              >
                {cta}
              </motion.div>
            )}
          </div>
        )}
        
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SectionWrapper;
