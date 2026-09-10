import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from './SpotlightCard';

export const InteractiveSimulator: React.FC = () => {
  const { navigateTo, formatMoney } = useApp();

  const [principal, setPrincipal] = useState<number>(0);
  const [rate, setRate] = useState<number>(12.5);
  const [tenure, setTenure] = useState<number>(7);
  const [frequency, setFrequency] = useState<number>(4); // Quarterly

  const r = rate / 100;
  const maturity = principal > 0 ? principal * Math.pow(1 + r / frequency, frequency * tenure) : 0;
  const interest = maturity > 0 ? maturity - principal : 0;
  const multiplier = principal > 0 ? maturity / principal : 0;
  const roi = principal > 0 ? (interest / principal) * 100 : 0;

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#632ecd', '#10b981', '#f59e0b'],
    });
  };

  return (
    <SpotlightCard className="p-6 sm:p-8" spotlightColor="rgba(99, 46, 205, 0.12)">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Left: Interactive Controls */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Live Interactive Sandbox
              </div>
              <span className="text-xs font-mono text-secondary font-medium">Real-time Compounding</span>
            </div>

            <h3 className="font-display-xl text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
              Test Instant Wealth Compounding
            </h3>
            <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
              Drag the tactile sliders below to simulate multi-stage interest compounding and see exponential curves recalculate in real-time.
            </p>
          </div>

          {/* Slider 1: Principal */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-on-surface">Initial Principal (P)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={50000000}
                  step={5000}
                  value={principal === 0 ? '' : principal}
                  onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
                  className="w-28 px-2 py-0.5 text-right text-sm font-mono font-bold text-primary bg-surface-container-lowest border border-outline-variant/30 rounded focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={5000000}
              step={10000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
              className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[11px] text-secondary font-mono">
              <span>{formatMoney(0)}</span>
              <span>{formatMoney(2500000)}</span>
              <span>{formatMoney(5000000)}</span>
            </div>
          </div>

          {/* Slider 2: Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-on-surface">Annual Interest Rate (r)</span>
              <span className="font-mono font-bold text-tertiary">{rate.toFixed(1)}% p.a.</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={36.0}
              step={0.5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-tertiary"
            />
            <div className="flex justify-between text-[11px] text-secondary font-mono">
              <span>1.0% (FD/Govt)</span>
              <span>12.5% (Equity)</span>
              <span>24.0% (Informal/NBFC)</span>
              <span>36.0%</span>
            </div>
          </div>

          {/* Slider 3: Duration & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-on-surface">Tenure (Years)</span>
                <span className="font-mono font-bold text-on-surface">{tenure} Yrs</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-2">
              <span className="block text-sm font-medium text-on-surface">Compounding (n)</span>
              <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container-high rounded-xl">
                {[
                  { label: 'Yearly', val: 1 },
                  { label: 'Half', val: 2 },
                  { label: 'Qtr', val: 4 },
                  { label: 'Monthly', val: 12 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setFrequency(item.val)}
                    className={`py-1 text-xs font-semibold rounded-lg transition-all ${
                      frequency === item.val
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dynamic 3D Result HUD */}
        <div className="lg:w-80 flex flex-col justify-between bg-gradient-to-b from-primary/5 via-tertiary/5 to-surface-container-high/40 rounded-2xl p-6 border border-outline-variant/30">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <span className="text-xs uppercase tracking-wider font-semibold text-secondary">
                Simulated Maturity
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                +{roi.toFixed(1)}% ROI
              </span>
            </div>

            {/* Big Maturity Figure */}
            <div>
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
                {formatMoney(maturity)}
              </div>
              <div className="text-xs text-secondary mt-1 font-mono">
                Total Accrued: <span className="font-semibold text-tertiary">+{formatMoney(interest)}</span>
              </div>
            </div>

            {/* Multiplier Badge */}
            <div className="p-4 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/30 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-secondary font-medium block">Wealth Multiplier</span>
                <span className="text-2xl font-black text-primary font-mono">{multiplier.toFixed(2)}x</span>
              </div>
              <button
                type="button"
                onClick={triggerCelebration}
                title="Celebrate your wealth milestone"
                className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <span>🎉</span> Celebrate
              </button>
            </div>

            {/* Visual ratio bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-secondary">
                <span>Principal ({maturity > 0 ? ((principal / maturity) * 100).toFixed(0) : 0}%)</span>
                <span>Interest ({maturity > 0 ? ((interest / maturity) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden bg-surface-container-highest flex">
                <div
                  className="bg-primary transition-all duration-300"
                  style={{ width: `${maturity > 0 ? Math.max(5, (principal / maturity) * 100) : 0}%` }}
                />
                <div
                  className="bg-tertiary transition-all duration-300"
                  style={{ width: `${maturity > 0 ? Math.max(5, (interest / maturity) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigateTo('calculators')}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span>Explore All Calculators</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('date-ledger')}
              className="w-full py-2 px-4 rounded-xl bg-transparent hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Open Custom Dates Passbook</span>
              <span className="material-symbols-outlined text-xs">calendar_month</span>
            </button>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};
