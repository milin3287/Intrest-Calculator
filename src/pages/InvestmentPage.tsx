import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InvestmentMode } from '../types';

export const InvestmentPage: React.FC = () => {
  const {
    formatMoney,
    currencyConfig,
    triggerToast,
    addHistoryItem,
    activeInvestmentType,
    setActiveInvestmentType,
  } = useApp();

  const investmentType = activeInvestmentType;
  const setInvestmentType = setActiveInvestmentType;

  // SIP inputs
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(10000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12);
  const [timeHorizonYears, setTimeHorizonYears] = useState<number>(10);
  const [annualStepUpPct, setAnnualStepUpPct] = useState<number>(10);
  const [stepUpActive, setStepUpActive] = useState<boolean>(false);

  // Lumpsum inputs
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(500000);

  // Goal Planner inputs
  const [targetCorpus, setTargetCorpus] = useState<number>(5000000);

  // SWP (Systematic Withdrawal Plan) inputs
  const [swpInitialInvestment, setSwpInitialInvestment] = useState<number>(5000000);
  const [swpMonthlyWithdrawal, setSwpMonthlyWithdrawal] = useState<number>(35000);
  const [swpFrequency, setSwpFrequency] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [swpStepUpActive, setSwpStepUpActive] = useState<boolean>(false);
  const [swpAnnualStepUpPct, setSwpAnnualStepUpPct] = useState<number>(5);
  const [showAllSwpYears, setShowAllSwpYears] = useState<boolean>(false);

  // Math Calculations:
  // 1. Regular SIP: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
  const i = expectedReturnRate > 0 ? expectedReturnRate / 12 / 100 : 0;
  const totalMonths = timeHorizonYears * 12;

  let totalInvestedAmount = 0;
  let totalFutureValue = 0;

  if (investmentType === 'SIP') {
    if (monthlyInvestment > 0 && timeHorizonYears > 0) {
      if (!stepUpActive || annualStepUpPct === 0) {
        totalInvestedAmount = monthlyInvestment * totalMonths;
        if (i > 0) {
          totalFutureValue = monthlyInvestment * ((Math.pow(1 + i, totalMonths) - 1) / i) * (1 + i);
        } else {
          totalFutureValue = totalInvestedAmount;
        }
      } else {
        // Step-Up SIP: monthly investment increases each year by annualStepUpPct
        let curMonthly = monthlyInvestment;
        let curCorpus = 0;
        let totalDeposits = 0;

        for (let yr = 1; yr <= timeHorizonYears; yr++) {
          for (let m = 1; m <= 12; m++) {
            totalDeposits += curMonthly;
            curCorpus = (curCorpus + curMonthly) * (1 + i);
          }
          curMonthly = curMonthly * (1 + annualStepUpPct / 100);
        }
        totalInvestedAmount = totalDeposits;
        totalFutureValue = curCorpus;
      }
    }
  } else if (investmentType === 'Lumpsum') {
    totalInvestedAmount = lumpSumAmount;
    totalFutureValue = (lumpSumAmount > 0 && timeHorizonYears > 0)
      ? lumpSumAmount * Math.pow(1 + (expectedReturnRate > 0 ? expectedReturnRate / 100 : 0), timeHorizonYears)
      : lumpSumAmount;
  } else if (investmentType === 'Goal') {
    // Goal Planner: Calculate required monthly SIP to achieve targetCorpus in timeHorizonYears at expectedReturnRate
    if (targetCorpus > 0 && timeHorizonYears > 0) {
      const requiredSip = i > 0
        ? (targetCorpus * i) / ((Math.pow(1 + i, totalMonths) - 1) * (1 + i))
        : targetCorpus / totalMonths;
      totalInvestedAmount = requiredSip * totalMonths;
      totalFutureValue = targetCorpus;
    }
  }

  // --- SWP Calculations ---
  const periodsPerYear = swpFrequency === 'Monthly' ? 12 : swpFrequency === 'Quarterly' ? 4 : 1;
  const swpTotalPeriods = Math.max(1, (timeHorizonYears > 0 ? timeHorizonYears : 1) * periodsPerYear);
  const swpPeriodicRate = expectedReturnRate > 0 ? (expectedReturnRate / 100) / periodsPerYear : 0;

  let basePeriodWithdrawal = swpMonthlyWithdrawal;
  if (swpFrequency === 'Quarterly') basePeriodWithdrawal = swpMonthlyWithdrawal * 3;
  if (swpFrequency === 'Yearly') basePeriodWithdrawal = swpMonthlyWithdrawal * 12;

  let swpCurrentCorpus = swpInitialInvestment;
  let swpTotalWithdrawn = 0;
  let swpTotalInterestEarned = 0;
  let swpDepletedPeriod: number | null = null;
  let curPeriodWithdrawal = basePeriodWithdrawal;

  interface YearlySWPRecord {
    year: number;
    openingBalance: number;
    withdrawal: number;
    interestEarned: number;
    closingBalance: number;
  }
  const swpYearlyRecords: YearlySWPRecord[] = [];

  let curYearOpening = swpCurrentCorpus;
  let curYearWithdrawn = 0;
  let curYearInterest = 0;

  for (let p = 1; p <= swpTotalPeriods; p++) {
    const currentYear = Math.ceil(p / periodsPerYear);
    const periodInYear = ((p - 1) % periodsPerYear) + 1;

    // Apply annual step-up at the start of each new year
    if (swpStepUpActive && swpAnnualStepUpPct > 0 && periodInYear === 1 && currentYear > 1) {
      curPeriodWithdrawal = curPeriodWithdrawal * (1 + swpAnnualStepUpPct / 100);
    }

    const opening = swpCurrentCorpus;
    if (opening <= 0.001) {
      if (swpDepletedPeriod === null) swpDepletedPeriod = p;
    } else {
      const interest = opening * swpPeriodicRate;
      swpTotalInterestEarned += interest;
      curYearInterest += interest;

      const available = opening + interest;
      const actualWithdrawal = Math.min(curPeriodWithdrawal, available);
      swpTotalWithdrawn += actualWithdrawal;
      curYearWithdrawn += actualWithdrawal;

      const closing = Math.max(0, available - actualWithdrawal);
      swpCurrentCorpus = closing;

      if (closing <= 0.001 && actualWithdrawal < curPeriodWithdrawal && swpDepletedPeriod === null) {
        swpDepletedPeriod = p;
      }
    }

    if (periodInYear === periodsPerYear || p === swpTotalPeriods) {
      swpYearlyRecords.push({
        year: currentYear,
        openingBalance: curYearOpening,
        withdrawal: curYearWithdrawn,
        interestEarned: curYearInterest,
        closingBalance: swpCurrentCorpus,
      });
      curYearOpening = swpCurrentCorpus;
      curYearWithdrawn = 0;
      curYearInterest = 0;
    }
  }

  const swpFinalRemainingCorpus = swpCurrentCorpus;
  const swpTotalValueRealized = swpTotalWithdrawn + swpFinalRemainingCorpus;
  const swpNetWealthGain = Math.max(0, swpTotalValueRealized - swpInitialInvestment);

  // Sustainability Metrics
  const swpAnnualWithdrawal = swpMonthlyWithdrawal * 12;
  const swpWithdrawalRatePct = swpInitialInvestment > 0 ? (swpAnnualWithdrawal / swpInitialInvestment) * 100 : 0;
  const isSwpPerpetual = expectedReturnRate > 0 && swpWithdrawalRatePct <= expectedReturnRate && (!swpStepUpActive || swpAnnualStepUpPct === 0);
  const isSwpDepleted = swpDepletedPeriod !== null;

  let swpDepletionMessage = '';
  if (isSwpDepleted && swpDepletedPeriod !== null) {
    const depYear = Math.floor((swpDepletedPeriod - 1) / periodsPerYear) + 1;
    const depPeriod = ((swpDepletedPeriod - 1) % periodsPerYear) + 1;
    swpDepletionMessage = swpFrequency === 'Monthly'
      ? `Corpus exhausts in Year ${depYear}, Month ${depPeriod}`
      : `Corpus exhausts in Year ${depYear}`;
  }

  // Common derived metrics for SIP/Lumpsum/Goal
  const estimatedWealthGain = investmentType === 'SWP'
    ? swpNetWealthGain
    : Math.max(0, totalFutureValue - totalInvestedAmount);

  const wealthMultiplier = investmentType === 'SWP'
    ? (swpInitialInvestment > 0 ? (swpTotalValueRealized / swpInitialInvestment).toFixed(2) : '1.0')
    : (totalInvestedAmount > 0 ? (totalFutureValue / totalInvestedAmount).toFixed(2) : '1.0');

  // Milestone trajectory points for SIP/Lumpsum/Goal
  const trajectoryMilestones = [];
  if (timeHorizonYears > 0 && totalInvestedAmount > 0) {
    for (let yr = 1; yr <= Math.min(10, timeHorizonYears); yr++) {
      const fraction = yr / timeHorizonYears;
      const inv = totalInvestedAmount * fraction;
      const fv = totalFutureValue * Math.pow(fraction, 1.8);
      trajectoryMilestones.push({
        year: `Year ${yr}`,
        invested: inv,
        corpus: fv,
      });
    }
  }

  // Presets loader for SWP
  const loadSwpPreset = (preset: 'retirement' | 'perpetual' | 'drawdown' | 'pension') => {
    if (preset === 'retirement') {
      setSwpInitialInvestment(5000000);
      setSwpMonthlyWithdrawal(30000);
      setExpectedReturnRate(8.5);
      setTimeHorizonYears(20);
      setSwpFrequency('Monthly');
      setSwpStepUpActive(false);
      triggerToast('Loaded ₹50 Lakh @ 8.5% Retirement SWP preset.');
    } else if (preset === 'perpetual') {
      setSwpInitialInvestment(10000000);
      setSwpMonthlyWithdrawal(50000);
      setExpectedReturnRate(10);
      setTimeHorizonYears(25);
      setSwpFrequency('Monthly');
      setSwpStepUpActive(false);
      triggerToast('Loaded ₹1 Crore Safe 6% Perpetual Income preset.');
    } else if (preset === 'drawdown') {
      setSwpInitialInvestment(2500000);
      setSwpMonthlyWithdrawal(25000);
      setExpectedReturnRate(7.5);
      setTimeHorizonYears(10);
      setSwpFrequency('Monthly');
      setSwpStepUpActive(false);
      triggerToast('Loaded ₹25 Lakh Capital Drawdown Bridge preset.');
    } else if (preset === 'pension') {
      setSwpInitialInvestment(6000000);
      setSwpMonthlyWithdrawal(35000);
      setExpectedReturnRate(9);
      setTimeHorizonYears(20);
      setSwpFrequency('Monthly');
      setSwpStepUpActive(true);
      setSwpAnnualStepUpPct(5);
      triggerToast('Loaded ₹60 Lakh Inflation-Hedged Pension (+5%/yr) preset.');
    }
  };

  const handleSaveInvestment = () => {
    if (investmentType === 'SWP') {
      addHistoryItem({
        category: 'Investment',
        title: `SWP Plan — ${formatMoney(swpMonthlyWithdrawal)}/mo from ${formatMoney(swpInitialInvestment)} @ ${expectedReturnRate}% for ${timeHorizonYears} yrs`,
        principal: swpInitialInvestment,
        rate: expectedReturnRate,
        tenureYears: timeHorizonYears,
        frequency: `${swpFrequency} SWP (${formatMoney(swpMonthlyWithdrawal)}/mo)`,
        resultValue: swpTotalWithdrawn,
        resultFormatted: formatMoney(swpTotalWithdrawn),
        formula: 'B_n = P(1+i)ⁿ - W × [((1+i)ⁿ - 1)/i]',
        details: [
          { label: 'Initial Corpus', value: formatMoney(swpInitialInvestment) },
          { label: 'Total Cash Harvested', value: formatMoney(swpTotalWithdrawn) },
          { label: 'Remaining Portfolio', value: formatMoney(swpFinalRemainingCorpus) },
          { label: 'Total Value Realized', value: formatMoney(swpTotalValueRealized) },
          { label: 'Net Wealth Growth', value: `+${formatMoney(swpNetWealthGain)}` },
          { label: 'Initial Withdrawal Rate', value: `${swpWithdrawalRatePct.toFixed(2)}% p.a.` },
          {
            label: 'Sustainability Status',
            value: isSwpDepleted
              ? swpDepletionMessage
              : isSwpPerpetual
              ? 'Perpetual Income (Principal Untouched)'
              : `Fully Sustains All ${timeHorizonYears} Years`,
          },
        ],
      });
      triggerToast('SWP scenario saved to history.');
      return;
    }

    addHistoryItem({
      category: 'Investment',
      title: `${investmentType} Plan — ${formatMoney(investmentType === 'SIP' ? monthlyInvestment : lumpSumAmount)} @ ${expectedReturnRate}% for ${timeHorizonYears} yrs`,
      principal: investmentType === 'SIP' ? monthlyInvestment : lumpSumAmount,
      rate: expectedReturnRate,
      tenureYears: timeHorizonYears,
      frequency: investmentType === 'SIP' ? 'Monthly SIP' : 'Lumpsum',
      resultValue: totalFutureValue,
      resultFormatted: formatMoney(totalFutureValue),
      formula: 'FV = P · [((1+i)ⁿ - 1)/i] · (1+i)',
      details: [
        { label: 'Total Invested', value: formatMoney(totalInvestedAmount) },
        { label: 'Est. Wealth Gain', value: formatMoney(estimatedWealthGain) },
        { label: 'Multiplier', value: `${wealthMultiplier}x` },
      ],
    });
    triggerToast('Investment scenario saved to history.');
  };

  const handleCopySwpSummary = () => {
    const text = `SWP (Systematic Withdrawal Plan) Summary:
• Initial Corpus: ${formatMoney(swpInitialInvestment)}
• Payout: ${formatMoney(swpMonthlyWithdrawal)}/month (${swpFrequency})
• Expected Return Rate: ${expectedReturnRate}% p.a.
• Duration: ${timeHorizonYears} years
• Total Cash Harvested: ${formatMoney(swpTotalWithdrawn)}
• Remaining Portfolio: ${formatMoney(swpFinalRemainingCorpus)}
• Net Wealth Growth: +${formatMoney(swpNetWealthGain)}
• Status: ${isSwpDepleted ? swpDepletionMessage : isSwpPerpetual ? 'Perpetual Growth' : `Fully Sustained for ${timeHorizonYears} Years`}`;
    navigator.clipboard.writeText(text);
    triggerToast('SWP projection summary copied to clipboard!');
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div>
          <div className="flex items-center gap-space-2xs text-secondary font-label-md text-label-md">
            <span>Calculators</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold">Wealth Planning</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">
            {investmentType === 'SWP'
              ? 'Systematic Withdrawal Plan (SWP)'
              : 'Systematic Investment & Wealth Accumulator'}
          </h1>
          <p className="font-body-md text-body-md text-secondary max-w-2xl">
            {investmentType === 'SWP'
              ? 'Calculate periodic retirement cashflows, capital longevity, and remaining balance from your mutual fund or fixed-return corpus.'
              : 'Simulate SIP (Systematic Investment Plans), Step-Up escalation models, lumpsum compounding, and reverse target goal plans.'}
          </p>
        </div>
        <div className="flex items-center gap-space-xs shrink-0">
          {investmentType === 'SWP' && (
            <button
              onClick={handleCopySwpSummary}
              className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold border border-surface-container-high/60 transition-all shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              <span>Copy Summary</span>
            </button>
          )}
          <button
            onClick={handleSaveInvestment}
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-sm transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
            <span>Save Plan</span>
          </button>
        </div>
      </div>

      {/* Model Type Selector */}
      <div className="flex items-center gap-space-xs p-1.5 bg-surface-container-low rounded-xl w-fit border border-surface-container-high/40 flex-wrap">
        {[
          { id: 'SIP', label: 'Systematic SIP', icon: 'autorenew' },
          { id: 'SWP', label: 'Systematic SWP (Withdrawal)', icon: 'payments' },
          { id: 'Lumpsum', label: 'One-time Lumpsum', icon: 'account_balance_wallet' },
          { id: 'Goal', label: 'Target Goal Planner', icon: 'flag' },
        ].map(item => {
          const isSelected = investmentType === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setInvestmentType(item.id as InvestmentMode)}
              type="button"
              className={`flex items-center gap-1.5 px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-all ${
                isSelected
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md border border-surface-container-high/50">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {investmentType === 'SWP' ? 'SWP Parameters' : 'Investment Parameters'}
              </h2>
              {investmentType === 'SWP' && (
                <span className="px-space-xs py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                  Income Harvest
                </span>
              )}
            </div>

            {/* Quick Scenario Presets for SWP */}
            {investmentType === 'SWP' && (
              <div className="flex flex-col gap-1.5 p-space-sm bg-surface-container-low rounded-xl border border-surface-container-high/40">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                  Quick SWP Presets
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => loadSwpPreset('retirement')}
                    className="p-1.5 text-left rounded-lg bg-surface-container-lowest hover:bg-surface-container text-xs font-medium text-on-surface border border-surface-container-high/40 transition-colors"
                  >
                    <span className="font-bold text-primary block">₹50L @ 8.5%</span>
                    <span className="text-secondary text-[11px]">₹30k/mo • 20 Yrs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSwpPreset('perpetual')}
                    className="p-1.5 text-left rounded-lg bg-surface-container-lowest hover:bg-surface-container text-xs font-medium text-on-surface border border-surface-container-high/40 transition-colors"
                  >
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">₹1 Cr @ 10%</span>
                    <span className="text-secondary text-[11px]">₹50k/mo • Perpetual</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSwpPreset('drawdown')}
                    className="p-1.5 text-left rounded-lg bg-surface-container-lowest hover:bg-surface-container text-xs font-medium text-on-surface border border-surface-container-high/40 transition-colors"
                  >
                    <span className="font-bold text-amber-600 dark:text-amber-400 block">₹25L @ 7.5%</span>
                    <span className="text-secondary text-[11px]">₹25k/mo • 10 Yrs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSwpPreset('pension')}
                    className="p-1.5 text-left rounded-lg bg-surface-container-lowest hover:bg-surface-container text-xs font-medium text-on-surface border border-surface-container-high/40 transition-colors"
                  >
                    <span className="font-bold text-purple-600 dark:text-purple-400 block">₹60L + Step-Up</span>
                    <span className="text-secondary text-[11px]">₹35k/mo • +5%/yr</span>
                  </button>
                </div>
              </div>
            )}

            {/* If SWP */}
            {investmentType === 'SWP' && (
              <>
                {/* Initial Investment Corpus */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md font-semibold text-on-surface">
                      Total Investment Corpus (P)
                    </label>
                    <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                      {formatMoney(swpInitialInvestment)}
                    </span>
                  </div>
                  <div className="flex items-center rounded-lg bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-primary">
                    <span className="px-space-md py-2.5 bg-surface-container-high text-primary font-bold">
                      {currencyConfig.symbol}
                    </span>
                    <input
                      className="w-full px-space-sm py-2.5 bg-surface-container-lowest font-data-mono-md text-on-surface font-semibold focus:outline-none"
                      type="number"
                      min="0"
                      max="100000000"
                      step="50000"
                      placeholder="Enter initial corpus"
                      value={swpInitialInvestment === 0 ? '' : swpInitialInvestment}
                      onChange={e => setSwpInitialInvestment(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <input
                    type="range"
                    className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer mt-1"
                    min="100000"
                    max="20000000"
                    step="100000"
                    value={swpInitialInvestment}
                    onChange={e => setSwpInitialInvestment(parseFloat(e.target.value) || 0)}
                  />
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    {[
                      { label: '₹10 Lakh', val: 1000000 },
                      { label: '₹25 Lakh', val: 2500000 },
                      { label: '₹50 Lakh', val: 5000000 },
                      { label: '₹1 Crore', val: 10000000 },
                      { label: '₹2 Crore', val: 20000000 },
                    ].map(chip => (
                      <button
                        key={chip.val}
                        type="button"
                        onClick={() => setSwpInitialInvestment(chip.val)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                          swpInitialInvestment === chip.val
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface-container-low text-secondary hover:text-on-surface border-surface-container-high/50'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly Withdrawal */}
                <div className="flex flex-col gap-1.5 pt-space-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md font-semibold text-on-surface">
                      Withdrawal Amount (Payout)
                    </label>
                    <span className="font-data-mono-md text-data-mono-md text-tertiary font-bold">
                      {formatMoney(swpMonthlyWithdrawal)}
                      <span className="text-secondary text-xs font-normal"> /mo</span>
                    </span>
                  </div>
                  <div className="flex items-center rounded-lg bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-primary">
                    <span className="px-space-md py-2.5 bg-surface-container-high text-tertiary font-bold">
                      {currencyConfig.symbol}
                    </span>
                    <input
                      className="w-full px-space-sm py-2.5 bg-surface-container-lowest font-data-mono-md text-on-surface font-semibold focus:outline-none"
                      type="number"
                      min="0"
                      max="1000000"
                      step="1000"
                      placeholder="Enter regular withdrawal amount"
                      value={swpMonthlyWithdrawal === 0 ? '' : swpMonthlyWithdrawal}
                      onChange={e => setSwpMonthlyWithdrawal(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <input
                    type="range"
                    className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer mt-1"
                    min="5000"
                    max="200000"
                    step="2500"
                    value={swpMonthlyWithdrawal}
                    onChange={e => setSwpMonthlyWithdrawal(parseFloat(e.target.value) || 0)}
                  />
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    {[
                      { label: '₹15k', val: 15000 },
                      { label: '₹25k', val: 25000 },
                      { label: '₹35k', val: 35000 },
                      { label: '₹50k', val: 50000 },
                      { label: '₹75k', val: 75000 },
                      { label: '₹1 Lakh', val: 100000 },
                    ].map(chip => (
                      <button
                        key={chip.val}
                        type="button"
                        onClick={() => setSwpMonthlyWithdrawal(chip.val)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                          swpMonthlyWithdrawal === chip.val
                            ? 'bg-tertiary text-white border-tertiary'
                            : 'bg-surface-container-low text-secondary hover:text-on-surface border-surface-container-high/50'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Withdrawal Frequency */}
                <div className="flex flex-col gap-1.5 pt-space-2xs">
                  <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                    Payout Frequency
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container-low rounded-lg border border-surface-container-high/40">
                    {(['Monthly', 'Quarterly', 'Yearly'] as const).map(freq => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setSwpFrequency(freq)}
                        className={`py-1.5 rounded-md text-xs font-semibold transition-all ${
                          swpFrequency === freq
                            ? 'bg-surface-container-lowest text-primary shadow-xs'
                            : 'text-secondary hover:text-on-surface'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* If SIP */}
            {investmentType === 'SIP' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">
                    Monthly Contribution (SIP)
                  </label>
                  <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                    {formatMoney(monthlyInvestment)}
                  </span>
                </div>
                <div className="flex items-center rounded-lg bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-primary">
                  <span className="px-space-md py-2.5 bg-surface-container-high text-primary font-bold">
                    {currencyConfig.symbol}
                  </span>
                  <input
                    className="w-full px-space-sm py-2.5 bg-surface-container-lowest font-data-mono-md text-on-surface font-semibold focus:outline-none"
                    type="number"
                    min="0"
                    max="5000000"
                    step="500"
                    placeholder="Enter monthly SIP amount"
                    value={monthlyInvestment === 0 ? '' : monthlyInvestment}
                    onChange={e => setMonthlyInvestment(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <input
                  type="range"
                  className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer mt-1"
                  min="0"
                  max="100000"
                  step="1000"
                  value={monthlyInvestment}
                  onChange={e => setMonthlyInvestment(parseFloat(e.target.value) || 0)}
                />
              </div>
            )}

            {/* If Lumpsum */}
            {investmentType === 'Lumpsum' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">
                    Initial Lumpsum Capital
                  </label>
                  <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                    {formatMoney(lumpSumAmount)}
                  </span>
                </div>
                <div className="flex items-center rounded-lg bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-primary">
                  <span className="px-space-md py-2.5 bg-surface-container-high text-primary font-bold">
                    {currencyConfig.symbol}
                  </span>
                  <input
                    className="w-full px-space-sm py-2.5 bg-surface-container-lowest font-data-mono-md text-on-surface font-semibold focus:outline-none"
                    type="number"
                    min="0"
                    max="100000000"
                    step="5000"
                    placeholder="Enter lumpsum amount"
                    value={lumpSumAmount === 0 ? '' : lumpSumAmount}
                    onChange={e => setLumpSumAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}

            {/* If Goal Planner */}
            {investmentType === 'Goal' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">
                    Target Wealth Corpus Needed
                  </label>
                  <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                    {formatMoney(targetCorpus)}
                  </span>
                </div>
                <div className="flex items-center rounded-lg bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-primary">
                  <span className="px-space-md py-2.5 bg-surface-container-high text-primary font-bold">
                    {currencyConfig.symbol}
                  </span>
                  <input
                    className="w-full px-space-sm py-2.5 bg-surface-container-lowest font-data-mono-md text-on-surface font-semibold focus:outline-none"
                    type="number"
                    min="0"
                    max="100000000"
                    step="100000"
                    placeholder="Enter target wealth goal"
                    value={targetCorpus === 0 ? '' : targetCorpus}
                    onChange={e => setTargetCorpus(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}

            {/* Expected Annual Returns */}
            <div className="flex flex-col gap-1.5 pt-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md font-semibold text-on-surface">
                  Expected Return Rate (CAGR)
                </label>
                <span className="font-label-sm text-label-sm text-primary font-bold">
                  {expectedReturnRate > 0 ? `${expectedReturnRate.toFixed(1)}% p.a.` : 'Enter return %'}
                </span>
              </div>
              <div className="flex items-center rounded-lg bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-primary">
                <input
                  className="w-full px-space-sm py-2 bg-surface-container-lowest font-data-mono-md text-on-surface font-semibold focus:outline-none"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  placeholder="Enter expected return %"
                  value={expectedReturnRate === 0 ? '' : expectedReturnRate}
                  onChange={e => setExpectedReturnRate(parseFloat(e.target.value) || 0)}
                />
                <span className="px-space-md py-2 bg-surface-container-high text-secondary font-medium text-label-md">
                  % p.a.
                </span>
              </div>
              <input
                type="range"
                className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                min="0"
                max="25"
                step="0.5"
                value={expectedReturnRate}
                onChange={e => setExpectedReturnRate(parseFloat(e.target.value) || 0)}
              />
              <div className="flex items-center gap-space-2xs pt-1 flex-wrap">
                {[6, 8, 10, 12, 14, 16].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setExpectedReturnRate(r)}
                    className="px-space-xs py-0.5 rounded bg-surface-container-low hover:bg-surface-container text-secondary text-label-sm font-label-sm border border-surface-container-high/40"
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            {/* Time Horizon */}
            <div className="flex flex-col gap-1.5 pt-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md font-semibold text-on-surface">
                  {investmentType === 'SWP' ? 'Withdrawal Horizon' : 'Investment Horizon'}
                </label>
                <span className="font-data-mono-md text-data-mono-md text-on-surface font-bold">
                  {timeHorizonYears > 0 ? `${timeHorizonYears} Years` : 'Enter years'}
                </span>
              </div>
              <div className="flex items-center rounded-lg bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-primary">
                <input
                  className="w-full px-space-sm py-2 bg-surface-container-lowest font-data-mono-md text-on-surface font-semibold focus:outline-none"
                  type="number"
                  min="1"
                  max="40"
                  step="1"
                  placeholder="Enter duration in years"
                  value={timeHorizonYears === 0 ? '' : timeHorizonYears}
                  onChange={e => setTimeHorizonYears(parseInt(e.target.value, 10) || 0)}
                />
                <span className="px-space-md py-2 bg-surface-container-high text-secondary font-medium text-label-md">
                  Years
                </span>
              </div>
              <input
                type="range"
                className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                min="1"
                max="35"
                value={timeHorizonYears}
                onChange={e => setTimeHorizonYears(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            {/* Step Up Switch (for SIP or SWP) */}
            {(investmentType === 'SIP' || investmentType === 'SWP') && (
              <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-sm border border-surface-container-high/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-md text-label-md font-semibold text-on-surface block">
                      {investmentType === 'SWP'
                        ? 'Annual Withdrawal Step-Up (Inflation Hedge)'
                        : 'Annual Step-Up Escalation'}
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      {investmentType === 'SWP'
                        ? 'Increase monthly payout yearly to match rising inflation costs'
                        : 'Increase SIP yearly with salary hikes'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`w-9 h-5 rounded-full relative p-0.5 transition-colors ${
                      (investmentType === 'SWP' ? swpStepUpActive : stepUpActive) ? 'bg-primary' : 'bg-surface-container-highest'
                    }`}
                    onClick={() => {
                      if (investmentType === 'SWP') {
                        setSwpStepUpActive(!swpStepUpActive);
                      } else {
                        setStepUpActive(!stepUpActive);
                      }
                    }}
                    aria-label="Toggle step-up"
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        (investmentType === 'SWP' ? swpStepUpActive : stepUpActive) ? 'ml-auto' : 'ml-0'
                      }`}
                    ></div>
                  </button>
                </div>

                {/* Step-up inputs */}
                {investmentType === 'SWP' && swpStepUpActive && (
                  <div className="flex items-center justify-between gap-space-sm pt-space-2xs border-t border-surface-container-high/40">
                    <span className="font-body-sm text-body-sm text-secondary">Annual Increment:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="25"
                        placeholder="0"
                        value={swpAnnualStepUpPct === 0 ? '' : swpAnnualStepUpPct}
                        onChange={e => setSwpAnnualStepUpPct(parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center font-semibold rounded bg-surface-container border border-surface-container-high/60 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-secondary text-sm font-semibold">%</span>
                      {[3, 5, 7, 10].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setSwpAnnualStepUpPct(pct)}
                          className={`px-space-xs py-0.5 rounded text-label-sm font-semibold transition-colors ${
                            swpAnnualStepUpPct === pct
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container text-secondary'
                          }`}
                        >
                          +{pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {investmentType === 'SIP' && stepUpActive && (
                  <div className="flex items-center justify-between gap-space-sm pt-space-2xs border-t border-surface-container-high/40">
                    <span className="font-body-sm text-body-sm text-secondary">Annual Increment:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={annualStepUpPct === 0 ? '' : annualStepUpPct}
                        onChange={e => setAnnualStepUpPct(parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center font-semibold rounded bg-surface-container border border-surface-container-high/60 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-secondary text-sm font-semibold">%</span>
                      {[5, 10, 15].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setAnnualStepUpPct(pct)}
                          className={`px-space-xs py-0.5 rounded text-label-sm font-semibold transition-colors ${
                            annualStepUpPct === pct
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container text-secondary'
                          }`}
                        >
                          +{pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SWP Sustainability Summary Callout */}
            {investmentType === 'SWP' && (
              <div
                className={`p-space-md rounded-xl border flex flex-col gap-1.5 ${
                  isSwpDepleted
                    ? 'bg-red-500/10 border-red-500/30 text-on-surface'
                    : isSwpPerpetual
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-on-surface'
                    : 'bg-primary/10 border-primary/30 text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isSwpDepleted
                        ? 'text-red-500'
                        : isSwpPerpetual
                        ? 'text-emerald-500'
                        : 'text-primary'
                    }`}
                  >
                    {isSwpDepleted ? 'warning' : isSwpPerpetual ? 'all_inclusive' : 'check_circle'}
                  </span>
                  <span className="font-label-md text-label-md font-bold">
                    {isSwpDepleted
                      ? 'Capital Depletion Alert'
                      : isSwpPerpetual
                      ? 'Perpetual Income Generator'
                      : 'Fully Sustained Amortization'}
                  </span>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  {isSwpDepleted ? (
                    <>
                      At this withdrawal pace, your initial corpus will run dry before the full {timeHorizonYears} years.
                      <strong className="text-red-600 dark:text-red-400 block mt-0.5 font-mono">
                        {swpDepletionMessage}
                      </strong>
                    </>
                  ) : isSwpPerpetual ? (
                    <>
                      Your initial withdrawal rate is{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                        {swpWithdrawalRatePct.toFixed(2)}% p.a.
                      </strong>
                      , which is less than your expected portfolio yield of{' '}
                      <strong className="font-mono">{expectedReturnRate}% p.a.</strong> Your principal remains intact and continues to grow!
                    </>
                  ) : (
                    <>
                      Your initial withdrawal rate is{' '}
                      <strong className="font-mono">{swpWithdrawalRatePct.toFixed(2)}% p.a.</strong>
                      . The portfolio comfortably lasts all {timeHorizonYears} years with a remaining terminal balance of{' '}
                      <strong className="text-primary font-mono">{formatMoney(swpFinalRemainingCorpus)}</strong>.
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Main Hero Result Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md border border-surface-container-high/50">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low p-space-lg rounded-xl border border-surface-container-high/50">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                  {investmentType === 'Goal'
                    ? 'Target Wealth Corpus'
                    : investmentType === 'SWP'
                    ? 'Total Regular Cash Harvested'
                    : 'Projected Wealth Maturity'}
                </span>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-display-xl text-display-xl text-primary font-bold tracking-tight">
                    {formatMoney(investmentType === 'SWP' ? swpTotalWithdrawn : totalFutureValue, 2)}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                  {investmentType === 'SWP'
                    ? `Harvested via ${swpFrequency} payouts over ${timeHorizonYears} years @ ${expectedReturnRate}% CAGR`
                    : timeHorizonYears > 0 && expectedReturnRate > 0
                    ? `Compounded over ${timeHorizonYears} years at ${expectedReturnRate}% annualized CAGR`
                    : 'Enter contribution, expected return, and time horizon to evaluate corpus'}
                </p>
                {investmentType === 'SWP' && (
                  <div className="mt-2 pt-2 border-t border-surface-container-high/40 flex items-center gap-2">
                    <span className="text-xs text-secondary font-medium">Terminal Balance in Corpus:</span>
                    <span className="text-sm font-bold font-data-mono-md text-emerald-600 dark:text-emerald-400">
                      {formatMoney(swpFinalRemainingCorpus)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
                {investmentType === 'SWP' ? (
                  <span
                    className={`px-space-sm py-1 rounded-full font-label-md text-label-md font-bold flex items-center gap-1 ${
                      isSwpDepleted
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                        : isSwpPerpetual
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-primary/15 text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isSwpDepleted ? 'warning' : isSwpPerpetual ? 'all_inclusive' : 'verified'}
                    </span>
                    {isSwpDepleted
                      ? 'Depleted'
                      : isSwpPerpetual
                      ? 'Perpetual Income'
                      : `Sustains ${timeHorizonYears} Yrs`}
                  </span>
                ) : (
                  <span className="px-space-sm py-1 rounded-full bg-surface-container-highest text-primary font-label-md text-label-md font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">trending_up</span>
                    {wealthMultiplier}&times; Wealth Multiplier
                  </span>
                )}
              </div>
            </div>

            {/* Bento Tiles */}
            {investmentType === 'SWP' ? (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-sm pt-space-xs">
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                    Initial Corpus (P)
                  </span>
                  <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface">
                    {formatMoney(swpInitialInvestment)}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Initial lump sum
                  </span>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                    Total Harvested
                  </span>
                  <span className="font-data-mono-md text-data-mono-md font-bold text-tertiary">
                    {formatMoney(swpTotalWithdrawn)}
                  </span>
                  <span className="font-body-sm text-body-sm text-tertiary font-semibold">
                    Received in cash
                  </span>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                    Ending Corpus
                  </span>
                  <span className="font-data-mono-md text-data-mono-md font-bold text-primary">
                    {formatMoney(swpFinalRemainingCorpus)}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Portfolio balance
                  </span>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                    Net Gain (Interest)
                  </span>
                  <span className="font-data-mono-md text-data-mono-md font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatMoney(swpNetWealthGain)}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Total yield earned
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                    Total Deposits (P)
                  </span>
                  <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface">
                    {formatMoney(totalInvestedAmount)}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Capital committed
                  </span>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                    Estimated Wealth Gain
                  </span>
                  <span className="font-data-mono-md text-data-mono-md font-bold text-tertiary">
                    +{formatMoney(estimatedWealthGain)}
                  </span>
                  <span className="font-body-sm text-body-sm text-tertiary font-semibold">
                    Pure compound interest
                  </span>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                    Total Portfolio
                  </span>
                  <span className="font-data-mono-md text-data-mono-md font-bold text-primary">
                    {formatMoney(totalFutureValue)}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Maturity harvest
                  </span>
                </div>
              </div>
            )}

            {/* Growth or SWP Trajectory & Schedule */}
            {investmentType === 'SWP' ? (
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-3 border border-surface-container-high/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-md text-label-md font-semibold text-on-surface block">
                      Annual Withdrawal &amp; Balance Amortization
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      Year-by-year cash payouts vs remaining invested capital
                    </span>
                  </div>
                  {swpYearlyRecords.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllSwpYears(!showAllSwpYears)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {showAllSwpYears ? 'Show Top 5' : `View All ${swpYearlyRecords.length} Yrs`}
                      <span className="material-symbols-outlined text-[16px]">
                        {showAllSwpYears ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-surface-container-high/60 text-secondary font-semibold">
                        <th className="py-2 px-2">Year</th>
                        <th className="py-2 px-2 text-right">Opening Corpus</th>
                        <th className="py-2 px-2 text-right">Withdrawals Paid</th>
                        <th className="py-2 px-2 text-right">Returns Accrued</th>
                        <th className="py-2 px-2 text-right">Closing Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high/40 font-data-mono-md">
                      {(showAllSwpYears ? swpYearlyRecords : swpYearlyRecords.slice(0, 5)).map(rec => (
                        <tr
                          key={rec.year}
                          className={`hover:bg-surface-container/60 transition-colors ${
                            rec.closingBalance === 0 ? 'bg-red-500/5 text-red-500' : ''
                          }`}
                        >
                          <td className="py-2 px-2 font-bold font-sans text-on-surface">
                            Year {rec.year}
                          </td>
                          <td className="py-2 px-2 text-right text-secondary">
                            {formatMoney(rec.openingBalance)}
                          </td>
                          <td className="py-2 px-2 text-right text-tertiary font-bold">
                            {formatMoney(rec.withdrawal)}
                          </td>
                          <td className="py-2 px-2 text-right text-emerald-600 dark:text-emerald-400">
                            +{formatMoney(rec.interestEarned)}
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-primary">
                            {formatMoney(rec.closingBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Milestone preview for SIP / Lumpsum / Goal */
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-2 border border-surface-container-high/40">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Portfolio Milestones
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Exponential snowball effect
                  </span>
                </div>
                <div className="space-y-2 pt-1">
                  {trajectoryMilestones.slice(0, 5).map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-body-sm">
                      <span className="font-medium text-on-surface">{m.year}</span>
                      <span className="text-secondary font-data-mono-md">{formatMoney(m.invested)} deposited</span>
                      <span className="font-bold text-primary font-data-mono-md">{formatMoney(m.corpus)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
