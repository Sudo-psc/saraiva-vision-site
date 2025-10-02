import React from 'react';
import { Shield, Stethoscope, Cpu, HelpCircle } from 'lucide-react';
import { categoryConfig } from '../../content/blog';

const iconMap = {
  'shield': Shield,
  'stethoscope': Stethoscope,
  'cpu': Cpu,
  'help-circle': HelpCircle
};

/**
 * CategoryBadge - Visual category indicator with icon and color
 * @param {string} category - Category name
 * @param {string} size - Size variant ('sm' | 'md' | 'lg')
 * @param {boolean} showIcon - Whether to show icon
 * @param {boolean} onImage - Whether badge is displayed on image (adds backdrop blur)
 */
const CategoryBadge = ({ category, size = 'md', showIcon = true, onImage = false }) => {
  const config = categoryConfig[category];

  if (!config) {
    // Fallback for unknown categories
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
        onImage
          ? 'bg-white/90 backdrop-blur-md text-gray-800 shadow-lg'
          : 'bg-gray-100 text-gray-800'
      }`}>
        {category}
      </span>
    );
  }

  const Icon = iconMap[config.icon];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Enhanced styles for badges on images
  const onImageStyles = onImage
    ? 'bg-white/95 backdrop-blur-md shadow-lg border border-white/50'
    : '';

  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} ${onImage ? onImageStyles : `${config.bgColor} ${config.hoverBg}`} ${config.textColor} rounded-full font-semibold transition-all`}
      aria-label={`Categoria: ${category}`}
    >
      {showIcon && Icon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;