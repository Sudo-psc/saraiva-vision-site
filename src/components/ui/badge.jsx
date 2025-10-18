import React from 'react';

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
    const getVariantClasses = (variant) => {
        switch (variant) {
            case 'success':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'destructive':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'outline':
                return 'bg-transparent text-gray-700 border-gray-300';
            case 'secondary':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-blue-100 text-cyan-800 border-cyan-200';
        }
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(variant)} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
};

export { Badge };