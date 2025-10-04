import * as React from "react";
import { cn } from "@/lib/utils";

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={decorative ? 'presentation' : 'separator'}
        aria-orientation={orientation}
        className={cn(
          orientation === 'horizontal'
            ? 'h-px w-full'
            : 'w-px h-full',
          'bg-slate-200',
          className
        )}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider };
