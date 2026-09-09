import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PagePath } from '../types';

export const HistoryPage: React.FC = () => {
  const {
    history,
    deleteHistoryItem,
    clearHistory,
    navigateTo,
    triggerToast,
  } = useApp();

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Compound Interest', 'Loan EMI', 'Investment', 'Advanced Solver', 'Date-to-Date Ledger'];

  const filteredHistory = history.filter(item => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.resultFormatted.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const exportHistoryJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `interestly-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Exported calculation history as JSON.');
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div>
          <div className="flex items-center gap-space-2xs text-secondary font-label-md text-label-md">
            <span>Home</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold">Audit Ledger</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">
            Calculation History &amp; Audit Trail
          </h1>
          <p className="font-body-md text-body-md text-secondary max-w-2xl">
            Review, compare, and re-solve previously evaluated financial interest and amortization models. Saved securely in local storage.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              onClick={exportHistoryJSON}
              className="flex items-center gap-1.5 px-space-md py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors border border-surface-container-high/40 font-medium"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Clear all calculation history?')) {
                  clearHistory();
                }
              }}
              className="flex items-center gap-1.5 px-space-md py-2 rounded-xl bg-surface-container-low hover:bg-error-container/20 text-error font-label-md text-label-md transition-colors border border-surface-container-high/40 font-medium"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md border border-surface-container-high/50">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {categories.map(cat => {
            const isSelected = filterCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                type="button"
                className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-primary text-on-primary font-semibold shadow-xs'
                    : 'bg-surface-container-low text-secondary hover:text-on-surface'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="flex items-center rounded-xl bg-surface-container-low px-space-sm py-1.5 w-full md:w-72 border border-surface-container-high/40 focus-within:ring-2 focus-within:ring-primary">
          <span className="material-symbols-outlined text-secondary text-[20px] mr-1">search</span>
          <input
            type="text"
            placeholder="Search calculations..."
            className="bg-transparent text-on-surface font-body-sm text-body-sm focus:outline-none w-full"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-secondary hover:text-on-surface">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-surface-container-lowest p-space-2xl rounded-2xl shadow-sm text-center flex flex-col items-center justify-center gap-space-md border border-surface-container-high/50 py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[36px]">history_toggle_off</span>
          </div>
          <div className="max-w-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              No Calculations Found
            </h3>
            <p className="font-body-md text-body-md text-secondary mt-1">
              {history.length === 0
                ? 'Your audit trail is empty. Perform and save calculations from the workspace to view them here.'
                : 'No items match your active filter or search query.'}
            </p>
          </div>
          <button
            onClick={() => navigateTo(PagePath.CALCULATORS)}
            className="px-space-lg py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-sm transition-all"
            type="button"
          >
            Launch Calculator Workspace
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md">
          {filteredHistory.map(item => (
            <div
              key={item.id}
              className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-space-sm border border-surface-container-high/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm uppercase font-semibold">
                    {item.category}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    {isNaN(Date.parse(item.timestamp)) ? item.timestamp : new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-space-2xs">
                  <button
                    onClick={() => {
                      if (item.category === 'Date-to-Date Ledger') {
                        navigateTo(PagePath.DATE_LEDGER);
                      } else if (item.category === 'Advanced Solver') {
                        navigateTo(PagePath.SOLVER);
                      } else if (item.category === 'Loan EMI') {
                        navigateTo(PagePath.LOAN_EMI);
                      } else if (item.category === 'Investment') {
                        navigateTo(PagePath.INVESTMENT);
                      } else {
                        navigateTo(PagePath.CALCULATORS);
                      }
                      triggerToast(`Loaded "${item.title}".`);
                    }}
                    className="flex items-center gap-1 px-space-xs py-1 rounded bg-surface-container-low hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    <span>Open</span>
                  </button>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="w-7 h-7 rounded flex items-center justify-center text-outline hover:text-error hover:bg-surface-container transition-colors"
                    title="Delete record"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pt-space-xs">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {item.title}
                  </h3>
                  <div className="font-data-mono-md text-data-mono-md text-secondary mt-0.5">
                    {item.formula}
                  </div>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary block">
                    Calculated Result
                  </span>
                  <span className="font-headline-md text-headline-md font-bold text-primary">
                    {item.resultFormatted}
                  </span>
                </div>
              </div>

              {item.details && item.details.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs pt-space-xs border-t border-surface-container-high/40">
                  {item.details.map((d, dIdx) => (
                    <div key={dIdx} className="flex flex-col bg-surface-container-low p-2 rounded-lg">
                      <span className="font-label-sm text-label-sm text-secondary">{d.label}</span>
                      <span className="font-data-mono-md text-data-mono-md font-semibold text-on-surface">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
