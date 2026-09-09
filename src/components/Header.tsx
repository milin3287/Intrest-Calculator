import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PagePath, CurrencyCode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const { currentPath, navigateTo, currency, setCurrency, theme, toggleTheme, history } = useApp();
  const [imgError, setImgError] = useState(false);

  const navItems: { label: string; path: PagePath }[] = [
    { label: 'Home', path: 'home' },
    { label: 'Calculators', path: 'calculators' },
    { label: 'Custom Dates', path: 'date-ledger' },
    { label: 'Monthly Vault', path: 'monthly-vault' },
    { label: 'Advanced Solver', path: 'advanced-solver' },
    { label: 'Loan & EMI', path: 'loan-and-emi' },
    { label: 'Investment', path: 'investment' },
    { label: 'History', path: 'history' },
    { label: 'Learn', path: 'learn' },
  ];

  const currencies: CurrencyCode[] = ['USD', 'INR', 'EUR', 'GBP'];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_1px_8px_rgba(15,23,42,0.05)] border-b border-surface-container-high/40 transition-colors">
      <div className="h-16 max-w-max-width-content mx-auto px-gutter-mobile lg:px-gutter-desktop flex items-center justify-between gap-space-sm">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none"
            aria-label="Interestly Home"
          >
            {!imgError ? (
              <img
                alt="Interestly Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1WFZ1KiSOChLZ2SYaLfQnCaBH2eAak35qPran7P5Vta-KIzDpX8ICjkguOU_BaqZhA-bZyrT3_Gput_64frwWXCY2fM8P4AAO3_WO7cKBO_D7NndhenqRtAWHLHlHXD68u4ACjtL1_gQoE-y9rtATIkIq2UDsVAUB-2R3zyTbhXRDDd7vejsrzlke6SoP6_OH5oBCfalaKOJ43Gj4LV_37LcRPxW0N0ymBpR5w5joLq--PMqATMT-OodRVV"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  %
                </div>
                <span className="font-headline-md text-on-surface font-extrabold tracking-tight">
                  Interest<span className="text-primary-container">ly</span>
                </span>
              </div>
            )}
          </button>
          <span className="hidden xl:inline-flex items-center px-space-xs py-space-2xs rounded-full bg-surface-container-low text-secondary font-label-sm text-label-sm tracking-wide border border-surface-container-high/60">
            Smart Interest. Clear Results.
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="hidden lg:flex items-center gap-space-2xs p-space-2xs rounded-xl">
          {navItems.map(item => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className={`px-space-sm py-space-xs rounded-lg font-label-md text-label-md transition-all ${
                  isActive
                    ? 'text-primary font-semibold bg-surface-container-low shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Currency, Theme, History, Get Started, Avatar */}
        <div className="flex items-center gap-space-xs shrink-0">
          {/* Currency Switcher */}
          <div className="hidden sm:flex items-center p-space-2xs bg-surface-container-low rounded-full gap-space-2xs border border-surface-container-high/50">
            {currencies.map(curr => {
              const isSelected = currency === curr;
              const symbols: Record<CurrencyCode, string> = {
                USD: 'USD $',
                INR: 'INR ₹',
                EUR: 'EUR €',
                GBP: 'GBP £',
              };
              return (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  type="button"
                  className={`px-space-xs py-space-2xs rounded-full font-label-sm text-label-sm transition-all ${
                    isSelected
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-[0_1px_3px_rgba(15,23,42,0.08)]'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  {symbols[curr]}
                </button>
              );
            })}
          </div>

          {/* In-app PWA install button for Android and iOS */}
          <PWAInstallButton />

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Theme Switcher"
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === 'light' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Calculation History */}
          <button
            onClick={() => navigateTo('history')}
            aria-label="Calculation History"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            {history.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface-container-lowest"></span>
            )}
          </button>

          {/* Get Started CTA */}
          <button
            onClick={() => navigateTo('advanced-solver')}
            className="hidden md:inline-flex items-center gap-space-2xs h-10 px-space-md rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all active:scale-[0.99] shadow-sm font-semibold"
            type="button"
          >
            Get Started
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>

      {/* Mobile Subnav Strip for small screens */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-surface-container-high/40 bg-surface-container-low/60 no-scrollbar">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigateTo(item.path)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              currentPath === item.path
                ? 'bg-primary text-white font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
