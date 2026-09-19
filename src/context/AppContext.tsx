import React, { createContext, useContext, useState, useEffect } from 'react';
import { PagePath, CurrencyCode, CurrencyConfig, CalculationAuditItem } from '../types';
import { saveRecord, getAllRecords, deleteRecord } from '../services/firebaseSync';

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
              !['AUD-8921', 'AUD-8920', 'AUD-8918'].includes(item.id)
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

  // Sync calculations from Firestore table on initial load
  useEffect(() => {
    getAllRecords<CalculationAuditItem>('calculation_history')
      .then((records) => {
        if (records && records.length > 0) {
          // Exclude internal setup flags
          const validRecords = records.filter(
            (r) => r.id !== 'INIT_CONFIG' && r.title && r.category
          );
          if (validRecords.length > 0) {
            setHistory((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const fresh = validRecords.filter((v) => !existingIds.has(v.id));
              return [...fresh, ...prev];
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Firestore calculations sync note:', err);
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('interestly_audit_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save audit history to localStorage', e);
    }
  }, [history]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('interestly_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    triggerToast(`Currency changed to ${curr} (${CURRENCIES[curr].symbol})`);
  };

  const currencyConfig = CURRENCIES[currency];

  const formatMoney = (valInINR: number, decimalPlaces = 2): string => {
    if (valInINR === undefined || valInINR === null || isNaN(valInINR)) return '0.00';
    const converted = valInINR * currencyConfig.rateAgainstINR;

    const parts = converted.toFixed(decimalPlaces).split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

    if (currency === 'INR') {
      const isNegative = integerPart.startsWith('-');
      if (isNegative) integerPart = integerPart.slice(1);
      const lastThree = integerPart.slice(-3);
      const otherNumbers = integerPart.slice(0, -3);
      const formatted = otherNumbers !== ''
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
        : lastThree;
      return `${isNegative ? '-' : ''}${currencyConfig.symbol}${formatted}${decimalPart}`;
    }

    return `${currencyConfig.symbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    })}`;
  };

  const formatMoneyCompact = (valInINR: number): string => {
    if (valInINR === undefined || valInINR === null || isNaN(valInINR)) return '0';
    const converted = valInINR * currencyConfig.rateAgainstINR;

    if (currency === 'INR') {
      if (Math.abs(converted) >= 1e7) {
        return `${currencyConfig.symbol}${(converted / 1e7).toFixed(2)} Cr`;
      }
      if (Math.abs(converted) >= 1e5) {
        return `${currencyConfig.symbol}${(converted / 1e5).toFixed(2)} Lakh`;
      }
      if (Math.abs(converted) >= 1e3) {
        return `${currencyConfig.symbol}${(converted / 1e3).toFixed(1)}k`;
      }
      return `${currencyConfig.symbol}${converted.toFixed(0)}`;
    }

    if (Math.abs(converted) >= 1e9) {
      return `${currencyConfig.symbol}${(converted / 1e9).toFixed(2)}B`;
    }
    if (Math.abs(converted) >= 1e6) {
      return `${currencyConfig.symbol}${(converted / 1e6).toFixed(2)}M`;
    }
    if (Math.abs(converted) >= 1e3) {
      return `${currencyConfig.symbol}${(converted / 1e3).toFixed(1)}k`;
    }
    return `${currencyConfig.symbol}${converted.toFixed(0)}`;
  };

  const navigateTo = (path: PagePath) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Save directly to Firestore database table
    saveRecord('calculation_history', newItem.id, {
      ...newItem,
      createdAt: new Date().toISOString(),
    }).catch((err) => {
      console.warn('Failed to save calculation to Firestore:', err);
    });
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    triggerToast('Calculation record purged from local audit ledger.');

    // Remove directly from Firestore database table
    deleteRecord('calculation_history', id).catch((err) => {
      console.warn('Failed to delete calculation from Firestore:', err);
    });
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
