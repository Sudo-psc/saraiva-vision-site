'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'default' | 'pills' | 'underline';
  onChange?: (tabId: string) => void;
  className?: string;
  contentClassName?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  variant = 'default',
  onChange,
  className = '',
  contentClassName = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    if (defaultTab && defaultTab !== activeTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.disabled) return;

    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const enabledTabs = tabs.filter(t => !t.disabled);
    const currentTabIndex = enabledTabs.findIndex(t => t.id === activeTab);
    
    let nextIndex = currentTabIndex;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (currentTabIndex + 1) % enabledTabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = currentTabIndex === 0 ? enabledTabs.length - 1 : currentTabIndex - 1;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = enabledTabs.length - 1;
    } else {
      return;
    }

    const nextTab = enabledTabs[nextIndex];
    if (nextTab) {
      handleTabChange(nextTab.id);
      tabRefs.current[nextTab.id]?.focus();
    }
  };

  const variantStyles = {
    default: {
      tabList: 'border-b border-gray-200',
      tab: 'px-4 py-2 text-sm font-medium transition-colors relative',
      tabActive: 'text-blue-600',
      tabInactive: 'text-gray-600 hover:text-gray-900',
      tabDisabled: 'text-gray-400 cursor-not-allowed',
      indicator: 'absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600'
    },
    pills: {
      tabList: 'flex gap-2 p-1 bg-gray-100 rounded-lg',
      tab: 'px-4 py-2 text-sm font-medium transition-all relative rounded-md',
      tabActive: 'text-white',
      tabInactive: 'text-gray-700 hover:text-gray-900',
      tabDisabled: 'text-gray-400 cursor-not-allowed',
      indicator: 'absolute inset-0 bg-blue-600 rounded-md -z-10'
    },
    underline: {
      tabList: 'flex gap-6 border-b border-gray-200',
      tab: 'pb-3 text-sm font-medium transition-colors relative',
      tabActive: 'text-blue-600',
      tabInactive: 'text-gray-600 hover:text-gray-900',
      tabDisabled: 'text-gray-400 cursor-not-allowed',
      indicator: 'absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn('flex', styles.tabList)}
        role="tablist"
        aria-label="Tabs"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => { tabRefs.current[tab.id] = el; }}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            aria-disabled={tab.disabled}
            tabIndex={activeTab === tab.id ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e)}
            className={cn(
              styles.tab,
              activeTab === tab.id ? styles.tabActive : styles.tabInactive,
              tab.disabled && styles.tabDisabled,
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
          >
            {tab.label}
            
            {activeTab === tab.id && (
              <motion.div
                layoutId={`tab-indicator-${variant}`}
                className={styles.indicator}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className={cn('mt-6', contentClassName)}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={tab.id}
            hidden={activeTab !== tab.id}
            tabIndex={0}
            className="focus:outline-none"
          >
            {activeTab === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
