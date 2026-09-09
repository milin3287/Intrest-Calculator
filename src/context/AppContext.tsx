import React, { createContext, useContext, useState, useEffect } from 'react';
import { PagePath, CurrencyCode, CurrencyConfig, CalculationAuditItem } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', label: 'INR ₹', rateAgainstINR: 1 },
  USD: { code: 'USD', symbol: '$', label: 'USD $', rateAgainstINR: 0.012 },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR €', rateAgainstINR: 0.011 },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP £', rateAgainstINR: 0.0094 },
};

const INITIAL_HISTORY: CalculationAuditItem[] = [
  {
    id: 'AUD-8921',
    category: 'Advanced Solver',
    title: 'Quarterly Compound Interest — ₹50,000 @ 8% for 3 yrs',
    principal: 50000,
    rate: 8.0,
    tenureYears: 3,
    frequency: 'Quarterly (n=4)',
    resultValue: 63412.09,
    resultFormatted: '₹63,412.09',
    formula: 'A = 50,000 × (1 + 0.08/4)^(4 × 3)',
    timestamp: 'Today, 14:32',
    details: [
      { label: 'P', value: '₹50,000' },
      { label: 'r', value: '8.00% APR' },
      { label: 't', value: '3 Years' },
      { label: 'Net Interest', value: '₹13,412.09' },
    ],
  },
  {
    id: 'AUD-8920',
    category: 'Loan EMI',
    title: 'Home Loan EMI — ₹30,00,000 @ 8.75% for 15 yrs',
    principal: 3000000,
    rate: 8.75,
    tenureYears: 15,
    frequency: 'Monthly (n=12)',
    resultValue: 29985,
    resultFormatted: '₹29,985 /mo',
    formula: 'EMI = [P × r × (1+r)^n] / [(1+r)^n - 1]',
    timestamp: 'Yesterday, 19:10',
    details: [
      { label: 'Sanctioned', value: '₹30,00,000' },
      { label: 'Rate', value: '8.75% Floating' },
      { label: 'Tenure', value: '180 Months' },
      { label: 'Total Repayment', value: '₹53,97,322' },
    ],
  },
  {
    id: 'AUD-8919',
    category: 'Investment',
    title: 'Retirement SIP Growth — ₹15,000/mo @ 12% for 15 yrs',
    principal: 2700000,
    rate: 12.0,
    tenureYears: 15,
    frequency: 'Monthly SIP',
    resultValue: 8423540,
    resultFormatted: '₹84,23,540',
    formula: 'FV = P(1+r)ⁿ + M × [((1+i)ⁿ - 1)/i] × (1+i)',
    timestamp: 'Oct 24, 11:05',
    details: [
      { label: 'Outlay', value: '₹27,00,000' },
      { label: 'CAGR Target', value: '12.00%' },
      { label: 'Real Value (6% CPI)', value: '₹35,14,832' },
    ],
  },
  {
    id: 'AUD-8918',
    category: 'Simple Interest',
    title: 'Simple Interest Commercial Note — ₹2,00,000 @ 10% for 180 days',
    principal: 200000,
    rate: 10.0,
    tenureYears: 0.493,
    frequency: 'Commercial (365 days)',
    resultValue: 9863.01,
    resultFormatted: '₹9,863.01',
    formula: 'I = (2,00,000 × 10 × (180/365)) / 100',
    timestamp: 'Oct 20, 09:40',
    details: [
      { label: 'Face Value', value: '₹2,00,000' },
      { label: 'Coupon', value: '10.00% p.a.' },
      { label: 'Maturity Value', value: '₹2,09,863.01' },
    ],
  },
];

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [history, setHistory] = useState<CalculationAuditItem[]>(() => {
    try {
      const saved = localStorage.getItem('interestly_audit_history');
      if (saved) return JSON.parse(saved);
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
