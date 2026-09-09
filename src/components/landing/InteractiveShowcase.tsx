import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from './SpotlightCard';

export const InteractiveShowcase: React.FC = () => {
  const { navigateTo, formatMoney } = useApp();
  const [activeTab, setActiveTab] = useState<'passbook' | 'compound' | 'loan' | 'solver'>('passbook');

  return (
    <section className="w-full py-12">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
          Deep Dive Architecture
        </span>
        <h2 className="font-display-xl text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mt-2">
          Designed for Every Financial Workflow
        </h2>
        <p className="text-body-md text-on-surface-variant mt-2">
          Switch across interactive viewports below to see live engine mechanics.
        </p>
      </div>

      {/* Pill Switcher */}
      <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-surface-container-high rounded-2xl max-w-xl mx-auto mb-8 border border-outline-variant/30">
        {[
          { id: 'passbook', label: 'Date Ledger', icon: 'calendar_month' },
          { id: 'compound', label: 'Compound Matrix', icon: 'trending_up' },
          { id: 'loan', label: 'Loan Prepayment', icon: 'account_balance' },
          { id: 'solver', label: 'ISO Derivations', icon: 'calculate' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Showcase Viewport */}
      <SpotlightCard className="p-6 sm:p-10 border border-outline-variant/40" spotlightColor="rgba(37, 99, 235, 0.12)">
        {activeTab === 'passbook' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-primary/10 text-primary">
                Passbook Protocol
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-on-surface">
                Variable Date Cash Flow Ledger
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Traditional calculators assume rigid monthly intervals. Interestly tracks exact calendar dates, calculating day-count fractions ($d/365$ or $d/360$), daily accrued interest, and running net balances.
              </p>
              <ul className="space-y-2 text-xs text-on-surface font-medium">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  Supports variable multiple receipts (credits) &amp; withdrawals (debits)
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  Indian Lakh &amp; Crore denomination words conversion for invoices
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  Versioned time-slot snapshots with single-click PDF downloads
                </li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('date-ledger')}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  <span>Launch Custom Dates Ledger</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-surface-container-high/60 rounded-2xl p-5 border border-outline-variant/30 font-mono text-xs overflow-x-auto">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
                <span className="font-bold text-on-surface">Live Ledger Flow (Simulation)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[11px]">
                  Rate: 18.0% p.a. (Simple)
                </span>
              </div>
              <div className="space-y-2 min-w-[400px]">
                <div className="grid grid-cols-12 text-secondary text-[11px] font-semibold">
                  <span className="col-span-3">DATE</span>
                  <span className="col-span-3">TRANSACTION</span>
                  <span className="col-span-2">DAYS</span>
                  <span className="col-span-2">INTEREST</span>
                  <span className="col-span-2 text-right">TOTAL</span>
                </div>
                <div className="grid grid-cols-12 py-1.5 border-t border-outline-variant/10 text-on-surface items-center">
                  <span className="col-span-3">01-Jan-2024</span>
                  <span className="col-span-3 text-emerald-600 font-bold">+₹2,00,000</span>
                  <span className="col-span-2 text-secondary">0 d</span>
                  <span className="col-span-2">₹0</span>
                  <span className="col-span-2 text-right font-bold">₹2,00,000</span>
                </div>
                <div className="grid grid-cols-12 py-1.5 border-t border-outline-variant/10 text-on-surface items-center">
                  <span className="col-span-3">15-Mar-2024</span>
                  <span className="col-span-3 text-rose-600 font-bold">-₹50,000</span>
                  <span className="col-span-2 text-secondary">+74 d</span>
                  <span className="col-span-2 text-tertiary font-bold">+₹7,301</span>
                  <span className="col-span-2 text-right font-bold">₹1,57,301</span>
                </div>
                <div className="grid grid-cols-12 py-1.5 border-t border-outline-variant/10 text-on-surface items-center">
                  <span className="col-span-3">30-Jun-2024</span>
                  <span className="col-span-3 text-secondary font-bold">Settlement</span>
                  <span className="col-span-2 text-secondary">+107 d</span>
                  <span className="col-span-2 text-tertiary font-bold">+₹8,827</span>
                  <span className="col-span-2 text-right font-bold text-primary">₹1,66,128</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compound' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-tertiary/10 text-tertiary">
                Exponential Scaling
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-on-surface">
                Discrete &amp; Continuous Compounding
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Watch how compounding frequencies from annual down to continuous (A = P &middot; e<sup>rt</sup>) amplify total wealth yields through reinvested interest.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('calculators')}
                  className="px-5 py-2.5 rounded-xl bg-tertiary text-on-tertiary text-sm font-semibold hover:bg-tertiary/90 transition-all flex items-center gap-2"
                >
                  <span>Open Compound Calculator</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-surface-container-high/60 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
              <div className="text-xs font-mono text-secondary">
                Comparing ₹1,00,000 at 12% over 10 Years:
              </div>
              <div className="space-y-3">
                {[
                  { mode: 'Simple Interest', val: '₹2,20,000', gain: '+120%', pct: 60 },
                  { mode: 'Annually (n=1)', val: '₹3,10,584', gain: '+210%', pct: 80 },
                  { mode: 'Quarterly (n=4)', val: '₹3,26,203', gain: '+226%', pct: 90 },
                  { mode: 'Daily / Continuous', val: '₹3,31,999', gain: '+232%', pct: 100 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono font-medium">
                      <span className="text-on-surface">{item.mode}</span>
                      <span className="font-bold text-primary">{item.val} ({item.gain})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-tertiary" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'loan' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600">
                Debt Elimination
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-on-surface">
                Prepayment Acceleration Engine
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                By injecting modest recurring prepayments into your amortization schedule, payments bypass future interest and directly eliminate high-interest principal tranches.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('loan-and-emi')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2"
                >
                  <span>Open EMI &amp; Prepayment Planner</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-surface-container-high/60 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                  <span className="text-xs text-secondary font-medium">Without Prepayment</span>
                  <div className="text-lg font-bold font-mono text-on-surface mt-1">20 Years</div>
                  <div className="text-xs text-rose-500 font-mono mt-0.5">Total Interest: ₹54.1L</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">With ₹5,000/mo Prepay</span>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">14.3 Years</div>
                  <div className="text-xs text-emerald-600 font-mono mt-0.5">Saves ₹18.4L in Interest</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'solver' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-500/10 text-amber-600">
                Mathematical Rigor
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-on-surface">
                Step-by-Step ISO 31-11 Derivations
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Need full algebraic proofs for academic, audit, or institutional reporting? Solve for rate r = n &middot; ((A/P)<sup>1/nt</sup> - 1) or time t = ln(A/P) / (n &middot; ln(1 + r/n)) with every single transformation laid bare.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('advanced-solver')}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-all flex items-center gap-2"
                >
                  <span>Launch Mathematical Solver</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-surface-container-high/60 rounded-2xl p-6 border border-outline-variant/30 font-mono text-xs space-y-3">
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                <div className="text-secondary text-[11px] uppercase font-bold">Step 1: Formula Isolation</div>
                <div className="text-on-surface font-semibold mt-1">r = n &times; [ (A / P)^(1 / (n &times; t)) - 1 ]</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                <div className="text-secondary text-[11px] uppercase font-bold">Step 2: Base Substitution</div>
                <div className="text-on-surface font-semibold mt-1">r = 4 &times; [ (2,50,000 / 1,00,000)^(1 / 20) - 1 ]</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 text-emerald-600 font-bold">
                Derived Annual Rate: 18.52% p.a.
              </div>
            </div>
          </div>
        )}
      </SpotlightCard>
    </section>
  );
};
