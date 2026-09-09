import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DateCashFlowItem, MonthlyStatementBucket } from '../types';
import { DateLedgerResult, formatIndianDenominationWords } from './dateLedgerEngine';

export interface DateLedgerPDFOptions {
  title?: string;
  subtitle?: string;
  transactions: DateCashFlowItem[];
  calculation: DateLedgerResult;
  rate: number;
  rateType: 'annual' | 'monthly';
  compoundingMethod: 'simple' | 'daily_compounding';
  dayCountBasis: 365 | 360;
  asOfDate: string;
  userRole: 'borrower' | 'lender';
  slotNote?: string;
  slotTimestamp?: string;
}

// Helper to format rupees cleanly in PDF without encoding issues
function formatPdfCurrency(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}Rs. ${formatted}`;
}

export function downloadDateLedgerPDF(options: DateLedgerPDFOptions): void {
  const {
    title = 'Date-to-Date Cash Flow & Interest Statement',
    subtitle = 'Comprehensive Multi-Tranche Running Passbook Ledger',
    transactions,
    calculation,
    rate,
    rateType,
    compoundingMethod,
    dayCountBasis,
    asOfDate,
    userRole,
    slotNote,
    slotTimestamp,
  } = options;

  // Create A4 portrait document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let cursorY = margin;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(0, 74, 198); // #004ac6 primary blue
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Header Section
  cursorY = 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INTERESTLY', margin, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('FINANCIAL DATE-TO-DATE ENGINE', margin + 37, cursorY - 1);

  // Document Title
  cursorY += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text(title, margin, cursorY);

  cursorY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle, margin, cursorY);

  // Metadata Box (Right Side)
  const metaBoxX = pageWidth - margin - 75;
  const metaBoxY = 12;
  const metaBoxW = 75;
  const metaBoxH = 24;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(metaBoxX, metaBoxY, metaBoxW, metaBoxH, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('STATEMENT DETAILS', metaBoxX + 4, metaBoxY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const nowStr = slotTimestamp || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  doc.text(`Generated: ${nowStr}`, metaBoxX + 4, metaBoxY + 9.5);
  doc.text(`Settlement As-Of: ${asOfDate}`, metaBoxX + 4, metaBoxY + 13.5);
  doc.text(
    `Rate: ${rate.toFixed(2)}% ${rateType === 'annual' ? 'p.a.' : 'monthly'} (${dayCountBasis}d)`,
    metaBoxX + 4,
    metaBoxY + 17.5
  );
  doc.text(
    `Method: ${compoundingMethod === 'simple' ? 'Simple Interest' : 'Daily Compounding'} | Role: ${userRole.toUpperCase()}`,
    metaBoxX + 4,
    metaBoxY + 21.5
  );

  // 3. Executive Financial Summary Cards
  cursorY = 41;

  if (slotNote) {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 8, 1.5, 1.5, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(`Note / Version: ${slotNote}`, margin + 3, cursorY + 5);
    cursorY += 11;
  }

  // Draw 4 Metrics Summary Boxes
  const cardGap = 3;
  const cardWidth = (pageWidth - margin * 2 - cardGap * 3) / 4;
  const cardHeight = 19;

  // Metric 1: Total Inflows
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.roundedRect(margin, cursorY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('TOTAL INFLOWS (+)', margin + 3, cursorY + 4.5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text(formatPdfCurrency(calculation.totalInflows), margin + 3, cursorY + 10.5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text(`${calculation.rows.filter(r => r.type === 'credit').length} receipts`, margin + 3, cursorY + 15);

  // Metric 2: Total Outflows
  const m2X = margin + cardWidth + cardGap;
  doc.setFillColor(255, 241, 242); // rose-50
  doc.setDrawColor(254, 205, 211); // rose-200
  doc.roundedRect(m2X, cursorY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text('TOTAL OUTFLOWS (-)', m2X + 3, cursorY + 4.5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(159, 18, 57);
  doc.text(formatPdfCurrency(calculation.totalOutflows), m2X + 3, cursorY + 10.5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(244, 63, 94);
  doc.text(`${calculation.rows.filter(r => r.type === 'debit').length} withdrawals/taken`, m2X + 3, cursorY + 15);

  // Metric 3: Total Accrued Interest
  const m3X = margin + (cardWidth + cardGap) * 2;
  doc.setFillColor(245, 243, 255); // purple-50
  doc.setDrawColor(221, 214, 254); // purple-200
  doc.roundedRect(m3X, cursorY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(124, 58, 237);
  doc.text('ACCRUED INTEREST', m3X + 3, cursorY + 4.5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(91, 33, 182);
  doc.text(formatPdfCurrency(calculation.totalInterestAccrued), m3X + 3, cursorY + 10.5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(139, 92, 246);
  doc.text(`Over ${calculation.totalDaysHorizon} total days`, m3X + 3, cursorY + 15);

  // Metric 4: Grand Settlement Balance
  const m4X = margin + (cardWidth + cardGap) * 3;
  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.roundedRect(m4X, cursorY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216);
  doc.text('GRAND SETTLEMENT', m4X + 3, cursorY + 4.5);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(formatPdfCurrency(calculation.grandTotalSettlement), m4X + 3, cursorY + 10.5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(37, 99, 235);
  doc.text('Net Principal + Interest', m4X + 3, cursorY + 15);

  cursorY += cardHeight + 4;

  // Grand Settlement Words Banner
  const settlementWords = formatIndianDenominationWords(calculation.grandTotalSettlement);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 7.5, 1, 1, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('SETTLEMENT SUM IN WORDS:', margin + 3, cursorY + 4.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(settlementWords, margin + 44, cursorY + 4.8);

  cursorY += 11;

  // 4. Section 1 Header: Cash Flow Transactions Schedule
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Cash Flow Transactions Schedule', margin, cursorY);
  cursorY += 2.5;

  const txsTableData = transactions
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((tx, idx) => [
      String(idx + 1),
      tx.date,
      tx.type === 'credit' ? 'Cash Received (+)' : 'Cash Taken / Repaid (-)',
      tx.note || (tx.type === 'credit' ? 'Receipt' : 'Withdrawal'),
      formatPdfCurrency(tx.amount),
      formatIndianDenominationWords(tx.amount),
    ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['#', 'Date', 'Cash Flow Type', 'Description / Memo', 'Amount', 'Denomination']],
    body: txsTableData,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22, fontStyle: 'bold' },
      2: { cellWidth: 38 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 36, fontStyle: 'italic', textColor: [100, 116, 139] },
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 2) {
        const text = String(data.cell.raw);
        if (text.includes('Received')) {
          data.cell.styles.textColor = [5, 150, 105]; // emerald-600
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [225, 29, 72]; // rose-600
          data.cell.styles.fontStyle = 'bold';
        }
      }
      if (data.section === 'body' && data.column.index === 4) {
        const typeCell = data.row.cells[2];
        if (typeCell && String(typeCell.raw).includes('Received')) {
          data.cell.styles.textColor = [4, 120, 87];
        } else {
          data.cell.styles.textColor = [190, 18, 60];
        }
      }
    },
  });

  // Get position after transactions table
  const finalY1 = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : cursorY + 40;
  cursorY = finalY1 + 8;

  // If close to bottom of page, start fresh page for passbook
  if (cursorY > pageHeight - 55) {
    doc.addPage();
    cursorY = 16;
  }

  // 5. Section 2 Header: Day-by-Day Running Passbook Ledger
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Day-by-Day Running Interest Passbook Ledger', margin, cursorY);
  cursorY += 2.5;

  const ledgerRows = calculation.rows.map((row) => [
    `#${row.index}`,
    row.date,
    row.daysSinceLast > 0 ? `+${row.daysSinceLast} d` : 'Day 0',
    row.type === 'credit'
      ? `+${formatPdfCurrency(row.amount)}`
      : `-${formatPdfCurrency(row.amount)}`,
    formatPdfCurrency(row.runningPrincipal),
    row.periodInterest > 0 ? formatPdfCurrency(row.periodInterest) : 'Rs. 0.00',
    formatPdfCurrency(row.cumulativeInterest),
    formatPdfCurrency(row.runningTotal),
  ]);

  if (calculation.finalIntervalRow) {
    const fRow = calculation.finalIntervalRow;
    ledgerRows.push([
      'AS-OF',
      `${fRow.date} (Settlement)`,
      `+${fRow.daysSinceLast} d`,
      'As-Of Accrual',
      formatPdfCurrency(fRow.runningPrincipal),
      formatPdfCurrency(fRow.periodInterest),
      formatPdfCurrency(fRow.cumulativeInterest),
      formatPdfCurrency(fRow.runningTotal),
    ]);
  }

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [
      [
        'Step',
        'Date',
        'Interval',
        'Cash Flow',
        'Running Principal',
        'Period Interest',
        'Total Interest',
        'Running Settlement',
      ],
    ],
    body: ledgerRows,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 26, halign: 'right' },
      4: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 23, halign: 'right' },
      6: { cellWidth: 23, halign: 'right', textColor: [124, 58, 237] },
      7: { cellWidth: 26, halign: 'right', fontStyle: 'bold', textColor: [0, 74, 198] },
    },
    didParseCell: function (data) {
      // Highlight As-of row
      if (data.section === 'body' && data.row.index === ledgerRows.length - 1 && calculation.finalIntervalRow) {
        data.cell.styles.fillColor = [238, 242, 255]; // indigo-50
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const finalY2 = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : cursorY + 60;
  let summaryBoxY = finalY2 + 6;

  if (summaryBoxY > pageHeight - 35) {
    doc.addPage();
    summaryBoxY = 16;
  }

  // 6. Final Legal & Engine Certification Note
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, summaryBoxY, pageWidth - margin * 2, 16, 1.5, 1.5, 'FD');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('AUDIT & CALCULATION PRINCIPLES:', margin + 3, summaryBoxY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `• Day count basis: ${dayCountBasis} days per year (${(rate / dayCountBasis).toFixed(5)}% per day at ${rate}% ${rateType}). Interest is computed on daily elapsed time between staggered dates.`,
    margin + 3,
    summaryBoxY + 8
  );
  doc.text(
    `• Net Principal: Rs. ${calculation.netPrincipalBalance.toLocaleString('en-IN')} | Total Interest Accrued: Rs. ${calculation.totalInterestAccrued.toLocaleString('en-IN')}. Settlement Amount: Rs. ${calculation.grandTotalSettlement.toLocaleString('en-IN')}.`,
    margin + 3,
    summaryBoxY + 11.5
  );
  doc.text(
    `• Generated by Interestly Financial Suite. Certified mathematical output. Verified safe for personal, peer-to-peer, and commercial bookkeeping.`,
    margin + 3,
    summaryBoxY + 14.5
  );

  // 7. Add Page Footers across all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Interestly — Precision Date-to-Date Financial Engine', margin, pageHeight - 5.5);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - doc.getTextWidth(`Page ${i} of ${totalPages}`),
      pageHeight - 5.5
    );
  }

  // Trigger browser download
  const cleanDateStr = new Date().toISOString().split('T')[0];
  const filename = `interestly-custom-dates-statement-${cleanDateStr}.pdf`;
  doc.save(filename);
}

// Download dedicated monthly statement PDF
export function downloadMonthlyBucketPDF(
  bucket: MonthlyStatementBucket,
  rateInfo: {
    rate: number;
    rateType: 'annual' | 'monthly';
    dayCountBasis: 365 | 360;
  }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let cursorY = margin;

  // Header band
  doc.setFillColor(0, 74, 198);
  doc.rect(0, 0, pageWidth, 5, 'F');

  cursorY = 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text('INTERESTLY — MONTHLY SPECIAL SPACE', margin, cursorY);

  cursorY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text(`Monthly Financial Statement — ${bucket.monthLabel}`, margin, cursorY);

  cursorY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Month Key: ${bucket.monthKey} • Base Rate: ${rateInfo.rate}% ${rateInfo.rateType} (${rateInfo.dayCountBasis}d)`,
    margin,
    cursorY
  );

  // Summary Metrics Row
  cursorY += 7;
  const cardGap = 3;
  const cardWidth = (pageWidth - margin * 2 - cardGap * 3) / 4;
  const cardH = 17;

  // Inflows
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, cursorY, cardWidth, cardH, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('MONTH INFLOWS', margin + 3, cursorY + 4.5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPdfCurrency(bucket.inflows), margin + 3, cursorY + 10.5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(formatIndianDenominationWords(bucket.inflows), margin + 3, cursorY + 14.5);

  // Outflows
  const c2X = margin + cardWidth + cardGap;
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(c2X, cursorY, cardWidth, cardH, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text('MONTH OUTFLOWS', c2X + 3, cursorY + 4.5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPdfCurrency(bucket.outflows), c2X + 3, cursorY + 10.5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(formatIndianDenominationWords(bucket.outflows), c2X + 3, cursorY + 14.5);

  // Net Movement
  const c3X = margin + (cardWidth + cardGap) * 2;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(c3X, cursorY, cardWidth, cardH, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text('NET MOVEMENT', c3X + 3, cursorY + 4.5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPdfCurrency(bucket.netMovement), c3X + 3, cursorY + 10.5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Inflows minus Outflows', c3X + 3, cursorY + 14.5);

  // Closing Balance
  const c4X = margin + (cardWidth + cardGap) * 3;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(c4X, cursorY, cardWidth, cardH, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216);
  doc.text('CLOSING BALANCE', c4X + 3, cursorY + 4.5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPdfCurrency(bucket.closingBalance), c4X + 3, cursorY + 10.5);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(formatIndianDenominationWords(bucket.closingBalance), c4X + 3, cursorY + 14.5);

  cursorY += cardH + 7;

  // Transactions table
  const tableData = bucket.items.map((item, idx) => [
    String(idx + 1),
    item.date,
    item.type === 'credit' ? 'Cash Received (+)' : 'Cash Taken / Repaid (-)',
    item.note,
    formatPdfCurrency(item.amount),
    formatIndianDenominationWords(item.amount),
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['#', 'Date', 'Type', 'Description', 'Amount', 'Words']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 24, fontStyle: 'bold' },
      2: { cellWidth: 38 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 36, fontStyle: 'italic', textColor: [100, 116, 139] },
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 2) {
        const text = String(data.cell.raw);
        if (text.includes('Received')) {
          data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Interestly — Monthly Statement (${bucket.monthLabel})`, margin, pageHeight - 5.5);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - doc.getTextWidth(`Page ${i} of ${totalPages}`),
      pageHeight - 5.5
    );
  }

  doc.save(`interestly-monthly-statement-${bucket.monthKey}.pdf`);
}
