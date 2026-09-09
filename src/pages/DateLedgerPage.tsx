import React, { useState, useId, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DateCashFlowItem, CashFlowType, DateLedgerSlot } from '../types';
import {
  formatDateISO,
  getDaysBetween,
  addDays,
  calculateDateLedger,
  exportLedgerToCSV,
  formatIndianDenominationWords,
} from '../utils/dateLedgerEngine';
import {
  getActiveLedger,
  saveActiveLedger,
  getLedgerSlots,
  recordLedgerSlot,
  deleteLedgerSlot,
  clearAllLedgerSlots,
  saveOrUpdateMonthlyBook,
} from '../utils/customDatesStorage';
import { DateLedgerSlotsModal } from '../components/DateLedgerSlotsModal';
import { downloadDateLedgerPDF } from '../utils/dateLedgerPdfGenerator';

export const DateLedgerPage: React.FC = () => {
  const { formatMoney, formatMoneyCompact, currencyConfig, triggerToast, addHistoryItem, navigateTo } = useApp();

  const todayStr = formatDateISO(new Date());
  const settlementDefault = addDays(todayStr, 45);

  // Initialize from persistent active ledger
  const initialActive = getActiveLedger();
  const [transactions, setTransactions] = useState<DateCashFlowItem[]>(initialActive.transactions);
  const [rate, setRate] = useState<number>(initialActive.rate);
  const [rateType, setRateType] = useState<'annual' | 'monthly'>(initialActive.rateType);
  const [compoundingMethod, setCompoundingMethod] = useState<'simple' | 'daily_compounding'>(initialActive.compoundingMethod);
  const [dayCountBasis, setDayCountBasis] = useState<365 | 360>(initialActive.dayCountBasis);
  const [asOfDate, setAsOfDate] = useState<string>(initialActive.asOfDate || settlementDefault);
  const [userRole, setUserRole] = useState<'borrower' | 'lender'>(initialActive.userRole || 'borrower');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Persistent Time-Slots State
  const [slots, setSlots] = useState<DateLedgerSlot[]>(() => getLedgerSlots());
  const [isSlotsModalOpen, setIsSlotsModalOpen] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    const s = getLedgerSlots();
    return s[0]?.formattedTime || 'Just now';
  });

  // New transaction input state
  const [newDate, setNewDate] = useState<string>(addDays(todayStr, 35));
  const [newType, setNewType] = useState<CashFlowType>('credit');
  const [newAmount, setNewAmount] = useState<number>(5000);
  const [newNote, setNewNote] = useState<string>('');

  // Editing row state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editType, setEditType] = useState<CashFlowType>('credit');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editNote, setEditNote] = useState<string>('');

  // Mobile / Desktop View Mode for Passbook Ledger
  const [passbookViewMode, setPassbookViewMode] = useState<'table' | 'cards'>('table');

  // Continuous auto-save to active ledger
  useEffect(() => {
    saveActiveLedger({
      transactions,
      rate,
      rateType,
      compoundingMethod,
      dayCountBasis,
      asOfDate,
      userRole,
      lastSavedAt: new Date().toISOString(),
    });
  }, [transactions, rate, rateType, compoundingMethod, dayCountBasis, asOfDate, userRole]);

  // Helper to record a new slot snapshot
  const createSnapshotSlot = (
    trigger: 'auto_change' | 'manual_save' | 'restore' | 'preset',
    description: string,
    txs: DateCashFlowItem[] = transactions,
    currentRate: number = rate,
    currentAsOfDate: string = asOfDate
  ) => {
    const slot = recordLedgerSlot({
      trigger,
      description,
      transactions: txs,
      rate: currentRate,
      rateType,
      compoundingMethod,
      dayCountBasis,
      asOfDate: currentAsOfDate,
      userRole,
    });
    setSlots(getLedgerSlots());
    setLastSavedTime(slot.formattedTime);
    return slot;
  };

  const startEditing = (tx: DateCashFlowItem) => {
    setEditingId(tx.id);
    setEditDate(tx.date);
    setEditType(tx.type);
    setEditAmount(tx.amount);
    setEditNote(tx.note);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editDate || editAmount <= 0) {
      triggerToast('Please provide a valid date and amount greater than 0.');
      return;
    }
    const nextTxs = transactions.map(t =>
      t.id === editingId
        ? {
            ...t,
            date: editDate,
            type: editType,
            amount: editAmount,
            note: editNote.trim() || (editType === 'credit' ? 'Cash Received' : 'Cash Taken / Repaid'),
          }
        : t
    );
    setTransactions(nextTxs);
    setEditingId(null);
    createSnapshotSlot('auto_change', `Edited transaction on ${editDate} to ${formatMoney(editAmount)}`, nextTxs);
    triggerToast(`Updated transaction to ${formatMoney(editAmount)} on ${editDate} (Saved to time-slot)`);
  };

  // Quick rate adjust
  const adjustRate = (delta: number) => {
    const next = Math.max(0.1, Math.min(100, rate + delta));
    const cleanRate = parseFloat(next.toFixed(2));
    setRate(cleanRate);
    createSnapshotSlot('auto_change', `Adjusted interest rate to ${cleanRate}%`, transactions, cleanRate);
  };

  // Run calculation engine
  const calculation = calculateDateLedger({
    items: transactions,
    rate,
    rateType,
    compoundingMethod,
    dayCountBasis,
    asOfDate,
  });

  // Handlers for transactions
  const handleAddTransaction = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newDate || newAmount <= 0) {
      triggerToast('Please provide a valid date and amount greater than 0.');
      return;
    }

    const item: DateCashFlowItem = {
      id: `tx-${Date.now()}`,
      date: newDate,
      type: newType,
      amount: newAmount,
      note: newNote.trim() || (newType === 'credit' ? 'Cash Received' : 'Cash Taken / Repaid'),
    };

    const nextTxs = [...transactions, item];
    setTransactions(nextTxs);
    createSnapshotSlot('auto_change', `Added ${newType === 'credit' ? 'Inflow' : 'Outflow'} of ${formatMoney(newAmount)} on ${newDate}`, nextTxs);
    triggerToast(`Added ${newType === 'credit' ? 'Inflow' : 'Outflow'} of ${formatMoney(newAmount)} on ${newDate} (Saved in slot)`);
    setNewNote('');
  };

  const handleDeleteTransaction = (id: string) => {
    if (transactions.length <= 1) {
      triggerToast('At least one transaction must remain in the ledger.');
      return;
    }
    const target = transactions.find(t => t.id === id);
    const nextTxs = transactions.filter(t => t.id !== id);
    setTransactions(nextTxs);
    createSnapshotSlot('auto_change', `Removed transaction of ${target ? formatMoney(target.amount) : ''} on ${target?.date || ''}`, nextTxs);
    triggerToast('Transaction removed & saved in new slot.');
  };

  const handleDuplicateTransaction = (item: DateCashFlowItem) => {
    const duplicated: DateCashFlowItem = {
      ...item,
      id: `tx-${Date.now()}`,
      note: `${item.note} (Copy)`,
    };
    const nextTxs = [...transactions, duplicated];
    setTransactions(nextTxs);
    createSnapshotSlot('auto_change', `Duplicated transaction on ${item.date}`, nextTxs);
    triggerToast('Transaction duplicated & saved in new slot.');
  };

  const handleSortChronologically = () => {
    const nextTxs = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    setTransactions(nextTxs);
    createSnapshotSlot('auto_change', 'Sorted transactions chronologically', nextTxs);
    triggerToast('Transactions sorted chronologically by date.');
  };

  // Presets
  const loadUserExamplePreset = () => {
    const t0 = formatDateISO(new Date());
    const presetTxs: DateCashFlowItem[] = [
      {
        id: `tx-${Date.now()}-1`,
        date: t0,
        type: 'credit',
        amount: 10000,
        note: 'First receipt (₹10,000 today)',
      },
      {
        id: `tx-${Date.now()}-2`,
        date: addDays(t0, 7),
        type: 'credit',
        amount: 10000,
        note: 'Second receipt after 1 week (₹10,000)',
      },
      {
        id: `tx-${Date.now()}-3`,
        date: addDays(t0, 25),
        type: 'debit',
        amount: 5000,
        note: 'Someone took from me / partial payback (₹5,000)',
      },
    ];
    setTransactions(presetTxs);
    const targetDate = addDays(t0, 45);
    setAsOfDate(targetDate);
    createSnapshotSlot('preset', 'Loaded request scenario (10k today + 10k in 1 wk - 5k taken)', presetTxs, rate, targetDate);
    triggerToast('Loaded your exact scenario preset & saved to slot!');
  };

  const loadPeerLoanPreset = () => {
    const t0 = formatDateISO(new Date());
    const presetTxs: DateCashFlowItem[] = [
      {
        id: `tx-${Date.now()}-1`,
        date: t0,
        type: 'credit',
        amount: 50000,
        note: 'Initial borrowed amount',
      },
      {
        id: `tx-${Date.now()}-2`,
        date: addDays(t0, 15),
        type: 'debit',
        amount: 10000,
        note: 'First partial installment paid',
      },
      {
        id: `tx-${Date.now()}-3`,
        date: addDays(t0, 30),
        type: 'credit',
        amount: 25000,
        note: 'Additional emergency credit requested',
      },
      {
        id: `tx-${Date.now()}-4`,
        date: addDays(t0, 60),
        type: 'debit',
        amount: 20000,
        note: 'Second repayment',
      },
    ];
    setTransactions(presetTxs);
    const targetDate = addDays(t0, 90);
    setAsOfDate(targetDate);
    createSnapshotSlot('preset', 'Loaded Peer-to-Peer Multi-Tranche loan preset', presetTxs, rate, targetDate);
    triggerToast('Loaded Peer-to-Peer Multi-Tranche loan preset & saved in slot.');
  };

  const loadMonthlyInterestPreset = () => {
    const t0 = formatDateISO(new Date());
    const presetTxs: DateCashFlowItem[] = [
      {
        id: `tx-${Date.now()}-1`,
        date: t0,
        type: 'credit',
        amount: 100000,
        note: 'Principal credit',
      },
      {
        id: `tx-${Date.now()}-2`,
        date: addDays(t0, 45),
        type: 'debit',
        amount: 25000,
        note: 'Interim withdrawal / settlement',
      },
    ];
    setTransactions(presetTxs);
    setRate(2.0); // 2% per month
    setRateType('monthly');
    const targetDate = addDays(t0, 90);
    setAsOfDate(targetDate);
    createSnapshotSlot('preset', 'Loaded 2% Monthly Interest preset', presetTxs, 2.0, targetDate);
    triggerToast('Loaded 2% Monthly Interest preset & saved in slot.');
  };

  const loadHighCapitalCrorePreset = () => {
    const t0 = formatDateISO(new Date());
    const presetTxs: DateCashFlowItem[] = [
      {
        id: `tx-${Date.now()}-1`,
        date: t0,
        type: 'credit',
        amount: 10000000, // 10,000,000 Rs (1 Crore)
        note: 'Tranche 1: Initial capital receipt (₹1,00,00,000 / 1 Crore)',
      },
      {
        id: `tx-${Date.now()}-2`,
        date: addDays(t0, 14),
        type: 'credit',
        amount: 5000000, // 5,000,000 Rs (50 Lakh)
        note: 'Tranche 2: Additional capital receipt after 2 wks (₹50,00,000 / 50 Lakh)',
      },
      {
        id: `tx-${Date.now()}-3`,
        date: addDays(t0, 30),
        type: 'credit',
        amount: 10000000, // 10,000,000 Rs (1 Crore)
        note: 'Tranche 3: Third tranche after 1 month (₹1,00,00,000 / 1 Crore)',
      },
      {
        id: `tx-${Date.now()}-4`,
        date: addDays(t0, 60),
        type: 'debit',
        amount: 7500000, // 7,500,000 Rs (75 Lakh)
        note: 'Partial repayment / Partner withdrawal (₹75,00,000 / 75 Lakh)',
      },
    ];
    setTransactions(presetTxs);
    const targetDate = addDays(t0, 90);
    setAsOfDate(targetDate);
    setNewAmount(10000000);
    createSnapshotSlot('preset', 'Loaded High Capital ₹10,000,000+ (1 Crore+) Tranche preset', presetTxs, rate, targetDate);
    triggerToast('Loaded High Capital ₹10,000,000+ (1 Crore+) Tranche preset & saved in slot!');
  };

  // Slot modal handlers
  const handleRestoreSlot = (slot: DateLedgerSlot) => {
    setTransactions(slot.transactions);
    setRate(slot.rate);
    setRateType(slot.rateType);
    setCompoundingMethod(slot.compoundingMethod);
    setDayCountBasis(slot.dayCountBasis);
    setAsOfDate(slot.asOfDate);
    setUserRole(slot.userRole);
    createSnapshotSlot(
      'restore',
      `Restored snapshot from ${slot.formattedDate} ${slot.formattedTime}`,
      slot.transactions,
      slot.rate,
      slot.asOfDate
    );
    triggerToast(`Restored time-slot snapshot from ${slot.formattedDate} ${slot.formattedTime}`);
  };

  const handleManualSaveSlot = (customNote: string) => {
    createSnapshotSlot('manual_save', customNote);
    triggerToast(`Saved new manual time-slot: "${customNote}"`);
  };

  const handleDeleteSlot = (id: string) => {
    const updated = deleteLedgerSlot(id);
    setSlots(updated);
    triggerToast('Slot deleted.');
  };

  const handleClearOldSlots = () => {
    const updated = clearAllLedgerSlots(true);
    setSlots(updated);
    triggerToast('Pruned old slots, retained latest active slot.');
  };

  // Save directly to Monthly Space
  const handleSaveToMonthlySpace = () => {
    const monthKey = asOfDate ? asOfDate.substring(0, 7) : todayStr.substring(0, 7);
    const [y, m] = monthKey.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, 1);
    const monthTitle = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    saveOrUpdateMonthlyBook({
      monthKey,
      monthTitle,
      bookTitle: `${monthTitle} Custom Dates Ledger`,
      note: `Saved from active Custom Dates ledger with ${transactions.length} entries.`,
      transactions,
      rate,
      rateType,
      compoundingMethod,
      dayCountBasis,
      asOfDate,
      userRole,
      openingPrincipal: 0,
      totalInflows: calculation.totalInflows,
      totalOutflows: calculation.totalOutflows,
      netPrincipal: calculation.netPrincipalBalance,
      accruedInterest: calculation.totalInterestAccrued,
      grandSettlement: calculation.grandTotalSettlement,
    });

    triggerToast(`Saved current ledger into Monthly Special Space (${monthTitle})!`);
  };

  // Audit history save
  const handleSaveToHistory = () => {
    addHistoryItem({
      category: 'Date-to-Date Ledger',
      title: `Custom Date Ledger — Net ${formatMoney(calculation.netPrincipalBalance)} @ ${rate}% ${rateType === 'monthly' ? 'p.m.' : 'p.a.'}`,
      principal: calculation.netPrincipalBalance,
      rate: calculation.nominalAnnualRate,
      tenureYears: calculation.totalDaysHorizon / 365,
      frequency: `${compoundingMethod === 'simple' ? 'Daily Simple' : 'Daily Compounding'} (${dayCountBasis}d basis)`,
      resultValue: calculation.grandTotalSettlement,
      resultFormatted: formatMoney(calculation.grandTotalSettlement),
      formula: 'I = ∑ [B_{k-1} × (r/basis) × Δdays_k]',
      details: [
        { label: 'Total Received (+)', value: formatMoney(calculation.totalInflows) },
        { label: 'Total Taken (-)', value: formatMoney(calculation.totalOutflows) },
        { label: 'Net Principal', value: formatMoney(calculation.netPrincipalBalance) },
        { label: 'Accrued Interest', value: formatMoney(calculation.totalInterestAccrued) },
        { label: 'Total Horizon', value: `${calculation.totalDaysHorizon} Days (As of ${asOfDate})` },
      ],
    });
    triggerToast('Saved Date-to-Date Ledger calculation to history!');
  };

  const handleCopySummary = () => {
    const text = [
      `Date-to-Date Interest & Running Ledger Statement`,
      `As of Date: ${asOfDate}`,
      `Rate: ${rate}% ${rateType === 'monthly' ? 'p.m. (24% p.a.)' : 'p.a.'}`,
      `Total Received (+): ${formatMoney(calculation.totalInflows)}`,
      `Total Taken / Repaid (-): ${formatMoney(calculation.totalOutflows)}`,
      `Net Principal: ${formatMoney(calculation.netPrincipalBalance)}`,
      `Accrued Interest: ${formatMoney(calculation.totalInterestAccrued)}`,
      `Total Settlement Balance: ${formatMoney(calculation.grandTotalSettlement)}`,
      `Days Horizon: ${calculation.totalDaysHorizon} days`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    triggerToast('Copied ledger statement to clipboard!');
  };

  const handleExportCSV = () => {
    const csv = exportLedgerToCSV(calculation, currencyConfig.symbol, asOfDate);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `interestly_date_ledger_${asOfDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Downloaded date ledger CSV file.');
  };

  const handleDownloadPDF = () => {
    try {
      downloadDateLedgerPDF({
        title: 'Date-to-Date Cash Flow & Interest Statement',
        subtitle: `Running Principal & Accrual Passbook (${transactions.length} Tranches)`,
        transactions,
        calculation,
        rate,
        rateType,
        compoundingMethod,
        dayCountBasis,
        asOfDate,
        userRole,
        slotTimestamp: lastSavedTime,
      });
      triggerToast('Official PDF Statement downloaded successfully!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      triggerToast('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Top Banner & Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-2xs text-secondary font-label-md text-label-md">
            <span>Calculators</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold">Custom Dates &amp; Running Ledger</span>
            <span className="ml-space-2xs px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Date-Wise Engine
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
            Date-to-Date Cash Flow &amp; Interest Ledger
          </h1>
          <p className="text-secondary font-body-md text-body-md max-w-3xl">
            Select exact calendar dates for multiple staggered receipts (e.g. 10,000 today, 10,000 next week) and withdrawals.
            Our daily accrual engine tracks exact elapsed days and calculates running principal with compound or simple interest.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-space-xs shrink-0">
          <button
            onClick={() => setIsSlotsModalOpen(true)}
            className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors border border-surface-container-highest/60"
            type="button"
            title="View time-stamped version history"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">history</span>
            <span>Slots ({slots.length})</span>
          </button>
          <button
            onClick={handleSaveToMonthlySpace}
            className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors border border-surface-container-highest/60"
            type="button"
            title="Save into dedicated monthly space"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-600">bookmark</span>
            <span>Save to Monthly Space</span>
          </button>
          <button
            onClick={handleSaveToHistory}
            className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors border border-surface-container-highest/60"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
            Save Audit
          </button>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors border border-surface-container-highest/60"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
            Copy
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-xs font-bold ring-2 ring-primary/20"
            type="button"
            title="Download official PDF passbook statement"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span>Download PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors border border-surface-container-highest/60 font-semibold"
            type="button"
            title="Export spreadsheet CSV"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Time-Slot Auto-Save & Special Monthly Space Action Bar */}
      <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-2xl border border-primary/25 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[22px]">save_clock</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold text-on-surface flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Auto-Saved Time-Slot: <span className="font-mono text-primary font-bold">{lastSavedTime}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                {slots.length} Slots Saved
              </span>
            </div>
            <p className="text-2xs text-secondary mt-0.5">
              Every date and time change is stored in a discrete slot. No data loss occurs across browser reloads or devices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold border border-surface-container-high shadow-xs flex items-center gap-1.5 transition-colors"
            title="Download PDF statement of current time-slot"
          >
            <span className="material-symbols-outlined text-primary text-[17px]">picture_as_pdf</span>
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSlotsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold border border-surface-container-high shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-[17px]">manage_history</span>
            Time-Slot History ({slots.length})
          </button>

          <button
            type="button"
            onClick={() => navigateTo('monthly-vault')}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:opacity-90 shadow-xs flex items-center gap-1.5 transition-opacity"
          >
            <span className="material-symbols-outlined text-[17px]">calendar_view_month</span>
            <span>Monthly Data Space</span>
            <span className="px-1.5 py-0.2 rounded bg-white/20 text-3xs font-extrabold uppercase">Vault</span>
          </button>
        </div>
      </div>

      {/* Quick Scenario Presets */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container-high/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">auto_fix_high</span>
          <span className="font-label-md text-label-md font-semibold text-on-surface">Quick Scenarios:</span>
        </div>
        <div className="flex flex-wrap items-center gap-space-xs">
          <button
            onClick={loadUserExamplePreset}
            type="button"
            className="px-space-sm py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors flex items-center gap-1 border border-primary/20"
          >
            <span className="material-symbols-outlined text-[15px]">verified</span>
            Your Request: 10k Today + 10k in 1 Wk - 5k Taken
          </button>
          <button
            onClick={loadHighCapitalCrorePreset}
            type="button"
            className="px-space-sm py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-colors flex items-center gap-1 border border-amber-500/30"
          >
            <span className="material-symbols-outlined text-[15px]">diamond</span>
            ₹10,000,000+ (1 Crore+) Tranche
          </button>
          <button
            onClick={loadPeerLoanPreset}
            type="button"
            className="px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors border border-surface-container-highest/60"
          >
            Peer Loan (Multi-Tranche)
          </button>
          <button
            onClick={loadMonthlyInterestPreset}
            type="button"
            className="px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors border border-surface-container-highest/60"
          >
            2% / Month Informal Rate
          </button>
          <button
            onClick={handleSortChronologically}
            type="button"
            className="px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary text-xs font-medium transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">swap_vert</span>
            Sort by Date
          </button>
        </div>
      </div>

      {/* Top High-Contrast KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: Net Principal */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container-high/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Net Principal Balance
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary">account_balance_wallet</span>
          </div>
          <div className="mt-2">
            <div className="text-headline-sm font-extrabold text-on-surface flex items-baseline gap-1.5 flex-wrap">
              <span>{formatMoney(calculation.netPrincipalBalance)}</span>
              {calculation.netPrincipalBalance >= 10000000 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  {formatMoneyCompact(calculation.netPrincipalBalance)}
                </span>
              )}
            </div>
            <div className="text-xs text-secondary mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">+{formatMoney(calculation.totalInflows)}</span>
              <span>rec&apos;d</span>
              <span>&bull;</span>
              <span className="text-rose-600 font-medium">-{formatMoney(calculation.totalOutflows)}</span>
              <span>taken</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Accrued Interest */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container-high/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Total Accrued Interest
            </span>
            <span className="material-symbols-outlined text-[20px] text-tertiary">trending_up</span>
          </div>
          <div className="mt-2">
            <div className="text-headline-sm font-extrabold text-tertiary flex items-baseline gap-1.5 flex-wrap">
              <span>{formatMoney(calculation.totalInterestAccrued)}</span>
              {calculation.totalInterestAccrued >= 10000000 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-tertiary/15 text-tertiary">
                  {formatMoneyCompact(calculation.totalInterestAccrued)}
                </span>
              )}
            </div>
            <div className="text-xs text-secondary mt-1">
              Avg: {formatMoney(calculation.averageDailyInterest)} / day &bull; {calculation.totalDaysHorizon} days total
            </div>
          </div>
        </div>

        {/* Card 3: Grand Settlement Due / Total */}
        <div className="bg-gradient-to-br from-primary-fixed to-surface-container-lowest p-space-md rounded-xl border border-primary/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-primary">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
              {userRole === 'borrower' ? 'Total Settlement Payable' : 'Total Settlement Receivable'}
            </span>
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </div>
          <div className="mt-2">
            <div className="text-headline-md font-black text-primary flex items-baseline gap-1.5 flex-wrap">
              <span>{formatMoney(calculation.grandTotalSettlement)}</span>
              {calculation.grandTotalSettlement >= 10000000 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  {formatMoneyCompact(calculation.grandTotalSettlement)}
                </span>
              )}
            </div>
            <div className="text-xs text-on-surface-variant mt-1 font-medium">
              Principal + All Daily Accrued Interest as of {asOfDate}
            </div>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-primary text-on-primary text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-2xs"
              title="Download formal statement PDF"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Download Statement (PDF)</span>
            </button>
          </div>
        </div>

        {/* Card 4: Horizon & Rate Basis */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container-high/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Accrual Horizon
            </span>
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          </div>
          <div className="mt-2">
            <div className="text-headline-sm font-bold text-on-surface">
              {calculation.totalDaysHorizon} <span className="text-sm font-normal text-secondary">Days</span>
            </div>
            <div className="text-xs text-secondary mt-1">
              {rate}% {rateType === 'monthly' ? 'p.m.' : 'p.a.'} &bull; {compoundingMethod === 'simple' ? 'Simple' : 'Daily Comp.'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Console (Parameters & Quick Add) + Right Console (Interactive Ledger Table & Visual Graph) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Controls & Add Transaction (5 cols on Desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          {/* Section 1: Interest Rate & Settlement As-Of Configuration */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high/50 shadow-xs flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Rate &amp; Date Rules
                </h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {dayCountBasis}d Basis
              </span>
            </div>

            {/* Perspective Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm font-medium text-secondary">
                Your Financial Role
              </label>
              <div className="grid grid-cols-2 p-1 bg-surface-container-low rounded-lg border border-surface-container-high/50">
                <button
                  type="button"
                  onClick={() => setUserRole('borrower')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                    userRole === 'borrower'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  I Received / Borrowed
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole('lender')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                    userRole === 'lender'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  I Lent / Invested
                </button>
              </div>
            </div>

            {/* Interest Rate with Annual vs Monthly Toggle */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm font-medium text-secondary">
                  Interest Rate
                </label>
                <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-md border border-surface-container-high/40">
                  <button
                    type="button"
                    onClick={() => setRateType('annual')}
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      rateType === 'annual' ? 'bg-primary text-on-primary font-semibold' : 'text-secondary'
                    }`}
                  >
                    % per Year (p.a.)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRateType('monthly')}
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      rateType === 'monthly' ? 'bg-primary text-on-primary font-semibold' : 'text-secondary'
                    }`}
                  >
                    % per Month (p.m.)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={rate}
                    onChange={e => setRate(Math.max(0.1, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="w-full h-11 px-3 pr-10 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-headline-sm text-on-surface font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary font-bold text-sm">
                    %
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => adjustRate(-1)}
                    className="h-11 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-sm border border-surface-container-high"
                  >
                    -1%
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustRate(1)}
                    className="h-11 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-sm border border-surface-container-high"
                  >
                    +1%
                  </button>
                </div>
              </div>

              {rateType === 'monthly' && (
                <div className="text-xs text-primary font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  {rate}% per month equates to an annualized nominal rate of {(rate * 12).toFixed(2)}% p.a.
                </div>
              )}
            </div>

            {/* Compounding Method & Basis */}
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm font-medium text-secondary">
                  Accrual Method
                </label>
                <select
                  value={compoundingMethod}
                  onChange={e => setCompoundingMethod(e.target.value as 'simple' | 'daily_compounding')}
                  className="h-10 px-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-body-sm text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="simple">Daily Simple Interest</option>
                  <option value="daily_compounding">Daily Compounding</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm font-medium text-secondary">
                  Day Count Basis
                </label>
                <select
                  value={dayCountBasis}
                  onChange={e => setDayCountBasis(Number(e.target.value) as 365 | 360)}
                  className="h-10 px-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-body-sm text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={365}>Actual / 365 days (Standard)</option>
                  <option value={360}>Actual / 360 days (Commercial)</option>
                </select>
              </div>
            </div>

            {/* Settlement / Calculate As Of Date */}
            <div className="flex flex-col gap-1.5 pt-space-xs border-t border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm font-semibold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">event_available</span>
                  Calculate Balance As Of Date
                </label>
                <span className="text-xs text-secondary">Target settlement</span>
              </div>
              <input
                type="date"
                value={asOfDate}
                onChange={e => setAsOfDate(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-body-md text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex flex-wrap gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => setAsOfDate(todayStr)}
                  className="px-2 py-1 text-2xs font-semibold rounded bg-surface-container hover:bg-surface-container-high text-secondary"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setAsOfDate(addDays(todayStr, 30))}
                  className="px-2 py-1 text-2xs font-semibold rounded bg-surface-container hover:bg-surface-container-high text-secondary"
                >
                  +30 Days
                </button>
                <button
                  type="button"
                  onClick={() => setAsOfDate(addDays(todayStr, 90))}
                  className="px-2 py-1 text-2xs font-semibold rounded bg-surface-container hover:bg-surface-container-high text-secondary"
                >
                  +3 Months
                </button>
                <button
                  type="button"
                  onClick={() => setAsOfDate(addDays(todayStr, 365))}
                  className="px-2 py-1 text-2xs font-semibold rounded bg-surface-container hover:bg-surface-container-high text-secondary"
                >
                  +1 Year
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Add New Transaction Form */}
          <form
            onSubmit={handleAddTransaction}
            className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high/50 shadow-xs flex flex-col gap-space-sm"
          >
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">add_circle</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Add Cash Transaction
                </h3>
              </div>
              <span className="text-xs text-secondary">Staggered cash flow</span>
            </div>

            {/* Type selector: Credit (Received / Inflow) vs Debit (Taken / Repaid / Outflow) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewType('credit')}
                className={`py-2 px-3 rounded-lg font-label-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  newType === 'credit'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'bg-surface-container-low border-surface-container-high/50 text-secondary hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                Cash Received (+)
              </button>
              <button
                type="button"
                onClick={() => setNewType('debit')}
                className={`py-2 px-3 rounded-lg font-label-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  newType === 'debit'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'bg-surface-container-low border-surface-container-high/50 text-secondary hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                Cash Taken / Repaid (-)
              </button>
            </div>

            {/* Date Picker with Quick Offset Pills */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm font-medium text-secondary">
                Transaction Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-body-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex flex-wrap gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => setNewDate(todayStr)}
                  className="px-2 py-0.5 text-2xs font-medium rounded bg-surface-container hover:bg-surface-container-high text-secondary"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setNewDate(addDays(todayStr, 7))}
                  className="px-2 py-0.5 text-2xs font-semibold rounded bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  +1 Week (7d)
                </button>
                <button
                  type="button"
                  onClick={() => setNewDate(addDays(todayStr, 14))}
                  className="px-2 py-0.5 text-2xs font-medium rounded bg-surface-container hover:bg-surface-container-high text-secondary"
                >
                  +2 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => setNewDate(addDays(todayStr, 30))}
                  className="px-2 py-0.5 text-2xs font-medium rounded bg-surface-container hover:bg-surface-container-high text-secondary"
                >
                  +1 Month
                </button>
              </div>
            </div>

            {/* Amount with High-Value Limits (supports ₹10,000,000+ / 1 Crore to multi-Crores) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Amount ({currencyConfig.symbol})
                </label>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-surface-container text-primary">
                  Limit: ₹10,000,000+ (1 Cr+) Supported
                </span>
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary font-bold text-base sm:text-lg">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="1"
                  max="1000000000000"
                  step="any"
                  value={newAmount === 0 ? '' : newAmount}
                  placeholder="Enter amount (e.g. 10000000 for 1 Crore)"
                  onChange={e => {
                    const parsed = parseFloat(e.target.value);
                    setNewAmount(isNaN(parsed) ? 0 : Math.max(0, parsed));
                  }}
                  className="w-full h-11 pl-8 pr-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-headline-sm text-base sm:text-lg text-on-surface font-extrabold focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
                />
              </div>

              {/* Dynamic Indian Denomination & Words Breakdown */}
              {newAmount > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-primary shrink-0">payments</span>
                    <span className="font-extrabold text-primary">
                      {formatMoney(newAmount)}
                    </span>
                    <span className="text-on-surface-variant font-medium truncate">
                      • {formatIndianDenominationWords(newAmount)}
                    </span>
                  </div>
                  {newAmount >= 10000000 && (
                    <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-500 text-white shadow-2xs">
                      10M / 1 Crore+
                    </span>
                  )}
                </div>
              )}

              {/* High-Value Quick Sets (10,000,000 Rs / 1 Crore, 10 Lakh, 50 Lakh, 5 Crore) */}
              <div className="flex flex-col gap-1 mt-1">
                <div className="text-2xs font-bold text-secondary uppercase tracking-wider">
                  Quick Set High Denominations:
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setNewAmount(10000000)}
                    className="px-2.5 py-1 text-2xs font-bold rounded-md bg-primary text-on-primary hover:bg-primary-container transition-all shadow-xs flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    1 Crore (10,000,000 Rs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAmount(50000000)}
                    className="px-2 py-1 text-2xs font-semibold rounded-md bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-all border border-surface-container-highest"
                  >
                    5 Crore (50M)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAmount(5000000)}
                    className="px-2 py-1 text-2xs font-semibold rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface transition-all"
                  >
                    50 Lakh (5M)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAmount(1000000)}
                    className="px-2 py-1 text-2xs font-semibold rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface transition-all"
                  >
                    10 Lakh (1M)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAmount(100000)}
                    className="px-2 py-1 text-2xs font-semibold rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface transition-all"
                  >
                    1 Lakh (100K)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAmount(10000)}
                    className="px-2 py-1 text-2xs font-semibold rounded-md bg-surface-container hover:bg-surface-container-high text-secondary transition-all"
                  >
                    10,000
                  </button>
                </div>

                {/* Additive Increments */}
                <div className="flex flex-wrap gap-1 mt-0.5">
                  <span className="text-2xs text-secondary self-center mr-1">Add:</span>
                  {[
                    { label: '+10K', val: 10000 },
                    { label: '+1 Lakh', val: 100000 },
                    { label: '+10 Lakh', val: 1000000 },
                    { label: '+50 Lakh', val: 5000000 },
                    { label: '+1 Crore (10M)', val: 10000000 },
                  ].map(inc => (
                    <button
                      key={inc.label}
                      type="button"
                      onClick={() => setNewAmount(prev => prev + inc.val)}
                      className="px-2 py-0.5 text-2xs font-medium rounded bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors border border-surface-container-high/40"
                    >
                      {inc.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewAmount(0)}
                    className="px-2 py-0.5 text-2xs text-rose-600 hover:underline font-medium ml-auto"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Note / Memo */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm font-medium text-secondary">
                Memo / Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Second installment, Friend loan, Emergency withdrawal..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-xs"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 w-full h-11 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Transaction to Ledger
            </button>
          </form>

          {/* Quick List of Configured Transactions */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container-high/50 shadow-xs flex flex-col gap-space-xs">
            <div className="flex items-center justify-between pb-space-2xs border-b border-surface-container-high/40">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                Configured Transactions ({transactions.length})
              </span>
              <button
                type="button"
                onClick={handleSortChronologically}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Sort by Date
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {calculation.sortedItems.map((tx) => {
                const isCredit = tx.type === 'credit';
                const isEditing = editingId === tx.id;

                if (isEditing) {
                  return (
                    <form
                      key={tx.id}
                      onSubmit={handleSaveEdit}
                      className="p-3 rounded-xl bg-surface-container-high border-2 border-primary/50 shadow-sm space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          Edit Transaction
                        </span>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="text-secondary hover:text-on-surface p-0.5 rounded"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-2xs font-semibold text-secondary">Date</label>
                          <input
                            type="date"
                            value={editDate}
                            onChange={e => setEditDate(e.target.value)}
                            className="w-full h-9 px-2 rounded-md bg-surface-container-lowest border border-outline-variant/60 font-medium text-on-surface"
                          />
                        </div>
                        <div>
                          <label className="text-2xs font-semibold text-secondary">Type</label>
                          <select
                            value={editType}
                            onChange={e => setEditType(e.target.value as CashFlowType)}
                            className="w-full h-9 px-2 rounded-md bg-surface-container-lowest border border-outline-variant/60 font-semibold text-on-surface"
                          >
                            <option value="credit">Received (+)</option>
                            <option value="debit">Taken / Repaid (-)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-2xs font-semibold text-secondary">
                            Amount ({currencyConfig.symbol})
                          </label>
                          {editAmount >= 10000000 && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              ₹1 Crore+ High Value
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="1000000000000"
                          value={editAmount === 0 ? '' : editAmount}
                          onChange={e => setEditAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full h-9 px-2 rounded-md bg-surface-container-lowest border border-outline-variant/60 font-bold text-on-surface"
                        />
                        {editAmount > 0 && (
                          <div className="mt-1 text-2xs font-semibold text-primary">
                            {formatMoney(editAmount)} • {formatIndianDenominationWords(editAmount)}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => setEditAmount(10000000)}
                            className="px-2 py-0.5 text-2xs font-bold rounded bg-primary text-white"
                          >
                            Set 1 Cr (10M)
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditAmount(50000000)}
                            className="px-2 py-0.5 text-2xs font-semibold rounded bg-surface-container-low text-on-surface"
                          >
                            5 Cr
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditAmount(5000000)}
                            className="px-2 py-0.5 text-2xs font-semibold rounded bg-surface-container-low text-on-surface"
                          >
                            50 L
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditAmount(1000000)}
                            className="px-2 py-0.5 text-2xs font-semibold rounded bg-surface-container-low text-on-surface"
                          >
                            10 L
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditAmount(100000)}
                            className="px-2 py-0.5 text-2xs font-semibold rounded bg-surface-container-low text-on-surface"
                          >
                            1 L
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-2xs font-semibold text-secondary">Memo / Note</label>
                        <input
                          type="text"
                          value={editNote}
                          onChange={e => setEditNote(e.target.value)}
                          className="w-full h-8 px-2 rounded-md bg-surface-container-lowest border border-outline-variant/60 text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-surface-container-high">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-3 py-1.5 rounded-md bg-surface-container hover:bg-surface-container-highest text-secondary text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low border border-surface-container-high/40 flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                          isCredit ? 'bg-emerald-500/20 text-emerald-700' : 'bg-rose-500/20 text-rose-700'
                        }`}
                      >
                        {isCredit ? '+' : '−'}
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-on-surface truncate flex items-center gap-1.5">
                          <span>{tx.note}</span>
                          {tx.amount >= 10000000 && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                              Cr
                            </span>
                          )}
                        </div>
                        <div className="text-2xs text-secondary flex items-center gap-1">
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span>{formatIndianDenominationWords(tx.amount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`font-bold ${
                          isCredit ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {isCredit ? '+' : '−'}{formatMoney(tx.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditing(tx)}
                        title="Edit amount / date"
                        className="text-secondary hover:text-primary p-1 rounded hover:bg-surface-container"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateTransaction(tx)}
                        title="Duplicate"
                        className="text-secondary hover:text-on-surface p-1 rounded hover:bg-surface-container"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTransaction(tx.id)}
                        title="Delete"
                        className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Passbook Ledger Table & Visual Curve (7 cols on Desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Visual Balance Progression Curve (SVG) */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high/50 shadow-xs flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">ssid_chart</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Running Balance &amp; Interest Progression
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-primary font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Principal Balance
                </span>
                <span className="flex items-center gap-1 text-tertiary font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span> Accrued Interest
                </span>
              </div>
            </div>

            {/* SVG Visual Stepped Ledger Chart */}
            <div className="w-full h-44 bg-surface-container-low/40 rounded-lg p-2 relative overflow-hidden border border-surface-container-high/40">
              <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="ledgerFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#004ac6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#004ac6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="interestFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#632ecd" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#632ecd" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="0.8" />
                <line x1="0" y1="65" x2="500" y2="65" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="0.8" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#cbd5e1" strokeWidth="1" />

                {/* Chart path generation */}
                {(() => {
                  const allRows = [...calculation.rows];
                  if (calculation.finalIntervalRow) allRows.push(calculation.finalIntervalRow);
                  if (allRows.length === 0) return null;

                  const maxPrincipal = Math.max(1, ...allRows.map(r => r.runningPrincipal));
                  const maxTotal = Math.max(1, ...allRows.map(r => r.runningTotal));
                  const effectiveMax = Math.max(maxPrincipal, maxTotal) * 1.15;

                  const points = allRows.map((r, i) => {
                    const x = allRows.length > 1 ? (i / (allRows.length - 1)) * 480 + 10 : 250;
                    const yPrincipal = 100 - (r.runningPrincipal / effectiveMax) * 85;
                    const yTotal = 100 - (r.runningTotal / effectiveMax) * 85;
                    return { x, yPrincipal, yTotal, row: r };
                  });

                  // Stepped line for principal
                  let principalPath = `M ${points[0].x} ${points[0].yPrincipal}`;
                  for (let i = 1; i < points.length; i++) {
                    principalPath += ` L ${points[i].x} ${points[i - 1].yPrincipal} L ${points[i].x} ${points[i].yPrincipal}`;
                  }

                  // Smooth curve for total with interest
                  let totalPath = `M ${points[0].x} ${points[0].yTotal}`;
                  for (let i = 1; i < points.length; i++) {
                    totalPath += ` L ${points[i].x} ${points[i].yTotal}`;
                  }

                  const areaPath = `${principalPath} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

                  return (
                    <>
                      <path d={areaPath} fill="url(#ledgerFill)" />
                      <path d={principalPath} fill="none" stroke="#004ac6" strokeWidth="2.5" strokeLinecap="round" />
                      <path d={totalPath} fill="none" stroke="#632ecd" strokeWidth="2" strokeDasharray="3 3" />

                      {/* Transaction node dots */}
                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle
                            cx={p.x}
                            cy={p.yPrincipal}
                            r={p.row.type === 'credit' ? 4.5 : 4}
                            fill={p.row.type === 'credit' ? '#10b981' : '#f43f5e'}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="flex items-center justify-between text-2xs text-secondary px-1">
              <span>Start: {calculation.sortedItems[0]?.date || '—'}</span>
              <span>Settlement Horizon: {asOfDate} ({calculation.totalDaysHorizon} elapsed days)</span>
            </div>
          </div>

          {/* Section 3: Detailed Step-by-Step Ledger (Passbook Table or Mobile Cards) */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high/50 shadow-xs overflow-hidden flex flex-col">
            <div className="p-space-md border-b border-surface-container-high/40 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Date-Wise Running Balance &amp; Interest Passbook
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {/* View Mode Toggle: Table vs Cards (Ideal for Android & iOS) */}
                <div className="flex items-center bg-surface-container rounded-lg p-0.5 border border-surface-container-high">
                  <button
                    type="button"
                    onClick={() => setPassbookViewMode('table')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      passbookViewMode === 'table'
                        ? 'bg-surface-container-lowest text-primary shadow-xs'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">table_chart</span>
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassbookViewMode('cards')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      passbookViewMode === 'cards'
                        ? 'bg-surface-container-lowest text-primary shadow-xs'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">view_agenda</span>
                    <span>Cards (Mobile)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-xs shrink-0"
                  title="Download passbook PDF statement"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>

                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container text-secondary shrink-0">
                  {calculation.rows.length + (calculation.finalIntervalRow ? 1 : 0)} entries
                </span>
              </div>
            </div>

            {/* View Mode 1: Mobile-Friendly Cards Stream */}
            {passbookViewMode === 'cards' ? (
              <div className="p-space-md space-y-3 bg-surface-container-low/30">
                {calculation.rows.map((row) => {
                  const isCredit = row.type === 'credit';
                  const isExpanded = expandedRow === row.index;

                  return (
                    <div
                      key={`card-${row.index}`}
                      className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-2.5"
                    >
                      {/* Top Row: Date, Interval, Type */}
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                          <span className="font-bold text-sm text-on-surface">{row.date}</span>
                          {row.daysSinceLast > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-surface-container text-secondary">
                              +{row.daysSinceLast} days
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                              isCredit
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {isCredit ? 'Cash Received (+)' : 'Cash Taken (-)'}
                          </span>
                          {row.originalId && (
                            <button
                              type="button"
                              onClick={() => {
                                const target = transactions.find(t => t.id === row.originalId);
                                if (target) startEditing(target);
                              }}
                              className="p-1 text-secondary hover:text-primary rounded hover:bg-surface-container"
                              title="Edit transaction"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Amount & Description */}
                      <div className="flex items-baseline justify-between gap-2 border-b border-surface-container-high/40 pb-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-on-surface truncate">
                            {row.note}
                          </div>
                          <div className="text-2xs text-secondary truncate">
                            {formatIndianDenominationWords(row.amount)}
                          </div>
                        </div>
                        <div
                          className={`text-base font-extrabold shrink-0 ${
                            isCredit ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {isCredit ? '+' : '−'}{formatMoney(row.amount)}
                        </div>
                      </div>

                      {/* 2x2 Financial Metric Matrix */}
                      <div className="grid grid-cols-2 gap-2 text-2xs">
                        <div className="p-2 rounded-lg bg-surface-container-low/80">
                          <div className="text-secondary font-medium">Period Interest (Accrued)</div>
                          <div className="font-bold text-tertiary text-xs mt-0.5">
                            +{formatMoney(row.periodInterest)}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-surface-container-low/80">
                          <div className="text-secondary font-medium">Running Principal</div>
                          <div className="font-bold text-on-surface text-xs mt-0.5">
                            {formatMoney(row.runningPrincipal)}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-surface-container-low/80">
                          <div className="text-secondary font-medium">Cumulative Interest</div>
                          <div className="font-bold text-on-surface text-xs mt-0.5">
                            {formatMoney(row.cumulativeInterest)}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="text-primary font-semibold">Total Running Balance</div>
                          <div className="font-extrabold text-primary text-xs mt-0.5">
                            {formatMoney(row.runningTotal)}
                          </div>
                        </div>
                      </div>

                      {/* Expand Formula toggle */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setExpandedRow(isExpanded ? null : row.index)}
                          className="text-2xs font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                          {isExpanded ? 'Hide math formula' : 'View accrual formula breakdown'}
                        </button>
                        {isExpanded && (
                          <div className="mt-2 p-2.5 rounded-lg bg-surface-container-high/60 font-mono text-[11px] text-on-surface space-y-1">
                            <div>
                              Period Interest = (Previous Principal) × ({calculation.nominalAnnualRate}% / {dayCountBasis}) × {row.daysSinceLast}d = {formatMoney(row.periodInterest)}
                            </div>
                            <div>
                              New Balance = {formatMoney(row.runningPrincipal)} + {formatMoney(row.cumulativeInterest)} = {formatMoney(row.runningTotal)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Final Settlement Horizon Card */}
                {calculation.finalIntervalRow && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-primary/10 to-surface-container-lowest border-2 border-primary/40 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[18px]">flag</span>
                        <span className="font-bold text-sm text-primary">
                          Settlement Horizon: {calculation.finalIntervalRow.date}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-primary text-on-primary">
                          +{calculation.finalIntervalRow.daysSinceLast} days
                        </span>
                      </div>
                      <span className="text-2xs font-bold uppercase tracking-wider text-primary">
                        Final Maturity
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-2xs pt-1">
                      <div className="p-2 rounded-lg bg-surface-container-lowest border border-primary/20">
                        <div className="text-secondary font-medium">Final Interval Interest</div>
                        <div className="font-bold text-tertiary text-xs mt-0.5">
                          +{formatMoney(calculation.finalIntervalRow.periodInterest)}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-container-lowest border border-primary/20">
                        <div className="text-primary font-semibold">Grand Total Payable/Due</div>
                        <div className="font-black text-primary text-xs mt-0.5">
                          {formatMoney(calculation.grandTotalSettlement)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* View Mode 2: Full Detailed Data Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-low/70 border-b border-surface-container-high/50 text-secondary font-label-sm uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Days (Δt)</th>
                      <th className="py-2.5 px-3 text-right">Inflow (+)</th>
                      <th className="py-2.5 px-3 text-right">Outflow (-)</th>
                      <th className="py-2.5 px-3 text-right">Period Interest</th>
                      <th className="py-2.5 px-3 text-right font-bold text-on-surface">Running Balance</th>
                      <th className="py-2.5 px-2 text-center">Formula</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/40 font-body-sm">
                  {calculation.rows.map((row) => {
                    const isCredit = row.type === 'credit';
                    const isExpanded = expandedRow === row.index;

                    return (
                      <React.Fragment key={row.index}>
                        <tr className="hover:bg-surface-container-low/40 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-on-surface whitespace-nowrap">
                            {row.date}
                          </td>
                          <td className="py-2.5 px-3 text-on-surface-variant max-w-[160px] truncate" title={row.note}>
                            {row.note}
                          </td>
                          <td className="py-2.5 px-3 text-center text-secondary">
                            {row.daysSinceLast > 0 ? (
                              <span className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-2xs">
                                +{row.daysSinceLast}d
                              </span>
                            ) : (
                              <span className="text-outline text-2xs">Day 0</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-semibold whitespace-nowrap">
                            {isCredit ? `+${formatMoney(row.amount)}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-rose-700 dark:text-rose-400 font-semibold whitespace-nowrap">
                            {!isCredit ? `-${formatMoney(row.amount)}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-tertiary font-medium whitespace-nowrap">
                            {row.periodInterest > 0 ? `+${formatMoney(row.periodInterest)}` : '₹0.00'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-on-surface whitespace-nowrap">
                            {formatMoney(row.runningPrincipal)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => setExpandedRow(isExpanded ? null : row.index)}
                              className="text-secondary hover:text-primary p-1 rounded hover:bg-surface-container"
                              title="Show calculation details"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isExpanded ? 'expand_less' : 'help_outline'}
                              </span>
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-surface-container-low/80">
                            <td colSpan={8} className="p-3 text-xs text-on-surface-variant">
                              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 space-y-1 font-mono text-2xs">
                                <div className="font-bold text-primary font-sans text-xs">
                                  Step {row.index} Calculation Breakdown:
                                </div>
                                <div>
                                  &bull; Interval: {row.daysSinceLast} days from previous transaction.
                                </div>
                                <div>
                                  &bull; Balance before this step: {formatMoney(row.runningPrincipal - (isCredit ? row.amount : -row.amount))}
                                </div>
                                <div>
                                  &bull; Accrued Interest Formula: I = Balance × ({calculation.nominalAnnualRate}% / 100) × ({row.daysSinceLast} / {dayCountBasis}) = {formatMoney(row.periodInterest)}
                                </div>
                                <div>
                                  &bull; Cumulative Accrued Interest to Date: {formatMoney(row.cumulativeInterest)}
                                </div>
                                <div>
                                  &bull; Net Running Total (Principal + Cumulative Interest): {formatMoney(row.runningTotal)}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Final Interval up to Settlement Date */}
                  {calculation.finalIntervalRow && (
                    <tr className="bg-primary/5 hover:bg-primary/10 transition-colors border-t border-primary/20">
                      <td className="py-2.5 px-3 font-bold text-primary whitespace-nowrap flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">flag</span>
                        {calculation.finalIntervalRow.date}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-primary">
                        Settlement As-Of Date
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary font-mono text-2xs font-bold">
                          +{calculation.finalIntervalRow.daysSinceLast}d
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-secondary">—</td>
                      <td className="py-2.5 px-3 text-right text-secondary">—</td>
                      <td className="py-2.5 px-3 text-right text-tertiary font-bold whitespace-nowrap">
                        +{formatMoney(calculation.finalIntervalRow.periodInterest)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-primary whitespace-nowrap">
                        {formatMoney(calculation.grandTotalSettlement)}
                      </td>
                      <td className="py-2.5 px-2 text-center text-primary font-bold text-2xs">
                        Final
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Table Footer Totals */}
                <tfoot className="bg-surface-container-low font-semibold text-on-surface border-t-2 border-surface-container-high">
                  <tr>
                    <td className="py-3 px-3" colSpan={2}>
                      Grand Total Summary
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-2xs text-secondary">
                      {calculation.totalDaysHorizon} days
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold whitespace-nowrap">
                      +{formatMoney(calculation.totalInflows)}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-700 dark:text-rose-400 font-bold whitespace-nowrap">
                      -{formatMoney(calculation.totalOutflows)}
                    </td>
                    <td className="py-3 px-3 text-right text-tertiary font-bold whitespace-nowrap">
                      {formatMoney(calculation.totalInterestAccrued)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-primary whitespace-nowrap text-sm">
                      {formatMoney(calculation.grandTotalSettlement)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            )}
          </div>

          {/* Educational Formula & Mathematical Principle Card */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container-high/50 shadow-xs flex flex-col gap-space-xs text-xs">
            <div className="flex items-center gap-2 font-semibold text-on-surface">
              <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
              <span>How Date-to-Date Interest Works:</span>
            </div>
            <p className="text-secondary leading-relaxed">
              When money is added or withdrawn on custom dates, the debt/investment is broken into discrete time slices:
            </p>
            <div className="p-2.5 bg-surface-container-low rounded-lg font-mono text-2xs text-on-surface space-y-1">
              <div>1. For each interval between Date(k-1) and Date(k), elapsed days = Date(k) − Date(k-1).</div>
              <div>2. Period Interest ΔI = (Outstanding Balance) × (Annual Rate / 100) × (Days / {dayCountBasis}).</div>
              <div>3. New Balance = Previous Balance + Inflow (− Outflow).</div>
              <div>4. Final Settlement = Active Principal + Sum of all accrued interval interests up to settlement date.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Ledger Time-Slots Modal */}
      <DateLedgerSlotsModal
        isOpen={isSlotsModalOpen}
        onClose={() => setIsSlotsModalOpen(false)}
        slots={slots}
        onRestoreSlot={handleRestoreSlot}
        onManualSaveSlot={handleManualSaveSlot}
        onDeleteSlot={handleDeleteSlot}
        onClearOldSlots={handleClearOldSlots}
      />
    </div>
  );
};
