import React, { useState, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ children, value = '', onValueChange, placeholder = 'Select an option', className = '' }, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue) => {
    onValueChange?.(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={!value ? 'text-muted-foreground' : ''}>
          {value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {React.Children.map(children, (child) =>
              React.cloneElement(child, {
                onClick: () => handleSelect(child.props.value),
                selected: value === child.props.value
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

const SelectTrigger = forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`
        flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background
        placeholder:text-muted-foreground
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  );
});

SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = forwardRef(({ placeholder = '', className = '', ...props }, ref) => {
  return (
    <span ref={ref} className={`block truncate ${className}`} {...props}>
      {placeholder}
    </span>
  );
});

SelectValue.displayName = 'SelectValue';

const SelectContent = ({ children }) => {
  return <div className="p-1">{children}</div>;
};

const SelectItem = forwardRef(({ className = '', children, selected = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`
        relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none
        hover:bg-accent hover:text-accent-foreground
        focus:bg-accent focus:text-accent-foreground
        data-[disabled]:pointer-events-none data-[disabled]:opacity-50
        ${selected ? 'bg-accent text-accent-foreground' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {selected && <div className="w-2 h-2 bg-current rounded-full" />}
      </span>
      {children}
    </div>
  );
});

SelectItem.displayName = 'SelectItem';

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};