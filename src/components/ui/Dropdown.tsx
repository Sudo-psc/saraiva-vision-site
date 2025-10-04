'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  position?: 'bottom' | 'top' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
  menuClassName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  position = 'bottom',
  align = 'start',
  className = '',
  menuClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled || item.separator) return;
    
    item.onClick?.();
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentId: string) => {
    const enabledItems = items.filter(item => !item.disabled && !item.separator);
    const currentIndex = enabledItems.findIndex(item => item.id === currentId);
    
    let nextIndex = currentIndex;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % enabledItems.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = currentIndex === 0 ? enabledItems.length - 1 : currentIndex - 1;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = enabledItems.length - 1;
    } else {
      return;
    }

    const nextItem = enabledItems[nextIndex];
    if (nextItem) {
      itemRefs.current[nextItem.id]?.focus();
    }
  };

  const positionClasses = {
    bottom: 'top-full mt-2',
    top: 'bottom-full mb-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  const alignClasses = {
    start: position === 'bottom' || position === 'top' ? 'left-0' : 'top-0',
    center: position === 'bottom' || position === 'top' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
    end: position === 'bottom' || position === 'top' ? 'right-0' : 'bottom-0'
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className={cn(
            'absolute z-50 min-w-[12rem] bg-white rounded-lg shadow-lg border border-gray-200 py-1',
            positionClasses[position],
            alignClasses[align],
            menuClassName
          )}
        >
          {items.map((item) => {
            if (item.separator) {
              return (
                <div
                  key={item.id}
                  className="my-1 border-t border-gray-200"
                  role="separator"
                />
              );
            }

            return (
              <button
                key={item.id}
                ref={el => { itemRefs.current[item.id] = el; }}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2',
                  'focus:outline-none focus:bg-blue-50 focus:text-blue-700',
                  item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer'
                )}
              >
                {item.icon && (
                  <span className="flex-shrink-0">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
