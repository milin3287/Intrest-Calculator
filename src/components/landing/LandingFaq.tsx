import React, { useState } from 'react';
import { SpotlightCard } from './SpotlightCard';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'Exact Dates & Intervals',
    question: 'How does the Custom Date-to-Date Cash Flow Ledger handle irregular intervals?',
    answer:
      'Unlike legacy banking calculators that assume strict 30-day months, our engine counts exact calendar days elapsed between each transaction using high-precision date serial algebra. Each interval computes interest using the selected day-count convention (ACT/365 or ACT/360) and compounds or accrues interest deterministically.',
  },
  {
    category: 'Staggered Cash Flows',
    question: 'Can I add multiple receipts (inflows) and repayments (outflows) over several years?',
    answer:
      'Yes! You can record unlimited staggered transactions. Inflows augment the active principal base, while repayments directly reduce principal or interest. The engine automatically balances running totals, periods, and net settlement balances.',
  },
  {
    category: 'Audit & Compliance',
    question: 'Are the calculations compliant with formal audit standards and Indian denomination words?',
    answer:
      'Yes. The engine formats numbers into both international ($1,000,000) and Indian numbering systems (Lakhs & Crores, e.g. ₹1,25,000), along with verbatim Indian denomination words for official ledger documentation, passbook printouts, and vector PDF exports.',
  },
  {
    category: 'Data Security & Storage',
    question: 'Where is my custom ledger data and calculation history stored?',
    answer:
      'All calculation history, custom date items, and time-slot snapshots remain strictly encrypted in your local browser storage. No financial credentials or private balances are dispatched to external cloud servers without your explicit intent.',
  },
];

export const LandingFaq: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="w-full py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
          Frequently Asked Questions
        </span>
        <h2 className="font-display-xl text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mt-2">
          Mathematical Precision &amp; Engine Mechanics
        </h2>
        <p className="text-body-md text-on-surface-variant mt-2">
          Clear answers about our day-count conventions, compounding methodologies, and offline security.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <SpotlightCard
              key={idx}
              className="p-5 sm:p-6 transition-all duration-200 cursor-pointer"
              onClick={() => toggle(idx)}
              spotlightColor="rgba(37, 99, 235, 0.08)"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                    {idx + 1}
                  </span>
                  <h3 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
                    {item.question}
                  </h3>
                </div>
                <span
                  className={`material-symbols-outlined text-secondary transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-primary' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-outline-variant/20 text-sm text-on-surface-variant leading-relaxed pl-9">
                  {item.answer}
                </div>
              )}
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
};
