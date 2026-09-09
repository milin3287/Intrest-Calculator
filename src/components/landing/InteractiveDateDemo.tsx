import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from './SpotlightCard';

export const InteractiveDateDemo: React.FC = () => {
  const { navigateTo, formatMoney } = useApp();

  const today = new Date();
  const formatIso = (d: Date) => d.toISOString().split('T')[0];

  const defaultStart = new Date(today.getFullYear(), 0, 15);
  const defaultEnd = new Date(today.getFullYear(), 6, 28);

  const [startDate, setStartDate] = useState<string>(formatIso(defaultStart));
  const [endDate, setEndDate] = useState<string>(formatIso(defaultEnd));
  const [amount, setAmount] = useState<number>(100000);
  const [rate, setRate] = useState<number>(12);
  const [dayBasis, setDayBasis] = useState<365 | 360>(365);

  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const elapsedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const interest = (amount * (rate / 100) * elapsedDays) / dayBasis;
  const total = amount + interest;

  return (
    <SpotlightCard
      className="p-6 sm:p-8 border border-primary/25 shadow-xl bg-surface-container-lowest/90 backdrop-blur-xl"
      spotlightColor="rgba(37, 99, 235, 0.15)"
    >
      <div className="flex flex-col lg:flex-row items-stretch gap-6 sm:gap-8">
        {/* Left: Input Sandbox */}
        <div className="flex-1 space-y-5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Instant 3-Second Demo
            </div>
            <div className="flex items-center gap-1 bg-surface-container-high p-0.5 rounded-lg text-xs font-mono">
              <button
                type="button"
                onClick={() => setDayBasis(365)}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${
                  dayBasis === 365 ? 'bg-primary text-on-primary shadow-xs' : 'text-secondary hover:text-on-surface'
                }`}
              >
                ACT/365
              </button>
              <button
                type="button"
                onClick={() => setDayBasis(360)}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${
                  dayBasis === 360 ? 'bg-primary text-on-primary shadow-xs' : 'text-secondary hover:text-on-surface'
                }`}
              >
                ACT/360
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-display-xl text-xl sm:text-2xl font-bold text-on-surface">
              Test Interest Between Any Two Dates
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Pick two dates to see how Interestly calculates exact calendar intervals without rough 30-day rounding.
            </p>
          </div>

          {/* Quick Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-primary">event</span>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-on-surface font-mono focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-primary">event_available</span>
                End / Settlement Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-on-surface font-mono focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Amount & Rate Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-secondary">Principal</span>
                <span className="font-mono font-bold text-primary">{formatMoney(amount)}</span>
              </div>
              <input
                type="range"
                min={10000}
                max={1000000}
                step={10000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-secondary">Interest Rate</span>
                <span className="font-mono font-bold text-tertiary">{rate}% p.a.</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={0.5}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-tertiary"
              />
            </div>
          </div>
        </div>

        {/* Right: Instant Computation Card */}
        <div className="lg:w-72 flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-primary/10 via-surface-container-high/50 to-surface-container-high/80 border border-outline-variant/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <span className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
                Exact Interval
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-primary text-on-primary">
                {elapsedDays} Days
              </span>
            </div>

            <div>
              <span className="text-xs text-secondary font-medium block">Total Payable</span>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
                {formatMoney(total)}
              </div>
              <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                + {formatMoney(interest)} Interest Accrued
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-secondary">
                <span>Daily Accrual:</span>
                <span className="font-bold text-on-surface">
                  {formatMoney((amount * (rate / 100)) / dayBasis)}/day
                </span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Effective Yield:</span>
                <span className="font-bold text-tertiary">
                  {((interest / amount) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => navigateTo('date-ledger')}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
            >
              <span>Add Staggered Payments</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};
