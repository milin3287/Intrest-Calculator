import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PagePath } from '../types';

interface FormulaCard {
  id: string;
  title: string;
  category: string;
  equation: string;
  variables: { sym: string; name: string; desc: string }[];
  description: string;
  derivationSummary: string;
  realWorldApplication: string;
  workedExample: {
    input: string;
    steps: string[];
    result: string;
  };
}

const FORMULAS_DATA: FormulaCard[] = [
  {
    id: 'compound-interest',
    title: 'Discrete Compound Interest',
    category: 'Exponential Growth',
    equation: 'A = P(1 + r/n)^(nt)',
    variables: [
      { sym: 'A', name: 'Accumulated Amount', desc: 'Final maturity value including principal and interest' },
      { sym: 'P', name: 'Principal Balance', desc: 'Initial sum borrowed or invested' },
      { sym: 'r', name: 'Nominal Annual Rate', desc: 'Stated annual percentage rate in decimal format' },
      { sym: 'n', name: 'Compounding Frequency', desc: 'Times interest is credited per year (12=monthly, 4=quarterly, 1=annual)' },
      { sym: 't', name: 'Time Horizon', desc: 'Duration in years' },
    ],
    description: 'Models exponential capital accrual when periodic returns are reinvested into the asset base to generate subsequent returns in each discrete cycle.',
    derivationSummary: 'Derived by repeatedly multiplying the beginning balance by (1 + r/n) for n·t consecutive discrete periods.',
    realWorldApplication: 'High-yield savings accounts, certificates of deposit (CDs), multi-year bond reinvestment, and structured deposits.',
    workedExample: {
      input: 'P = $10,000, r = 6% (0.06), n = 4 (Quarterly), t = 5 years',
      steps: [
        'Periodic rate i = 0.06 / 4 = 0.015',
        'Total periods N = 4 × 5 = 20',
        'Growth factor = (1 + 0.015)²⁰ ≈ 1.346855',
        'A = 10,000 × 1.346855 = $13,468.55',
        'Compound Interest CI = A - P = $3,468.55',
      ],
      result: '$13,468.55',
    },
  },
  {
    id: 'continuous-compounding',
    title: 'Continuous Compounding',
    category: 'Calculus & Limits',
    equation: 'A = P · e^(rt)',
    variables: [
      { sym: 'A', name: 'Maturity Amount', desc: 'Value under infinite compounding frequency' },
      { sym: 'P', name: 'Principal Base', desc: 'Original invested capital' },
      { sym: 'e', name: "Euler's Constant", desc: 'Irrational mathematical constant ≈ 2.718281828' },
      { sym: 'r', name: 'Nominal Rate', desc: 'Continuous annual rate' },
      { sym: 't', name: 'Time in Years', desc: 'Continuous time parameter' },
    ],
    description: 'The mathematical limit of discrete compounding as the frequency n approaches infinity (lim n→∞ [1 + r/n]^(nt) = e^(rt)).',
    derivationSummary: 'Calculated using Euler’s limit definition lim (x→∞) (1 + 1/x)^x = e.',
    realWorldApplication: 'Black-Scholes option pricing model, continuous discounting in high-frequency algorithmic finance, and theoretical physics.',
    workedExample: {
      input: 'P = $50,000, r = 7% (0.07), t = 4 years',
      steps: [
        'Exponent rt = 0.07 × 4 = 0.28',
        'e^(0.28) ≈ 1.323130',
        'A = 50,000 × 1.323130 = $66,156.50',
      ],
      result: '$66,156.50',
    },
  },
  {
    id: 'loan-emi',
    title: 'Equated Monthly Installment (EMI)',
    category: 'Debt Amortization',
    equation: 'E = [P · r · (1 + r)^n] / [(1 + r)^n - 1]',
    variables: [
      { sym: 'E', name: 'Monthly Payment', desc: 'Fixed installment paid each month' },
      { sym: 'P', name: 'Loan Principal', desc: 'Total principal borrowed' },
      { sym: 'r', name: 'Monthly Interest Rate', desc: 'Annual rate / 12 / 100' },
      { sym: 'n', name: 'Total Monthly Tenures', desc: 'Total number of monthly installments (Years × 12)' },
    ],
    description: 'Calculates the fixed monthly installment required to completely amortize a debt obligation over a specified horizon under reducing-balance terms.',
    derivationSummary: 'Derived by equating the present value of an ordinary annuity of n installments to the initial loan principal P.',
    realWorldApplication: 'Home mortgages, automotive loans, educational loans, and personal credit lines.',
    workedExample: {
      input: 'P = $1,000,000, Annual Rate = 8.4%, Tenure = 20 Years (240 months)',
      steps: [
        'Monthly rate r = 0.084 / 12 = 0.007',
        '(1 + 0.007)²⁴⁰ ≈ 5.35246',
        'Numerator = 1,000,000 × 0.007 × 5.35246 = 37,467.22',
        'Denominator = 5.35246 - 1 = 4.35246',
        'E = 37,467.22 / 4.35246 = $8,608.28 per month',
      ],
      result: '$8,608.28 / month',
    },
  },
  {
    id: 'future-value-annuity',
    title: 'Future Value of Annuity (SIP)',
    category: 'Systematic Inflows',
    equation: 'FV = PMT · [((1 + i)^n - 1) / i] · (1 + i)',
    variables: [
      { sym: 'FV', name: 'Future Value', desc: 'Total accumulated corpus at the end of the tenure' },
      { sym: 'PMT', name: 'Periodic Installment', desc: 'Amount invested in each regular period' },
      { sym: 'i', name: 'Periodic Rate', desc: 'Interest rate per compounding interval' },
      { sym: 'n', name: 'Number of Periods', desc: 'Total payment intervals' },
    ],
    description: 'Determines the accumulated future worth of a series of uniform periodic deposits invested at regular intervals with compound interest.',
    derivationSummary: 'Sum of a geometric progression of future cash flows compounded for (n - k) remaining periods.',
    realWorldApplication: 'Mutual fund SIPs, 401(k) / IRA contributions, pension sinking funds, and recurring deposits.',
    workedExample: {
      input: 'PMT = $500/month, Annual Return = 12% (i = 0.01/month), Tenure = 10 Years (120 months)',
      steps: [
        '(1 + 0.01)¹²⁰ ≈ 3.300387',
        '[(3.300387 - 1) / 0.01] = 230.0387',
        'FV = 500 × 230.0387 × (1 + 0.01) = $116,169.54',
        'Total Invested = 500 × 120 = $60,000',
        'Net Compound Gain = $56,169.54',
      ],
      result: '$116,169.54',
    },
  },
  {
    id: 'fisher-equation',
    title: 'Fisher Hypothesis (Real Rate of Return)',
    category: 'Macroeconomics',
    equation: '(1 + r_nominal) = (1 + r_real) · (1 + i)',
    variables: [
      { sym: 'r_nominal', name: 'Nominal Stated Rate', desc: 'Observed market interest rate' },
      { sym: 'r_real', name: 'Real Rate of Return', desc: 'Purchasing power yield adjusted for inflation' },
      { sym: 'i', name: 'Inflation Rate (CPI)', desc: 'General rate of consumer price index inflation' },
    ],
    description: 'The exact relationship connecting nominal yield, inflation-adjusted purchasing power yield, and expected inflation.',
    derivationSummary: 'Exact formula: r_real = (1 + r_nominal)/(1 + i) - 1. (Approximated linearly as r_nominal - i).',
    realWorldApplication: 'Sovereign TIPS bonds, retirement purchasing power security, and macro asset allocation.',
    workedExample: {
      input: 'Nominal Return = 10.0%, Inflation = 5.5%',
      steps: [
        'r_real = (1 + 0.10) / (1 + 0.055) - 1',
        '1.10 / 1.055 = 1.04265',
        'Real Yield = +4.265% (vs simple 10 - 5.5 = 4.5%)',
      ],
      result: '4.265% Real Yield',
    },
  },
  {
    id: 'rule-of-72',
    title: 'Rule of 72, 114, 144',
    category: 'Mental Math Heuristics',
    equation: 't ≈ 72 / r  (Doubling)',
    variables: [
      { sym: 't', name: 'Years to Double', desc: 'Approximate horizon to 2× capital' },
      { sym: 'r', name: 'Compound Interest Rate', desc: 'Annual rate expressed as a whole percentage' },
    ],
    description: 'Heuristic approximation derived from the Taylor expansion of natural logarithm ln(2) ≈ 0.693.',
    derivationSummary: 'ln(2) = 0.6931. Because 72 has many divisors (2, 3, 4, 6, 8, 9, 12), 72 is used instead of 69.3 for easy mental calculation.',
    realWorldApplication: 'Rule of 72 doubles capital; Rule of 114 triples capital (114/r); Rule of 144 quadruples capital (144/r).',
    workedExample: {
      input: 'Annual Compound Rate = 8%',
      steps: [
        'Years to double = 72 / 8 = 9.0 Years',
        'Years to triple = 114 / 8 = 14.25 Years',
        'Years to quadruple = 144 / 8 = 18.0 Years',
      ],
      result: '9.0 Years to Double',
    },
  },
];

export const LearnPage: React.FC = () => {
  const { navigateTo, openFormulaDrawer, triggerToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const categories = ['All', 'Exponential Growth', 'Debt Amortization', 'Systematic Inflows', 'Macroeconomics', 'Mental Math Heuristics'];

  const filtered = FORMULAS_DATA.filter(f => {
    const matchCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchSearch =
      search === '' ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.equation.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div>
          <div className="flex items-center gap-space-2xs text-secondary font-label-md text-label-md">
            <span>Documentation</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold">Formula Compendium</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">
            Financial Mathematics &amp; Formula Compendium
          </h1>
          <p className="font-body-md text-body-md text-secondary max-w-2xl">
            Pedagogical proofs, derivations, variable breakdowns, and real-world institutional applications of core interest principles.
          </p>
        </div>
        <button
          onClick={openFormulaDrawer}
          className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors border border-surface-container-high/40 font-semibold shrink-0"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-primary">menu_book</span>
          <span>Open Formula Drawer</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md border border-surface-container-high/50">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {categories.map(c => {
            const isSelected = selectedCategory === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-primary text-on-primary font-semibold shadow-xs'
                    : 'bg-surface-container-low text-secondary hover:text-on-surface'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="flex items-center rounded-xl bg-surface-container-low px-space-sm py-1.5 w-full md:w-64 border border-surface-container-high/40">
          <span className="material-symbols-outlined text-secondary text-[20px] mr-1">search</span>
          <input
            type="text"
            placeholder="Search formulas..."
            className="bg-transparent text-on-surface font-body-sm text-body-sm focus:outline-none w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Formula Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        {filtered.map(card => (
          <div
            key={card.id}
            className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-space-md border border-surface-container-high/50"
          >
            {/* Top Badge & Title */}
            <div className="flex items-start justify-between gap-space-xs">
              <div>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-tertiary font-label-sm text-label-sm uppercase font-semibold">
                  {card.category}
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
                  {card.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigateTo(PagePath.CALCULATORS);
                  triggerToast(`Configured workspace for ${card.title}.`);
                }}
                className="flex items-center gap-1 text-primary hover:underline font-label-sm text-label-sm font-semibold shrink-0"
              >
                <span>Try in Workspace</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Formula Equation Banner */}
            <div className="bg-surface-container-low p-space-md rounded-xl font-data-mono-md text-data-mono-md text-primary font-bold text-center border border-surface-container-high/40 text-lg">
              {card.equation}
            </div>

            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
              {card.description}
            </p>

            {/* Variables Breakdown */}
            <div className="flex flex-col gap-1 pt-space-2xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Variables
              </span>
              <div className="grid grid-cols-1 gap-1 text-body-sm text-body-sm bg-surface-container-low p-space-sm rounded-xl">
                {card.variables.map(v => (
                  <div key={v.sym} className="flex items-baseline gap-2">
                    <span className="font-data-mono-md text-primary font-bold w-12 shrink-0">{v.sym}</span>
                    <span className="font-medium text-on-surface">{v.name}:</span>
                    <span className="text-secondary">{v.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Worked Example */}
            <div className="border-t border-surface-container-high/40 pt-space-xs flex flex-col gap-1">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Worked Institutional Example
              </span>
              <div className="text-body-sm font-data-mono-md text-secondary">
                Input: {card.workedExample.input}
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-body-sm text-on-surface pl-1">
                {card.workedExample.steps.map((step, sIdx) => (
                  <li key={sIdx}>{step}</li>
                ))}
              </ul>
              <div className="flex items-center justify-between pt-1">
                <span className="font-label-sm text-label-sm text-secondary font-semibold">Result:</span>
                <span className="font-data-mono-md text-data-mono-md font-bold text-primary">
                  {card.workedExample.result}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
