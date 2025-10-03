'use client';

import React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ children, variant = 'default', className = '', ...props }, ref) => {
    const getVariantClasses = (variant: string): string => {
      switch (variant) {
        case 'destructive':
          return 'bg-red-50 border-red-200 text-red-800';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        case 'success':
          return 'bg-green-50 border-green-200 text-green-800';
        default:
          return 'bg-blue-50 border-blue-200 text-blue-800';
      }
    };

    return (
      <div
        ref={ref}
        className={`p-4 rounded-lg border ${getVariantClasses(variant)} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`text-sm ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };
