import { DateCashFlowItem, DateLedgerRow, CashFlowType } from '../types';

/**
 * Normalizes date string to YYYY-MM-DD
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates calendar days between two YYYY-MM-DD date strings
 */
export function getDaysBetween(date1Str: string, date2Str: string): number {
  const [y1, m1, d1] = date1Str.split('-').map(Number);
  const [y2, m2, d2] = date2Str.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / msPerDay);
}

/**
 * Adds offset days to a YYYY-MM-DD date string
 */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatDateISO(date);
}

export interface DateLedgerCalculationParams {
  items: DateCashFlowItem[];
  rate: number; // nominal percentage
  rateType: 'annual' | 'monthly'; // 'annual' = % p.a., 'monthly' = % p.m.
  compoundingMethod: 'simple' | 'daily_compounding';
  dayCountBasis: 365 | 360;
  asOfDate: string; // YYYY-MM-DD target settlement/calculation date
}

export interface DateLedgerResult {
  sortedItems: DateCashFlowItem[];
  rows: DateLedgerRow[];
  finalIntervalRow: DateLedgerRow | null;
  totalInflows: number; // Total Received
  totalOutflows: number; // Total Taken / Repaid
  netPrincipalBalance: number;
  totalInterestAccrued: number;
  grandTotalSettlement: number;
  totalDaysHorizon: number;
  effectiveAnnualRate: number;
  nominalAnnualRate: number;
  averageDailyInterest: number;
}

export function calculateDateLedger(params: DateLedgerCalculationParams): DateLedgerResult {
  const { items, rate, rateType, compoundingMethod, dayCountBasis, asOfDate } = params;

  // Convert monthly rate to annual if needed
  const nominalAnnualRate = rateType === 'monthly' ? rate * 12 : rate;
  const rDecimal = nominalAnnualRate / 100;

  // Sort items chronologically
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) {
    return {
      sortedItems: [],
      rows: [],
      finalIntervalRow: null,
      totalInflows: 0,
      totalOutflows: 0,
      netPrincipalBalance: 0,
      totalInterestAccrued: 0,
      grandTotalSettlement: 0,
      totalDaysHorizon: 0,
      effectiveAnnualRate: nominalAnnualRate,
      nominalAnnualRate,
      averageDailyInterest: 0,
    };
  }

  let runningPrincipal = 0;
  let cumulativeInterest = 0;
  let totalInflows = 0;
  let totalOutflows = 0;
  const rows: DateLedgerRow[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const prevDate = i === 0 ? item.date : sorted[i - 1].date;
    const daysElapsed = Math.max(0, getDaysBetween(prevDate, item.date));

    // Calculate interest accrued on previous running balance during the elapsed interval
    let periodInterest = 0;
    if (daysElapsed > 0 && runningPrincipal > 0) {
      if (compoundingMethod === 'simple') {
        periodInterest = runningPrincipal * rDecimal * (daysElapsed / dayCountBasis);
      } else {
        // Daily compounding: P * ((1 + r/basis)^days - 1)
        periodInterest = runningPrincipal * (Math.pow(1 + rDecimal / dayCountBasis, daysElapsed) - 1);
      }
    }

    cumulativeInterest += periodInterest;

    // Apply transaction
    if (item.type === 'credit') {
      runningPrincipal += item.amount;
      totalInflows += item.amount;
    } else {
      runningPrincipal -= item.amount;
      totalOutflows += item.amount;
    }

    rows.push({
      index: i + 1,
      date: item.date,
      note: item.note || (item.type === 'credit' ? 'Cash Received' : 'Cash Taken / Repaid'),
      type: item.type,
      amount: item.amount,
      daysSinceLast: daysElapsed,
      periodInterest,
      cumulativeInterest,
      runningPrincipal,
      runningTotal: runningPrincipal + cumulativeInterest,
      originalId: item.id,
    });
  }

  // Final interval up to asOfDate
  let finalIntervalRow: DateLedgerRow | null = null;
  const lastDate = sorted[sorted.length - 1].date;
  const daysToAsOf = getDaysBetween(lastDate, asOfDate);

  let finalPeriodInterest = 0;
  if (daysToAsOf > 0 && runningPrincipal > 0) {
    if (compoundingMethod === 'simple') {
      finalPeriodInterest = runningPrincipal * rDecimal * (daysToAsOf / dayCountBasis);
    } else {
      finalPeriodInterest = runningPrincipal * (Math.pow(1 + rDecimal / dayCountBasis, daysToAsOf) - 1);
    }
  }

  const finalCumulativeInterest = cumulativeInterest + finalPeriodInterest;
  const startDate = sorted[0].date;
  const totalDaysHorizon = Math.max(0, getDaysBetween(startDate, asOfDate >= lastDate ? asOfDate : lastDate));

  if (daysToAsOf > 0) {
    finalIntervalRow = {
      index: sorted.length + 1,
      date: asOfDate,
      note: 'Settlement / Calculation As Of Date',
      type: 'credit',
      amount: 0,
      daysSinceLast: daysToAsOf,
      periodInterest: finalPeriodInterest,
      cumulativeInterest: finalCumulativeInterest,
      runningPrincipal,
      runningTotal: runningPrincipal + finalCumulativeInterest,
    };
  }

  const grandTotalSettlement = runningPrincipal + finalCumulativeInterest;
  const averageDailyInterest = totalDaysHorizon > 0 ? finalCumulativeInterest / totalDaysHorizon : 0;
  const effectiveAnnualRate =
    compoundingMethod === 'daily_compounding'
      ? (Math.pow(1 + rDecimal / dayCountBasis, dayCountBasis) - 1) * 100
      : nominalAnnualRate;

  return {
    sortedItems: sorted,
    rows,
    finalIntervalRow,
    totalInflows,
    totalOutflows,
    netPrincipalBalance: runningPrincipal,
    totalInterestAccrued: finalCumulativeInterest,
    grandTotalSettlement,
    totalDaysHorizon,
    effectiveAnnualRate,
    nominalAnnualRate,
    averageDailyInterest,
  };
}

/**
 * Generates downloadable CSV content of the running ledger
 */
export function exportLedgerToCSV(
  result: DateLedgerResult,
  currencySymbol: string,
  asOfDate: string
): string {
  const headers = [
    '#',
    'Date',
    'Description',
    'Type',
    'Amount',
    'Days in Interval',
    'Period Interest Accrued',
    'Cumulative Interest',
    'Running Principal',
    'Net Closing Balance',
  ];

  const lines: string[] = [];
  lines.push(`"Date-to-Date Cash Flow & Running Interest Ledger"`);
  lines.push(`"Calculation As Of","${asOfDate}"`);
  lines.push(`"Nominal Rate","${result.nominalAnnualRate.toFixed(2)}% p.a."`);
  lines.push(`"Total Inflows","${currencySymbol}${result.totalInflows.toFixed(2)}"`);
  lines.push(`"Total Outflows","${currencySymbol}${result.totalOutflows.toFixed(2)}"`);
  lines.push(`"Net Principal","${currencySymbol}${result.netPrincipalBalance.toFixed(2)}"`);
  lines.push(`"Total Interest","${currencySymbol}${result.totalInterestAccrued.toFixed(2)}"`);
  lines.push(`"Grand Settlement Balance","${currencySymbol}${result.grandTotalSettlement.toFixed(2)}"`);
  lines.push('');
  lines.push(headers.map(h => `"${h}"`).join(','));

  result.rows.forEach(r => {
    lines.push(
      [
        r.index,
        r.date,
        `"${r.note.replace(/"/g, '""')}"`,
        r.type === 'credit' ? 'Received (+)' : 'Taken (-)',
        r.amount.toFixed(2),
        r.daysSinceLast,
        r.periodInterest.toFixed(2),
        r.cumulativeInterest.toFixed(2),
        r.runningPrincipal.toFixed(2),
        r.runningTotal.toFixed(2),
      ].join(',')
    );
  });

  if (result.finalIntervalRow) {
    const f = result.finalIntervalRow;
    lines.push(
      [
        f.index,
        f.date,
        `"${f.note.replace(/"/g, '""')}"`,
        'Accrual Interval',
        '0.00',
        f.daysSinceLast,
        f.periodInterest.toFixed(2),
        f.cumulativeInterest.toFixed(2),
        f.runningPrincipal.toFixed(2),
        f.runningTotal.toFixed(2),
      ].join(',')
    );
  }

  return lines.join('\n');
}

/**
 * Returns human-readable denomination in Indian numbering system (Crores & Lakhs)
 * along with Millions for international clarity.
 * e.g. 10000000 -> "1 Crore (10 Million Rupees)"
 */
export function formatIndianDenominationWords(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) return '';
  
  if (amount >= 10000000) {
    const crores = amount / 10000000;
    const millions = amount / 1000000;
    const crFormatted = crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2).replace(/\.?0+$/, '');
    const mFormatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1).replace(/\.?0+$/, '');
    return `${crFormatted} Crore${crores > 1 ? 's' : ''} (${mFormatted} Million)`;
  }
  
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    const lakhFormatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2).replace(/\.?0+$/, '');
    return `${lakhFormatted} Lakh${lakhs > 1 ? 's' : ''}`;
  }
  
  if (amount >= 1000) {
    const thousands = amount / 1000;
    const kFormatted = thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1).replace(/\.?0+$/, '');
    return `${kFormatted} Thousand`;
  }
  
  return `${amount.toLocaleString('en-IN')}`;
}

