import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const LoanAndEmiPage: React.FC = () => {
  const { formatMoney, currencyConfig, triggerToast, addHistoryItem } = useApp();

  // Loan parameters
  const [loanAmount, setLoanAmount] = useState<number>(2500000);
  const [interestRate, setInterestRate] = useState<number>(8.75);
  const [tenureYears, setTenureYears] = useState<number>(15);
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(10000); // extra per month
  const [prepaymentActive, setPrepaymentActive] = useState<boolean>(false);
  const [processingFeePct, setProcessingFeePct] = useState<number>(0.5);

  // EMI Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  let emi = 0;
  if (monthlyRate > 0 && totalMonths > 0) {
    emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  } else if (totalMonths > 0) {
    emi = loanAmount / totalMonths;
  }

  const standardTotalRepayment = emi * totalMonths;
  const standardTotalInterest = Math.max(0, standardTotalRepayment - loanAmount);
  const processingFee = (loanAmount * processingFeePct) / 100;

  // Prepayment simulation
  let prepayMonths = totalMonths;
  let prepayTotalInterest = standardTotalInterest;
  if (prepaymentActive && prepaymentAmount > 0) {
    let balance = loanAmount;
    let m = 0;
    let accumulatedInterest = 0;
    const effectiveEmi = emi + prepaymentAmount;
    while (balance > 0 && m < totalMonths) {
      m++;
      const interestForMonth = balance * monthlyRate;
      accumulatedInterest += interestForMonth;
      const principalForMonth = effectiveEmi - interestForMonth;
      balance = Math.max(0, balance - principalForMonth);
    }
    prepayMonths = m;
    prepayTotalInterest = accumulatedInterest;
  }

  const interestSaved = standardTotalInterest - prepayTotalInterest;
  const timeSavedMonths = totalMonths - prepayMonths;

  // Pie percentages
  const totalPayable = prepaymentActive ? (loanAmount + prepayTotalInterest) : standardTotalRepayment;
  const principalPct = totalPayable > 0 ? (loanAmount / totalPayable) * 100 : 50;
  const interestPct = Math.max(0, 100 - principalPct);

  // First 5 years annual amortization schedule preview
  const annualSchedule = [];
  let currentBalance = loanAmount;
  for (let yr = 1; yr <= Math.min(10, tenureYears); yr++) {
    let yrInterest = 0;
    let yrPrincipal = 0;
    const monthsInThisYear = 12;
    for (let m = 1; m <= monthsInThisYear; m++) {
      if (currentBalance <= 0) break;
      const mInterest = currentBalance * monthlyRate;
      const effectivePay = prepaymentActive ? (emi + prepaymentAmount) : emi;
      const mPrincipal = Math.min(currentBalance, effectivePay - mInterest);
      yrInterest += mInterest;
      yrPrincipal += mPrincipal;
      currentBalance = Math.max(0, currentBalance - mPrincipal);
    }
    annualSchedule.push({
      year: `Year ${yr}`,
      interestPaid: yrInterest,
      principalPaid: yrPrincipal,
      endingBalance: currentBalance,
    });
  }

  const handleSaveLoan = () => {
    addHistoryItem({
      category: 'Loan EMI',
      title: `Home/Personal Loan — ${formatMoney(loanAmount)} @ ${interestRate}% for ${tenureYears} yrs`,
      principal: loanAmount,
      rate: interestRate,
      tenureYears,
      frequency: 'Monthly (n=12)',
      resultValue: emi,
      resultFormatted: `${formatMoney(emi, 2)} / month`,
      formula: 'E = P · r · (1+r)ⁿ / ((1+r)ⁿ - 1)',
      details: [
        { label: 'Monthly EMI', value: formatMoney(emi, 2) },
        { label: 'Total Interest', value: formatMoney(standardTotalInterest, 2) },
        { label: 'Total Payable', value: formatMoney(standardTotalRepayment, 2) },
        { label: 'Processing Fee', value: formatMoney(processingFee) },
      ],
    });
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div>
          <div className="flex items-center gap-space-2xs text-secondary font-label-md text-label-md">
            <span>Calculators</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold">Loan &amp; Amortization</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">
            Equated Monthly Installment (EMI) Calculator
          </h1>
          <p className="font-body-md text-body-md text-secondary max-w-2xl">
            Simulate mortgage, auto, or personal debt amortization with reducing balance interest, prepayment payoffs, and schedule ledgers.
          </p>
        </div>
        <div className="flex items-center gap-space-xs shrink-0">
          <button
            onClick={handleSaveLoan}
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-sm transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
            <span>Save Scenario</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Input Console (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md border border-surface-container-high/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[22px]">payments</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Loan Configuration
                </h2>
              </div>
              <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                Reducing Balance
              </span>
            </div>

            {/* Loan Principal Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md font-semibold text-on-surface">
                  Loan Amount (P)
                </label>
                <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                  {formatMoney(loanAmount)}
                </span>
              </div>
              <div className="flex items-center rounded-lg bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-primary">
                <span className="px-space-md py-2.5 bg-surface-container-high text-primary font-bold">
                  {currencyConfig.symbol}
                </span>
                <input
                  className="w-full px-space-sm py-2.5 bg-surface-container-lowest font-data-mono-md text-data-mono-md text-on-surface font-semibold focus:outline-none"
                  type="number"
                  min="50000"
                  max="50000000"
                  step="50000"
                  value={loanAmount}
                  onChange={e => setLoanAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <input
                type="range"
                className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer mt-1"
                min="100000"
                max="10000000"
                step="50000"
                value={loanAmount}
                onChange={e => setLoanAmount(parseFloat(e.target.value))}
              />
              <div className="flex items-center gap-space-2xs pt-1 flex-wrap">
                {[500000, 1500000, 2500000, 5000000, 8000000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLoanAmount(amt)}
                    className="px-space-xs py-0.5 rounded bg-surface-container-low hover:bg-surface-container text-secondary text-label-sm font-label-sm border border-surface-container-high/40"
                  >
                    {formatMoney(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate */}
            <div className="flex flex-col gap-1.5 pt-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md font-semibold text-on-surface">
                  Annual Interest Rate (%)
                </label>
                <span className="font-label-sm text-label-sm text-secondary">
                  Monthly: {(interestRate / 12).toFixed(3)}%
                </span>
              </div>
              <div className="flex items-center rounded-lg bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-primary">
                <input
                  className="w-full px-space-sm py-2.5 bg-surface-container-lowest font-data-mono-md text-data-mono-md text-on-surface font-semibold focus:outline-none"
                  type="number"
                  min="1"
                  max="30"
                  step="0.05"
                  value={interestRate}
                  onChange={e => setInterestRate(parseFloat(e.target.value) || 0)}
                />
                <span className="px-space-md py-2.5 bg-surface-container-high text-secondary font-medium text-label-md">
                  % p.a.
                </span>
              </div>
              <input
                type="range"
                className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer mt-1"
                min="4"
                max="20"
                step="0.1"
                value={interestRate}
                onChange={e => setInterestRate(parseFloat(e.target.value))}
              />
            </div>

            {/* Loan Tenure */}
            <div className="flex flex-col gap-1.5 pt-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md font-semibold text-on-surface">
                  Tenure Horizon
                </label>
                <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                  {tenureYears} Years ({totalMonths} EMIs)
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <input
                  className="w-24 px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface font-data-mono-md font-semibold text-center border border-surface-container-high/60"
                  type="number"
                  min="1"
                  max="35"
                  value={tenureYears}
                  onChange={e => setTenureYears(parseInt(e.target.value, 10) || 1)}
                />
                <input
                  type="range"
                  className="flex-1 accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                  min="1"
                  max="30"
                  value={tenureYears}
                  onChange={e => setTenureYears(parseInt(e.target.value, 10))}
                />
              </div>
            </div>

            {/* Prepayment & Extra Monthly Installment */}
            <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-sm border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-2xs">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">savings</span>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Accelerated Prepayment
                  </span>
                </div>
                <button
                  type="button"
                  className={`w-9 h-5 rounded-full relative p-0.5 transition-colors ${
                    prepaymentActive ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                  onClick={() => setPrepaymentActive(!prepaymentActive)}
                  aria-label="Toggle prepayment"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      prepaymentActive ? 'ml-auto' : 'ml-0'
                    }`}
                  ></div>
                </button>
              </div>
              {prepaymentActive && (
                <div className="flex items-center justify-between gap-space-sm pt-space-2xs border-t border-surface-container-high/40">
                  <span className="font-body-sm text-body-sm text-secondary">
                    Extra monthly contribution:
                  </span>
                  <div className="flex items-center rounded-lg bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 w-36">
                    <span className="px-2 py-1 bg-surface-container text-primary font-bold text-xs">
                      {currencyConfig.symbol}
                    </span>
                    <input
                      type="number"
                      step="1000"
                      className="w-full px-2 py-1 text-right font-data-mono-md text-label-md font-semibold focus:outline-none"
                      value={prepaymentAmount}
                      onChange={e => setPrepaymentAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Processing Fee */}
            <div className="flex items-center justify-between text-body-sm text-secondary pt-space-xs">
              <span>Processing Fee ({processingFeePct}%):</span>
              <span className="font-data-mono-md font-semibold text-on-surface">
                {formatMoney(processingFee)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Visual Amortization Results Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Main EMI Metric Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md border border-surface-container-high/50">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low p-space-lg rounded-xl border border-surface-container-high/50">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                  Monthly Installment (EMI)
                </span>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-display-xl text-display-xl text-primary font-bold tracking-tight">
                    {formatMoney(emi, 2)}
                  </span>
                  <span className="text-secondary font-label-md text-label-md font-medium">/ month</span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                  Calculated for {totalMonths} monthly payments at {interestRate}% APR
                </p>
              </div>

              {prepaymentActive && interestSaved > 0 && (
                <div className="flex flex-col items-start md:items-end gap-1 p-space-sm rounded-lg bg-tertiary-fixed/30 border border-tertiary-fixed shrink-0">
                  <span className="font-label-sm text-label-sm uppercase text-tertiary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">celebration</span>
                    Prepayment Advantage
                  </span>
                  <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface">
                    Saves {formatMoney(interestSaved)}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Debt-free {timeSavedMonths} months early!
                  </span>
                </div>
              )}
            </div>

            {/* 3 Bento Tiles for Core Loan Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                  Principal Borrowed
                </span>
                <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface">
                  {formatMoney(loanAmount)}
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  {principalPct.toFixed(1)}% of total payout
                </span>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                  Total Interest Accrued
                </span>
                <span className="font-data-mono-md text-data-mono-md font-bold text-tertiary">
                  {formatMoney(prepaymentActive ? prepayTotalInterest : standardTotalInterest, 2)}
                </span>
                <span className="font-body-sm text-body-sm text-tertiary font-semibold">
                  {interestPct.toFixed(1)}% interest cost
                </span>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container-high/40">
                <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                  Total Repayment
                </span>
                <span className="font-data-mono-md text-data-mono-md font-bold text-primary">
                  {formatMoney(totalPayable, 2)}
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Principal + Total Interest
                </span>
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="flex flex-col gap-1 pt-space-xs">
              <div className="flex items-center justify-between text-label-sm font-label-sm">
                <span className="flex items-center gap-1.5 font-medium text-on-surface">
                  <span className="w-3 h-3 rounded bg-primary inline-block"></span> Principal ({principalPct.toFixed(1)}%)
                </span>
                <span className="flex items-center gap-1.5 font-medium text-tertiary">
                  <span className="w-3 h-3 rounded bg-tertiary inline-block"></span> Interest ({interestPct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex">
                <div className="bg-primary h-full transition-all duration-300" style={{ width: `${principalPct}%` }}></div>
                <div className="bg-tertiary h-full transition-all duration-300" style={{ width: `${interestPct}%` }}></div>
              </div>
            </div>
          </div>

          {/* Annual Amortization Schedule Table */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md border border-surface-container-high/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">table_rows</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Annual Amortization Ledger
                </h3>
              </div>
              <span className="font-label-sm text-label-sm text-secondary">
                First {annualSchedule.length} Years Overview
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase">
                    <th className="py-space-xs px-space-sm rounded-l-lg">Timeline</th>
                    <th className="py-space-xs px-space-sm">Principal Paid</th>
                    <th className="py-space-xs px-space-sm">Interest Paid</th>
                    <th className="py-space-xs px-space-sm rounded-r-lg">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-data-mono-md">
                  {annualSchedule.map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-space-xs px-space-sm font-semibold text-on-surface">{row.year}</td>
                      <td className="py-space-xs px-space-sm text-primary font-medium">{formatMoney(row.principalPaid)}</td>
                      <td className="py-space-xs px-space-sm text-tertiary font-medium">{formatMoney(row.interestPaid)}</td>
                      <td className="py-space-xs px-space-sm text-on-surface font-bold">{formatMoney(row.endingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-space-xs border-t border-surface-container-high/40 text-body-sm text-secondary">
              <span>*Interest component decreases each month as balance reduces.</span>
              <button
                type="button"
                onClick={() => triggerToast('Exported detailed monthly amortization ledger.')}
                className="text-primary hover:underline font-label-md text-label-md font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">download</span> Export Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
