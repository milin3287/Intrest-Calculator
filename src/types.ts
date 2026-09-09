export const PagePath = {
  HOME: 'home',
  CALCULATORS: 'calculators',
  SOLVER: 'advanced-solver',
  LOAN_EMI: 'loan-and-emi',
  INVESTMENT: 'investment',
  DATE_LEDGER: 'date-ledger',
  MONTHLY_VAULT: 'monthly-vault',
  HISTORY: 'history',
  LEARN: 'learn',
} as const;

export type PagePath = (typeof PagePath)[keyof typeof PagePath];

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rateAgainstINR: number; // 1 INR in target currency
}

export type CashFlowType = 'credit' | 'debit'; // credit = received/inflow (+), debit = taken/repaid/outflow (-)

export interface DateCashFlowItem {
  id: string;
  date: string; // YYYY-MM-DD
  type: CashFlowType;
  amount: number;
  note: string;
}

export interface DateLedgerRow {
  index: number;
  date: string;
  note: string;
  type: CashFlowType;
  amount: number;
  daysSinceLast: number;
  periodInterest: number;
  cumulativeInterest: number;
  runningPrincipal: number;
  runningTotal: number;
  originalId?: string;
}

export interface DateLedgerSlot {
  id: string;
  timestamp: string; // ISO string
  formattedDate: string; // e.g. "2026-09-08"
  formattedTime: string; // e.g. "15:45:10"
  trigger: 'auto_change' | 'manual_save' | 'restore' | 'preset';
  description: string;
  transactions: DateCashFlowItem[];
  rate: number;
  rateType: 'annual' | 'monthly';
  compoundingMethod: 'simple' | 'daily_compounding';
  dayCountBasis: 365 | 360;
  asOfDate: string;
  userRole: 'borrower' | 'lender';
  netPrincipal: number;
  accruedInterest: number;
  grandTotal: number;
}

export interface MonthlyLedgerBook {
  id: string;
  monthKey: string; // "YYYY-MM", e.g. "2026-09"
  monthTitle: string; // e.g. "September 2026"
  bookTitle: string; // e.g. "September 2026 Borrowing & Inflows"
  note?: string;
  createdAt: string;
  updatedAt: string;
  transactions: DateCashFlowItem[];
  rate: number;
  rateType: 'annual' | 'monthly';
  compoundingMethod: 'simple' | 'daily_compounding';
  dayCountBasis: 365 | 360;
  asOfDate: string;
  userRole: 'borrower' | 'lender';
  openingPrincipal: number;
  totalInflows: number;
  totalOutflows: number;
  netPrincipal: number;
  accruedInterest: number;
  grandSettlement: number;
}

export interface MonthlyStatementBucket {
  monthKey: string; // "YYYY-MM"
  monthLabel: string; // "September 2026"
  items: DateCashFlowItem[];
  inflows: number;
  outflows: number;
  netMovement: number;
  estimatedInterest: number;
  closingBalance: number;
}

export interface CalculationAuditItem {
  id: string;
  category: 'Advanced Solver' | 'Loan EMI' | 'Investment' | 'Compound Interest' | 'Simple Interest' | 'Date-to-Date Ledger';
  title: string;
  principal: number;
  rate: number;
  tenureYears: number;
  frequency?: number | string;
  resultValue: number;
  resultFormatted: string;
  formula: string;
  timestamp: string;
  details: {
    label: string;
    value: string;
  }[];
}
