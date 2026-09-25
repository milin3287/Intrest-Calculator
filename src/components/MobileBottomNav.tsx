import React from 'react';
import { useApp } from '../context/AppContext';
import { PagePath } from '../types';

interface NavItem {
  id: string;
  label: string;
  path: PagePath;
  icon: string;
  badge?: string;
}

export const MobileBottomNav: React.FC = () => {
  const { currentPath, navigateTo, setActiveInvestmentType } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      path: 'home',
      icon: 'home',
    },
    {
      id: 'date-ledger',
      label: 'Ledger',
      path: 'date-ledger',
      icon: 'calendar_month',
      badge: 'Core',
    },
    {
      id: 'investment',
      label: 'SIP & SWP',
      path: 'investment',
      icon: 'trending_up',
    },
    {
      id: 'loan-and-emi',
      label: 'Loan EMI',
      path: 'loan-and-emi',
      icon: 'payments',
    },
    {
      id: 'calculators',
      label: 'All Tools',
      path: 'calculators',
      icon: 'grid_view',
    },
  ];

  const handleItemClick = (item: NavItem) => {
    if (item.id === 'investment' && currentPath !== 'investment') {
      // Default to SIP or keep existing
    }
    navigateTo(item.path);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/95 dark:bg-surface-container-low/95 backdrop-blur-md border-t border-surface-container-high/60 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] px-2 pt-1.5 pb-safe pb-2"
    >
      <div className="flex items-center justify-around gap-1 max-w-lg mx-auto">
        {navItems.map(item => {
          const isActive =
            currentPath === item.path ||
            (item.path === 'calculators' && ['monthly-vault', 'advanced-solver', 'history', 'learn'].includes(currentPath));

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              type="button"
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                  isActive ? 'bg-primary/15 text-primary' : 'text-secondary'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full text-[9px] font-mono font-bold bg-primary text-on-primary">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 truncate max-w-[64px] ${isActive ? 'font-bold text-primary' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
