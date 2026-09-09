import React from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from './SpotlightCard';

export const BentoGrid: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <section className="w-full py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
          <span className="material-symbols-outlined text-[14px]">grid_view</span>
          Full Architectural Suite
        </div>
        <h2 className="font-display-xl text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
          Engineered for Quantitative Precision
        </h2>
        <p className="text-body-md text-on-surface-variant mt-2">
          From staggered variable date cash-flows to audit-grade PDF statements and ISO 31-11 quantitative derivations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bento 1: Custom Date-to-Date Cash Flow Ledger (Span 7) */}
        <SpotlightCard
          className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between group cursor-pointer"
          onClick={() => navigateTo('date-ledger')}
          spotlightColor="rgba(37, 99, 235, 0.18)"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">calendar_month</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary-container/30 text-primary border border-primary/20">
                Flagship Engine
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-on-surface group-hover:text-primary transition-colors">
              Custom Date-to-Date Cash Flow Ledger
            </h3>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              Track multi-tranche staggered receipts and repayments on exact calendar dates. Computes elapsed day intervals, running principal balance, period interest, and cumulative settlement.
            </p>

            {/* Mini Passbook Preview Graphic */}
            <div className="mt-6 p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 font-mono text-xs space-y-2">
              <div className="flex justify-between text-secondary border-b border-outline-variant/20 pb-1.5 font-semibold text-[11px]">
                <span>DATE</span>
                <span>TYPE</span>
                <span>DAYS</span>
                <span>BALANCE</span>
              </div>
              <div className="flex justify-between text-on-surface items-center">
                <span>15 Jan 2024</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">+₹1,00,000</span>
                <span className="text-secondary">0 d</span>
                <span className="font-bold">₹1,00,000</span>
              </div>
              <div className="flex justify-between text-on-surface items-center">
                <span>28 Feb 2024</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">-₹25,000</span>
                <span className="text-secondary">+44 d</span>
                <span className="font-bold">₹76,446</span>
              </div>
              <div className="flex justify-between text-on-surface items-center">
                <span>10 May 2024</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">+₹50,000</span>
                <span className="text-secondary">+72 d</span>
                <span className="font-bold">₹1,29,180</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-sm text-primary font-semibold">
            <span className="flex items-center gap-1.5">
              <span>Open Custom Dates Ledger</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </span>
            <span className="text-xs font-mono text-secondary">365/360-day ISO</span>
          </div>
        </SpotlightCard>

        {/* Bento 2: Loan Amortization & Smart Prepayments (Span 5) */}
        <SpotlightCard
          className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between group cursor-pointer"
          onClick={() => navigateTo('loan-and-emi')}
          spotlightColor="rgba(99, 46, 205, 0.18)"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-tertiary/10 text-tertiary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">account_balance</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Save 4.5+ Years
              </span>
            </div>

            <h3 className="text-xl font-bold text-on-surface group-hover:text-tertiary transition-colors">
              Loan Amortization &amp; Prepayments
            </h3>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              Test how small recurring or one-time prepayments drastically reduce tenure and eliminate interest burdens.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-secondary font-medium">Standard EMI (20 Yrs)</span>
                <span className="font-mono font-bold text-on-surface">₹43,391/mo</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-secondary font-medium">With ₹5,000 Prepay</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">14.2 Yrs (-5.8 Yrs)</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-tertiary h-full w-[70%]" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-sm text-tertiary font-semibold">
            <span className="flex items-center gap-1.5">
              <span>Simulate Loan Prepayment</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </span>
          </div>
        </SpotlightCard>

        {/* Bento 3: Step-by-Step ISO 31-11 Solver (Span 4) */}
        <SpotlightCard
          className="md:col-span-4 p-6 sm:p-7 flex flex-col justify-between group cursor-pointer"
          onClick={() => navigateTo('advanced-solver')}
          spotlightColor="rgba(245, 158, 11, 0.16)"
        >
          <div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">functions</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface group-hover:text-amber-600 transition-colors">
              Quantitative Solver
            </h3>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Step-by-step mathematical derivations solving for $P$, $r$, $t$, or $A$ with algebraic proofs.
            </p>
            <div className="mt-4 p-3 rounded-lg bg-surface-container-high/60 border border-outline-variant/20 font-mono text-[11px] text-on-surface">
              A = P &times; (1 + r/n)<sup>n&middot;t</sup>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-amber-600 dark:text-amber-400 font-semibold gap-1">
            <span>Solve Variables</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </div>
        </SpotlightCard>

        {/* Bento 4: Monthly Data Space & Ledger Vault (Span 4) */}
        <SpotlightCard
          className="md:col-span-4 p-6 sm:p-7 flex flex-col justify-between group cursor-pointer"
          onClick={() => navigateTo('monthly-vault')}
          spotlightColor="rgba(16, 185, 129, 0.16)"
        >
          <div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">folder_zip</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface group-hover:text-emerald-600 transition-colors">
              Monthly Data Vault
            </h3>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Auto-partitioned monthly balance sheets with net movements and individual audit statements.
            </p>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-mono text-secondary">
              <span className="px-2 py-0.5 rounded bg-surface-container-highest">Jan 2024</span>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest">Feb 2024</span>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest">+8 More</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold gap-1">
            <span>Explore Monthly Space</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </div>
        </SpotlightCard>

        {/* Bento 5: Vector PDF Generation & Snapshots (Span 4) */}
        <SpotlightCard
          className="md:col-span-4 p-6 sm:p-7 flex flex-col justify-between group cursor-pointer"
          onClick={() => navigateTo('date-ledger')}
          spotlightColor="rgba(59, 130, 246, 0.16)"
        >
          <div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface group-hover:text-blue-600 transition-colors">
              Audit-Grade PDF Export
            </h3>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Generate formal PDF statements with executive summary cards, passbook tables, and Lakh/Crore words.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 text-xs font-semibold">
              <span className="material-symbols-outlined text-xs">download</span> Instant Vector PDF
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-blue-600 dark:text-blue-400 font-semibold gap-1">
            <span>View Sample PDF</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
};
