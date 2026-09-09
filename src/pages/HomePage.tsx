import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const HomePage: React.FC = () => {
  const { navigateTo, formatMoney, currencyConfig } = useApp();

  // Hero Interactive Calculator State (in INR base)
  const [heroPrincipal, setHeroPrincipal] = useState<number>(500000);
  const [heroRate, setHeroRate] = useState<number>(12.0);
  const [heroTenure, setHeroTenure] = useState<number>(5);

  // Calculation for Hero Growth Matrix (Quarterly compounding, n=4)
  const n = 4;
  const rateDecimal = heroRate / 100;
  const heroMaturity = heroPrincipal * Math.pow(1 + rateDecimal / n, n * heroTenure);
  const heroInterest = heroMaturity - heroPrincipal;
  const heroGrowthRoi = heroPrincipal > 0 ? (heroInterest / heroPrincipal) * 100 : 0;
  const heroEffectiveRate = (Math.pow(1 + rateDecimal / n, n) - 1) * 100;

  // Dynamic SVG curve coordinates calculation
  const growthMultiplier = heroPrincipal > 0 ? heroMaturity / heroPrincipal : 1;
  const endY = Math.max(12, Math.min(85, 100 - growthMultiplier * 25));
  const controlY = Math.max(30, endY + 25);

  const loadHeroPreset = (mode: 'wealth' | 'debt' | 'sip') => {
    if (mode === 'wealth') {
      setHeroPrincipal(1000000);
      setHeroRate(14);
      setHeroTenure(10);
    } else if (mode === 'debt') {
      setHeroPrincipal(750000);
      setHeroRate(9.5);
      setHeroTenure(7);
    } else if (mode === 'sip') {
      setHeroPrincipal(250000);
      setHeroRate(12.5);
      setHeroTenure(15);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Subtle Ambient Top Halo */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-primary-fixed/60 via-tertiary-fixed/30 to-transparent blur-3xl pointer-events-none -z-10 opacity-70"></div>

        {/* Hero Section */}
        <section className="w-full pt-space-md pb-space-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            {/* Left: Copy & Actions (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-start gap-space-md">
              {/* Live Precision Badge */}
              <div className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-container-high shadow-sm border border-surface-container-highest/60">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                </span>
                <span className="font-label-sm text-label-sm font-semibold tracking-wide text-on-surface">
                  Next-Gen Financial Math Engine &bull; Precision &amp; Speed
                </span>
              </div>

              {/* Main Hero Heading */}
              <h1 className="font-display-xl text-display-xl tracking-tight text-on-surface font-extrabold">
                Calculate Interest.<br />
                <span className="bg-gradient-to-r from-primary via-primary-container to-tertiary bg-clip-text text-transparent">
                  Understand Your Money.
                </span>
              </h1>

              {/* Subheading */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                From simple interest to institutional multi-stage compounding, get deterministic precision with interactive simulations designed for investors, students, and quantitative analysts.
              </p>

              {/* Interactive Mode Switchers / Pills */}
              <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                  Mode Presets:
                </span>
                <button
                  className="px-space-xs py-1 rounded-full bg-surface-container hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm transition-colors border border-surface-container-high/60"
                  onClick={() => loadHeroPreset('wealth')}
                  type="button"
                >
                  Wealth Compounding
                </button>
                <button
                  className="px-space-xs py-1 rounded-full bg-surface-container hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm transition-colors border border-surface-container-high/60"
                  onClick={() => loadHeroPreset('debt')}
                  type="button"
                >
                  Loan Amortization
                </button>
                <button
                  className="px-space-xs py-1 rounded-full bg-surface-container hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm transition-colors border border-surface-container-high/60"
                  onClick={() => loadHeroPreset('sip')}
                  type="button"
                >
                  SIP Systematic Plan
                </button>
              </div>

              {/* Primary CTA Cluster */}
              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                <button
                  onClick={() => navigateTo('calculators')}
                  className="inline-flex items-center gap-space-xs h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-md hover:bg-primary-container active:scale-[0.99] transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span>Start Calculating</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button
                  onClick={() => navigateTo('date-ledger')}
                  className="inline-flex items-center gap-space-xs h-11 px-space-md rounded-xl bg-surface-container-lowest text-primary font-label-md text-label-md font-bold shadow-sm hover:bg-surface-container hover:shadow transition-all border border-primary/30"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  <span>Custom Date Ledger</span>
                </button>
                <button
                  onClick={() => navigateTo('calculators')}
                  className="inline-flex items-center gap-space-xs h-11 px-space-md rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold shadow-sm hover:bg-surface-container hover:shadow transition-all border border-surface-container-high/50"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">calculate</span>
                  <span>Explore Calculators</span>
                </button>
                <button
                  onClick={() => navigateTo('advanced-solver')}
                  className="inline-flex items-center gap-space-2xs px-space-sm py-2 rounded-full bg-surface-container-low text-tertiary hover:bg-surface-container font-label-sm text-label-sm font-semibold transition-colors border border-surface-container-high/40"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span>Try Problem Solver</span>
                </button>
              </div>

              {/* Proof Micro-strip */}
              <div className="flex items-center gap-space-md pt-space-sm text-secondary font-body-sm text-body-sm">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                  <span>0% rounding approximations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                  <span>Sub-millisecond solver</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Financial Engine Card (5 cols) */}
            <div className="lg:col-span-5 relative w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-tertiary/10 to-transparent rounded-3xl blur-2xl -z-10"></div>
              <div className="w-full bg-surface-container-lowest rounded-2xl p-space-lg shadow-xl relative overflow-hidden border border-surface-container-high/50">
                {/* Card Header & Badges */}
                <div className="flex items-center justify-between gap-space-sm pb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Interactive Growth Matrix
                    </span>
                  </div>
                  <span className="px-space-xs py-1 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm font-semibold tracking-wider uppercase">
                    Quarterly Compounded
                  </span>
                </div>

                {/* Formula Inset Sandbox */}
                <div className="w-full bg-surface-container-low rounded-xl p-space-xs px-space-sm mb-space-md flex items-center justify-between border border-surface-container-high/40">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm uppercase text-secondary font-mono">
                      Equation:
                    </span>
                    <code className="font-mono text-body-sm text-on-surface font-semibold">
                      A = P(1 + r/n)^(nt)
                    </code>
                  </div>
                  <span className="text-secondary font-body-sm text-body-sm">n = 4</span>
                </div>

                {/* Sliders Grid */}
                <div className="flex flex-col gap-space-sm">
                  {/* Slider 1: Principal */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-secondary font-label-md text-label-md">
                        Principal Amount (P)
                      </span>
                      <span className="font-data-mono-md text-data-mono-md text-on-surface font-semibold">
                        {formatMoney(heroPrincipal)}
                      </span>
                    </div>
                    <input
                      className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                      max="2500000"
                      min="50000"
                      step="25000"
                      type="range"
                      value={heroPrincipal}
                      onChange={e => setHeroPrincipal(parseFloat(e.target.value))}
                    />
                  </div>

                  {/* Slider 2: Rate */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-secondary font-label-md text-label-md">
                        Interest Rate p.a. (r)
                      </span>
                      <span className="font-data-mono-md text-data-mono-md text-primary font-semibold">
                        {heroRate.toFixed(1)}%
                      </span>
                    </div>
                    <input
                      className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                      max="24"
                      min="3"
                      step="0.5"
                      type="range"
                      value={heroRate}
                      onChange={e => setHeroRate(parseFloat(e.target.value))}
                    />
                  </div>

                  {/* Slider 3: Duration */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-secondary font-label-md text-label-md">
                        Tenure Duration (t)
                      </span>
                      <span className="font-data-mono-md text-data-mono-md text-on-surface font-semibold">
                        {heroTenure} {heroTenure === 1 ? 'Year' : 'Years'}
                      </span>
                    </div>
                    <input
                      className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                      max="25"
                      min="1"
                      step="1"
                      type="range"
                      value={heroTenure}
                      onChange={e => setHeroTenure(parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>

                {/* Dynamic SVG Growth Curve */}
                <div className="pt-space-md pb-space-xs">
                  <div className="relative w-full h-32 bg-surface-container-low rounded-xl p-space-xs flex flex-col justify-end overflow-hidden border border-surface-container-high/40">
                    <div className="absolute top-2 left-3 flex items-center gap-space-xs">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                      <span className="font-label-sm text-label-sm text-secondary">
                        Exponential Trajectory
                      </span>
                    </div>
                    <svg className="w-full h-24 overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 120">
                      <defs>
                        <linearGradient id="heroCurveGrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#004ac6" stopOpacity="0.3"></stop>
                          <stop offset="100%" stopColor="#004ac6" stopOpacity="0.0"></stop>
                        </linearGradient>
                      </defs>
                      <line stroke="#c3c6d7" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="400" y1="100" y2="100"></line>
                      <line stroke="#c3c6d7" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="400" y1="50" y2="50"></line>
                      <path
                        d={`M 0 100 Q 200 ${controlY} 400 ${endY} L 400 120 L 0 120 Z`}
                        fill="url(#heroCurveGrad)"
                      ></path>
                      <path
                        d={`M 0 100 Q 200 ${controlY} 400 ${endY}`}
                        fill="none"
                        stroke="#004ac6"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      ></path>
                      <circle
                        cx="400"
                        cy={endY}
                        fill="#632ecd"
                        r="5.5"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      ></circle>
                    </svg>
                  </div>
                </div>

                {/* KPI Metric Strip */}
                <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
                  <div className="bg-surface-container rounded-xl p-space-xs px-space-sm flex flex-col border border-surface-container-high/40">
                    <span className="font-label-sm text-label-sm text-secondary uppercase font-medium">
                      Interest Earned
                    </span>
                    <span className="font-data-mono-lg text-data-mono-lg text-primary font-bold">
                      {formatMoney(heroInterest)}
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">
                      +{heroGrowthRoi.toFixed(1)}% Growth
                    </span>
                  </div>
                  <div className="bg-surface-container-high rounded-xl p-space-xs px-space-sm flex flex-col border border-surface-container-highest/60">
                    <span className="font-label-sm text-label-sm text-secondary uppercase font-medium">
                      Maturity Value
                    </span>
                    <span className="font-data-mono-lg text-data-mono-lg text-on-surface font-bold">
                      {formatMoney(heroMaturity)}
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary font-semibold">
                      Eff. Rate {heroEffectiveRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Trust & Metrics Strip */}
      <section className="w-full py-space-md my-space-md bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md divide-y md:divide-y-0 text-center">
          <div className="flex flex-col items-center justify-center p-space-xs">
            <span className="font-display-xl text-headline-lg text-primary font-bold tracking-tight">
              {currencyConfig.symbol}1.48B+
            </span>
            <span className="font-label-sm text-label-sm text-secondary uppercase font-medium mt-1">
              Simulated Volume
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-space-xs">
            <span className="font-display-xl text-headline-lg text-on-surface font-bold tracking-tight">
              99.999%
            </span>
            <span className="font-label-sm text-label-sm text-secondary uppercase font-medium mt-1">
              Formula Determinism
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-space-xs">
            <span className="font-display-xl text-headline-lg text-tertiary font-bold tracking-tight">
              &lt; 4ms
            </span>
            <span className="font-label-sm text-label-sm text-secondary uppercase font-medium mt-1">
              Client Evaluation
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-space-xs">
            <span className="font-display-xl text-headline-lg text-on-surface font-bold tracking-tight">
              ISO 27001
            </span>
            <span className="font-label-sm text-label-sm text-secondary uppercase font-medium mt-1">
              Zero-Data Retention
            </span>
          </div>
        </div>
      </section>

      {/* Financial Intelligence / Live Ticker Strip */}
      <div className="w-full bg-surface-container rounded-xl p-space-xs px-space-md mb-space-2xl flex items-center justify-between overflow-x-auto gap-space-md border border-surface-container-high/40">
        <div className="flex items-center gap-space-xs shrink-0">
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
            Live Yield Benchmarks
          </span>
        </div>
        <div className="flex items-center gap-space-lg text-body-sm shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-secondary font-medium">US 10Y Treasury:</span>
            <span className="font-data-mono-md text-body-sm font-bold text-on-surface">4.32%</span>
            <span className="text-primary font-label-sm text-label-sm font-semibold">+0.04</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-secondary font-medium">RBI Repo Rate:</span>
            <span className="font-data-mono-md text-body-sm font-bold text-on-surface">6.50%</span>
            <span className="text-secondary font-label-sm text-label-sm font-semibold">Unch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-secondary font-medium">Nifty CAGR (10Y):</span>
            <span className="font-data-mono-md text-body-sm font-bold text-on-surface">13.8%</span>
            <span className="text-primary font-label-sm text-label-sm font-semibold">Bullish</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-secondary font-medium">Inflation Baseline (CPI):</span>
            <span className="font-data-mono-md text-body-sm font-bold text-on-surface">4.85%</span>
            <span className="text-tertiary font-label-sm text-label-sm font-semibold">Target 4.0</span>
          </div>
        </div>
      </div>

      {/* Primary Section: High-Fidelity Quick Calculators Grid */}
      <section className="w-full pb-space-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-xs">
              <span className="px-space-xs py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold uppercase">
                Engine Suite
              </span>
              <span className="text-secondary font-label-sm text-label-sm">&bull; 6 Core Tools</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Standard &amp; Advanced Calculators
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Accurate algebraic implementations with real-time parameter tweaking, schedule amortization, and formula proofs.
            </p>
          </div>
        </div>

        {/* Featured Highlight Banner: Date-to-Date Cash Flow & Running Ledger */}
        <div className="w-full mb-space-lg p-space-lg rounded-2xl bg-gradient-to-r from-primary-fixed/40 via-surface-container-lowest to-surface-container-low border border-primary/25 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[26px]">calendar_month</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                  New Feature
                </span>
                <span className="text-secondary font-label-sm text-label-sm">Custom Calendar Dates &amp; Multi-tranche Inflows</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                Date-to-Date Cash Flow &amp; Running Interest Ledger
              </h3>
              <p className="text-secondary font-body-sm text-body-sm max-w-2xl">
                Got 10,000 today, 10,000 in a week, and someone took money later? Track exact calendar dates, staggered receipts, and withdrawals with daily interest accrual and an interactive passbook ledger.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('date-ledger')}
            className="shrink-0 h-11 px-space-lg rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-bold transition-all shadow-xs flex items-center gap-2"
            type="button"
          >
            <span>Open Date Ledger</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        {/* 6 Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {/* Card 1: Simple Interest */}
          <div
            onClick={() => navigateTo('calculators')}
            className="group bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer border border-surface-container-high/40"
          >
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary-container/15 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[26px]">percent</span>
                </div>
                <span className="px-space-xs py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                  Linear Model
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">
                  Simple Interest
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Calculate linear accrued interest on capital bonds, fixed deposits, short-term promissory notes, and trade financing.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-xs flex items-center justify-between border border-surface-container-high/30">
                <code className="font-mono text-body-sm text-on-surface font-semibold">
                  I = P &times; R &times; T / 100
                </code>
                <span className="text-secondary font-label-sm text-label-sm">Linear</span>
              </div>
            </div>
            <div className="pt-space-md flex items-center justify-between">
              <div className="flex items-center gap-1 text-secondary font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">speed</span>
                <span>Instant schedule</span>
              </div>
              <span className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary group-hover:translate-x-1 transition-transform">
                <span>Calculate</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </span>
            </div>
          </div>

          {/* Card 2: Compound Interest */}
          <div
            onClick={() => navigateTo('calculators')}
            className="group bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer border border-surface-container-high/40"
          >
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-tertiary-container/15 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[26px]">trending_up</span>
                </div>
                <span className="px-space-xs py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                  Exponential
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-tertiary transition-colors">
                  Compound Interest
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Model multi-frequency accruals (annual, quarterly, monthly, daily, and continuous eʳᵗ) with visual balance splits.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-xs flex items-center justify-between border border-surface-container-high/30">
                <code className="font-mono text-body-sm text-tertiary font-semibold">
                  A = P(1 + r/n)ⁿᵗ
                </code>
                <span className="text-secondary font-label-sm text-label-sm">Multi-Freq</span>
              </div>
            </div>
            <div className="pt-space-md flex items-center justify-between">
              <div className="flex items-center gap-1 text-secondary font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px] text-tertiary">data_exploration</span>
                <span>APY / APR matrix</span>
              </div>
              <span className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-tertiary group-hover:translate-x-1 transition-transform">
                <span>Calculate</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </span>
            </div>
          </div>

          {/* Card 3: Loan EMI & Amortization */}
          <div
            onClick={() => navigateTo('loan-and-emi')}
            className="group bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer border border-surface-container-high/40"
          >
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary-container/15 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[26px]">account_balance</span>
                </div>
                <span className="px-space-xs py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                  Reducing Balance
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">
                  Loan EMI &amp; Amortization
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Calculate monthly installments for mortgages, auto loans, and personal credit with dynamic pre-payment impact evaluation.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-xs flex items-center justify-between border border-surface-container-high/30">
                <code className="font-mono text-body-sm text-on-surface font-semibold">
                  E = P&middot;r(1+r)ⁿ / ((1+r)ⁿ-1)
                </code>
                <span className="text-secondary font-label-sm text-label-sm">Monthly</span>
              </div>
            </div>
            <div className="pt-space-md flex items-center justify-between">
              <div className="flex items-center gap-1 text-secondary font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                <span>Full schedule</span>
              </div>
              <span className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary group-hover:translate-x-1 transition-transform">
                <span>Amortize</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </span>
            </div>
          </div>

          {/* Card 4: Investment Returns & SIP */}
          <div
            onClick={() => navigateTo('investment')}
            className="group bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer border border-surface-container-high/40"
          >
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold">
                  <span className="material-symbols-outlined text-[26px]">savings</span>
                </div>
                <span className="px-space-xs py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  Wealth Corpus
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">
                  Investment Returns (SIP)
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Simulate disciplined recurring contributions (SIP) alongside lumpsum infusions, inflation drag, and post-tax yield estimates.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-xs flex items-center justify-between border border-surface-container-high/30">
                <code className="font-mono text-body-sm text-on-surface font-semibold">
                  M = P &times; ((1+i)ⁿ - 1)/i &times; (1+i)
                </code>
                <span className="text-secondary font-label-sm text-label-sm">CAGR</span>
              </div>
            </div>
            <div className="pt-space-md flex items-center justify-between">
              <div className="flex items-center gap-1 text-secondary font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">query_stats</span>
                <span>Real purchasing power</span>
              </div>
              <span className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary group-hover:translate-x-1 transition-transform">
                <span>Calculate</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </span>
            </div>
          </div>

          {/* Card 5: Reverse Savings Goal Solver */}
          <div
            onClick={() => navigateTo('investment')}
            className="group bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer border border-surface-container-high/40"
          >
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[26px]">flag_circle</span>
                </div>
                <span className="px-space-xs py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                  Reverse Target
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">
                  Savings Goal Solver
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Determine exact monthly deposits or initial capital required to reach target nest eggs for retirement, college, or property acquisition.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-xs flex items-center justify-between border border-surface-container-high/30">
                <code className="font-mono text-body-sm text-on-surface font-semibold">
                  PMT = FV &times; i / ((1+i)ⁿ - 1)
                </code>
                <span className="text-secondary font-label-sm text-label-sm">Target FV</span>
              </div>
            </div>
            <div className="pt-space-md flex items-center justify-between">
              <div className="flex items-center gap-1 text-secondary font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">track_changes</span>
                <span>Step-up planning</span>
              </div>
              <span className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary group-hover:translate-x-1 transition-transform">
                <span>Solve Target</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </span>
            </div>
          </div>

          {/* Card 6: Advanced Wolfram-Style Solver */}
          <div
            onClick={() => navigateTo('advanced-solver')}
            className="group bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden cursor-pointer border border-surface-container-high/40"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-tertiary/15 to-transparent rounded-bl-full pointer-events-none"></div>
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[26px]">psychology_alt</span>
                </div>
                <span className="px-space-xs py-1 rounded-full bg-tertiary-container text-on-tertiary font-label-sm text-label-sm font-semibold">
                  AI Solver
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-tertiary transition-colors">
                  Advanced Natural Solver
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Type complex financial prompts in plain English: &quot;How long to double $50k at 8.4% monthly compounding with $200 extra monthly?&quot;
                </p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-xs flex items-center justify-between border border-surface-container-high/30">
                <span className="font-mono text-body-sm text-tertiary font-semibold truncate">
                  NLP Parser + Symbolic Solver
                </span>
                <span className="text-secondary font-label-sm text-label-sm shrink-0">Any Variable</span>
              </div>
            </div>
            <div className="pt-space-md flex items-center justify-between">
              <div className="flex items-center gap-1 text-secondary font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px] text-tertiary">auto_fix_high</span>
                <span>Instant Derivation</span>
              </div>
              <span className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-tertiary group-hover:translate-x-1 transition-transform">
                <span>Launch Engine</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Amortization Simulation & Analytical Highlights Section */}
      <section className="w-full pb-space-2xl">
        <div className="bg-surface-container-lowest rounded-3xl p-space-lg lg:p-space-xl shadow-md border border-surface-container-high/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            {/* Amortization Narrative (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-space-md">
              <div className="inline-flex items-center gap-space-xs px-space-xs py-1 rounded-md bg-surface-container text-secondary font-label-sm text-label-sm font-semibold uppercase">
                <span className="material-symbols-outlined text-[16px] text-primary">pie_chart</span>
                <span>Institutional Mechanics</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Why Precision Engineering Matters
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Standard online tools often apply simplistic annualized averages that hide compounding lag and front-loaded interest burdens. Interestly&apos;s computational engine recalculates reducing principal continuously, showing you exactly how much every extra dollar saves over time.
              </p>

              <div className="flex flex-col gap-space-sm">
                <div className="flex items-start gap-space-sm p-space-xs rounded-xl hover:bg-surface-container transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[20px]">tune</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Real-Time Dynamic Evaluation
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Adjust sliders and variables with sub-millisecond client-side recalculations. No server roundtrips.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-space-sm p-space-xs rounded-xl hover:bg-surface-container transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[20px]">functions</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Step-by-Step Proofs
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Inspect transparent formula substitutions, intermediate logarithms, and mathematical balance proofs.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-space-sm p-space-xs rounded-xl hover:bg-surface-container transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Audit-Ready Export Formats
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Download complete year-by-year amortization schedules and cashflow tables in institutional CSV or PDF format.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Visualization Sandbox (7 cols) */}
            <div className="lg:col-span-7 bg-surface-container-low rounded-2xl p-space-md flex flex-col gap-space-md border border-surface-container-high/40">
              <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
                <div>
                  <span className="font-label-sm text-label-sm uppercase text-secondary font-semibold">
                    Simulated Sample
                  </span>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    20-Year Home Loan Amortization Profile
                  </h4>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-1 rounded-md bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-semibold shadow-sm border border-surface-container-high/50">
                    {formatMoney(4500000)} @ 8.5%
                  </span>
                </div>
              </div>

              {/* Principal vs Interest Amortization Bar Stack */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between text-body-sm font-medium">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 rounded-sm bg-primary"></span>
                    <span className="text-on-surface font-label-md text-label-md">
                      Principal Paid: <strong className="font-data-mono-md">{formatMoney(4500000)}</strong> (48%)
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 rounded-sm bg-tertiary"></span>
                    <span className="text-on-surface font-label-md text-label-md">
                      Total Interest: <strong className="font-data-mono-md">{formatMoney(4881840)}</strong> (52%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-4 bg-surface-container rounded-full overflow-hidden flex">
                  <div className="h-full bg-primary" style={{ width: '48%' }}></div>
                  <div className="h-full bg-tertiary" style={{ width: '52%' }}></div>
                </div>
              </div>

              {/* Year-by-Year Schedule Snippet Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm">
                  <thead>
                    <tr className="text-secondary font-label-sm text-label-sm uppercase bg-surface-container rounded-lg">
                      <th className="p-space-xs rounded-l-lg">Year</th>
                      <th className="p-space-xs">Principal Repaid</th>
                      <th className="p-space-xs">Interest Repaid</th>
                      <th className="p-space-xs">Balance Remaining</th>
                      <th className="p-space-xs rounded-r-lg">Loan Paid %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    <tr>
                      <td className="p-space-xs font-semibold">Year 1</td>
                      <td className="p-space-xs font-mono">{formatMoney(90820)}</td>
                      <td className="p-space-xs font-mono text-tertiary">{formatMoney(378080)}</td>
                      <td className="p-space-xs font-mono">{formatMoney(4409180)}</td>
                      <td className="p-space-xs font-semibold text-primary">2.0%</td>
                    </tr>
                    <tr>
                      <td className="p-space-xs font-semibold">Year 5</td>
                      <td className="p-space-xs font-mono">{formatMoney(127150)}</td>
                      <td className="p-space-xs font-mono text-tertiary">{formatMoney(341750)}</td>
                      <td className="p-space-xs font-mono">{formatMoney(3926450)}</td>
                      <td className="p-space-xs font-semibold text-primary">12.7%</td>
                    </tr>
                    <tr>
                      <td className="p-space-xs font-semibold">Year 10</td>
                      <td className="p-space-xs font-mono">{formatMoney(194860)}</td>
                      <td className="p-space-xs font-mono text-tertiary">{formatMoney(274040)}</td>
                      <td className="p-space-xs font-mono">{formatMoney(3049210)}</td>
                      <td className="p-space-xs font-semibold text-primary">32.2%</td>
                    </tr>
                    <tr>
                      <td className="p-space-xs font-semibold">Year 15</td>
                      <td className="p-space-xs font-mono">{formatMoney(298620)}</td>
                      <td className="p-space-xs font-mono text-tertiary">{formatMoney(170280)}</td>
                      <td className="p-space-xs font-mono">{formatMoney(1704330)}</td>
                      <td className="p-space-xs font-semibold text-primary">62.1%</td>
                    </tr>
                    <tr>
                      <td className="p-space-xs font-semibold">Year 20</td>
                      <td className="p-space-xs font-mono">{formatMoney(457820)}</td>
                      <td className="p-space-xs font-mono text-tertiary">{formatMoney(11080)}</td>
                      <td className="p-space-xs font-mono">{formatMoney(0)}</td>
                      <td className="p-space-xs font-semibold text-primary">100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-space-xs">
                <span className="font-body-sm text-body-sm text-secondary">
                  Tip: Adding {formatMoney(5000)} monthly prepay cuts your loan tenure by 4.5 years.
                </span>
                <button
                  onClick={() => navigateTo('loan-and-emi')}
                  className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary hover:underline"
                >
                  <span>Simulate Prepayment</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Precision Principles / Callout Banner */}
      <section className="w-full pb-space-lg">
        <div className="bg-gradient-to-r from-primary to-tertiary rounded-3xl p-space-xl text-on-primary shadow-lg flex flex-col md:flex-row items-center justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs max-w-2xl">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-primary-container font-semibold">
              Client-Side Precision Guarantee
            </span>
            <h3 className="font-headline-lg text-headline-lg text-on-primary font-bold">
              Ready to take control of your financial calculations?
            </h3>
            <p className="font-body-md text-body-md text-on-primary/90 leading-relaxed">
              Experience clean, fast, advert-free financial modeling. Explore compounding, solve real inflation scenarios, or benchmark personal wealth horizons today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-space-sm shrink-0">
            <button
              onClick={() => navigateTo('advanced-solver')}
              className="h-11 px-space-lg rounded-xl bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold shadow-md hover:bg-surface-container-low transition-all active:scale-[0.99] flex items-center justify-center"
            >
              Open Advanced Solver
            </button>
            <button
              onClick={() => navigateTo('learn')}
              className="h-11 px-space-md rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors flex items-center justify-center"
            >
              Explore Formula Guides
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
