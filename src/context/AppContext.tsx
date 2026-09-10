import React, { createContext, useContext, useState, useEffect } from 'react';
import { PagePath, CurrencyCode, CurrencyConfig, CalculationAuditItem } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', label: 'INR ₹', rateAgainstINR: 1 },
  USD: { code: 'USD', symbol: '$', label: 'USD $', rateAgainstINR: 0.012 },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR €', rateAgainstINR: 0.011 },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP £', rateAgainstINR: 0.0094 },
};

const INITIAL_HISTORY: CalculationAuditItem[] = [];

interface AppContextType {
  currentPath: PagePath;
  navigateTo: (path: PagePath) => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  currencyConfig: CurrencyConfig;
  formatMoney: (valInINR: number, decimalPlaces?: number) => string;
  formatMoneyCompact: (valInINR: number) => string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  history: CalculationAuditItem[];
  addHistoryItem: (item: Omit<CalculationAuditItem, 'id' | 'timestamp'>) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  toastMessage: string | null;
  triggerToast: (msg: string) => void;
  activeCalculatorTab: string;
  setActiveCalculatorTab: (tab: string) => void;
  formulaDrawerOpen: boolean;
  toggleFormulaDrawer: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<PagePath>('home');
  const [currency, setCurrencyState] = useState<CurrencyCode>('INR');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('interestly_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      if (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)')?.matches
      ) {
        return 'dark';
      }
    } catch {
      // ignore
    }
    return 'light';
  });
  const [history, setHistory] = useState<CalculationAuditItem[]>(() => {
    try {
      const saved = localStorage.getItem('interestly_audit_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (item: CalculationAuditItem) =>
              !['AUD-8921', 'AUD-8920', 'AUD-8919', 'AUD-8918'].includes(item.id)
          );
          return cleaned;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_HISTORY;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCalculatorTab, setActiveCalculatorTab] = useState<string>('Compound Interest');
  const [formulaDrawerOpen, setFormulaDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('interestly_audit_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('interestly_theme', theme);
    } catch {
      // ignore
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    triggerToast(theme === 'light' ? 'Switched to Dark theme.' : 'Switched to Light theme.');
  };

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    triggerToast(`Currency base set to ${CURRENCIES[curr].label}`);
  };

  const navigateTo = (path: PagePath) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currencyConfig = CURRENCIES[currency];

  const formatMoney = (valInINR: number, decimalPlaces = 0): string => {
    if (isNaN(valInINR)) return `${currencyConfig.symbol}0`;
    const converted = valInINR * currencyConfig.rateAgainstINR;
    if (currency === 'INR') {
      return (
        currencyConfig.symbol +
        Math.round(converted).toLocaleString('en-IN', {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        })
      );
    }
    return (
      currencyConfig.symbol +
      converted.toLocaleString('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      })
    );
  };

  const formatMoneyCompact = (valInINR: number): string => {
    if (isNaN(valInINR)) return `${currencyConfig.symbol}0`;
    const converted = valInINR * currencyConfig.rateAgainstINR;
    if (currency === 'INR') {
      if (Math.abs(converted) >= 10000000) {
        return `${currencyConfig.symbol}${(converted / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(converted) >= 100000) {
        return `${currencyConfig.symbol}${(converted / 100000).toFixed(1)} L`;
      }
      if (Math.abs(converted) >= 1000) {
        return `${currencyConfig.symbol}${(converted / 1000).toFixed(0)}K`;
      }
      return `${currencyConfig.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
    }

    if (Math.abs(converted) >= 1000000) {
      return `${currencyConfig.symbol}${(converted / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(converted) >= 1000) {
      return `${currencyConfig.symbol}${(converted / 1000).toFixed(1)}K`;
    }
    return `${currencyConfig.symbol}${Math.round(converted).toLocaleString('en-US')}`;
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  const addHistoryItem = (item: Omit<CalculationAuditItem, 'id' | 'timestamp'>) => {
    const newItem: CalculationAuditItem = {
      ...item,
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Just now',
    };
    setHistory(prev => [newItem, ...prev]);
    triggerToast('Calculation state logged to audit ledger.');
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    triggerToast('Calculation record purged from local audit ledger.');
  };

  const clearHistory = () => {
    setHistory([]);
    triggerToast('All calculation history has been cleared.');
  };

  const toggleFormulaDrawer = () => {
    setFormulaDrawerOpen(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        currentPath,
        navigateTo,
        currency,
        setCurrency,
        currencyConfig,
        formatMoney,
        formatMoneyCompact,
        theme,
        toggleTheme,
        history,
        addHistoryItem,
        deleteHistoryItem,
        clearHistory,
        toastMessage,
        triggerToast,
        activeCalculatorTab,
        setActiveCalculatorTab,
        formulaDrawerOpen,
        toggleFormulaDrawer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
