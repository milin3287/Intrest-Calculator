import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const InvestmentPage: React.FC = () => {
  const { formatMoney, currencyConfig, triggerToast, addHistoryItem } = useApp();

  const [investmentType, setInvestmentType] = useState<'SIP' | 'Lumpsum' | 'Goal'>('SIP');

  // SIP inputs
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(15000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12.0);
  const [timeHorizonYears, setTimeHorizonYears] = useState<number>(10);
  const [annualStepUpPct, setAnnualStepUpPct] = useState<number>(10);
  const [stepUpActive, setStepUpActive] = useState<boolean>(true);

  // Lumpsum inputs
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(200000);

  // Goal Planner inputs
  const [targetCorpus, setTargetCorpus] = useState<number>(10000000); // e.g. 1 Crore

  // Math Calculations:
  // 1. Regular SIP: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
  const i = expectedReturnRate / 12 / 100;
  const totalMonths = timeHorizonYears * 12;

  let totalInvestedAmount = 0;
  let totalFutureValue = 0;

  if (investmentType === 'SIP') {
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
  } else if (investmentType === 'Lumpsum') {
    totalInvestedAmount = lumpSumAmount;
    totalFutureValue = lumpSumAmount * Math.pow(1 + expectedReturnRate / 100, timeHorizonYears);
  } else {
    // Goal Planner: Calculate required monthly SIP to achieve targetCorpus in timeHorizonYears at expectedReturnRate
    const requiredSip = (i > 0 && totalMonths > 0)
      ? (targetCorpus * i) / ((Math.pow(1 + i, totalMonths) - 1) * (1 + i))
      : targetCorpus / (totalMonths || 1);
    totalInvestedAmount = requiredSip * totalMonths;
    totalFutureValue = targetCorpus;
  }

  const estimatedWealthGain = Math.max(0, totalFutureValue - totalInvestedAmount);
  const wealthMultiplier = totalInvestedAmount > 0 ? (totalFutureValue / totalInvestedAmount).toFixed(2) : '1.0';

  // Milestone trajectory points
  const trajectoryMilestones = [];
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

  const handleSaveInvestment = () => {
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
            Systematic Investment &amp; Wealth Accumulator
          </h1>
          <p className="font-body-md text-body-md text-secondary max-w-2xl">
            Simulate SIP (Systematic Investment Plans), Step-Up escalation models, lumpsum compounding, and reverse target goal plans.
          </p>
        </div>
        <div className="flex items-center gap-space-xs shrink-0">
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
      <div className="flex items-center gap-space-xs p-1.5 bg-surface-container-low rounded-xl w-fit border border-surface-container-high/40">
        {[
          { id: 'SIP', label: 'Systematic SIP', icon: 'autorenew' },
          { id: 'Lumpsum', label: 'One-time Lumpsum', icon: 'account_balance_wallet' },
          { id: 'Goal', label: 'Target Goal Planner', icon: 'flag' },
        ].map(item => {
          const isSelected = investmentType === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setInvestmentType(item.id as any)}
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
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Investment Parameters
            </h2>

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
                    min="500"
                    max="500000"
                    step="500"
                    value={monthlyInvestment}
                    onChange={e => setMonthlyInvestment(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <input
                  type="range"
                  className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer mt-1"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={monthlyInvestment}
                  onChange={e => setMonthlyInvestment(parseFloat(e.target.value))}
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
                    min="10000"
                    max="10000000"
                    step="10000"
                    value={lumpSumAmount}
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
                    min="100000"
                    max="100000000"
                    step="100000"
                    value={targetCorpus}
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
                  {expectedReturnRate.toFixed(1)}% p.a.
                </span>
              </div>
              <input
                type="range"
                className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                min="4"
                max="25"
                step="0.5"
                value={expectedReturnRate}
                onChange={e => setExpectedReturnRate(parseFloat(e.target.value))}
              />
              <div className="flex items-center gap-space-2xs pt-1 flex-wrap">
                {[8, 10, 12, 14, 16].map(r => (
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
                  Investment Horizon
                </label>
                <span className="font-data-mono-md text-data-mono-md text-on-surface font-bold">
                  {timeHorizonYears} Years
                </span>
              </div>
              <input
                type="range"
                className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                min="1"
                max="35"
                value={timeHorizonYears}
                onChange={e => setTimeHorizonYears(parseInt(e.target.value, 10))}
              />
            </div>

            {/* Step Up SIP Switch */}
            {investmentType === 'SIP' && (
              <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-sm border border-surface-container-high/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-md text-label-md font-semibold text-on-surface block">
                      Annual Step-Up Escalation
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      Increase SIP yearly with salary hikes
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`w-9 h-5 rounded-full relative p-0.5 transition-colors ${
                      stepUpActive ? 'bg-primary' : 'bg-surface-container-highest'
                    }`}
                    onClick={() => setStepUpActive(!stepUpActive)}
                    aria-label="Toggle step-up"
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        stepUpActive ? 'ml-auto' : 'ml-0'
                      }`}
                    ></div>
                  </button>
                </div>
                {stepUpActive && (
                  <div className="flex items-center justify-between gap-space-sm pt-space-2xs border-t border-surface-container-high/40">
                    <span className="font-body-sm text-body-sm text-secondary">Annual Increment:</span>
                    <div className="flex items-center gap-1">
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
          </div>
        </div>

        {/* Right Output Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Main Hero Result Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md border border-surface-container-high/50">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low p-space-lg rounded-xl border border-surface-container-high/50">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                  {investmentType === 'Goal' ? 'Target Wealth Corpus' : 'Projected Wealth Maturity'}
                </span>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-display-xl text-display-xl text-primary font-bold tracking-tight">
                    {formatMoney(totalFutureValue, 2)}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                  Compounded over {timeHorizonYears} years at {expectedReturnRate}% annualized CAGR
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
                <span className="px-space-sm py-1 rounded-full bg-surface-container-highest text-primary font-label-md text-label-md font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  {wealthMultiplier}&times; Wealth Multiplier
                </span>
              </div>
            </div>

            {/* 3 Bento Tiles */}
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

            {/* Growth Curve Preview */}
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
          </div>
        </div>
      </div>
    </div>
  );
};
