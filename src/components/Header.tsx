import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PagePath, CurrencyCode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { BrandLogo } from './common/BrandLogo';

interface NavSubItem {
  label: string;
  description: string;
  path: PagePath;
  icon: string;
  badge?: string;
}

export const Header: React.FC = () => {
  const {
    currentPath,
    navigateTo,
    currency,
    setCurrency,
    theme,
    toggleTheme,
    history,
  } = useApp();

  // Dropdown states
  const [calcDropdownOpen, setCalcDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const calcDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (calcDropdownRef.current && !calcDropdownRef.current.contains(e.target as Node)) {
        setCalcDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCalcDropdownOpen(false);
        setCurrencyDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const calculatorItems: NavSubItem[] = [
    {
      label: 'Date-to-Date Ledger',
      description: 'Staggered inflows, payments & running interest',
      path: 'date-ledger',
      icon: 'calendar_month',
      badge: 'Core',
    },
    {
      label: 'Monthly Date Vault',
      description: 'Multi-party passbook records & monthly statements',
      path: 'monthly-vault',
      icon: 'account_balance_wallet',
      badge: 'Ledger',
    },
    {
      label: 'Advanced Solver',
      description: 'Compound, simple & arbitrary periodic expansion',
      path: 'advanced-solver',
      icon: 'calculate',
    },
    {
      label: 'Loan & EMI Slasher',
      description: 'Tenure reduction & prepayment interest savings',
      path: 'loan-and-emi',
      icon: 'content_cut',
      badge: 'Save ₹',
    },
    {
      label: 'Investment SIP & SWP',
      description: 'Wealth growth, systematic withdrawals & compounding',
      path: 'investment',
      icon: 'trending_up',
      badge: 'SIP/SWP',
    },
    {
      label: 'All Calculators',
      description: 'Complete directory of financial math models',
      path: 'calculators',
      icon: 'grid_view',
    },
  ];

  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', label: 'US Dollar', symbol: '$' },
    { code: 'EUR', label: 'Euro', symbol: '€' },
    { code: 'GBP', label: 'British Pound', symbol: '£' },
  ];

  const currentCurrencyInfo = currencies.find(c => c.code === currency) || currencies[0];

  const isCalcActive = [
    'calculators',
    'date-ledger',
    'monthly-vault',
    'advanced-solver',
    'loan-and-emi',
    'investment',
  ].includes(currentPath);

  const handleNavClick = (path: PagePath) => {
    navigateTo(path);
    setCalcDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/95 dark:bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(15,23,42,0.06)] border-b border-surface-container-high/40 transition-colors">
        <div className="h-16 max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* 1. Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none"
              aria-label="MRP Interestly Home"
            >
              <BrandLogo size="sm" showText={true} />
            </button>
          </div>

          {/* 2. Desktop & Laptop Adaptive Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* Home */}
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all ${
                currentPath === 'home'
                  ? 'text-primary font-bold bg-surface-container shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
              }`}
            >
              Home
            </button>

            {/* Calculators Dropdown Menu */}
            <div className="relative" ref={calcDropdownRef}>
              <button
                onClick={() => setCalcDropdownOpen(prev => !prev)}
                onMouseEnter={() => setCalcDropdownOpen(true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all ${
                  isCalcActive
                    ? 'text-primary font-bold bg-surface-container shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
                }`}
                aria-expanded={calcDropdownOpen}
              >
                <span>Calculators</span>
                <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${calcDropdownOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Mega Dropdown Menu */}
              {calcDropdownOpen && (
                <div
                  onMouseLeave={() => setCalcDropdownOpen(false)}
                  className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-2xl p-2.5 z-50 grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-3 py-2 border-b border-outline-variant/20 mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-secondary font-semibold">
                      Calculation Modules
                    </span>
                    <span className="text-[11px] text-primary font-medium hover:underline cursor-pointer" onClick={() => handleNavClick('calculators')}>
                      View all (6) &rarr;
                    </span>
                  </div>

                  {calculatorItems.map(item => {
                    const active = currentPath === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                          active
                            ? 'bg-primary/10 border border-primary/20 text-primary'
                            : 'hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5 ${
                          active ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-primary'
                        }`}>
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs xl:text-sm truncate">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-primary-container text-on-primary-container">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Direct Quick Link: Date Ledger */}
            <button
              onClick={() => handleNavClick('date-ledger')}
              className={`px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all ${
                currentPath === 'date-ledger'
                  ? 'text-primary font-bold bg-surface-container shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
              }`}
            >
              Date Ledger
            </button>

            {/* Direct Quick Link: Monthly Vault (Visible on wider laptops) */}
            <button
              onClick={() => handleNavClick('monthly-vault')}
              className={`hidden xl:inline-block px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all ${
                currentPath === 'monthly-vault'
                  ? 'text-primary font-bold bg-surface-container shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
              }`}
            >
              Vault
            </button>

            {/* History */}
            <button
              onClick={() => handleNavClick('history')}
              className={`px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all ${
                currentPath === 'history'
                  ? 'text-primary font-bold bg-surface-container shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
              }`}
            >
              History
            </button>

            {/* Learn */}
            <button
              onClick={() => handleNavClick('learn')}
              className={`px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all ${
                currentPath === 'learn'
                  ? 'text-primary font-bold bg-surface-container shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
              }`}
            >
              Learn
            </button>
          </nav>

          {/* 3. Action Controls: Compact Currency, Unmissable Dark Mode Toggle, History, Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Compact Currency Dropdown */}
            <div className="relative" ref={currencyDropdownRef}>
              <button
                onClick={() => setCurrencyDropdownOpen(prev => !prev)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface-container-low dark:bg-surface-container border border-surface-container-high/60 hover:border-primary/40 text-on-surface text-xs font-semibold transition-all shadow-2xs focus:outline-none"
                aria-label="Select currency"
                title="Change display currency"
              >
                <span className="font-mono text-primary font-bold">{currentCurrencyInfo.symbol}</span>
                <span className="text-[11px] font-mono">{currentCurrencyInfo.code}</span>
                <span className="material-symbols-outlined text-[14px] text-secondary">arrow_drop_down</span>
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-xl p-1.5 z-[60]">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase text-secondary font-semibold border-b border-outline-variant/20 mb-1">
                    Select Currency
                  </div>
                  {currencies.map(c => {
                    const isSelected = currency === c.code;
                    return (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCurrency(c.code);
                          setCurrencyDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-mono w-4 font-bold text-primary">{c.symbol}</span>
                          <span>{c.code}</span>
                        </span>
                        <span className="text-[11px] text-secondary">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ★ PROMINENT UNMISSABLE DARK MODE TOGGLE (ALWAYS VISIBLE) ★ */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="relative flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-on-surface transition-all shrink-0 shadow-xs hover:border-primary/40 focus:outline-none active:scale-95"
              type="button"
            >
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
                theme === 'dark' ? 'text-amber-300 rotate-12' : 'text-amber-500 -rotate-12'
              }`}>
                {theme === 'dark' ? 'dark_mode' : 'light_mode'}
              </span>
              <span className="hidden sm:inline text-xs font-semibold tracking-tight">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Calculation History Icon Button */}
            <button
              onClick={() => handleNavClick('history')}
              aria-label="Calculation History"
              title="Calculation Audit History"
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors focus:outline-none"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">history</span>
              {history.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface-container-lowest" />
              )}
            </button>

            {/* Mobile / Laptop Hamburger Menu Button (lg:hidden) */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors focus:outline-none"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

            {/* Quick CTA button (Shown on wide laptop / desktop screens) */}
            <button
              onClick={() => handleNavClick('advanced-solver')}
              className="hidden 2xl:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all active:scale-[0.99] shadow-xs"
              type="button"
            >
              <span>Solve Math</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* 4. Mobile & Tablet Subnav Strip (Quick scrolling access) */}
        <div className="lg:hidden flex items-center justify-between gap-2 overflow-x-auto px-3 py-1.5 border-t border-surface-container-high/40 bg-surface-container-low/80 dark:bg-surface-container-lowest/80 backdrop-blur-sm no-scrollbar">
          <div className="flex items-center gap-1">
            {[
              { label: 'Home', path: 'home' },
              { label: 'Ledger', path: 'date-ledger' },
              { label: 'Vault', path: 'monthly-vault' },
              { label: 'Solver', path: 'advanced-solver' },
              { label: 'Loans', path: 'loan-and-emi' },
              { label: 'Invest', path: 'investment' },
              { label: 'History', path: 'history' },
              { label: 'Learn', path: 'learn' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path as PagePath)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  currentPath === item.path
                    ? 'bg-primary text-white font-semibold shadow-2xs'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Quick theme button on subnav for mobile screens */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[11px] font-medium shrink-0 ml-1 border border-outline-variant/30"
            title="Toggle theme"
          >
            <span className="material-symbols-outlined text-[14px] text-amber-500">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
            <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </header>

      {/* 5. Mobile & Responsive Slide-Over Menu Drawer (z-[70], Top-0, Never obscured by navbar) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] h-full bg-surface-container-lowest dark:bg-surface-container-low shadow-2xl border-l border-outline-variant/30 flex flex-col z-[71] animate-in slide-in-from-right duration-200 overflow-hidden">
            {/* Dedicated Top Bar inside Drawer */}
            <div className="h-16 px-4 border-b border-outline-variant/20 flex items-center justify-between shrink-0 bg-surface-container-low/60">
              <button
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-2 focus:outline-none"
              >
                <BrandLogo size="xs" showText={true} />
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors focus:outline-none"
                aria-label="Close navigation menu"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Scrollable Content (Takes 100% of remaining height without overflowing the screen) */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 overscroll-contain">
              {/* Appearance & Currency Strip */}
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container-high/40 border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">Appearance</span>
                    <span className="text-[11px] text-secondary">
                      {theme === 'dark' ? 'Dark theme active' : 'Light theme active'}
                    </span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/40 text-xs font-semibold shadow-xs"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-500">
                      {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                    </span>
                    <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface">Currency</span>
                  <div className="flex items-center gap-1">
                    {currencies.map(c => (
                      <button
                        key={c.code}
                        onClick={() => setCurrency(c.code)}
                        type="button"
                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                          currency === c.code
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-surface-container text-secondary hover:text-on-surface'
                        }`}
                      >
                        {c.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-secondary px-2 mb-1">
                  Navigation
                </span>

                <button
                  onClick={() => handleNavClick('home')}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                    currentPath === 'home'
                      ? 'bg-primary text-on-primary font-bold shadow-xs'
                      : 'hover:bg-surface-container text-on-surface'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">home</span>
                  <span>Home</span>
                </button>

                <div className="pt-2 pb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-secondary px-2">
                    Financial Calculators
                  </span>
                </div>

                {calculatorItems.map(item => {
                  const active = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                        active
                          ? 'bg-primary text-on-primary font-semibold shadow-xs'
                          : 'hover:bg-surface-container text-on-surface'
                      }`}
                      type="button"
                    >
                      <span className={`material-symbols-outlined text-[20px] mt-0.5 ${active ? 'text-on-primary' : 'text-primary'}`}>
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-sm font-medium truncate">{item.label}</span>
                          {item.badge && (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono shrink-0 ${
                              active ? 'bg-white/20 text-white font-bold' : 'bg-primary/10 text-primary font-bold'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] line-clamp-1 ${active ? 'text-white/80' : 'text-on-surface-variant'}`}>
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}

                <div className="pt-2 pb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-secondary px-2">
                    Resources & History
                  </span>
                </div>

                <button
                  onClick={() => handleNavClick('history')}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                    currentPath === 'history'
                      ? 'bg-primary text-on-primary font-bold shadow-xs'
                      : 'hover:bg-surface-container text-on-surface'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">history</span>
                  <span>Calculation Audit History</span>
                  {history.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-mono bg-primary-container text-on-primary-container">
                      {history.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNavClick('learn')}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                    currentPath === 'learn'
                      ? 'bg-primary text-on-primary font-bold shadow-xs'
                      : 'hover:bg-surface-container text-on-surface'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  <span>Knowledge & Formulas</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-3 px-4 border-t border-outline-variant/20 shrink-0 flex items-center justify-between text-xs text-secondary bg-surface-container-low/40">
              <span>MRP Interestly v2.4</span>
              <span className="font-mono">Exact-Day Math</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
