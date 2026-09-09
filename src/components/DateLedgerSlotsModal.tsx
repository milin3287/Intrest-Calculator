import React, { useState } from 'react';
import { DateLedgerSlot } from '../types';
import { useApp } from '../context/AppContext';
import { calculateDateLedger, formatIndianDenominationWords } from '../utils/dateLedgerEngine';
import { downloadDateLedgerPDF } from '../utils/dateLedgerPdfGenerator';

interface DateLedgerSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: DateLedgerSlot[];
  onRestoreSlot: (slot: DateLedgerSlot) => void;
  onManualSaveSlot: (customNote: string) => void;
  onDeleteSlot: (id: string) => void;
  onClearOldSlots: () => void;
}

export const DateLedgerSlotsModal: React.FC<DateLedgerSlotsModalProps> = ({
  isOpen,
  onClose,
  slots,
  onRestoreSlot,
  onManualSaveSlot,
  onDeleteSlot,
  onClearOldSlots,
}) => {
  const { formatMoney, triggerToast } = useApp();
  const [filterQuery, setFilterQuery] = useState('');
  const [newSlotNote, setNewSlotNote] = useState('');
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [previewSlotId, setPreviewSlotId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSlots = slots.filter(s => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      s.formattedDate.toLowerCase().includes(q) ||
      s.formattedTime.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotNote.trim()) {
      triggerToast('Please provide a memo or description for this time slot.');
      return;
    }
    onManualSaveSlot(newSlotNote.trim());
    setNewSlotNote('');
    setIsCreatingManual(false);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(slots, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `interestly-time-slots-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Time slots audit log exported to JSON file.');
  };

  const handleDownloadSlotPDF = (slot: DateLedgerSlot) => {
    try {
      const calc = calculateDateLedger({
        items: slot.transactions,
        rate: slot.rate,
        rateType: slot.rateType,
        compoundingMethod: slot.compoundingMethod,
        dayCountBasis: slot.dayCountBasis,
        asOfDate: slot.asOfDate,
      });

      downloadDateLedgerPDF({
        title: `Date-to-Date Statement (Slot ${slot.formattedDate})`,
        subtitle: `Time-Slot Version • ${slot.description || 'Snapshot'}`,
        transactions: slot.transactions,
        calculation: calc,
        rate: slot.rate,
        rateType: slot.rateType,
        compoundingMethod: slot.compoundingMethod,
        dayCountBasis: slot.dayCountBasis,
        asOfDate: slot.asOfDate,
        userRole: slot.userRole,
        slotNote: slot.description,
        slotTimestamp: `${slot.formattedDate} ${slot.formattedTime}`,
      });
      triggerToast(`Downloaded PDF for time-slot (${slot.formattedTime})!`);
    } catch (err) {
      console.error('Error generating slot PDF:', err);
      triggerToast('Could not generate PDF for this slot.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-surface-container-high shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">history</span>
            </div>
            <div>
              <h2 className="text-title-md sm:text-headline-xs font-bold text-on-surface flex items-center gap-2">
                Time-Slot History &amp; Auto-Save Vault
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Zero Data Loss
                </span>
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Every date, time, and change is saved in a distinct slot. Restore any past state anytime.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-surface-container-high bg-surface-container-lowest flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by date, time, or description..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-container text-xs border border-surface-container-high focus:outline-none focus:border-primary text-on-surface"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingManual(!isCreatingManual)}
              className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
              <span>New Slot</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary text-xs font-medium transition-colors flex items-center gap-1"
              title="Download full JSON history"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">Export</span>
            </button>
            {slots.length > 5 && (
              <button
                type="button"
                onClick={onClearOldSlots}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-rose-600 text-xs font-medium transition-colors flex items-center gap-1"
                title="Clean up old slots"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                <span className="hidden sm:inline">Prune</span>
              </button>
            )}
          </div>
        </div>

        {/* Manual Slot Creation Form */}
        {isCreatingManual && (
          <form onSubmit={handleManualSubmit} className="p-3 bg-primary/5 border-b border-primary/20 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Enter slot name or memo (e.g., Before paying ₹1 Crore supplier tranche)..."
              value={newSlotNote}
              onChange={e => setNewSlotNote(e.target.value)}
              className="flex-1 min-w-[240px] px-3 py-1.5 text-xs rounded-lg border border-primary/40 bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90"
            >
              Save Time-Slot
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingManual(false)}
              className="px-2.5 py-1.5 bg-surface-container text-secondary text-xs rounded-lg"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Slots List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 divide-y divide-surface-container-high/60 space-y-2">
          {filteredSlots.length === 0 ? (
            <div className="py-12 text-center text-secondary">
              <span className="material-symbols-outlined text-4xl text-secondary/50">schedule</span>
              <p className="mt-2 text-sm">No saved time slots match your query.</p>
            </div>
          ) : (
            filteredSlots.map((slot, idx) => {
              const isLatest = idx === 0;
              const isPreview = previewSlotId === slot.id;

              return (
                <div
                  key={slot.id}
                  className={`pt-3 pb-3 transition-colors rounded-xl px-2 sm:px-3 ${
                    isLatest ? 'bg-primary/5 border border-primary/20' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isLatest && (
                          <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-primary text-on-primary">
                            CURRENT / LATEST
                          </span>
                        )}
                        <span className="font-mono text-xs font-bold text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
                          {slot.formattedDate}
                        </span>
                        <span className="font-mono text-xs text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">schedule</span>
                          {slot.formattedTime}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-2xs uppercase tracking-wider font-semibold bg-surface-container text-secondary">
                          {slot.trigger.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-on-surface font-semibold">
                        {slot.description}
                      </div>

                      <div className="text-2xs text-secondary flex items-center gap-2 flex-wrap">
                        <span>{slot.transactions.length} transactions</span>
                        <span>&bull;</span>
                        <span>Net Principal: <strong className="text-on-surface">{formatMoney(slot.netPrincipal)}</strong></span>
                        <span>&bull;</span>
                        <span>Interest: <strong className="text-tertiary">+{formatMoney(slot.accruedInterest)}</strong></span>
                        <span>&bull;</span>
                        <span>Total Due: <strong className="text-primary">{formatMoney(slot.grandTotal)}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadSlotPDF(slot)}
                        className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 text-2xs font-semibold"
                        title="Download PDF statement of this time-slot"
                      >
                        <span className="material-symbols-outlined text-[17px] text-primary">picture_as_pdf</span>
                        <span className="hidden sm:inline">PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewSlotId(isPreview ? null : slot.id)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-surface-container hover:bg-surface-container-high text-secondary transition-colors"
                      >
                        {isPreview ? 'Hide' : 'Inspect'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onRestoreSlot(slot);
                          onClose();
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity flex items-center gap-1 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">restore</span>
                        Restore
                      </button>

                      {slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteSlot(slot.id)}
                          className="p-1 rounded-lg text-secondary hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                          title="Delete slot"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Transaction Preview */}
                  {isPreview && (
                    <div className="mt-3 p-3 rounded-lg bg-surface-container-high/50 border border-surface-container-high text-xs space-y-2">
                      <div className="font-bold text-on-surface flex items-center justify-between">
                        <span>Snapshot Transactions ({slot.transactions.length})</span>
                        <span className="text-2xs text-secondary">
                          Rate: {slot.rate}% {slot.rateType} &bull; As of: {slot.asOfDate}
                        </span>
                      </div>
                      <div className="max-h-40 overflow-y-auto divide-y divide-surface-container-high/70">
                        {slot.transactions.map((tx, tIdx) => (
                          <div key={tx.id || tIdx} className="py-1.5 flex items-center justify-between text-2xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-secondary">{tx.date}</span>
                              <span className={tx.type === 'credit' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                {tx.type === 'credit' ? '+ Inflow' : '- Taken'}
                              </span>
                              <span className="text-on-surface truncate max-w-[180px]">{tx.note}</span>
                            </div>
                            <div className="font-bold text-on-surface">
                              {formatMoney(tx.amount)}
                              <span className="text-3xs text-secondary block text-right font-normal">
                                {formatIndianDenominationWords(tx.amount)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 bg-surface-container-low/80 border-t border-surface-container-high flex items-center justify-between text-2xs text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified</span>
            <span>All edits and additions are recorded automatically in local persistent storage.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
