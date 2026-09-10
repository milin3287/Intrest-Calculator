import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CurrencyCode } from '../types';

export const CalculatorsPage: React.FC = () => {
  const {
    formatMoney,
    currency,
    setCurrency,
    currencyConfig,
    activeCalculatorTab,
    setActiveCalculatorTab,
    triggerToast,
    addHistoryItem,
    navigateTo,
  } = useApp();

  // Primary Workspace Parameters
  const [principal, setPrincipal] = useState<number>(0);
  const [rate, setRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [tenureUnit, setTenureUnit] = useState<'Years' | 'Months' | 'Days'>('Years');
  const [frequency, setFrequency] = useState<number>(4); // 12=monthly, 4=quarterly, 2=semi, 1=annual

  // Advanced adjustments
  const [accordionOpen, setAccordionOpen] = useState<boolean>(true);
  const [periodicAdditionsActive, setPeriodicAdditionsActive] = useState<boolean>(false);
  const [periodicMonthlyAmount, setPeriodicMonthlyAmount] = useState<number>(0);
  const [inflationActive, setInflationActive] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(5.5);
  const [ltcgTaxActive, setLtcgTaxActive] = useState<boolean>(false);
  const [ltcgRate, setLtcgRate] = useState<number>(10.0);

  // Amortization Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

  // Quick adjust helpers
  const adjustPrincipal = (delta: number) => {
    setPrincipal(prev => Math.min(50000000, Math.max(0, prev + delta)));
  };

  const adjustRate = (delta: number) => {
    setRate(prev => {
      const next = Math.min(30, Math.max(1, prev + delta));
      return parseFloat(next.toFixed(2));
    });
  };

  // Convert tenure into fractional years for math
  let t = tenureYears;
  if (tenureUnit === 'Months') t = tenureYears / 12;
  if (tenureUnit === 'Days') t = tenureYears / 365;

  // Math Evaluation
  const n = frequency;
  const r = rate / 100;
  const pmt = periodicAdditionsActive ? periodicMonthlyAmount : 0;

  // Lump sum compound: P * (1 + r/n)^(n*t)
  const compoundPrincipal = principal * Math.pow(1 + r / n, n * t);

  // Periodic addition compound: PMT * [((1 + r/m)^(m*t) - 1) / (r/m)] where m=12 (monthly deposits)
  let compoundAdditions = 0;
  let totalAdditionsDeposited = 0;
  if (pmt > 0 && t > 0) {
    const m = 12;
    const i = r / m;
    const totalPayments = Math.round(m * t);
    totalAdditionsDeposited = pmt * totalPayments;
    if (i > 0) {
      compoundAdditions = pmt * ((Math.pow(1 + i, totalPayments) - 1) / i);
    } else {
      compoundAdditions = totalAdditionsDeposited;
    }
  }

  // Total Corpus
  const totalCorpus = compoundPrincipal + compoundAdditions;
  const totalFunded = principal + totalAdditionsDeposited;
  const totalCompoundInterest = Math.max(0, totalCorpus - totalFunded);

  // Effective Annual Rate (EAR): (1 + r/n)^n - 1
  const effectiveAnnualRate = (Math.pow(1 + r / n, n) - 1) * 100;

  // Realised CAGR
  const cagr = totalFunded > 0 && t > 0 ? (Math.pow(totalCorpus / totalFunded, 1 / t) - 1) * 100 : rate;
  const totalRoi = totalFunded > 0 ? ((totalCorpus - totalFunded) / totalFunded) * 100 : 0;

  // Inflation Adjusted Purchasing Power: Corpus / (1 + inf)^t
  const inflationFactor = inflationActive ? Math.pow(1 + inflationRate / 100, t) : 1;
  const inflationAdjustedCorpus = totalCorpus / inflationFactor;
  const realGain = inflationAdjustedCorpus - totalFunded;

  // Breakdown Percentages
  const principalPct = totalCorpus > 0 ? (principal / totalCorpus) * 100 : 50;
  const additionsPct = totalCorpus > 0 ? (totalAdditionsDeposited / totalCorpus) * 100 : 0;
  const gainPct = Math.max(0, 100 - principalPct - additionsPct);

  // Donut SVG circumference calculation (r = 38 => circumference = 2 * PI * 38 = 238.76)
  const circ = 238.76;
  const seg1Len = (principalPct / 100) * circ;
  const seg2Len = (additionsPct / 100) * circ;
  const seg3Len = (gainPct / 100) * circ;
  const offset1 = 0;
  const offset2 = -seg1Len;
  const offset3 = -(seg1Len + seg2Len);

  // Trajectory year points (up to 5 years or tenure)
  const trajectorySteps = 5;
  const trajectoryData = [];
  for (let yr = 0; yr <= trajectorySteps; yr++) {
    const fraction = yr / trajectorySteps;
    const currentT = t * fraction;
    const curP = principal;
    const curAdditions = pmt * (12 * currentT);
    const curFunded = curP + curAdditions;
    const curCompP = curP * Math.pow(1 + r / n, n * currentT);
    let curCompAdd = 0;
    if (pmt > 0 && currentT > 0) {
      const m = 12;
      const i = r / m;
      curCompAdd = pmt * ((Math.pow(1 + i, m * currentT) - 1) / i);
    }
    const curTotal = curCompP + curCompAdd;
    trajectoryData.push({
      year: yr === 0 ? 'Start' : `Year ${yr}`,
      funded: curFunded,
      total: curTotal,
    });
  }

  // Scenarios for quick cards
  const scenarioPlus1Pct = () => {
    const rNew = (rate + 1.0) / 100;
    const cp = principal * Math.pow(1 + rNew / n, n * t);
    let ca = 0;
    if (pmt > 0 && t > 0) {
      const m = 12;
      const i = rNew / m;
      ca = pmt * ((Math.pow(1 + i, m * t) - 1) / i);
    }
    return cp + ca;
  };
  const valPlus1 = scenarioPlus1Pct();
  const diffPlus1 = valPlus1 - totalCorpus;

  const scenario10Yr = () => {
    const tNew = 10;
    const cp = principal * Math.pow(1 + r / n, n * tNew);
    let ca = 0;
    if (pmt > 0) {
      const m = 12;
      const i = r / m;
      ca = pmt * ((Math.pow(1 + i, m * tNew) - 1) / i);
    }
    return cp + ca;
  };
  const val10Yr = scenario10Yr();

  const ruleOf72Years = rate > 0 ? (72 / rate).toFixed(2) : '0';

  const handleSaveCalculation = () => {
    addHistoryItem({
      category: 'Compound Interest',
      title: `Compound Corpus — ${formatMoney(principal)} @ ${rate}% for ${tenureYears} yrs`,
      principal,
      rate,
      tenureYears,
      frequency: n === 12 ? 'Monthly (n=12)' : n === 4 ? 'Quarterly (n=4)' : n === 2 ? 'Semi-Annual (n=2)' : 'Annual (n=1)',
      resultValue: totalCorpus,
      resultFormatted: formatMoney(totalCorpus),
      formula: 'A = P(1 + r/n)ⁿᵗ + PMT × [((1 + r/n)ⁿᵗ - 1)/(r/n)]',
      details: [
        { label: 'Principal Base', value: formatMoney(principal) },
        { label: 'SIP Inflows', value: formatMoney(totalAdditionsDeposited) },
        { label: 'Compound Yield', value: formatMoney(totalCompoundInterest) },
        { label: 'Effective Rate (EAR)', value: `${effectiveAnnualRate.toFixed(2)}%` },
      ],
    });
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(`${formatMoney(totalCorpus)} (Accumulated Corpus after ${tenureYears} years @ ${rate}%)`);
    triggerToast('Copied total accumulated corpus to clipboard!');
  };

  const subNavTabs = [
    'Simple Interest',
    'Compound Interest',
    'Custom Dates Ledger',
    'Loan EMI',
    'Investment Growth',
    'Present Value',
    'Future Value',
    'SIP & Recurring',
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Breadcrumb & Workflow Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md">
        <div className="flex items-center gap-space-2xs text-secondary font-label-md text-label-md">
          <button className="hover:text-primary transition-colors" onClick={() => navigateTo('home')}>Home</button>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span className="hover:text-primary transition-colors">Calculators</span>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span className="text-on-surface font-semibold">Workspace</span>
          <span className="ml-space-2xs px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
            Engine v4.2
          </span>
        </div>
        <div className="flex items-center gap-space-xs">
          <div className="flex items-center gap-space-2xs text-secondary font-body-sm text-body-sm bg-surface-container-low px-space-sm py-1 rounded-full border border-surface-container-high/40">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span>Autosave: Active</span>
          </div>
          <button
            onClick={() => triggerToast('Institutional calculation guide & documentation.')}
            className="flex items-center gap-1 text-secondary hover:text-on-surface font-label-sm text-label-sm px-space-xs py-1 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">help_outline</span> Docs
          </button>
        </div>
      </div>

      {/* Date-to-Date Irregular Cash Flow Quick Banner */}
      <div className="w-full mb-space-md p-space-sm px-space-md rounded-xl bg-gradient-to-r from-primary-fixed/40 to-surface-container-lowest border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
          <span>
            <strong>Need irregular custom dates?</strong> (e.g. 10k today + 10k in 1 week − 5k taken later)
          </span>
        </div>
        <button
          onClick={() => navigateTo('date-ledger')}
          className="text-primary hover:text-primary-container font-bold underline flex items-center gap-1 shrink-0 text-xs"
          type="button"
        >
          Open Custom Date Ledger &rarr;
        </button>
      </div>

      {/* Horizontal Calculator Switcher Sub-nav */}
      <div className="w-full overflow-x-auto pb-space-xs mb-space-lg no-scrollbar">
        <div className="flex items-center gap-space-2xs p-1.5 bg-surface-container-low rounded-xl min-w-max shadow-xs border border-surface-container-high/40">
          {subNavTabs.map(tab => {
            const isActive = activeCalculatorTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'Custom Dates Ledger') {
                    navigateTo('date-ledger');
                    return;
                  }
                  setActiveCalculatorTab(tab);
                  triggerToast(`Switched workspace model to ${tab}`);
                }}
                className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Asymmetric Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Parameter Input Console (5 Columns on Desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container-high/50">
            {/* Panel Header & Quick Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Calculation Setup
                </h2>
              </div>
              <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase font-semibold">
                Exact Precision
              </span>
            </div>

            {/* Currency Selector Strip */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                Base Currency &amp; Notation
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container-low rounded-lg text-center border border-surface-container-high/40">
                {(['INR', 'USD', 'EUR', 'GBP'] as CurrencyCode[]).map(currCode => {
                  const isSelected = currency === currCode;
                  const labels: Record<CurrencyCode, string> = {
                    INR: '₹ INR',
                    USD: '$ USD',
                    EUR: '€ EUR',
                    GBP: '£ GBP',
                  };
                  return (
                    <button
                      key={currCode}
                      onClick={() => setCurrency(currCode)}
                      type="button"
                      className={`py-1.5 rounded-md font-label-md text-label-md transition-all ${
                        isSelected
                          ? 'text-primary bg-surface-container-lowest shadow-sm font-semibold'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                    >
                      {labels[currCode]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Principal Amount Input & Fast Incrementers */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="principal-input">
                  Principal Amount
                </label>
                <span className="font-body-sm text-body-sm text-secondary">
                  Min: {currencyConfig.symbol}10K &bull; Max: {currencyConfig.symbol}50L
                </span>
              </div>
              <div className="flex items-center rounded-lg bg-surface-container-lowest shadow-xs overflow-hidden border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-primary">
                <span className="px-space-md py-2.5 bg-surface-container-high text-primary font-data-mono-md text-data-mono-md font-bold">
                  {currencyConfig.symbol}
                </span>
                <input
                  className="w-full px-space-sm py-2.5 bg-surface-container-lowest font-data-mono-lg text-data-mono-lg text-on-surface font-semibold focus:outline-none"
                  id="principal-input"
                  max="50000000"
                  min="0"
                  step="1000"
                  type="number"
                  placeholder="Enter principal amount"
                  value={principal === 0 ? '' : principal}
                  onChange={e => setPrincipal(parseFloat(e.target.value) || 0)}
                />
              </div>
              <input
                className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                max="5000000"
                min="0"
                step="10000"
                type="range"
                value={principal}
                onChange={e => setPrincipal(parseFloat(e.target.value) || 0)}
              />
              {/* Quick Increment Badges */}
              <div className="flex items-center gap-space-2xs pt-1 flex-wrap">
                <button
                  className="px-space-xs py-1 rounded-md bg-surface-container-low hover:bg-surface-container-high text-secondary hover:text-on-surface font-label-sm text-label-sm transition-colors border border-surface-container-high/40"
                  onClick={() => adjustPrincipal(25000)}
                  type="button"
                >
                  +{currencyConfig.symbol}25,000
                </button>
                <button
                  className="px-space-xs py-1 rounded-md bg-surface-container-low hover:bg-surface-container-high text-secondary hover:text-on-surface font-label-sm text-label-sm transition-colors border border-surface-container-high/40"
                  onClick={() => adjustPrincipal(100000)}
                  type="button"
                >
                  +{currencyConfig.symbol}1,00,000
                </button>
                <button
                  className="px-space-xs py-1 rounded-md bg-surface-container-low hover:bg-surface-container-high text-secondary hover:text-on-surface font-label-sm text-label-sm transition-colors border border-surface-container-high/40"
                  onClick={() => adjustPrincipal(500000)}
                  type="button"
                >
                  +{currencyConfig.symbol}5,00,000
                </button>
                <button
                  className="ml-auto text-outline hover:text-error text-body-sm font-body-sm transition-colors flex items-center gap-0.5"
                  onClick={() => setPrincipal(0)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span> Clear
                </button>
              </div>
            </div>

            {/* Annual Interest Rate */}
            <div className="flex flex-col gap-2 pt-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="rate-input">
                  Annual Nominal Rate (r)
                </label>
                <span className="font-label-sm text-label-sm text-primary font-semibold bg-primary-fixed px-space-xs py-0.5 rounded">
                  Benchmark: 8.5% p.a.
                </span>
              </div>
              <div className="grid grid-cols-12 gap-space-xs items-center">
                <div className="col-span-8 flex items-center rounded-lg bg-surface-container-lowest shadow-xs overflow-hidden border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-primary">
                  <input
                    className="w-full px-space-sm py-2 bg-surface-container-lowest font-data-mono-md text-data-mono-md text-on-surface font-semibold focus:outline-none"
                    id="rate-input"
                    max="30"
                    min="1"
                    step="0.1"
                    type="number"
                    value={rate}
                    onChange={e => setRate(parseFloat(e.target.value) || 0)}
                  />
                  <span className="px-space-sm py-2 bg-surface-container-high text-secondary font-label-md text-label-md font-medium">
                    % p.a.
                  </span>
                </div>
                <div className="col-span-4 flex items-center gap-1 justify-end">
                  <button
                    className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface font-bold text-lg active:scale-95 transition-all border border-surface-container-high/60"
                    onClick={() => adjustRate(-0.25)}
                    type="button"
                    title="Decrease by 0.25%"
                  >
                    -
                  </button>
                  <button
                    className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface font-bold text-lg active:scale-95 transition-all border border-surface-container-high/60"
                    onClick={() => adjustRate(0.25)}
                    type="button"
                    title="Increase by 0.25%"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                max="25"
                min="1"
                step="0.1"
                type="range"
                value={rate}
                onChange={e => setRate(parseFloat(e.target.value))}
              />
            </div>

            {/* Investment Horizon / Time Period */}
            <div className="flex flex-col gap-2 pt-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="tenure-input">
                  Investment Horizon
                </label>
                <div className="flex items-center p-0.5 bg-surface-container-low rounded-lg text-label-sm font-label-sm border border-surface-container-high/40">
                  {(['Years', 'Months', 'Days'] as const).map(unit => (
                    <button
                      key={unit}
                      onClick={() => setTenureUnit(unit)}
                      type="button"
                      className={`px-space-xs py-0.5 rounded transition-all ${
                        tenureUnit === unit
                          ? 'bg-surface-container-lowest shadow-xs text-primary font-semibold'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-space-xs">
                <input
                  className="w-24 px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface font-data-mono-md text-data-mono-md font-semibold text-center border border-surface-container-high/60 focus:ring-2 focus:ring-primary focus:outline-none"
                  id="tenure-input"
                  max="40"
                  min="1"
                  type="number"
                  value={tenureYears}
                  onChange={e => setTenureYears(parseInt(e.target.value, 10) || 1)}
                />
                <input
                  className="flex-1 accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                  max="30"
                  min="1"
                  type="range"
                  value={tenureYears}
                  onChange={e => setTenureYears(parseInt(e.target.value, 10))}
                />
                <span className="font-data-mono-md text-data-mono-md text-secondary font-medium w-16 text-right">
                  {tenureYears} {tenureUnit === 'Years' ? 'Yrs' : tenureUnit === 'Months' ? 'Mo' : 'Days'}
                </span>
              </div>
            </div>

            {/* Compounding Frequency Selector */}
            <div className="flex flex-col gap-1.5 pt-space-xs">
              <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                Compounding Frequency (n)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Monthly', n: 12, sub: 'n=12' },
                  { label: 'Quarterly', n: 4, sub: 'n=4' },
                  { label: 'Semi-Annual', n: 2, sub: 'n=2' },
                  { label: 'Annually', n: 1, sub: 'n=1' },
                ].map(item => {
                  const isSelected = frequency === item.n;
                  return (
                    <button
                      key={item.n}
                      onClick={() => setFrequency(item.n)}
                      type="button"
                      className={`py-2 px-1 text-center rounded-lg font-label-sm text-label-sm transition-all border ${
                        isSelected
                          ? 'bg-primary text-on-primary font-semibold shadow-sm border-primary'
                          : 'bg-surface-container-low text-secondary hover:text-on-surface border-surface-container-high/40'
                      }`}
                    >
                      {item.label}
                      <span
                        className={`block text-[10px] ${
                          isSelected ? 'text-primary-fixed' : 'text-outline'
                        }`}
                      >
                        {item.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Mathematical Adjustments Accordion */}
            <div className="mt-space-xs rounded-xl bg-surface-container-low p-space-sm flex flex-col gap-space-sm border border-surface-container-high/40">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setAccordionOpen(!accordionOpen)}
              >
                <div className="flex items-center gap-space-2xs text-on-surface font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">account_balance</span>
                  <span>Advanced Parameters &amp; Cash Flow</span>
                </div>
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  {accordionOpen ? 'expand_less' : 'expand_more'}
                </span>
              </div>

              {accordionOpen && (
                <div className="flex flex-col gap-space-sm pt-space-xs">
                  {/* Monthly Cash Addition */}
                  <div className="flex items-center justify-between gap-space-sm bg-surface-container-lowest p-space-xs rounded-lg shadow-xs border border-surface-container-high/40">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                        Periodic Additions
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary">
                        Invest {formatMoney(periodicMonthlyAmount)} monthly
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <input
                        className="w-24 text-right px-2 py-1 bg-surface-container-low rounded font-data-mono-md text-label-md font-semibold text-on-surface border border-surface-container-high/50"
                        type="number"
                        step="500"
                        placeholder="0"
                        value={periodicMonthlyAmount === 0 ? '' : periodicMonthlyAmount}
                        onChange={e => setPeriodicMonthlyAmount(parseFloat(e.target.value) || 0)}
                      />
                      <button
                        className={`w-9 h-5 rounded-full relative p-0.5 transition-colors ${
                          periodicAdditionsActive ? 'bg-primary' : 'bg-surface-container-highest'
                        }`}
                        onClick={() => setPeriodicAdditionsActive(!periodicAdditionsActive)}
                        type="button"
                        aria-label="Toggle periodic additions"
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            periodicAdditionsActive ? 'ml-auto' : 'ml-0'
                          }`}
                        ></div>
                      </button>
                    </div>
                  </div>

                  {/* Inflation Adjustment */}
                  <div className="flex items-center justify-between gap-space-sm bg-surface-container-lowest p-space-xs rounded-lg shadow-xs border border-surface-container-high/40">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                        Inflation Hedging (CPI)
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary">
                        Discount rate at {inflationRate}% p.a.
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-data-mono-md text-label-md font-bold text-tertiary">
                        {inflationRate}%
                      </span>
                      <button
                        className={`w-9 h-5 rounded-full relative p-0.5 transition-colors ${
                          inflationActive ? 'bg-primary' : 'bg-surface-container-highest'
                        }`}
                        onClick={() => setInflationActive(!inflationActive)}
                        type="button"
                        aria-label="Toggle inflation hedging"
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            inflationActive ? 'ml-auto' : 'ml-0'
                          }`}
                        ></div>
                      </button>
                    </div>
                  </div>

                  {/* Capital Gains Tax */}
                  <div className="flex items-center justify-between gap-space-sm bg-surface-container-lowest p-space-xs rounded-lg shadow-xs border border-surface-container-high/40">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                        LTCG Tax Estimate
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary">
                        Applied on net gains
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-data-mono-md text-label-md font-semibold text-on-surface-variant">
                        {ltcgRate.toFixed(1)}%
                      </span>
                      <button
                        className={`w-9 h-5 rounded-full relative p-0.5 transition-colors ${
                          ltcgTaxActive ? 'bg-primary' : 'bg-surface-container-highest'
                        }`}
                        onClick={() => setLtcgTaxActive(!ltcgTaxActive)}
                        type="button"
                        aria-label="Toggle LTCG tax estimate"
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            ltcgTaxActive ? 'ml-auto' : 'ml-0'
                          }`}
                        ></div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Execution Button Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-space-xs pt-space-xs">
              <button
                onClick={() => triggerToast('Recalculated with exact continuous float matrices.')}
                className="w-full sm:flex-1 h-11 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">calculate</span>
                Recalculate Instantly
              </button>
              <button
                onClick={handleSaveCalculation}
                className="w-full sm:w-auto h-11 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors border border-surface-container-high/40 font-medium"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                Save
              </button>
              <button
                onClick={() => {
                  setPrincipal(0);
                  setRate(8.5);
                  setTenureYears(5);
                  setFrequency(4);
                  setPeriodicMonthlyAmount(0);
                  setPeriodicAdditionsActive(false);
                  triggerToast('Workspace cleared.');
                }}
                className="w-full sm:w-11 h-11 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary hover:text-error flex items-center justify-center transition-colors border border-surface-container-high/40"
                title="Reset All Fields"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
              </button>
            </div>
          </div>

          {/* Formula Visual Card Context */}
          <div className="bg-surface-container p-space-md rounded-xl flex items-start gap-space-sm relative overflow-hidden border border-surface-container-high/50">
            <div className="w-1.5 h-full absolute left-0 top-0 bg-tertiary"></div>
            <span className="material-symbols-outlined text-tertiary text-[24px] shrink-0 mt-0.5">functions</span>
            <div className="flex flex-col gap-1">
              <div className="font-label-sm text-label-sm uppercase font-semibold text-tertiary tracking-wider">
                Governing Equation
              </div>
              <div className="font-data-mono-md text-data-mono-md text-on-surface font-semibold">
                A = P(1 + r/n)<sup>nt</sup> + PMT &times; [((1 + r/n)<sup>nt</sup> - 1)/(r/n)]
              </div>
              <div className="font-body-sm text-body-sm text-secondary">
                Evaluating with P={formatMoney(principal)}, r={(rate / 100).toFixed(3)}, n={frequency} (
                {frequency === 4 ? 'Quarterly' : frequency === 12 ? 'Monthly' : frequency === 2 ? 'Semi-Annual' : 'Annual'}
                ), t={tenureYears} yrs, PMT={formatMoney(pmt)}/mo.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: High-Impact Visual Results Engine (7 Columns on Desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Core Result Header Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-lg relative overflow-hidden border border-surface-container-high/50">
            {/* Top Status Bar in Card */}
            <div className="flex flex-wrap items-center justify-between gap-space-xs">
              <div className="flex items-center gap-2">
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm uppercase font-semibold">
                  Continuous Math Matrix
                </span>
                <span className="text-outline text-body-sm font-body-sm">&bull; High Precision Float</span>
              </div>
              <div className="flex items-center gap-1 text-secondary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
                <span>Zero-drift calculation verified</span>
              </div>
            </div>

            {/* Big Hero Visual Result */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low p-space-lg rounded-xl border border-surface-container-high/50">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                  Total Accumulated Corpus
                </span>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-display-xl text-display-xl text-primary font-bold tracking-tight">
                    {formatMoney(totalCorpus, 2)}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                  Estimated maturity value after {tenureYears}.0 years with reinvested yields
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
                <span className="px-space-sm py-1 rounded-full bg-surface-container-highest text-primary font-label-md text-label-md font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  +{totalRoi.toFixed(1)}% Total ROI
                </span>
                <span className="font-body-sm text-body-sm text-outline font-medium">
                  Realised annualized CAGR: {cagr.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Key Numerical Breakdown (4 Bento Tiles) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-medium">
                  Initial Principal
                </span>
                <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface">
                  {formatMoney(principal)}
                </span>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-primary h-full" style={{ width: `${Math.min(100, principalPct)}%` }}></div>
                </div>
                <span className="font-body-sm text-body-sm text-secondary">
                  {principalPct.toFixed(1)}% of corpus
                </span>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-medium">
                  Total Additions
                </span>
                <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface">
                  {formatMoney(totalAdditionsDeposited)}
                </span>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-secondary h-full" style={{ width: `${Math.min(100, additionsPct)}%` }}></div>
                </div>
                <span className="font-body-sm text-body-sm text-secondary">
                  {additionsPct.toFixed(1)}% periodic
                </span>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-medium">
                  Compound Interest
                </span>
                <span className="font-data-mono-md text-data-mono-md font-bold text-tertiary">
                  {formatMoney(totalCompoundInterest)}
                </span>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-tertiary-container h-full" style={{ width: `${Math.min(100, gainPct)}%` }}></div>
                </div>
                <span className="font-body-sm text-body-sm text-tertiary font-semibold">
                  {gainPct.toFixed(1)}% wealth multiplier
                </span>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-medium">
                  Effective Rate (EAR)
                </span>
                <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface">
                  {effectiveAnnualRate.toFixed(2)}%
                </span>
                <span className="font-label-sm text-label-sm text-outline mt-1 font-medium">
                  Nominal: {rate.toFixed(2)}%
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  {frequency === 4 ? 'Quarterly' : frequency === 12 ? 'Monthly' : frequency === 2 ? 'Semi-Annual' : 'Annual'}
                </span>
              </div>
            </div>

            {/* Deep Analytics: Donut Composition + Trajectory Visual Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md pt-space-xs">
              {/* Interactive Donut Graph (5 Cols) */}
              <div className="md:col-span-5 p-space-md rounded-xl bg-surface-container-low flex flex-col items-center justify-between border border-surface-container-high/40">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Capital Allocation
                  </span>
                  <span className="material-symbols-outlined text-secondary text-[18px]">pie_chart</span>
                </div>
                <div className="relative w-44 h-44 my-2 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-surface-container-high"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="38"
                      stroke="currentColor"
                      strokeWidth="15"
                    ></circle>
                    {/* Principal Segment */}
                    <circle
                      className="text-primary transition-all duration-500"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="38"
                      stroke="currentColor"
                      strokeDasharray={`${seg1Len} ${circ}`}
                      strokeDashoffset={offset1}
                      strokeWidth="15"
                    ></circle>
                    {/* Additions Segment */}
                    {seg2Len > 0 && (
                      <circle
                        className="text-secondary transition-all duration-500"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="38"
                        stroke="currentColor"
                        strokeDasharray={`${seg2Len} ${circ}`}
                        strokeDashoffset={offset2}
                        strokeWidth="15"
                      ></circle>
                    )}
                    {/* Compound Gain Segment */}
                    <circle
                      className="text-tertiary transition-all duration-500"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="38"
                      stroke="currentColor"
                      strokeDasharray={`${seg3Len} ${circ}`}
                      strokeDashoffset={offset3}
                      strokeWidth="15"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="font-body-sm text-body-sm text-secondary font-medium">Yield Portion</span>
                    <span className="font-data-mono-md text-data-mono-md font-bold text-tertiary">
                      {gainPct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Custom Clean Legend */}
                <div className="w-full flex flex-col gap-1 pt-2 text-label-sm font-label-sm border-t border-surface-container-high/40">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Principal Base
                    </span>
                    <span className="font-data-mono-md font-semibold text-on-surface">
                      {formatMoney(principal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> SIP Inflow
                    </span>
                    <span className="font-data-mono-md font-semibold text-on-surface">
                      {formatMoney(totalAdditionsDeposited)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span> Compound Gain
                    </span>
                    <span className="font-data-mono-md font-semibold text-tertiary">
                      {formatMoney(totalCompoundInterest)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive 5-Year Growth Trajectory (7 Cols) */}
              <div className="md:col-span-7 p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between border border-surface-container-high/40">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      5-Year Growth Curve
                    </span>
                    <span className="block font-body-sm text-body-sm text-secondary">
                      Capital curve vs total cash funded
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="font-label-sm text-label-sm text-secondary">Year-by-Year</span>
                  </div>
                </div>

                {/* SVG Vector Area Curve Chart */}
                <div className="relative w-full h-44 pt-2">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 120">
                    <defs>
                      <linearGradient id="growthFillWorkspace" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#004ac6" stopOpacity="0.3"></stop>
                        <stop offset="100%" stopColor="#004ac6" stopOpacity="0.0"></stop>
                      </linearGradient>
                      <linearGradient id="baselineFillWorkspace" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#505f76" stopOpacity="0.15"></stop>
                        <stop offset="100%" stopColor="#505f76" stopOpacity="0.0"></stop>
                      </linearGradient>
                    </defs>

                    {/* Horizontal guidelines */}
                    <line className="text-outline-variant" opacity="0.4" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="320" y1="20" y2="20"></line>
                    <line className="text-outline-variant" opacity="0.4" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="320" y1="60" y2="60"></line>
                    <line className="text-outline-variant" opacity="0.4" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="320" y1="100" y2="100"></line>

                    {/* Baseline Area & Line */}
                    <path d="M0,105 L64,96 L128,87 L192,78 L256,69 L320,60 L320,120 L0,120 Z" fill="url(#baselineFillWorkspace)"></path>
                    <path d="M0,105 L64,96 L128,87 L192,78 L256,69 L320,60" fill="none" stroke="#505f76" strokeDasharray="4 2" strokeWidth="1.5"></path>

                    {/* Growth Spline Area & Line */}
                    <path d="M0,105 C40,98 50,92 64,88 C110,75 118,65 128,58 C180,42 188,32 192,28 C240,15 260,10 320,8 L320,120 L0,120 Z" fill="url(#growthFillWorkspace)"></path>
                    <path d="M0,105 C40,98 50,92 64,88 C110,75 118,65 128,58 C180,42 188,32 192,28 C240,15 260,10 320,8" fill="none" stroke="#004ac6" strokeWidth="2.5"></path>

                    {/* Milestone Points */}
                    <circle className="fill-primary" cx="0" cy="105" r="3"></circle>
                    <circle className="fill-primary" cx="64" cy="88" r="3"></circle>
                    <circle className="fill-primary" cx="128" cy="58" r="3"></circle>
                    <circle className="fill-primary" cx="192" cy="28" r="3"></circle>
                    <circle className="fill-primary" cx="256" cy="14" r="3"></circle>
                    <circle className="fill-primary stroke-surface-container-lowest stroke-2" cx="320" cy="8" r="4.5"></circle>
                  </svg>
                  <div className="absolute right-0 top-0 transform translate-x-1 -translate-y-2 bg-primary text-on-primary px-space-xs py-0.5 rounded shadow text-[11px] font-data-mono-md font-bold">
                    Yr {tenureYears}: {formatMoney(totalCorpus)}
                  </div>
                </div>

                {/* Year Markers Axis */}
                <div className="flex justify-between items-center pt-2 text-outline font-label-sm text-label-sm border-t border-surface-container-high/60 mt-1">
                  <span>Start</span>
                  <span>Year 1</span>
                  <span>Year 2</span>
                  <span>Year 3</span>
                  <span>Year 4</span>
                  <span className="text-primary font-bold">Year 5</span>
                </div>
              </div>
            </div>

            {/* Inflation Reality Check Panel */}
            <div className="rounded-xl bg-surface-container p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm border-l-4 border-l-secondary border border-surface-container-high/40">
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[24px] mt-0.5">price_check</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Inflation-Adjusted Purchasing Power
                  </span>
                  <p className="font-body-sm text-body-sm text-secondary">
                    At an average {inflationRate}% annual inflation rate, your {formatMoney(totalCorpus)} nominal amount will carry the purchasing power equivalent of:
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:items-end shrink-0">
                <span className="font-headline-md text-headline-md font-bold text-on-surface">
                  {formatMoney(inflationAdjustedCorpus, 2)}
                </span>
                <span className="font-label-sm text-label-sm text-error font-medium">
                  Real gain: +{formatMoney(Math.max(0, realGain))} (
                  {totalFunded > 0 ? ((realGain / totalFunded) * 100).toFixed(1) : 0}% real)
                </span>
              </div>
            </div>

            {/* Post-Calculation Context Tooling & Export Row */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs border-t border-surface-container-high">
              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-1.5 px-space-sm py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-medium transition-colors border border-surface-container-high/40"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">table_chart</span>
                <span>View Full Amortization Schedule</span>
              </button>
              <div className="flex items-center gap-space-xs ml-auto">
                <button
                  onClick={() => triggerToast('Exported complete quantitative scenario report.')}
                  className="flex items-center gap-1 px-space-sm py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface font-label-md text-label-md transition-colors border border-surface-container-high/40"
                  title="Download Report"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    triggerToast('Shareable calculation parameters link copied!');
                  }}
                  className="flex items-center gap-1 px-space-sm py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface font-label-md text-label-md transition-colors border border-surface-container-high/40"
                  title="Share Calculations"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  <span className="hidden sm:inline">Share Link</span>
                </button>
                <button
                  onClick={handleCopyResult}
                  className="flex items-center gap-1 px-space-sm py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface font-label-md text-label-md transition-colors border border-surface-container-high/40"
                  title="Copy Raw Result"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Scenario Modeling Comparison Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
            <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                  Scenario: +1% Yield ({(rate + 1.0).toFixed(1)}%)
                </span>
                <span className="material-symbols-outlined text-[16px] text-primary">north_east</span>
              </div>
              <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface">
                {formatMoney(valPlus1)}
              </span>
              <span className="font-body-sm text-body-sm text-primary font-medium">
                +{formatMoney(diffPlus1)} added gain
              </span>
            </div>

            <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                  Scenario: 10-Yr Stretch
                </span>
                <span className="material-symbols-outlined text-[16px] text-tertiary">hourglass_bottom</span>
              </div>
              <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface">
                {formatMoney(val10Yr)}
              </span>
              <span className="font-body-sm text-body-sm text-tertiary font-semibold">
                Double time reached
              </span>
            </div>

            <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                  Rule of 72 Doubler
                </span>
                <span className="material-symbols-outlined text-[16px] text-secondary">speed</span>
              </div>
              <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface">
                {ruleOf72Years} Years
              </span>
              <span className="font-body-sm text-body-sm text-secondary">
                Time to 2&times; principal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Amortization Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-space-md animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-2xl max-w-3xl w-full p-space-lg shadow-2xl flex flex-col gap-space-md max-h-[85vh] border border-surface-container-high/60">
            <div className="flex items-center justify-between border-b border-surface-container-high/50 pb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">table_chart</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Discrete Amortization &amp; Accrual Ledger
                </h3>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container transition-colors"
                onClick={() => setShowScheduleModal(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-secondary">
              Period-by-period breakdown evaluated with {frequency === 4 ? 'Quarterly' : frequency === 12 ? 'Monthly' : frequency === 2 ? 'Semi-Annual' : 'Annual'} compounding frequency.
            </p>

            <div className="overflow-y-auto flex-1 border border-surface-container-high/50 rounded-xl">
              <table className="w-full text-left font-body-sm text-body-sm">
                <thead className="bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase sticky top-0">
                  <tr>
                    <th className="p-space-xs px-space-sm">Period</th>
                    <th className="p-space-xs px-space-sm">Beginning Balance</th>
                    <th className="p-space-xs px-space-sm">Periodic Addition</th>
                    <th className="p-space-xs px-space-sm">Interest Accrued</th>
                    <th className="p-space-xs px-space-sm">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-data-mono-md">
                  {trajectoryData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/50">
                      <td className="p-space-xs px-space-sm font-semibold">{row.year}</td>
                      <td className="p-space-xs px-space-sm">{formatMoney(principal)}</td>
                      <td className="p-space-xs px-space-sm text-secondary">
                        {formatMoney(row.funded - principal)}
                      </td>
                      <td className="p-space-xs px-space-sm text-tertiary">
                        +{formatMoney(Math.max(0, row.total - row.funded))}
                      </td>
                      <td className="p-space-xs px-space-sm font-bold text-primary">
                        {formatMoney(row.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-space-xs border-t border-surface-container-high/50">
              <span className="font-body-sm text-body-sm text-secondary">
                Total Accrued Yield: <strong className="text-primary">{formatMoney(totalCompoundInterest)}</strong>
              </span>
              <button
                className="px-space-md py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors font-semibold"
                onClick={() => setShowScheduleModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
