import { DateCashFlowItem, DateLedgerSlot, MonthlyLedgerBook, MonthlyStatementBucket } from '../types';
import { calculateDateLedger } from './dateLedgerEngine';

const ACTIVE_LEDGER_KEY = 'interestly_active_custom_date_ledger';
const SLOTS_STORAGE_KEY = 'interestly_date_ledger_slots';
const MONTHLY_BOOKS_KEY = 'interestly_monthly_books';

export interface ActiveLedgerState {
  transactions: DateCashFlowItem[];
  rate: number;
  rateType: 'annual' | 'monthly';
  compoundingMethod: 'simple' | 'daily_compounding';
  dayCountBasis: 365 | 360;
  asOfDate: string;
  userRole: 'borrower' | 'lender';
  lastSavedAt: string;
}

const DEFAULT_ACTIVE_LEDGER: ActiveLedgerState = {
  transactions: [],
  rate: 12.0,
  rateType: 'annual',
  compoundingMethod: 'simple',
  dayCountBasis: 365,
  asOfDate: new Date().toISOString().split('T')[0],
  userRole: 'borrower',
  lastSavedAt: new Date().toISOString(),
};

/**
 * Load the active working ledger state from localStorage
 */
export function getActiveLedger(): ActiveLedgerState {
  try {
    const raw = localStorage.getItem(ACTIVE_LEDGER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions)) {
        // Filter out legacy sample transactions if present
        const cleanedTransactions = parsed.transactions.filter(
          (tx: DateCashFlowItem) =>
            !tx.id?.startsWith('tx-init-') &&
            !tx.note?.includes('Initial Capital Tranche')
        );
        return {
          ...parsed,
          transactions: cleanedTransactions,
        };
      }
    }
  } catch (err) {
    console.error('Failed to load active ledger:', err);
  }
  return DEFAULT_ACTIVE_LEDGER;
}

/**
 * Save the active working ledger state to localStorage
 */
export function saveActiveLedger(state: ActiveLedgerState): void {
  try {
    localStorage.setItem(
      ACTIVE_LEDGER_KEY,
      JSON.stringify({ ...state, lastSavedAt: new Date().toISOString() })
    );
  } catch (err) {
    console.error('Failed to save active ledger:', err);
  }
}

/**
 * Fetch all historical auto-saved and manual time slots
 */
export function getLedgerSlots(): DateLedgerSlot[] {
  try {
    const raw = localStorage.getItem(SLOTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy sample slots with hardcoded 1 Crore
        const filtered = parsed.filter(
          (s: DateLedgerSlot) =>
            !s.description?.includes('₹1 Crore Capital Scenario') &&
            !s.id?.startsWith('SLOT-INIT')
        );
        return filtered;
      }
    }
  } catch (err) {
    console.error('Failed to parse slots:', err);
  }

  // If empty, return empty list without filling default amounts
  return [];
}

function saveLedgerSlots(slots: DateLedgerSlot[]): void {
  try {
    // Keep up to 120 most recent versioned slots to avoid quota overflow
    const trimmed = slots.slice(0, 120);
    localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save slots:', err);
  }
}

function createInitialSlot(): DateLedgerSlot {
  const now = new Date();
  const def = DEFAULT_ACTIVE_LEDGER;
  const calc = calculateDateLedger({
    items: def.transactions,
    rate: def.rate,
    rateType: def.rateType,
    compoundingMethod: def.compoundingMethod,
    dayCountBasis: def.dayCountBasis,
    asOfDate: def.asOfDate,
  });

  return {
    id: `SLOT-${now.getTime().toString(36).toUpperCase()}`,
    timestamp: now.toISOString(),
    formattedDate: now.toISOString().split('T')[0],
    formattedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
    trigger: 'preset',
    description: 'Initial Baseline Ledger (₹1 Crore Capital Scenario)',
    transactions: def.transactions,
    rate: def.rate,
    rateType: def.rateType,
    compoundingMethod: def.compoundingMethod,
    dayCountBasis: def.dayCountBasis,
    asOfDate: def.asOfDate,
    userRole: def.userRole,
    netPrincipal: calc.netPrincipalBalance,
    accruedInterest: calc.totalInterestAccrued,
    grandTotal: calc.grandTotalSettlement,
  };
}

/**
 * Record a new distinct time-slot snapshot every time a change occurs
 */
export function recordLedgerSlot(params: {
  trigger: 'auto_change' | 'manual_save' | 'restore' | 'preset';
  description: string;
  transactions: DateCashFlowItem[];
  rate: number;
  rateType: 'annual' | 'monthly';
  compoundingMethod: 'simple' | 'daily_compounding';
  dayCountBasis: 365 | 360;
  asOfDate: string;
  userRole: 'borrower' | 'lender';
}): DateLedgerSlot {
  const now = new Date();
  const calc = calculateDateLedger({
    items: params.transactions,
    rate: params.rate,
    rateType: params.rateType,
    compoundingMethod: params.compoundingMethod,
    dayCountBasis: params.dayCountBasis,
    asOfDate: params.asOfDate,
  });

  const newSlot: DateLedgerSlot = {
    id: `SLOT-${now.getTime().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now.toISOString(),
    formattedDate: now.toISOString().split('T')[0],
    formattedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
    trigger: params.trigger,
    description: params.description,
    transactions: JSON.parse(JSON.stringify(params.transactions)),
    rate: params.rate,
    rateType: params.rateType,
    compoundingMethod: params.compoundingMethod,
    dayCountBasis: params.dayCountBasis,
    asOfDate: params.asOfDate,
    userRole: params.userRole,
    netPrincipal: calc.netPrincipalBalance,
    accruedInterest: calc.totalInterestAccrued,
    grandTotal: calc.grandTotalSettlement,
  };

  const existing = getLedgerSlots();
  // Don't duplicate if identical to most recent within 1 second
  if (existing.length > 0) {
    const latest = existing[0];
    const isSameTime = latest.formattedTime === newSlot.formattedTime && latest.formattedDate === newSlot.formattedDate;
    const isSameDesc = latest.description === newSlot.description;
    if (isSameTime && isSameDesc) {
      return latest;
    }
  }

  const updated = [newSlot, ...existing];
  saveLedgerSlots(updated);
  return newSlot;
}

/**
 * Delete a specific slot
 */
export function deleteLedgerSlot(id: string): DateLedgerSlot[] {
  const slots = getLedgerSlots().filter(s => s.id !== id);
  saveLedgerSlots(slots);
  return slots;
}

/**
 * Clear all slots except current
 */
export function clearAllLedgerSlots(keepLatest = true): DateLedgerSlot[] {
  const existing = getLedgerSlots();
  const retained = keepLatest && existing.length > 0 ? [existing[0]] : [];
  saveLedgerSlots(retained);
  return retained;
}

/* =========================================================================
   SPECIAL SPACE: MONTHLY LEDGER BOOKS & MONTHLY DATA
   ========================================================================= */

const INITIAL_MONTHLY_BOOKS: MonthlyLedgerBook[] = [];

/**
 * Retrieve all saved monthly books from storage
 */
export function getMonthlyBooks(): MonthlyLedgerBook[] {
  try {
    const raw = localStorage.getItem(MONTHLY_BOOKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out legacy sample books
        const filtered = parsed.filter(
          (b: MonthlyLedgerBook) =>
            b.id !== 'BOOK-2026-09-TRK' && b.id !== 'BOOK-2026-08-ARC'
        );
        return filtered;
      }
    }
  } catch (err) {
    console.error('Failed to load monthly books:', err);
  }

  return [];
}

/**
 * Persist monthly books array to localStorage
 */
export function saveMonthlyBooks(books: MonthlyLedgerBook[]): void {
  try {
    localStorage.setItem(MONTHLY_BOOKS_KEY, JSON.stringify(books));
  } catch (err) {
    console.error('Failed to save monthly books:', err);
  }
}

/**
 * Create or save a new monthly ledger book
 */
export function saveOrUpdateMonthlyBook(book: Omit<MonthlyLedgerBook, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): MonthlyLedgerBook {
  const books = getMonthlyBooks();
  const now = new Date().toISOString();

  if (book.id) {
    const existingIndex = books.findIndex(b => b.id === book.id);
    if (existingIndex >= 0) {
      const updated: MonthlyLedgerBook = {
        ...books[existingIndex],
        ...book,
        id: book.id,
        updatedAt: now,
      };
      books[existingIndex] = updated;
      saveMonthlyBooks(books);
      return updated;
    }
  }

  // New book
  const newBook: MonthlyLedgerBook = {
    ...book,
    id: `BOOK-${Date.now().toString(36).toUpperCase()}`,
    createdAt: now,
    updatedAt: now,
  };
  const updatedList = [newBook, ...books];
  saveMonthlyBooks(updatedList);
  return newBook;
}

/**
 * Delete a monthly book by ID
 */
export function deleteMonthlyBook(id: string): MonthlyLedgerBook[] {
  const updated = getMonthlyBooks().filter(b => b.id !== id);
  saveMonthlyBooks(updated);
  return updated;
}

/**
 * Group any list of custom date transactions into distinct calendar monthly statement buckets
 */
export function computeMonthlyStatementBuckets(
  items: DateCashFlowItem[],
  rate: number,
  rateType: 'annual' | 'monthly' = 'annual',
  dayCountBasis: 365 | 360 = 365
): MonthlyStatementBucket[] {
  if (!items || items.length === 0) return [];

  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  const groups = new Map<string, DateCashFlowItem[]>();

  for (const item of sorted) {
    const monthKey = item.date.substring(0, 7); // "YYYY-MM"
    if (!groups.has(monthKey)) {
      groups.set(monthKey, []);
    }
    groups.get(monthKey)!.push(item);
  }

  const sortedMonthKeys = Array.from(groups.keys()).sort();
  const buckets: MonthlyStatementBucket[] = [];
  let runningBalance = 0;

  const annualRate = rateType === 'monthly' ? rate * 12 : rate;
  const dailyRate = (annualRate / 100) / dayCountBasis;

  for (const key of sortedMonthKeys) {
    const monthItems = groups.get(key)!;
    const [yearStr, monthStr] = key.split('-');
    const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, 1);
    const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    let monthInflows = 0;
    let monthOutflows = 0;

    // Approximate monthly accrued interest: calculate interval-based
    let monthInterest = 0;
    let currentBal = runningBalance;
    let lastDay = 1;

    for (const item of monthItems) {
      const itemDay = Number(item.date.split('-')[2]);
      const daysElapsed = Math.max(0, itemDay - lastDay);
      if (daysElapsed > 0 && currentBal > 0) {
        monthInterest += currentBal * dailyRate * daysElapsed;
      }

      if (item.type === 'credit') {
        monthInflows += item.amount;
        currentBal += item.amount;
      } else {
        monthOutflows += item.amount;
        currentBal -= item.amount;
      }
      lastDay = itemDay;
    }

    // Days remaining in month
    const daysInMonth = new Date(Number(yearStr), Number(monthStr), 0).getDate();
    const remainingDays = Math.max(0, daysInMonth - lastDay);
    if (remainingDays > 0 && currentBal > 0) {
      monthInterest += currentBal * dailyRate * remainingDays;
    }

    runningBalance = currentBal;

    buckets.push({
      monthKey: key,
      monthLabel,
      items: monthItems,
      inflows: monthInflows,
      outflows: monthOutflows,
      netMovement: monthInflows - monthOutflows,
      estimatedInterest: Math.round(monthInterest),
      closingBalance: runningBalance,
    });
  }

  return buckets;
}

/**
 * Export full JSON backup of all slots and monthly data
 */
export function exportCustomDatesBackup(): string {
  const active = getActiveLedger();
  const slots = getLedgerSlots();
  const monthlyBooks = getMonthlyBooks();

  const backupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appName: 'Interestly Custom Dates Infrastructure',
    activeLedger: active,
    timeSlots: slots,
    monthlyBooks: monthlyBooks,
  };

  return JSON.stringify(backupData, null, 2);
}

/**
 * Restore from JSON backup string
 */
export function importCustomDatesBackup(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (data.activeLedger && Array.isArray(data.activeLedger.transactions)) {
      saveActiveLedger(data.activeLedger);
    }
    if (Array.isArray(data.timeSlots)) {
      saveLedgerSlots(data.timeSlots);
    }
    if (Array.isArray(data.monthlyBooks)) {
      saveMonthlyBooks(data.monthlyBooks);
    }
    return { success: true, message: 'All Custom Dates data, time slots, and monthly books successfully restored!' };
  } catch (err: any) {
    return { success: false, message: `Invalid backup file: ${err?.message || 'Parse error'}` };
  }
}
