import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0 shadow-3d hover:shadow-3d-hover',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/25',
        cta: 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-orange-500/30 font-bold',
        medical: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/30',
        success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-green-500/30',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border-2 border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-blue-500 hover:text-blue-800',
        secondary: 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200',
        ghost: 'text-slate-800 hover:bg-slate-100 hover:text-slate-900',
        link: 'text-blue-700 underline-offset-4 hover:underline hover:text-blue-800',
        gradient: 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white hover:from-blue-700 hover:via-purple-700 hover:to-blue-900 hover:shadow-purple-500/30',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-lg px-4 text-sm',
        lg: 'h-14 rounded-xl px-10 text-base font-semibold',
        xl: 'h-16 rounded-2xl px-12 text-lg font-bold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
