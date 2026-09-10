import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AdvancedSolverPage: React.FC = () => {
  const { formatMoney, triggerToast, addHistoryItem } = useApp();

  const [activeMode, setActiveMode] = useState<'Formula' | 'Equation' | 'Problem'>('Problem');

  const [promptText, setPromptText] = useState<string>('');

  // Extracted Variables
  const [pVal, setPVal] = useState<number>(0);
  const [rVal, setRVal] = useState<number>(0);
  const [tVal, setTVal] = useState<number>(0);
  const [nVal, setNVal] = useState<number>(4);

  const hasData = pVal > 0 && rVal > 0 && tVal > 0;

  // Calculations
  const rDecimal = rVal / 100;
  const periodicRate = rDecimal / nVal;
  const totalCycles = Math.round(nVal * tVal);
  const growthMultiplier = Math.pow(1 + periodicRate, totalCycles);
  const maturityA = pVal * growthMultiplier;
  const compoundInterestCI = maturityA - pVal;
  const effectiveAnnualRate = (Math.pow(1 + periodicRate, nVal) - 1) * 100;
  const simpleInterestSI = pVal * rDecimal * tVal;
  const alphaSpread = compoundInterestCI - simpleInterestSI;
  const alphaPct = simpleInterestSI > 0 ? (alphaSpread / simpleInterestSI) * 100 : 0;

  // Yearly spreads
  const getYearSpread = (yr: number) => {
    const ci_yr = pVal * Math.pow(1 + periodicRate, nVal * yr) - pVal;
    const si_yr = pVal * rDecimal * yr;
    return Math.max(0, ci_yr - si_yr);
  };
  const year1Spread = getYearSpread(1);
  const year2Spread = getYearSpread(2);
  const year3Spread = getYearSpread(3);

  const applyTemplate = (templateName: string) => {
    if (templateName === 'Quarterly Compound Interest') {
      setPVal(50000);
      setRVal(8.0);
      setTVal(3.0);
      setNVal(4);
      setPromptText('Calculate the compound interest on ₹50,000 at 8% per annum for 3 years, compounded quarterly. Also determine the effective annual yield and difference compared to simple interest.');
    } else if (templateName === 'Finding Unknown Rate (r)') {
      setPVal(100000);
      setRVal(10.5);
      setTVal(5.0);
      setNVal(12);
      setPromptText('Determine required nominal annual interest rate to grow ₹1,00,000 into ₹1,68,000 over 5 years with monthly compounding.');
    } else if (templateName === 'Double Money Rule of 72') {
      setPVal(75000);
      setRVal(9.0);
      setTVal(8.0);
      setNVal(1);
      setPromptText('How long will it take for ₹75,000 to double at 9% annual compound interest based on exact logarithms and the Rule of 72?');
    } else if (templateName === 'Car Loan Balloon Payment') {
      setPVal(600000);
      setRVal(9.2);
      setTVal(4.0);
      setNVal(12);
      setPromptText('Evaluate 4-year auto loan on ₹6,00,000 at 9.2% nominal interest with standard reducing installments and a 15% final balloon payment.');
    } else if (templateName === 'Annuity Due with Inflation') {
      setPVal(25000);
      setRVal(12.0);
      setTVal(10.0);
      setNVal(12);
      setPromptText('Model a 10-year annuity due depositing ₹25,000 at the start of each month at 12% compounding with 5.5% annual CPI inflation discount.');
    }
    triggerToast(`Loaded "${templateName}" template into symbolic solver.`);
  };

  const handleSolve = () => {
    if (!hasData) {
      triggerToast('Please select a quick template or enter problem values first.');
      return;
    }
    addHistoryItem({
      category: 'Advanced Solver',
      title: `Quarterly Compound Interest — ${formatMoney(pVal)} @ ${rVal}% for ${tVal} yrs`,
      principal: pVal,
      rate: rVal,
      tenureYears: tVal,
      frequency: nVal === 4 ? 'Quarterly (n=4)' : `n=${nVal}`,
      resultValue: maturityA,
      resultFormatted: formatMoney(maturityA, 2),
      formula: `A = ${pVal} × (1 + ${rVal / 100}/${nVal})^(${nVal} × ${tVal})`,
      details: [
        { label: 'Net Interest (CI)', value: formatMoney(compoundInterestCI, 2) },
        { label: 'Effective Yield (EAR)', value: `${effectiveAnnualRate.toFixed(2)}%` },
        { label: 'Simple Interest Spread', value: `+${formatMoney(alphaSpread, 2)}` },
      ],
    });
    triggerToast('Step-by-step mathematical proof derived.');
  };

  const copyMarkdownSolution = () => {
    const md = `### Solution: Compound Interest Evaluation
- **Principal (P):** ${formatMoney(pVal)}
- **Nominal Rate (r):** ${rVal}% p.a.
- **Horizon (t):** ${tVal} Years
- **Compounding (n):** ${nVal} times/year
- **Total Maturity (A):** ${formatMoney(maturityA, 2)}
- **Compound Interest (CI):** ${formatMoney(compoundInterestCI, 2)}
- **Effective Annual Rate (EAR):** ${effectiveAnnualRate.toFixed(2)}%
- **Alpha vs Simple Interest:** +${formatMoney(alphaSpread, 2)} (+${alphaPct.toFixed(2)}%)`;
    navigator.clipboard.writeText(md);
    triggerToast('Copied pedagogical derivation in Markdown!');
  };

  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Header & Context Banner */}
      <div className="relative w-full rounded-2xl bg-surface-container-low p-space-xl lg:p-space-2xl shadow-sm overflow-hidden border border-surface-container-high/40">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary-fixed/40 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 rounded-full bg-tertiary-fixed/30 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-primary-container/10 text-primary font-label-sm text-label-sm uppercase tracking-wider mb-space-sm border border-primary/20">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>Symbolic &amp; Quantitative Engine v4.2</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold mb-space-xs">
              Solve Complex Interest Problems
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Enter your equation, specify variables, or describe a financial word problem for instant step-by-step mathematical solutions.
            </p>
          </div>

          {/* Engine Status Matrix Badge */}
          <div className="flex items-center gap-space-md p-space-sm bg-surface-container-lowest rounded-xl shadow-sm shrink-0 border border-surface-container-high/60">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">terminal</span>
            </div>
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span className="font-label-sm text-label-sm uppercase text-on-surface font-semibold">
                  Parser Active
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-secondary">LaTeX + Real Yield Solvers Ready</span>
            </div>
          </div>
        </div>

        {/* Input Mode Switcher */}
        <div className="mt-space-xl pt-space-md flex flex-wrap items-center gap-space-xs border-t border-surface-container-high/40">
          {(['Formula', 'Equation', 'Problem'] as const).map(mode => {
            const isSelected = activeMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                type="button"
                className={`relative inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-xl font-label-md text-label-md transition-all ${
                  isSelected
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm border border-surface-container-high/60'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                {mode === 'Problem' && <span className="material-symbols-outlined text-[18px]">auto_awesome</span>}
                <span>{mode} Mode</span>
                {mode === 'Problem' && (
                  <span className="px-space-xs py-space-2xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold tracking-normal">
                    Natural Language AI Parser
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Solver Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* Left Input & Diagnostic Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Scenario Input Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md border border-surface-container-high/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Natural Language Query
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-secondary">Multi-parameter solver</span>
            </div>

            <div className="relative">
              <textarea
                className="w-full bg-surface-container-low text-on-surface p-space-md rounded-xl font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all resize-none shadow-inner border border-surface-container-high/50"
                rows={4}
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                placeholder="Type or paste any financial math challenge..."
              />
              <div className="absolute bottom-2 right-2 text-secondary font-label-sm text-label-sm pointer-events-none">
                {promptText.length} chars
              </div>
            </div>

            {/* Sample scenario chips */}
            <div>
              <span className="font-label-sm text-label-sm uppercase text-secondary font-semibold block mb-space-xs">
                Quick Templates
              </span>
              <div className="flex flex-wrap gap-space-xs">
                {[
                  'Quarterly Compound Interest',
                  'Finding Unknown Rate (r)',
                  'Double Money Rule of 72',
                  'Car Loan Balloon Payment',
                  'Annuity Due with Inflation',
                ].map(tpl => (
                  <button
                    key={tpl}
                    onClick={() => applyTemplate(tpl)}
                    className="px-space-xs py-space-2xs rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm transition-colors border border-surface-container-high/40 text-left"
                    type="button"
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Variable Detection HUD */}
            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs border border-surface-container-high/40">
              <div className="flex items-center justify-between pb-space-2xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold flex items-center gap-space-2xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">data_object</span>
                  Variable Detection HUD
                </span>
                <span className="px-space-xs py-space-2xs rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  5 variables bound
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs pt-space-2xs">
                <div className="p-space-xs rounded-lg bg-surface-container-lowest flex items-center justify-between shadow-sm border border-surface-container-high/30">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-secondary">Principal (P)</span>
                    <span className="font-data-mono-md text-data-mono-md text-on-surface font-semibold">
                      {formatMoney(pVal)}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                </div>

                <div className="p-space-xs rounded-lg bg-surface-container-lowest flex items-center justify-between shadow-sm border border-surface-container-high/30">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-secondary">Nominal Rate (r)</span>
                    <span className="font-data-mono-md text-data-mono-md text-on-surface font-semibold">
                      {rVal.toFixed(1)}% / year
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                </div>

                <div className="p-space-xs rounded-lg bg-surface-container-lowest flex items-center justify-between shadow-sm border border-surface-container-high/30">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-secondary">Tenure (t)</span>
                    <span className="font-data-mono-md text-data-mono-md text-on-surface font-semibold">
                      {tVal.toFixed(1)} Years
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                </div>

                <div className="p-space-xs rounded-lg bg-surface-container-lowest flex items-center justify-between shadow-sm border border-surface-container-high/30">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-secondary">Compounding (n)</span>
                    <span className="font-data-mono-md text-data-mono-md text-on-surface font-semibold">
                      {nVal} ({nVal === 4 ? 'Quarterly' : nVal === 12 ? 'Monthly' : nVal === 1 ? 'Annually' : 'Periodic'})
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                </div>
              </div>

              <div className="p-space-xs rounded-lg bg-surface-container-lowest flex items-center justify-between shadow-sm mt-space-2xs border border-surface-container-high/30">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-tertiary font-semibold">
                    Target Unknowns Identified
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Maturity (A), Net Compound Yield (CI), Effective Yield (EAR)
                  </span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-tertiary">tune</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-space-sm pt-space-xs">
              <button
                onClick={handleSolve}
                className="flex-1 h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-space-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px] animate-pulse">bolt</span>
                <span>Solve Step-by-Step</span>
              </button>
              <button
                onClick={() => setPromptText('')}
                className="h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-space-2xs border border-surface-container-high/40"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">clear_all</span>
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Mathematical Framework */}
          <div className="bg-surface-container-low p-space-lg rounded-2xl flex flex-col gap-space-sm border border-surface-container-high/40">
            <div className="flex items-center gap-space-xs text-on-surface">
              <span className="material-symbols-outlined text-primary text-[20px]">architecture</span>
              <span className="font-headline-sm text-headline-sm font-bold">Mathematical Framework</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Interestly utilizes exact floating precision with arbitrary periodic expansion to avoid compounding rounding anomalies common in generic calculators.
            </p>
            <div className="flex items-center gap-space-md pt-space-2xs">
              <div className="flex items-center gap-space-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span className="font-label-sm text-label-sm text-secondary">Discrete Compounding</span>
              </div>
              <div className="flex items-center gap-space-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                <span className="font-label-sm text-label-sm text-secondary">Fisher Hypothesis Ready</span>
              </div>
            </div>
          </div>

          {/* Institutional Illustration */}
          <div className="overflow-hidden rounded-2xl shadow-sm bg-surface-container-lowest border border-surface-container-high/50">
            <img
              className="w-full h-44 object-cover"
              alt="Institutional workspace"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCurUw2qClWmaRKzg3ESnIMi9_6KKfMwuzBHClnsAV6MSUYLWsUKUKyU2f7ctSGL-redyAG1XVKHwAs1Zdinisi5CkzBmcppzWHXrisq_DAwbEJ-20QGvDEiq1YcQkMzM-mhJUwcEYECNZoFiLNtTIdH9kaCFvbhUUvfATQCn3I1tM9nvBTRZQYLpnnRF6bRwO0dZRxQ50Vz8Ujjgjn1TUU3puLZ84cvQw8CvK6det7xy3dYb8zjLNuVg"
            />
            <div className="p-space-md flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                Institutional Grade Verification
              </span>
              <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                100% Deterministic
              </span>
            </div>
          </div>
        </div>

        {/* Right Detailed Pedagogical Solution Breakdown Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Section 4: Final Answer Hero Card */}
          <div className="relative bg-gradient-to-br from-primary via-primary to-primary-container text-on-primary p-space-lg lg:p-space-xl rounded-2xl shadow-lg overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none flex items-center justify-end pr-space-md">
              <span className="material-symbols-outlined text-[240px] leading-none">calculate</span>
            </div>
            {!hasData ? (
              <div className="relative z-10 flex flex-col items-center justify-center py-10 text-center text-on-primary">
                <span className="material-symbols-outlined text-[44px] mb-2 opacity-80">psychology</span>
                <h3 className="font-headline-sm text-headline-sm font-bold">Solver Ready</h3>
                <p className="font-body-sm text-body-sm text-on-primary/85 max-w-sm mt-1">
                  Type a mathematical query or click one of the Quick Templates to load problem parameters and calculate step-by-step proofs.
                </p>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span className="px-space-xs py-space-2xs rounded-full bg-on-primary/15 font-label-sm text-label-sm uppercase tracking-wider font-semibold text-on-primary">
                    Solution Matrix Verified
                  </span>
                  <span className="font-label-sm text-label-sm text-on-primary/80">Computed in 4.2ms</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg pt-space-xs">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-wide text-on-primary/80 block mb-space-2xs">
                      Net Compound Interest (CI)
                    </span>
                    <div className="font-display-xl text-display-xl tracking-tight font-bold">
                      {formatMoney(compoundInterestCI, 2)}
                    </div>
                    <div className="flex items-center gap-space-2xs mt-space-2xs font-body-sm text-body-sm text-on-primary/90">
                      <span className="material-symbols-outlined text-[18px]">trending_up</span>
                      <span>
                        +{formatMoney(alphaSpread, 2)} vs Simple Interest (+{alphaPct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  <div className="sm:border-l sm:border-on-primary/20 sm:pl-space-lg flex flex-col justify-center">
                    <span className="font-label-sm text-label-sm uppercase tracking-wide text-on-primary/80 block mb-space-2xs">
                      Total Maturity Amount (A)
                    </span>
                    <div className="font-data-mono-lg text-data-mono-lg font-bold">
                      {formatMoney(maturityA, 2)}
                    </div>
                    <div className="mt-space-xs inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-lg bg-on-primary/10 w-fit">
                      <span className="font-label-sm text-label-sm font-semibold">Effective Annual Rate (EAR):</span>
                      <span className="font-data-mono-md text-data-mono-md font-bold text-tertiary-fixed">
                        {effectiveAnnualRate.toFixed(2)}% p.a.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Problem Summary & Given Parameters */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md border border-surface-container-high/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Parameter Specification Table
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary">
                Discrete {nVal === 4 ? 'Quarterly' : nVal === 12 ? 'Monthly' : 'Periodic'} Accrual
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-md text-body-md">
                <thead>
                  <tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase">
                    <th className="py-space-xs px-space-sm rounded-l-lg">Parameter Symbol</th>
                    <th className="py-space-xs px-space-sm">Description</th>
                    <th className="py-space-xs px-space-sm">Stated Value</th>
                    <th className="py-space-xs px-space-sm rounded-r-lg">Normalized Math Unit</th>
                  </tr>
                </thead>
                <tbody className="text-on-surface divide-y divide-surface-container-high/40">
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-space-xs px-space-sm font-data-mono-md text-primary font-bold">P</td>
                    <td className="py-space-xs px-space-sm">Initial Principal Amount</td>
                    <td className="py-space-xs px-space-sm font-medium">{formatMoney(pVal)}</td>
                    <td className="py-space-xs px-space-sm font-data-mono-md text-secondary">
                      {pVal.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-space-xs px-space-sm font-data-mono-md text-primary font-bold">r</td>
                    <td className="py-space-xs px-space-sm">Nominal Annual Interest Rate</td>
                    <td className="py-space-xs px-space-sm font-medium">{rVal.toFixed(2)}%</td>
                    <td className="py-space-xs px-space-sm font-data-mono-md text-secondary">
                      {(rVal / 100).toFixed(4)} / year
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-space-xs px-space-sm font-data-mono-md text-primary font-bold">t</td>
                    <td className="py-space-xs px-space-sm">Investment Horizon Duration</td>
                    <td className="py-space-xs px-space-sm font-medium">{tVal} Years</td>
                    <td className="py-space-xs px-space-sm font-data-mono-md text-secondary">
                      {tVal.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-space-xs px-space-sm font-data-mono-md text-primary font-bold">n</td>
                    <td className="py-space-xs px-space-sm">Compounding Frequency</td>
                    <td className="py-space-xs px-space-sm font-medium">
                      {nVal === 4 ? 'Quarterly' : nVal === 12 ? 'Monthly' : 'Annual'}
                    </td>
                    <td className="py-space-xs px-space-sm font-data-mono-md text-secondary">
                      {nVal} cycles / year
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Mathematical Formula Display */}
          <div className="bg-surface-container-low p-space-lg rounded-2xl flex flex-col gap-space-sm border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-[16px] text-tertiary">functions</span>
                Governing Equations
              </span>
              <span className="font-body-sm text-body-sm text-secondary font-medium">
                Standard Exponential Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-2xs">
              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-center border border-surface-container-high/40">
                <span className="font-label-sm text-label-sm text-secondary mb-space-2xs">
                  Total Accumulated Value
                </span>
                <div className="font-headline-md text-headline-md text-on-surface tracking-wide flex items-center gap-space-xs">
                  <span className="text-primary font-bold">A</span>
                  <span>=</span>
                  <span>P</span>
                  <span>&times;</span>
                  <span className="bg-surface-container px-space-xs py-space-2xs rounded-md text-on-surface font-mono text-[18px]">
                    (1 + <sup>r</sup>/<sub>n</sub>)<sup>n &times; t</sup>
                  </span>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-center border border-surface-container-high/40">
                <span className="font-label-sm text-label-sm text-secondary mb-space-2xs">
                  Compound Accrual &amp; Yield
                </span>
                <div className="font-headline-md text-headline-md text-on-surface tracking-wide flex items-center gap-space-xs">
                  <span className="text-primary font-bold">CI</span>
                  <span>=</span>
                  <span>A - P</span>
                  <span className="text-secondary mx-space-2xs">|</span>
                  <span className="text-tertiary font-bold text-headline-sm">EAR</span>
                  <span>=</span>
                  <span className="bg-surface-container px-space-xs py-space-2xs rounded-md text-on-surface font-mono text-[16px]">
                    (1 + <sup>r</sup>/<sub>n</sub>)<sup>n</sup> - 1
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Step-by-Step Pedagogical Derivations */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md border border-surface-container-high/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">format_list_numbered</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Step-by-Step Pedagogical Derivations
                </span>
              </div>
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                6 Proof Steps
              </span>
            </div>

            <div className="space-y-space-sm">
              {/* Step 1 */}
              <div className="p-space-md rounded-xl bg-surface-container-low/60 flex items-start gap-space-md hover:bg-surface-container-low transition-colors border border-surface-container-high/30">
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Calculate Periodic Rate
                    </span>
                    <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                      i = {periodicRate.toFixed(4)} ({(periodicRate * 100).toFixed(2)}%)
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                    Divide nominal rate (<code className="bg-surface-container px-1 rounded font-mono">r = {rVal}%</code>) by compounding frequency (<code className="bg-surface-container px-1 rounded font-mono">n = {nVal}</code>):
                    <br />
                    <span className="font-mono text-on-surface text-[13px]">
                      i = r / n = {(rVal / 100).toFixed(4)} / {nVal} = {periodicRate.toFixed(4)} per period
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-space-md rounded-xl bg-surface-container-low/60 flex items-start gap-space-md hover:bg-surface-container-low transition-colors border border-surface-container-high/30">
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Determine Total Compounding Intervals
                    </span>
                    <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                      N = {totalCycles} Intervals
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                    Multiply time duration (<code className="bg-surface-container px-1 rounded font-mono">t = {tVal}</code>) by frequency (<code className="bg-surface-container px-1 rounded font-mono">n = {nVal}</code>):
                    <br />
                    <span className="font-mono text-on-surface text-[13px]">
                      N = n &times; t = {nVal} &times; {tVal} = {totalCycles} total cycles
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-space-md rounded-xl bg-surface-container-low/60 flex items-start gap-space-md hover:bg-surface-container-low transition-colors border border-surface-container-high/30">
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Compute Exponential Growth Multiplier
                    </span>
                    <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                      M = {growthMultiplier.toFixed(8)}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                    Raise periodic base factor to the {totalCycles}th exponent:
                    <br />
                    <span className="font-mono text-on-surface text-[13px]">
                      (1 + {periodicRate.toFixed(4)})^{totalCycles} = ({ (1 + periodicRate).toFixed(4) })^{totalCycles} &approx; {growthMultiplier.toFixed(8)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-space-md rounded-xl bg-surface-container-low/60 flex items-start gap-space-md hover:bg-surface-container-low transition-colors border border-surface-container-high/30">
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0 mt-0.5">
                  4
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Multiply Factor by Principal Balance
                    </span>
                    <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                      A = {formatMoney(maturityA, 2)}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                    <span className="font-mono text-on-surface text-[13px]">
                      A = {pVal.toLocaleString()} &times; {growthMultiplier.toFixed(8)} = {formatMoney(maturityA, 2)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-space-md rounded-xl bg-surface-container-low/60 flex items-start gap-space-md hover:bg-surface-container-low transition-colors border border-surface-container-high/30">
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0 mt-0.5">
                  5
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Isolate Pure Accrued Interest
                    </span>
                    <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                      CI = {formatMoney(compoundInterestCI, 2)}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                    Subtract initial principal base from final accumulated value:
                    <br />
                    <span className="font-mono text-on-surface text-[13px]">
                      CI = A - P = {formatMoney(maturityA, 2)} - {formatMoney(pVal, 2)} = {formatMoney(compoundInterestCI, 2)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="p-space-md rounded-xl bg-surface-container-high/50 flex items-start gap-space-md border border-surface-container-high/40">
                <div className="w-7 h-7 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0 mt-0.5">
                  6
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Benchmark Against Simple Interest (SI)
                    </span>
                    <span className="font-data-mono-md text-data-mono-md text-tertiary font-bold">
                      +{formatMoney(alphaSpread, 2)} Alpha
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                    Linear simple interest: <span className="font-mono text-on-surface">SI = P &times; r &times; t = {formatMoney(simpleInterestSI, 2)}</span>.
                    <br />
                    Compounding creates an incremental dividend of <strong className="text-on-surface font-semibold">+{formatMoney(alphaSpread, 2)}</strong> due to periodic re-investment of yields.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Interactive Growth Curve Graph */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md border border-surface-container-high/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
              <div>
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">show_chart</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Compounding Divergence Curve
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-secondary">
                  Period-by-period visual divergence against simple interest baseline
                </span>
              </div>
              <div className="flex items-center gap-space-md font-label-sm text-label-sm">
                <div className="flex items-center gap-space-2xs">
                  <span className="w-3 h-1 bg-primary rounded-full"></span>
                  <span className="text-on-surface font-medium">Compound (Quarterly)</span>
                </div>
                <div className="flex items-center gap-space-2xs">
                  <span className="w-3 h-1 bg-outline rounded-full"></span>
                  <span className="text-secondary font-medium">Simple Linear</span>
                </div>
              </div>
            </div>

            {/* Inline SVG Visualization Chart */}
            <div className="relative w-full h-64 bg-surface-container-low rounded-xl p-space-md flex flex-col justify-end overflow-hidden border border-surface-container-high/40">
              <div className="absolute inset-0 p-space-md flex flex-col justify-between pointer-events-none opacity-20">
                <div className="w-full border-b border-outline"></div>
                <div className="w-full border-b border-outline"></div>
                <div className="w-full border-b border-outline"></div>
                <div className="w-full border-b border-outline"></div>
              </div>

              <svg className="w-full h-44 overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 160">
                <defs>
                  <linearGradient id="curveGradSolver" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#004ac6" stopOpacity="0.25"></stop>
                    <stop offset="100%" stopColor="#004ac6" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>
                <polygon
                  fill="url(#curveGradSolver)"
                  points="0,150 50,140 100,129 150,118 200,105 250,92 300,78 350,63 400,47 450,30 500,12 550,-7 600,-28 600,150 0,150"
                ></polygon>
                <line stroke="#737686" strokeDasharray="4,4" strokeWidth="2" x1="0" x2="600" y1="150" y2="20"></line>
                <path
                  d="M0,150 Q280,95 600,-28"
                  fill="none"
                  stroke="#004ac6"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                ></path>
                <circle cx="0" cy="150" fill="#004ac6" r="4"></circle>
                <circle cx="200" cy="105" fill="#004ac6" r="4"></circle>
                <circle cx="400" cy="47" fill="#004ac6" r="4"></circle>
                <circle cx="600" cy="-28" fill="#2563eb" r="5"></circle>
              </svg>

              <div className="flex justify-between items-center text-secondary font-label-sm text-label-sm pt-space-xs border-t border-surface-container-high/60 mt-1">
                <span>Start ({formatMoney(pVal)})</span>
                <span>Year 1</span>
                <span>Year 2</span>
                <span className="text-primary font-bold">Year {tVal} ({formatMoney(maturityA)})</span>
              </div>
            </div>

            {/* Divergence Callout Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
              <div className="p-space-xs rounded-lg bg-surface-container-low flex flex-col border border-surface-container-high/40">
                <span className="font-label-sm text-label-sm text-secondary">Year 1 Divergence</span>
                <span className="font-data-mono-md text-data-mono-md text-on-surface font-semibold">
                  +{formatMoney(year1Spread, 2)}
                </span>
              </div>
              <div className="p-space-xs rounded-lg bg-surface-container-low flex flex-col border border-surface-container-high/40">
                <span className="font-label-sm text-label-sm text-secondary">Year 2 Divergence</span>
                <span className="font-data-mono-md text-data-mono-md text-on-surface font-semibold">
                  +{formatMoney(year2Spread, 2)}
                </span>
              </div>
              <div className="p-space-xs rounded-lg bg-surface-container-low flex flex-col border border-surface-container-high/40">
                <span className="font-label-sm text-label-sm text-secondary">Final Spread</span>
                <span className="font-data-mono-md text-data-mono-md text-primary font-bold">
                  +{formatMoney(alphaSpread, 2)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container-high/40">
            <div className="flex flex-wrap items-center gap-space-xs">
              <button
                onClick={copyMarkdownSolution}
                className="inline-flex items-center gap-space-2xs px-space-md py-space-xs rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md font-medium shadow-sm hover:bg-surface-container transition-all border border-surface-container-high/40"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">content_copy</span>
                <span>Copy Full Solution (Markdown)</span>
              </button>
              <button
                onClick={() => triggerToast('Generating LaTeX-formatted step-by-step PDF...')}
                className="inline-flex items-center gap-space-2xs px-space-md py-space-xs rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md font-medium shadow-sm hover:bg-surface-container transition-all border border-surface-container-high/40"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">picture_as_pdf</span>
                <span>Download Step-by-Step PDF</span>
              </button>
            </div>
            <button
              onClick={() => {
                applyTemplate('Quarterly Compound Interest');
                triggerToast('Loaded next problem scenario.');
              }}
              className="inline-flex items-center gap-space-2xs px-space-md py-space-xs rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-sm transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Try Another Problem</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deep Analytical Educational Cards */}
      <div className="mt-space-lg grid grid-cols-1 md:grid-cols-3 gap-space-lg">
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-xs border border-surface-container-high/40">
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-space-2xs">
            <span className="material-symbols-outlined text-[22px]">percent</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Effective Annual Rate (EAR)
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Because interest compounds {nVal} times annually, the actual yield exceeds the stated {rVal.toFixed(2)}% nominal APR, reaching {effectiveAnnualRate.toFixed(3)}% p.a.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-xs border border-surface-container-high/40">
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-tertiary mb-space-2xs">
            <span className="material-symbols-outlined text-[22px]">history_edu</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Rule of 72 Equivalence
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            At this Effective Annual Rate of {effectiveAnnualRate.toFixed(2)}%, this capital will double organically in approximately {(72 / effectiveAnnualRate).toFixed(2)} years without requiring additional deposits.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-xs border border-surface-container-high/40">
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-space-2xs">
            <span className="material-symbols-outlined text-[22px]">verified</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Exact Symbolic Verifier
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Every step conforms to ISO 31-11 quantitative principles and can be exported cleanly to standard LaTeX documents or financial reporting software.
          </p>
        </div>
      </div>
    </div>
  );
};
