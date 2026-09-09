import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useApp } from '../context/AppContext';
import { ThreeDCanvas } from '../components/landing/ThreeDCanvas';
import { GsapTicker } from '../components/landing/GsapTicker';
import { SpotlightCard } from '../components/landing/SpotlightCard';
import { ParticleField } from '../components/landing/ParticleField';
import { InteractiveDateDemo } from '../components/landing/InteractiveDateDemo';

export const HomePage: React.FC = () => {
  const { navigateTo, formatMoney } = useApp();
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const featureSectionRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        badgeRef.current,
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 }
      )
        .fromTo(
          headlineRef.current,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          '-=0.3'
        )
        .fromTo(
          subtextRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.4'
        )
        .fromTo(
          ctaGroupRef.current,
          { y: 16, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5 },
          '-=0.3'
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen bg-surface text-on-surface overflow-hidden">
      {/* Constellation Particle Field */}
      <div className="relative w-full">
        <ParticleField particleCount={35} />

        {/* Ambient Glow Orbs */}
        <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-primary/15 via-tertiary/10 to-transparent blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-[400px] right-[-100px] w-[450px] h-[450px] bg-secondary/10 blur-[130px] pointer-events-none -z-10" />

        {/* --- Hero Section --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Hero Left: Punchy, High-Clarity Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div
                ref={badgeRef}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/80 border border-outline-variant/30 backdrop-blur-md shadow-xs"
              >
                <img src="/logo.png" alt="MRP Logo" className="w-5 h-5 object-contain rounded" referrerPolicy="no-referrer" />
                <span className="text-xs font-mono font-semibold tracking-wide uppercase text-on-surface-variant">
                  MRP Engine • Exact-Day Financial Math
                </span>
              </div>

              <h1
                ref={headlineRef}
                className="font-display-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.12]"
              >
                Calculate Interest Between Any Dates.
              </h1>

              <p
                ref={subtextRef}
                className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-xl"
              >
                No rough 30-day rounding. Record irregular deposits, withdrawals, and prepayments with exact calendar day counts, daily accruals, and audit-grade PDF statements.
              </p>

              {/* Action Buttons */}
              <div
                ref={ctaGroupRef}
                className="flex flex-wrap items-center gap-3 pt-1"
              >
                <button
                  type="button"
                  onClick={() => navigateTo('date-ledger')}
                  className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                  <span>Open Date Ledger</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('compound')}
                  className="px-6 py-3 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm border border-outline-variant/40 hover:bg-surface-container-highest hover:border-primary/40 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base text-tertiary">trending_up</span>
                  <span>Compound Visualizer</span>
                </button>
              </div>

              {/* 3 Quick Proof Points */}
              <div className="pt-3 grid grid-cols-3 gap-3 border-t border-outline-variant/20 max-w-lg text-xs text-secondary font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                  <span>ACT/365 & 360</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                  <span>Staggered Cash</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                  <span>Vector PDF Print</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Interactive 3D Canvas */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="w-full aspect-square max-w-[440px] relative rounded-3xl bg-gradient-to-b from-surface-container-high/40 via-surface-container-lowest/30 to-surface-container-high/20 border border-outline-variant/30 backdrop-blur-md shadow-2xl p-4 overflow-hidden">
                <ThreeDCanvas growthFactor={1.4} interactive={true} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Infinite Marquee Ticker */}
      <div className="py-2 bg-surface-container-low/40 border-y border-outline-variant/20">
        <GsapTicker />
      </div>

      {/* --- Section 1: The 3-Second Live Calculation Demo --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
            Interactive Playground
          </span>
          <h2 className="font-display-xl text-2xl sm:text-3xl font-extrabold text-on-surface">
            Experience the Exact-Day Difference
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Adjust the dates or principal below. Watch the exact days and daily interest calculate in real time.
          </p>
        </div>

        <InteractiveDateDemo />
      </div>

      {/* --- Section 2: Three Core Pillars (Visual & Intuitive) --- */}
      <div ref={featureSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-mono font-bold text-tertiary uppercase tracking-wider">
            Engine Architecture
          </span>
          <h2 className="font-display-xl text-2xl sm:text-3xl font-extrabold text-on-surface">
            Everything You Need, Nothing You Don't
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Three dedicated calculation modes built for borrowers, lenders, and investors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Passbook Ledger */}
          <SpotlightCard
            className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-md flex flex-col justify-between hover:border-primary/40 transition-all group"
            spotlightColor="rgba(37, 99, 235, 0.15)"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-blue-500/10 text-primary">
                  <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-secondary">01 / LEDGER</span>
              </div>

              <div>
                <h3 className="font-bold text-base sm:text-lg text-on-surface group-hover:text-primary transition-colors">
                  Date-to-Date Passbook
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Add multiple deposits and partial repayments on custom dates. Computes running daily balances with zero guesswork.
                </p>
              </div>

              {/* Visual Micro-Preview */}
              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/20 font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between text-secondary">
                  <span>15 Jan &rarr; 28 Mar</span>
                  <span className="text-primary font-semibold">72 Days</span>
                </div>
                <div className="flex justify-between font-bold text-on-surface">
                  <span>Partial Debit:</span>
                  <span className="text-rose-500">-₹25,000</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Net Balance:</span>
                  <span className="text-emerald-500 font-bold">₹75,000</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => navigateTo('date-ledger')}
                className="w-full py-2 px-3 rounded-lg bg-surface-container-high text-on-surface text-xs font-bold hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-1"
              >
                <span>Launch Ledger</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </SpotlightCard>

          {/* Card 2: Compounding Visualizer */}
          <SpotlightCard
            className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-md flex flex-col justify-between hover:border-tertiary/40 transition-all group"
            spotlightColor="rgba(147, 51, 234, 0.15)"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-purple-500/10 text-tertiary">
                  <span className="material-symbols-outlined text-xl">trending_up</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-secondary">02 / MULTIPLIER</span>
              </div>

              <div>
                <h3 className="font-bold text-base sm:text-lg text-on-surface group-hover:text-tertiary transition-colors">
                  Compounding Matrix
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Compare annual, quarterly, monthly, and continuous compounding frequencies side-by-side with step-by-step math.
                </p>
              </div>

              {/* Visual Micro-Preview */}
              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/20 font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between text-secondary">
                  <span>Annual Compound:</span>
                  <span className="text-on-surface font-semibold">₹1,61,051</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Monthly Compound:</span>
                  <span className="text-on-surface font-semibold">₹1,64,530</span>
                </div>
                <div className="flex justify-between font-bold text-tertiary">
                  <span>Continuous e^(rt):</span>
                  <span className="font-bold text-tertiary">₹1,64,872</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => navigateTo('compound')}
                className="w-full py-2 px-3 rounded-lg bg-surface-container-high text-on-surface text-xs font-bold hover:bg-tertiary hover:text-on-primary transition-all flex items-center justify-center gap-1"
              >
                <span>Compare Frequencies</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </SpotlightCard>

          {/* Card 3: Loan Tenure Slasher */}
          <SpotlightCard
            className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
            spotlightColor="rgba(16, 185, 129, 0.15)"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <span className="material-symbols-outlined text-xl">content_cut</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-secondary">03 / PREPAYMENTS</span>
              </div>

              <div>
                <h3 className="font-bold text-base sm:text-lg text-on-surface group-hover:text-emerald-500 transition-colors">
                  Loan Tenure Slasher
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  See how small extra monthly prepayments or annual lump sums eliminate years of interest and cut loan tenure in half.
                </p>
              </div>

              {/* Visual Micro-Preview */}
              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/20 font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between text-secondary">
                  <span>Standard 20 Yr Loan:</span>
                  <span className="text-on-surface font-semibold">240 Months</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                  <span>+₹5,000/mo Prepay:</span>
                  <span>168 Months</span>
                </div>
                <div className="flex justify-between text-secondary font-bold">
                  <span>Interest Saved:</span>
                  <span className="text-emerald-500">₹8.4 Lakhs</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => navigateTo('loan')}
                className="w-full py-2 px-3 rounded-lg bg-surface-container-high text-on-surface text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-1"
              >
                <span>Slash Loan Tenure</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* --- Section 3: Audit-Ready Statement Export & Indian Words Preview --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SpotlightCard
          className="p-6 sm:p-8 rounded-3xl border border-outline-variant/30 bg-gradient-to-r from-surface-container-high/40 via-surface-container-lowest/70 to-surface-container-high/40 backdrop-blur-xl shadow-xl"
          spotlightColor="rgba(59, 130, 246, 0.12)"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-mono font-bold">
                <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
                Instant Vector PDF & Words
              </div>
              <h3 className="font-display-xl text-xl sm:text-2xl font-bold text-on-surface">
                Ready for Formal Accounting & Legal Audits
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl">
                Every calculation exports to crisp vector PDF with formal party metadata, itemized ledger entries, and amounts spelled out in Indian words (<span className="font-mono text-on-surface font-semibold">Rupees One Lakh Twenty-Five Thousand Only</span>).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigateTo('date-ledger')}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">description</span>
                <span>Generate Passbook</span>
              </button>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* --- Bottom Clean Launch Banner --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-surface-container-high/80 to-surface-container-lowest/90 border border-primary/25 shadow-2xl relative overflow-hidden space-y-5">
          <div className="absolute -right-16 -top-16 w-60 h-60 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-60 h-60 bg-tertiary/15 rounded-full blur-3xl pointer-events-none" />

          <h2 className="font-display-xl text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
            Stop Guessing. Start Calculating Exact Dates.
          </h2>

          <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            Whether settling personal loans, managing promissory notes, or tracking investment yields, Interestly handles the math with mathematical certainty.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('date-ledger')}
              className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm shadow-xl shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Launch Passbook Ledger</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('simple')}
              className="px-6 py-3 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs sm:text-sm border border-outline-variant/30 hover:bg-surface-container-highest transition-all"
            >
              View All Calculators
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
