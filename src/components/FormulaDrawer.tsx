import React from 'react';
import { useApp } from '../context/AppContext';

export const FormulaDrawer: React.FC = () => {
  const { formulaDrawerOpen, toggleFormulaDrawer, triggerToast, navigateTo, setActiveCalculatorTab } = useApp();

  const applyFormula = (name: string, calcTab: string) => {
    toggleFormulaDrawer();
    setActiveCalculatorTab(calcTab);
    navigateTo('calculators');
    triggerToast(`Applied ${name} into calculation workspace.`);
  };

  return (
    <>
      {/* Backdrop */}
      {formulaDrawerOpen && (
        <div
          className="fixed inset-0 bg-on-background/40 backdrop-blur-xs z-50 transition-opacity"
          onClick={toggleFormulaDrawer}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface-container-lowest shadow-2xl transform transition-transform duration-300 flex flex-col border-l border-surface-container-high/60 ${
          formulaDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container-high/50">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[22px] text-primary">menu_book</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Formula Cheat-Sheet
            </h3>
          </div>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container transition-colors"
            onClick={toggleFormulaDrawer}
            aria-label="Close formula drawer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-space-md flex-1 overflow-y-auto flex flex-col gap-space-md">
          {/* Simple Interest */}
          <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1 border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Simple Interest
              </span>
              <button
                onClick={() => applyFormula('Simple Interest', 'Simple Interest')}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                Use in Calculator &rarr;
              </button>
            </div>
            <code className="font-data-mono-md text-on-surface bg-surface-container-lowest p-2 rounded border border-surface-container-high/60">
              I = (P × R × T) / 100
            </code>
            <span className="text-secondary font-body-sm text-body-sm">
              Where P = Principal, R = Rate (% per annum), T = Time in years.
            </span>
          </div>

          {/* Compound Interest */}
          <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1 border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Compound Interest (Periodic)
              </span>
              <button
                onClick={() => applyFormula('Compound Interest', 'Compound Interest')}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                Use in Calculator &rarr;
              </button>
            </div>
            <code className="font-data-mono-md text-on-surface bg-surface-container-lowest p-2 rounded border border-surface-container-high/60">
              A = P × (1 + r/n)^(n × t)
            </code>
            <span className="text-secondary font-body-sm text-body-sm">
              n = Compounding cycles (Annual: 1, Semi: 2, Quarterly: 4, Monthly: 12).
            </span>
          </div>

          {/* Continuous Yield */}
          <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1 border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Continuous Compounding
              </span>
              <button
                onClick={() => applyFormula('Continuous Yield', 'Compound Interest')}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                Use in Calculator &rarr;
              </button>
            </div>
            <code className="font-data-mono-md text-on-surface bg-surface-container-lowest p-2 rounded border border-surface-container-high/60">
              A = P × e^(r × t)
            </code>
            <span className="text-secondary font-body-sm text-body-sm">
              e is Euler&apos;s constant (approx. 2.71828). Infinite compounding frequency.
            </span>
          </div>

          {/* Reducing Balance Monthly EMI */}
          <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1 border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Reducing Balance Monthly EMI
              </span>
              <button
                onClick={() => {
                  toggleFormulaDrawer();
                  navigateTo('loan-and-emi');
                  triggerToast('Navigated to Loan EMI Calculator.');
                }}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                Open EMI &rarr;
              </button>
            </div>
            <code className="font-data-mono-md text-on-surface bg-surface-container-lowest p-2 rounded border border-surface-container-high/60">
              EMI = [P × r × (1+r)ⁿ] / [(1+r)ⁿ - 1]
            </code>
            <span className="text-secondary font-body-sm text-body-sm">
              r = monthly rate (Annual Rate / 12 / 100), n = total months.
            </span>
          </div>

          {/* Future Value of Annuity (SIP) */}
          <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1 border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Future Value of Annuity (SIP)
              </span>
              <button
                onClick={() => {
                  toggleFormulaDrawer();
                  navigateTo('investment');
                  triggerToast('Navigated to Investment & SIP Calculator.');
                }}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                Open SIP &rarr;
              </button>
            </div>
            <code className="font-data-mono-md text-on-surface bg-surface-container-lowest p-2 rounded border border-surface-container-high/60">
              FV = P × [((1 + i)ⁿ - 1) / i] × (1 + i)
            </code>
            <span className="text-secondary font-body-sm text-body-sm">
              P = monthly investment installment, i = periodic rate, n = number of periods.
            </span>
          </div>

          {/* Fisher Equation */}
          <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1 border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Fisher Equation (Real Yield)
              </span>
              <button
                onClick={() => {
                  toggleFormulaDrawer();
                  navigateTo('advanced-solver');
                  triggerToast('Loaded Real-Yield Fisher Equation.');
                }}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                Open Solver &rarr;
              </button>
            </div>
            <code className="font-data-mono-md text-on-surface bg-surface-container-lowest p-2 rounded border border-surface-container-high/60">
              (1 + r_real) = (1 + r_nominal) / (1 + inflation)
            </code>
            <span className="text-secondary font-body-sm text-body-sm">
              Exact formula for real purchasing power growth after inflation drag.
            </span>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low flex justify-end border-t border-surface-container-high/50">
          <button
            className="px-space-md py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors font-semibold"
            onClick={toggleFormulaDrawer}
          >
            Close Reference
          </button>
        </div>
      </div>
    </>
  );
};
