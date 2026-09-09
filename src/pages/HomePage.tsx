import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useApp } from '../context/AppContext';
import { ThreeDCanvas } from '../components/landing/ThreeDCanvas';
import { GsapTicker } from '../components/landing/GsapTicker';
import { GsapCounter } from '../components/landing/GsapCounter';
import { InteractiveSimulator } from '../components/landing/InteractiveSimulator';
import { BentoGrid } from '../components/landing/BentoGrid';
import { InteractiveShowcase } from '../components/landing/InteractiveShowcase';
import { LandingFaq } from '../components/landing/LandingFaq';
import { SpotlightCard } from '../components/landing/SpotlightCard';
import { ParticleField } from '../components/landing/ParticleField';

export const HomePage: React.FC = () => {
  const { navigateTo } = useApp();
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const statsGroupRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        badgeRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      )
        .fromTo(
          headlineRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.3'
        )
        .fromTo(
          subtextRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          '-=0.4'
        )
        .fromTo(
          ctaGroupRef.current,
          { y: 20, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6 },
          '-=0.4'
        )
        .fromTo(
          statsGroupRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.3'
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const tickerItems = [
    { title: 'Custom Date Ledger', tag: 'Staggered Cash Flows', icon: 'calendar_month' },
    { title: 'Exact Day Count', tag: '365 / 360 ISO', icon: 'schedule' },
    { title: 'Compound Interest', tag: 'Multi-Frequency', icon: 'trending_up' },
    { title: 'Loan EMI Prepayments', tag: 'Tenure Slasher', icon: 'account_balance' },
    { title: 'Vector PDF Statements', tag: 'Audit Grade', icon: 'picture_as_pdf' },
    { title: 'Wealth Multiplier', tag: 'SIP & Lumpsum', icon: 'rocket_launch' },
    { title: 'Indian Lakh/Crore Words', tag: 'Invoice Ready', icon: 'format_quote' },
    { title: 'ISO 31-11 Quantitative Solver', tag: 'Algebraic Proofs', icon: 'functions' },
  ];

  return (
    <div ref={heroRef} className="flex flex-col w-full overflow-hidden">
      {/* Constellation Particle Field */}
      <div className="relative w-full">
        <ParticleField particleCount={40} />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-primary/20 via-tertiary/15 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* HERO SECTION */}
        <section className="w-full pt-4 pb-12 lg:pt-8 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 flex flex-col items-start gap-5">
              {/* Badge */}
              <div
                ref={badgeRef}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/80 border border-outline-variant/30 shadow-xs backdrop-blur-sm"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[13px]">bolt</span>
                </span>
                <span className="text-xs font-semibold tracking-wide text-on-surface">
                  Next-Gen Quantitative Financial Engine &bull; React 19 + GSAP
                </span>
              </div>

              {/* Main Display Headline */}
              <h1
                ref={headlineRef}
                className="font-display-xl text-4xl sm:text-5xl lg:text-6xl tracking-tight text-on-surface font-extrabold leading-[1.1]"
              >
                Exact Financial Math.<br />
                <span className="bg-gradient-to-r from-primary via-primary-container to-tertiary bg-clip-text text-transparent">
                  Zero Assumptions.
                </span>
              </h1>

              {/* Subheading */}
              <p
                ref={subtextRef}
                className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-xl leading-relaxed"
              >
                From staggered, multi-tranche date cash flows and daily accruals to loan prepayment simulations and audit-grade vector PDF statements — engineered for absolute precision.
              </p>

              {/* Action Buttons */}
              <div ref={ctaGroupRef} className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigateTo('date-ledger')}
                  className="relative group overflow-hidden px-6 py-3.5 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                >
                  {/* Subtle Shimmer Light Sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  <span>Launch Date Ledger</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('calculators')}
                  className="px-5 py-3.5 rounded-xl bg-surface-container-high/70 hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg text-primary">calculate</span>
                  <span>Explore Calculators</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('advanced-solver')}
                  className="px-4 py-3.5 rounded-xl hover:bg-surface-container-high/50 text-secondary text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">functions</span>
                  <span>ISO Math Solver</span>
                </button>
              </div>

              {/* Live Quantitative Stats HUD */}
              <div
                ref={statsGroupRef}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 w-full max-w-xl"
              >
                <div className="p-3 rounded-xl bg-surface-container-low/80 border border-outline-variant/20">
                  <div className="font-mono text-xl sm:text-2xl font-extrabold text-on-surface">
                    <GsapCounter value={99.999} decimals={3} suffix="%" />
                  </div>
                  <div className="text-[11px] font-medium text-secondary mt-0.5">Calculation Precision</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low/80 border border-outline-variant/20">
                  <div className="font-mono text-xl sm:text-2xl font-extrabold text-primary">
                    <GsapCounter value={365} suffix="/360" />
                  </div>
                  <div className="text-[11px] font-medium text-secondary mt-0.5">Day Count Standards</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low/80 border border-outline-variant/20">
                  <div className="font-mono text-xl sm:text-2xl font-extrabold text-tertiary">
                    <GsapCounter value={100} prefix="₹" suffix="Cr+" />
                  </div>
                  <div className="text-[11px] font-medium text-secondary mt-0.5">Simulation Capacity</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low/80 border border-outline-variant/20">
                  <div className="font-mono text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    &lt; 1ms
                  </div>
                  <div className="text-[11px] font-medium text-secondary mt-0.5">Instant Calculation</div>
                </div>
              </div>
            </div>

            {/* Right: Interactive 3D Canvas Scene */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="w-full aspect-square max-w-[480px] relative">
                {/* 3D WebGL Canvas */}
                <ThreeDCanvas />

                {/* Floating 3D Badge 1: Top Right */}
                <div className="absolute top-4 right-0 sm:-right-4 p-3 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/40 shadow-xl backdrop-blur-md flex items-center gap-2.5 animate-bounce [animation-duration:4s]">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="text-left">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-secondary">
                      Active Ledger Engine
                    </span>
                    <span className="font-mono font-bold text-xs text-on-surface">365-Day Exact Interval</span>
                  </div>
                </div>

                {/* Floating 3D Badge 2: Bottom Left */}
                <div className="absolute bottom-6 left-0 sm:-left-4 p-3 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/40 shadow-xl backdrop-blur-md flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                  </span>
                  <div className="text-left">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-secondary">
                      Vector PDF Export
                    </span>
                    <span className="font-mono font-bold text-xs text-on-surface">Instant Audit Reports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GSAP INFINITE TICKER */}
        <GsapTicker items={tickerItems} speed={32} />

        {/* INTERACTIVE SIMULATOR (LIVE PLAYGROUND) */}
        <section className="w-full py-12">
          <InteractiveSimulator />
        </section>

        {/* BENTO GRID (21st.dev Style Architecture) */}
        <BentoGrid />

        {/* INTERACTIVE FEATURE SHOWCASE */}
        <InteractiveShowcase />

        {/* COMPARISON MATRIX (TRADITIONAL VS INTERESTLY) */}
        <section className="w-full py-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
              Why Interestly
            </span>
            <h2 className="font-display-xl text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mt-2">
              Beyond Basic Static Calculators
            </h2>
            <p className="text-body-md text-on-surface-variant mt-2">
              Comparing legacy financial calculation tools against Interestly&apos;s dynamic multi-tranche ledger system.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
            <div className="grid grid-cols-12 bg-surface-container-high/60 p-4 border-b border-outline-variant/20 font-bold text-xs sm:text-sm text-on-surface">
              <span className="col-span-5 sm:col-span-6">CAPABILITY</span>
              <span className="col-span-3 text-secondary">LEGACY TOOLS</span>
              <span className="col-span-4 sm:col-span-3 text-primary">INTERESTLY</span>
            </div>
            {[
              {
                feature: 'Exact Date Accounting',
                legacy: '30-day fixed months only',
                interestly: 'Exact calendar days (ACT/365 & 360)',
              },
              {
                feature: 'Staggered Cash Flows',
                legacy: 'Single lump sum or flat EMI',
                interestly: 'Unlimited staggered deposits & debits',
              },
              {
                feature: 'Day-by-Day Passbook',
                legacy: 'Unavailable',
                interestly: 'Real-time running balances & period interest',
              },
              {
                feature: 'Audit-Grade PDF Statements',
                legacy: 'Generic screenshot or raw CSV',
                interestly: 'Formatted vector PDF with Lakh/Crore words',
              },
              {
                feature: 'Loan Prepayment Simulation',
                legacy: 'Static amortizations',
                interestly: 'Dynamic tenure cuts and interest elimination',
              },
              {
                feature: 'Offline & Privacy',
                legacy: 'Ad-heavy or server-reliant',
                interestly: '100% Client-side local encrypted storage',
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 p-4 border-b border-outline-variant/10 text-xs sm:text-sm items-center hover:bg-surface-container-low/40 transition-colors"
              >
                <span className="col-span-5 sm:col-span-6 font-semibold text-on-surface">
                  {row.feature}
                </span>
                <span className="col-span-3 text-secondary font-medium text-xs">
                  {row.legacy}
                </span>
                <span className="col-span-4 sm:col-span-3 font-bold text-primary flex items-center gap-1.5 text-xs sm:text-sm">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  <span>{row.interestly}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <LandingFaq />

        {/* BOTTOM CALL TO ACTION BANNER */}
        <section className="w-full py-12">
          <SpotlightCard
            className="p-8 sm:p-12 text-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-tertiary/10 to-surface-container-high/60 border border-primary/30"
            spotlightColor="rgba(37, 99, 235, 0.25)"
          >
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-primary text-on-primary">
                100% Free &bull; Private &bull; Offline Capable
              </span>
              <h2 className="font-display-xl text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
                Ready for Deterministic Financial Precision?
              </h2>
              <p className="text-body-md text-on-surface-variant max-w-lg mx-auto">
                Track your date-to-date money flows, simulate loan prepayments, and generate audit-grade PDF statements instantly.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigateTo('date-ledger')}
                  className="px-6 py-3.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  <span>Start With Custom Dates Ledger</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('calculators')}
                  className="px-6 py-3.5 rounded-xl bg-surface-container-lowest text-on-surface border border-outline-variant/30 font-bold text-sm hover:bg-surface-container-high hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg text-primary">calculate</span>
                  <span>Open Core Calculators</span>
                </button>
              </div>
            </div>
          </SpotlightCard>
        </section>
      </div>
    </div>
  );
};
