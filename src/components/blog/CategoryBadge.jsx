import React from 'react';
import { Shield, Stethoscope, Cpu, HelpCircle } from 'lucide-react';
import { categoryConfig } from '../../data/blogPosts';

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
 */
const CategoryBadge = ({ category, size = 'md', showIcon = true }) => {
  const config = categoryConfig[category];

  if (!config) {
    // Fallback for unknown categories
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
        {category}
      </span>
    );
  }

  const Icon = iconMap[config.icon];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} ${config.bgColor} ${config.textColor} rounded-full font-medium transition-colors ${config.hoverBg}`}
      aria-label={`Categoria: ${category}`}
    >
      {showIcon && Icon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;