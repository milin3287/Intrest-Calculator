import React from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './common/BrandLogo';

export const Footer: React.FC = () => {
  const { navigateTo, theme, toggleTheme } = useApp();

  return (
    <footer className="w-full bg-surface-container-low shadow-[0_-1px_8px_rgba(15,23,42,0.03)] mt-space-3xl border-t border-surface-container-high/60 transition-colors">
      <div className="max-w-max-width-content mx-auto px-gutter-mobile lg:px-gutter-desktop pt-space-2xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl pb-space-2xl">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-space-sm">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" showText={true} />
              <span className="font-label-sm text-label-sm uppercase px-space-xs py-space-2xs rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                Fintech Engine
              </span>
            </div>
            <p className="text-on-surface-variant font-body-sm text-body-sm max-w-sm leading-relaxed">
              High-precision institutional-grade calculation infrastructure for compound interest, debt amortization, real-rate yield modeling, and systematic investment scenarios.
            </p>
            <div className="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm pt-1">
              <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
              <span>256-bit client-side mathematical evaluation</span>
            </div>
          </div>

          {/* Calculators Column */}
          <div className="flex flex-col gap-space-xs">
            <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
              Calculators
            </h4>
            <ul className="flex flex-col gap-space-2xs font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <button
                  onClick={() => navigateTo('calculators')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Compound Interest
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('calculators')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Simple &amp; Accrued Rate
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('loan-and-emi')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Mortgage &amp; EMI Amortization
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('investment')}
                  className="hover:text-primary transition-colors text-left"
                >
                  SIP &amp; Lumpsum Growth
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('advanced-solver')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Real-Rate &amp; Inflation Solver
                </button>
              </li>
            </ul>
          </div>

          {/* Formulas & Engine Column */}
          <div className="flex flex-col gap-space-xs">
            <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
              Formulas &amp; Engine
            </h4>
            <ul className="flex flex-col gap-space-2xs font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <button
                  onClick={() => navigateTo('learn')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Exponential Yield A=P(1+r/n)ⁿᵗ
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('learn')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Reducing Balance Principle
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('learn')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Continuous Compounding eʳᵗ
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('learn')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Rule of 72 &amp; Doubling Time
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('learn')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Inflation Parity Matrix
                </button>
              </li>
            </ul>
          </div>

          {/* Developer & Legal Column */}
          <div className="flex flex-col gap-space-xs">
            <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
              Developer &amp; Legal
            </h4>
            <ul className="flex flex-col gap-space-2xs font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <button
                  onClick={() => navigateTo('learn')}
                  className="hover:text-primary transition-colors text-left"
                >
                  API Documentation
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('learn')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Webhooks &amp; SDKs
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('learn')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Precision Benchmarks
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('learn')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Privacy Framework
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('learn')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Terms of Computation
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer row */}
        <div className="pt-space-lg bg-surface-container-high/40 rounded-xl p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-surface-container-high/60">
          <div className="flex items-start gap-space-xs max-w-2xl">
            <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">
              info
            </span>
            <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
              Interestly provides quantitative mathematical simulations for informational, academic, and personal planning purposes. Computation algorithms assume uniform periodic accrual and do not constitute registered financial, investment, tax, or legal advice.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/40 text-on-surface text-xs font-medium hover:border-primary/40 transition-colors shadow-2xs"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              <span className="material-symbols-outlined text-[16px] text-amber-500">
                {theme === 'dark' ? 'dark_mode' : 'light_mode'}
              </span>
              <span>Theme: <strong className="capitalize">{theme}</strong></span>
            </button>
            <span className="font-body-sm text-body-sm text-outline">
              &copy; {new Date().getFullYear()} MRP Interestly. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
