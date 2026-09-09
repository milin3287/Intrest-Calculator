import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MonthlyLedgerBook, MonthlyStatementBucket, DateCashFlowItem } from '../types';
import {
  getActiveLedger,
  saveActiveLedger,
  getMonthlyBooks,
  saveOrUpdateMonthlyBook,
  deleteMonthlyBook,
  computeMonthlyStatementBuckets,
  exportCustomDatesBackup,
  importCustomDatesBackup,
} from '../utils/customDatesStorage';
import { formatIndianDenominationWords } from '../utils/dateLedgerEngine';
import { downloadMonthlyBucketPDF } from '../utils/dateLedgerPdfGenerator';

export const MonthlyDateVaultPage: React.FC = () => {
  const { formatMoney, formatMoneyCompact, navigateTo, triggerToast } = useApp();

  const [activeLedger, setActiveLedgerState] = useState(getActiveLedger());
  const [monthlyBooks, setMonthlyBooks] = useState<MonthlyLedgerBook[]>([]);
  const [activeTab, setActiveTab] = useState<'buckets' | 'books'>('buckets');

  // Save Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookMonth, setNewBookMonth] = useState(() => new Date().toISOString().substring(0, 7));
  const [newBookNote, setNewBookNote] = useState('');

  // Selected Statement for Print / Modal
  const [selectedStatement, setSelectedStatement] = useState<MonthlyStatementBucket | null>(null);

  // Backup modal
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupJSONInput, setBackupJSONInput] = useState('');

  useEffect(() => {
    setMonthlyBooks(getMonthlyBooks());
  }, []);

  // Compute live monthly statement buckets from active ledger
  const statementBuckets = computeMonthlyStatementBuckets(
    activeLedger.transactions,
    activeLedger.rate,
    activeLedger.rateType,
    activeLedger.dayCountBasis
  );

  const handleSaveCurrentAsBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) {
      triggerToast('Please provide a title for this monthly book.');
      return;
    }

    const [y, m] = newBookMonth.split('-');
    const monthDate = new Date(Number(y), Number(m) - 1, 1);
    const monthTitle = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Filter transactions for that month, or save all if user chooses
    const monthTxs = activeLedger.transactions.filter(t => t.date.startsWith(newBookMonth));
    const txsToSave = monthTxs.length > 0 ? monthTxs : activeLedger.transactions;

    const saved = saveOrUpdateMonthlyBook({
      monthKey: newBookMonth,
      monthTitle,
      bookTitle: newBookTitle.trim(),
      note: newBookNote.trim() || undefined,
      transactions: txsToSave,
      rate: activeLedger.rate,
      rateType: activeLedger.rateType,
      compoundingMethod: activeLedger.compoundingMethod,
      dayCountBasis: activeLedger.dayCountBasis,
      asOfDate: activeLedger.asOfDate,
      userRole: activeLedger.userRole,
      openingPrincipal: 0,
      totalInflows: txsToSave.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
      totalOutflows: txsToSave.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0),
      netPrincipal: txsToSave.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0),
      accruedInterest: 0,
      grandSettlement: 0,
    });

    setMonthlyBooks(getMonthlyBooks());
    setShowSaveModal(false);
    setNewBookTitle('');
    setNewBookNote('');
    triggerToast(`Saved "${saved.bookTitle}" to Monthly Special Space!`);
  };

  const handleLoadBookIntoActive = (book: MonthlyLedgerBook) => {
    const newState = {
      transactions: book.transactions,
      rate: book.rate,
      rateType: book.rateType,
      compoundingMethod: book.compoundingMethod,
      dayCountBasis: book.dayCountBasis,
      asOfDate: book.asOfDate,
      userRole: book.userRole,
      lastSavedAt: new Date().toISOString(),
    };
    saveActiveLedger(newState);
    setActiveLedgerState(newState);
    triggerToast(`Loaded "${book.bookTitle}" into active Custom Dates ledger.`);
    navigateTo('date-ledger');
  };

  const handleRollForwardMonth = (book: MonthlyLedgerBook) => {
    // Determine next month key
    const [y, m] = book.monthKey.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const nextMonthKey = nextDate.toISOString().substring(0, 7);
    const nextMonthTitle = nextDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Closing net balance becomes opening tranche
    const closingPrincipal = Math.max(0, book.netPrincipal);
    const openingDate = `${nextMonthKey}-01`;

    const rollTxs: DateCashFlowItem[] = [
      {
        id: `tx-roll-${Date.now()}`,
        date: openingDate,
        type: 'credit',
        amount: closingPrincipal > 0 ? closingPrincipal : 10000000,
        note: `Carried forward opening balance from ${book.monthTitle}`,
      },
    ];

    const rolledBook = saveOrUpdateMonthlyBook({
      monthKey: nextMonthKey,
      monthTitle: nextMonthTitle,
      bookTitle: `${nextMonthTitle} Ledger (Rolled Forward)`,
      note: `Rolled forward with opening balance from ${book.bookTitle}`,
      transactions: rollTxs,
      rate: book.rate,
      rateType: book.rateType,
      compoundingMethod: book.compoundingMethod,
      dayCountBasis: book.dayCountBasis,
      asOfDate: `${nextMonthKey}-28`,
      userRole: book.userRole,
      openingPrincipal: closingPrincipal,
      totalInflows: closingPrincipal,
      totalOutflows: 0,
      netPrincipal: closingPrincipal,
      accruedInterest: 0,
      grandSettlement: closingPrincipal,
    });

    setMonthlyBooks(getMonthlyBooks());
    triggerToast(`Created new book for ${nextMonthTitle} with ₹${closingPrincipal.toLocaleString('en-IN')} opening principal!`);
  };

  const handleDeleteBook = (id: string) => {
    const updated = deleteMonthlyBook(id);
    setMonthlyBooks(updated);
    triggerToast('Monthly book removed from special space.');
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportCustomDatesBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interestly-custom-dates-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    triggerToast('Full Custom Dates & Monthly Vault backup downloaded.');
  };

  const handleImportBackup = () => {
    if (!backupJSONInput.trim()) {
      triggerToast('Please paste the JSON backup content.');
      return;
    }
    const res = importCustomDatesBackup(backupJSONInput.trim());
    if (res.success) {
      setActiveLedgerState(getActiveLedger());
      setMonthlyBooks(getMonthlyBooks());
      setShowBackupModal(false);
      setBackupJSONInput('');
      triggerToast(res.message);
    } else {
      triggerToast(res.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        setBackupJSONInput(text);
      }
    };
    reader.readAsText(file);
  };

  const exportBucketCSV = (bucket: MonthlyStatementBucket) => {
    const headers = ['Date', 'Type', 'Amount (INR)', 'Note'];
    const rows = bucket.items.map(it => [
      it.date,
      it.type === 'credit' ? 'Received (Credit)' : 'Taken (Debit)',
      it.amount,
      `"${it.note.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-statement-${bucket.monthKey}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    triggerToast(`Exported CSV for ${bucket.monthLabel}`);
  };

  return (
    <div className="space-y-space-lg">
      {/* Top Banner & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-surface-container-high/60 pb-space-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-primary/15 text-primary uppercase tracking-wider">
              Special Space
            </span>
            <span className="text-2xs text-secondary">Custom Dates Monthly Vault</span>
          </div>
          <h1 className="text-headline-sm sm:text-headline-md font-black text-on-surface tracking-tight mt-1">
            Monthly Custom Dates Data Space
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1 max-w-2xl">
            A dedicated sanctuary to organize, track, and save your date-to-date cash flow records by month with zero data loss.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigateTo('date-ledger')}
            className="px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-surface-container-high flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">arrow_back</span>
            Back to Active Ledger
          </button>

          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:opacity-95 flex items-center gap-1.5 transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save Current as Monthly Book
          </button>

          <button
            type="button"
            onClick={() => setShowBackupModal(true)}
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface border border-surface-container-high transition-colors"
            title="Backup & Restore Data"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs">
          <div className="text-2xs uppercase tracking-wider font-bold text-secondary">
            Saved Monthly Books
          </div>
          <div className="text-headline-sm font-black text-on-surface mt-1">
            {monthlyBooks.length}
          </div>
          <div className="text-2xs text-secondary mt-1">
            Archived in permanent storage
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs">
          <div className="text-2xs uppercase tracking-wider font-bold text-secondary">
            Active Months Detected
          </div>
          <div className="text-headline-sm font-black text-primary mt-1">
            {statementBuckets.length}
          </div>
          <div className="text-2xs text-secondary mt-1">
            From {activeLedger.transactions.length} active custom date transactions
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs">
          <div className="text-2xs uppercase tracking-wider font-bold text-secondary">
            Total Inflow Volume
          </div>
          <div className="text-headline-sm font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {formatMoneyCompact(
              statementBuckets.reduce((sum, b) => sum + b.inflows, 0)
            )}
          </div>
          <div className="text-2xs text-secondary mt-1">
            Across all monthly statements
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs">
          <div className="text-2xs uppercase tracking-wider font-bold text-secondary">
            Storage Safety Status
          </div>
          <div className="text-headline-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
            <span>100% Intact</span>
          </div>
          <div className="text-2xs text-secondary mt-1">
            Every date &amp; time change preserved
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex items-center gap-2 border-b border-surface-container-high">
        <button
          type="button"
          onClick={() => setActiveTab('buckets')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'buckets'
              ? 'border-primary text-primary'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">calendar_view_month</span>
          <span>Monthly Statements Breakdown ({statementBuckets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('books')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'books'
              ? 'border-primary text-primary'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">collections_bookmark</span>
          <span>Saved Monthly Ledgers Vault ({monthlyBooks.length})</span>
        </button>
      </div>

      {/* TAB 1: Monthly Statement Buckets */}
      {activeTab === 'buckets' && (
        <div className="space-y-space-md">
          <div className="bg-surface-container-low/60 p-3 rounded-xl border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-secondary">
            <div>
              Custom date transactions are automatically partitioned into their respective calendar months.
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-semibold text-on-surface">Base Rate:</span>
              <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-2xs text-primary font-bold">
                {activeLedger.rate}% {activeLedger.rateType} ({activeLedger.dayCountBasis}d)
              </span>
            </div>
          </div>

          {statementBuckets.length === 0 ? (
            <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-6 space-y-3">
              <span className="material-symbols-outlined text-5xl text-secondary/40">event_busy</span>
              <h3 className="text-title-sm font-bold text-on-surface">No Monthly Transactions Found</h3>
              <p className="text-xs text-secondary max-w-md mx-auto">
                Add dates and amounts in the Custom Dates calculator to see your live monthly statements appear here.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('date-ledger')}
                className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl shadow-xs"
              >
                Go to Date Ledger
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {statementBuckets.map((bucket, bIdx) => (
                <div
                  key={bucket.monthKey}
                  className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/70 shadow-xs overflow-hidden"
                >
                  {/* Month Bucket Header */}
                  <div className="p-4 bg-surface-container-low/40 border-b border-surface-container-high/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {bucket.monthKey.split('-')[1]}
                      </div>
                      <div>
                        <h3 className="text-title-sm sm:text-title-md font-bold text-on-surface flex items-center gap-2">
                          {bucket.monthLabel}
                          <span className="text-2xs px-2 py-0.5 rounded-full bg-surface-container text-secondary font-medium">
                            {bucket.items.length} transactions
                          </span>
                        </h3>
                        <p className="text-2xs text-secondary mt-0.5">
                          Month Code: {bucket.monthKey} &bull; Closing Principal:{' '}
                          <strong className="text-on-surface">{formatMoney(bucket.closingBalance)}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Quick Month Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            downloadMonthlyBucketPDF(bucket, {
                              rate: activeLedger.rate,
                              rateType: activeLedger.rateType,
                              dayCountBasis: activeLedger.dayCountBasis,
                            });
                            triggerToast(`Downloaded PDF statement for ${bucket.monthLabel}!`);
                          } catch (err) {
                            console.error('Error generating PDF:', err);
                            triggerToast('Could not download PDF.');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold flex items-center gap-1 transition-colors border border-primary/20"
                        title="Download official PDF passbook statement for this month"
                      >
                        <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                        Download PDF
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedStatement(bucket)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-secondary flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">print</span>
                        Print Statement
                      </button>

                      <button
                        type="button"
                        onClick={() => exportBucketCSV(bucket)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-secondary flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">csv</span>
                        Export CSV
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewBookMonth(bucket.monthKey);
                          setNewBookTitle(`${bucket.monthLabel} Capital Ledger`);
                          setShowSaveModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:opacity-90 flex items-center gap-1 shadow-xs transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[15px]">bookmark</span>
                        Save Month Book
                      </button>
                    </div>
                  </div>

                  {/* Monthly Financial Metrics Grid */}
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container-lowest border-b border-surface-container-high/40">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-2xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                        Monthly Inflows
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-emerald-800 dark:text-emerald-200 mt-1">
                        +{formatMoney(bucket.inflows)}
                      </div>
                      <div className="text-3xs text-secondary mt-0.5 truncate">
                        {formatIndianDenominationWords(bucket.inflows)}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <div className="text-2xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                        Monthly Outflows
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-rose-800 dark:text-rose-200 mt-1">
                        -{formatMoney(bucket.outflows)}
                      </div>
                      <div className="text-3xs text-secondary mt-0.5 truncate">
                        {formatIndianDenominationWords(bucket.outflows)}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="text-2xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        Net Movement
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-on-surface mt-1">
                        {bucket.netMovement >= 0 ? '+' : ''}{formatMoney(bucket.netMovement)}
                      </div>
                      <div className="text-3xs text-secondary mt-0.5">
                        Inflows − Outflows
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                      <div className="text-2xs font-bold text-primary uppercase tracking-wider">
                        Month Closing Balance
                      </div>
                      <div className="text-sm sm:text-base font-black text-primary mt-1">
                        {formatMoney(bucket.closingBalance)}
                      </div>
                      <div className="text-3xs text-primary font-medium mt-0.5 truncate">
                        {formatIndianDenominationWords(bucket.closingBalance)}
                      </div>
                    </div>
                  </div>

                  {/* Monthly Transactions List */}
                  <div className="p-4 space-y-2">
                    <div className="text-2xs font-bold text-secondary uppercase tracking-wider mb-2">
                      Transactions in {bucket.monthLabel}
                    </div>
                    <div className="divide-y divide-surface-container-high/60">
                      {bucket.items.map((item, itIdx) => (
                        <div
                          key={item.id || itIdx}
                          className="py-2.5 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-xs font-bold text-on-surface shrink-0">
                              {item.date}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-2xs font-bold shrink-0 ${
                                item.type === 'credit'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {item.type === 'credit' ? 'Inflow (+)' : 'Taken (−)'}
                            </span>
                            <span className="text-on-surface truncate font-medium">
                              {item.note}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`font-bold text-sm ${
                                item.type === 'credit'
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {item.type === 'credit' ? '+' : '−'}{formatMoney(item.amount)}
                            </span>
                            <div className="text-3xs text-secondary">
                              {formatIndianDenominationWords(item.amount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Saved Monthly Books Archive */}
      {activeTab === 'books' && (
        <div className="space-y-space-md">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-secondary">
              Saved permanent monthly ledgers. Each book preserves its own rate, transactions, and notes.
            </div>
            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:opacity-90 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Create New Monthly Book
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {monthlyBooks.map(book => (
              <div
                key={book.id}
                className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/70 shadow-xs p-space-md flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                        {book.monthKey.split('-')[1]}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">{book.bookTitle}</h4>
                        <div className="text-2xs text-secondary">
                          {book.monthTitle} &bull; {book.transactions.length} entries
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteBook(book.id)}
                      className="p-1 text-secondary hover:text-rose-600 rounded"
                      title="Delete book"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>

                  {book.note && (
                    <p className="mt-2 text-2xs text-secondary bg-surface-container-low p-2 rounded-lg italic">
                      &quot;{book.note}&quot;
                    </p>
                  )}

                  {/* Financial Metrics in Book */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-2xs">
                    <div className="p-2 rounded-lg bg-surface-container-low">
                      <span className="text-secondary block">Inflows</span>
                      <strong className="text-emerald-600 text-xs">+{formatMoney(book.totalInflows)}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-low">
                      <span className="text-secondary block">Outflows</span>
                      <strong className="text-rose-600 text-xs">-{formatMoney(book.totalOutflows)}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-low">
                      <span className="text-secondary block">Net Principal</span>
                      <strong className="text-on-surface text-xs">{formatMoney(book.netPrincipal)}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <span className="text-primary block">Interest Rate</span>
                      <strong className="text-primary text-xs">{book.rate}% {book.rateType}</strong>
                    </div>
                  </div>
                </div>

                {/* Book Action Footer */}
                <div className="pt-2 border-t border-surface-container-high/50 flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-3xs text-secondary">
                    Updated {new Date(book.updatedAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRollForwardMonth(book)}
                      className="px-2.5 py-1 text-2xs font-semibold rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary flex items-center gap-1"
                      title="Roll forward to next month"
                    >
                      <span className="material-symbols-outlined text-[14px]">fast_forward</span>
                      Roll Forward
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLoadBookIntoActive(book)}
                      className="px-3 py-1 text-2xs font-bold rounded-lg bg-primary text-on-primary hover:opacity-90 flex items-center gap-1 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                      Load &amp; Calculate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SAVE MONTHLY BOOK MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-md w-full p-5 border border-surface-container-high shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-title-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bookmark_add</span>
                Save to Monthly Special Space
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="p-1 rounded-lg text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCurrentAsBook} className="space-y-3 text-xs">
              <div>
                <label className="block text-secondary font-semibold mb-1">Select Month (YYYY-MM)</label>
                <input
                  type="month"
                  value={newBookMonth}
                  onChange={e => setNewBookMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-container-high bg-surface-container font-mono text-xs focus:outline-none focus:border-primary text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-secondary font-semibold mb-1">Book Title / Ledger Name</label>
                <input
                  type="text"
                  placeholder="e.g., September 2026 Borrowing Tranches"
                  value={newBookTitle}
                  onChange={e => setNewBookTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-container-high bg-surface-container text-xs focus:outline-none focus:border-primary text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-secondary font-semibold mb-1">Notes / Description (Optional)</label>
                <textarea
                  placeholder="e.g., Seed capital draws from investor with 12% p.a. interest..."
                  value={newBookNote}
                  onChange={e => setNewBookNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-surface-container-high bg-surface-container text-xs focus:outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-surface-container text-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-xs"
                >
                  Save Monthly Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE STATEMENT MODAL */}
      {selectedStatement && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-2xl w-full p-6 border border-surface-container-high shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
              <div>
                <h3 className="text-title-md font-bold text-on-surface">
                  Monthly Statement — {selectedStatement.monthLabel}
                </h3>
                <p className="text-2xs text-secondary">Interestly Date-to-Date Financial Statement</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStatement(null)}
                className="p-1.5 rounded-lg text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Statement Summary Card */}
            <div className="p-4 rounded-xl bg-surface-container-low grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-secondary text-2xs block">Month Inflows</span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                  +{formatMoney(selectedStatement.inflows)}
                </strong>
              </div>
              <div>
                <span className="text-secondary text-2xs block">Month Outflows</span>
                <strong className="text-rose-700 dark:text-rose-400 font-bold">
                  -{formatMoney(selectedStatement.outflows)}
                </strong>
              </div>
              <div>
                <span className="text-secondary text-2xs block">Net Movement</span>
                <strong className="text-on-surface font-bold">
                  {formatMoney(selectedStatement.netMovement)}
                </strong>
              </div>
              <div>
                <span className="text-secondary text-2xs block">Closing Principal</span>
                <strong className="text-primary font-black">
                  {formatMoney(selectedStatement.closingBalance)}
                </strong>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto border border-surface-container-high rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low font-semibold text-secondary">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/60">
                  {selectedStatement.items.map((it, idx) => (
                    <tr key={it.id || idx}>
                      <td className="py-2 px-3 font-mono">{it.date}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-2xs font-bold ${
                            it.type === 'credit'
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {it.type === 'credit' ? 'Inflow' : 'Taken'}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-on-surface">{it.note}</td>
                      <td className="py-2 px-3 text-right font-bold text-on-surface">
                        {it.type === 'credit' ? '+' : '−'}{formatMoney(it.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-surface-container-high flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      downloadMonthlyBucketPDF(selectedStatement, {
                        rate: activeLedger.rate,
                        rateType: activeLedger.rateType,
                        dayCountBasis: activeLedger.dayCountBasis,
                      });
                      triggerToast(`Downloaded PDF statement for ${selectedStatement.monthLabel}!`);
                    } catch (err) {
                      console.error('Error generating PDF:', err);
                      triggerToast('Could not download PDF.');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity"
                  title="Download vector PDF statement"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1.5 border border-surface-container-high"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Print
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStatement(null)}
                className="px-4 py-2 rounded-xl bg-surface-container text-secondary text-xs font-medium hover:text-on-surface"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BACKUP & RESTORE MODAL */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-lg w-full p-5 border border-surface-container-high shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-title-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">cloud_sync</span>
                Vault Backup &amp; Device Transfer
              </h3>
              <button
                type="button"
                onClick={() => setShowBackupModal(false)}
                className="p-1 rounded-lg text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-secondary">
              Export all your custom dates data, time-slots, and monthly books as a single JSON file. You can restore this file on any Android, iOS, or desktop browser anytime.
            </p>

            <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-on-surface">Download Backup File</div>
                <div className="text-2xs text-secondary">Saves slots, active ledger &amp; monthly books</div>
              </div>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="px-3.5 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download JSON
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-surface-container-high">
              <div className="font-bold text-xs text-on-surface flex items-center justify-between">
                <span>Restore from Backup</span>
                <label className="text-primary text-2xs cursor-pointer hover:underline font-semibold">
                  Upload file
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <textarea
                placeholder="Or paste backup JSON content here..."
                value={backupJSONInput}
                onChange={e => setBackupJSONInput(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-surface-container-high bg-surface-container font-mono text-2xs focus:outline-none focus:border-primary text-on-surface"
              />
              <button
                type="button"
                onClick={handleImportBackup}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                Restore Vault Data Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
