import React from 'react';

const Alert = ({ children, variant = 'default', className = '', ...props }) => {
    const getVariantClasses = (variant) => {
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
            className={`p-4 rounded-lg border ${getVariantClasses(variant)} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

const AlertDescription = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`text-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export { Alert, AlertDescription };