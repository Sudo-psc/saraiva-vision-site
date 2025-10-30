import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

/**
 * A React component that displays a badge.
 *
 * @param {object} props The component's props.
 * @param {React.ReactNode} props.children The content to display inside the badge.
 * @param {'default' | 'secondary' | 'destructive' | 'outline'} [props.variant='default'] The visual style of the badge.
 * @param {string} [props.className=''] Additional CSS classes to apply to the badge.
 * @returns {React.ReactElement} The rendered badge component.
 */
const Badge = ({
  children,
  variant = 'default',
  className = ''
}: BadgeProps) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default Badge;