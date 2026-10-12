import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { formatSwissCHF, formatSwissDate, formatSwissQRReference, generateSwissQRReference } from '../../utils/swissQr';
import { BankTransaction } from '../../types';

export const BankReconciliation: React.FC = () => {
  const {
    bankTransactions,
    invoices,
    reconcileTransaction,
    rejectTransactionMatch,
    importBankTransactions,
    addToast
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'all' | 'unmatched' | 'matched'>('all');
  const [manualMatchModalTx, setManualMatchModalTx] = useState<BankTransaction | null>(null);

  const matchedCount = bankTransactions.filter(t => t.status === 'matched').length;
  const pendingCount = bankTransactions.filter(t => t.status === 'unmatched' || t.status === 'ambiguous').length;
  const totalReconciledCHF = bankTransactions
    .filter(t => t.status === 'matched')
    .reduce((sum, t) => sum + t.amountCHF, 0);

  const filteredTransactions = bankTransactions.filter(t => {
    if (filterStatus === 'matched') return t.status === 'matched';
    if (filterStatus === 'unmatched') return t.status !== 'matched';
    return true;
  });

  const handleSimulateLoadCAMT = () => {
    // Generate realistic CAMT.053 transactions matching current invoices!
    const openInvoices = invoices.filter(i => i.status !== 'paid');
    const newTxs: BankTransaction[] = [];

    if (openInvoices.length > 0) {
      const inv = openInvoices[0];
      newTxs.push({
        id: `btx-camt-${Date.now()}-1`,
        transactionId: `TX-CAMT053-CH-${Math.floor(1000 + Math.random() * 9000)}`,
        bookingDate: new Date().toISOString().split('T')[0],
        amountCHF: inv.totalAmountCHF - inv.paidAmountCHF,
        creditorName: 'DanseFlow GmbH',
        debtorName: inv.studentName,
        debtorIBAN: 'CH58 0024 0240 9102 3841 2',
        paymentReference: inv.qrReference,
        remittanceInfo: `ISO 20022 CAMT.053 / QRR ${formatSwissQRReference(inv.qrReference)}`,
        status: 'matched',
        matchedInvoiceId: inv.id,
        confidenceScore: 100,
        matchReason: '100% Exact Swiss QR Reference match via PostFinance clearing'
      });
    }

    // Add another generic incoming
    newTxs.push({
      id: `btx-camt-${Date.now()}-2`,
      transactionId: `TX-CAMT053-CH-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingDate: new Date().toISOString().split('T')[0],
      amountCHF: 280.00,
      creditorName: 'DanseFlow GmbH',
      debtorName: 'Martina Bachmann',
      debtorIBAN: 'CH79 0070 0110 0012 9481 0',
      paymentReference: '',
      remittanceInfo: 'Drop-In 10 Pass Dance Class Lea',
      status: 'unmatched',
      confidenceScore: 40,
      matchReason: 'Debtor name found in student contacts; no exact QR reference'
    });

    importBankTransactions(newTxs);
  };

  const handleConfirmMatch = (tx: BankTransaction) => {
    if (!tx.matchedInvoiceId) return;
    reconcileTransaction(tx.id, tx.matchedInvoiceId);
  };

  const handleConfirmAllHighConfidence = () => {
    let count = 0;
    bankTransactions.forEach(tx => {
      if (tx.status !== 'matched' && tx.matchedInvoiceId && (tx.confidenceScore || 0) >= 85) {
        reconcileTransaction(tx.id, tx.matchedInvoiceId);
        count++;
      }
    });

    if (count > 0) {
      addToast({
        type: 'success',
        title: 'Batch reconciliation completed',
        message: `${count} payments verified and applied to student invoices.`
      });
    } else {
      addToast({
        type: 'info',
        title: 'No pending high-confidence matches',
        message: 'All confident payments have already been reconciled.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Bank Payment Reconciliation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automatic CAMT.053 & CSV bank statement processing with Swiss QR reference matching.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulateLoadCAMT}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-violet-600" />
            <span>Load Sample CAMT.053 Bank File</span>
          </button>

          <button
            onClick={handleConfirmAllHighConfidence}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Confirm High-Confidence Matches</span>
          </button>
        </div>
      </div>

      {/* Reconciliation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reconciled Volume</span>
          <p className="text-xl font-bold text-emerald-700 font-mono-num mt-1">
            CHF {formatSwissCHF(totalReconciledCHF)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">{matchedCount} transactions cleared</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Review Queue</span>
          <p className="text-xl font-bold text-amber-800 font-mono-num mt-1">
            {pendingCount} Pending
          </p>
          <span className="text-[11px] text-amber-600 mt-1 block">Requires staff confirmation or manual link</span>
        </div>

        <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-700">Clearing Engine</span>
          <p className="text-sm font-bold text-violet-950 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ISO 20022 CAMT.053 Active</span>
          </p>
          <span className="text-[11px] text-violet-600 mt-1 block">PostFinance & SIX Swiss Interbank Clearing</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {(['all', 'unmatched', 'matched'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filterStatus === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredTransactions.length} transactions
        </span>
      </div>

      {/* Transactions Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Booking Date & ID</th>
                <th className="py-3 px-4">Debtor / Counterparty</th>
                <th className="py-3 px-4">Remittance / Reference</th>
                <th className="py-3 px-4 text-right">Amount (CHF)</th>
                <th className="py-3 px-4">Suggested Match</th>
                <th className="py-3 px-4 text-center">Confidence</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.map(tx => {
                const matchedInv = tx.matchedInvoiceId ? invoices.find(i => i.id === tx.matchedInvoiceId) : null;
                const isReconciled = tx.status === 'matched';
                const score = tx.confidenceScore || 0;

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block font-mono-num">
                        {formatSwissDate(tx.bookingDate)}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{tx.transactionId}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{tx.debtorName}</span>
                      <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                        {tx.debtorIBAN}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-700 text-xs truncate" title={tx.remittanceInfo}>
                        {tx.remittanceInfo}
                      </p>
                      {tx.paymentReference && (
                        <span className="text-[10px] font-mono text-violet-600 block">
                          QRR: ••••• {tx.paymentReference.slice(-6)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-slate-900 text-sm">
                      CHF {formatSwissCHF(tx.amountCHF)}
                    </td>

                    <td className="py-3.5 px-4">
                      {matchedInv ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900">{matchedInv.invoiceNumber}</span>
                            <span className="text-[10px] text-slate-400">({matchedInv.studentName})</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">{tx.matchReason}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No automated invoice link</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        score >= 90 ? 'bg-emerald-100 text-emerald-800' :
                        score >= 60 ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {score}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isReconciled ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {matchedInv && (
                            <button
                              onClick={() => handleConfirmMatch(tx)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-sm transition active:scale-95"
                            >
                              Confirm
                            </button>
                          )}
                          <button
                            onClick={() => setManualMatchModalTx(tx)}
                            className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
                          >
                            Link...
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Match Selector Modal */}
      {manualMatchModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Manually Link Bank Transaction</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  CHF {formatSwissCHF(manualMatchModalTx.amountCHF)} from {manualMatchModalTx.debtorName}
                </p>
              </div>
              <button onClick={() => setManualMatchModalTx(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-600">Select the open invoice to match this bank transfer to:</p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {invoices.filter(i => i.status !== 'paid').map(inv => (
                <div
                  key={inv.id}
                  onClick={() => {
                    reconcileTransaction(manualMatchModalTx.id, inv.id);
                    setManualMatchModalTx(null);
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:bg-violet-50/70 hover:border-violet-300 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold font-mono text-slate-900">{inv.invoiceNumber}</span>
                    <span className="text-slate-600 ml-2 font-semibold">{inv.studentName}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{inv.billingPeriod} • Due {formatSwissDate(inv.dueDate)}</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    CHF {formatSwissCHF(inv.totalAmountCHF - inv.paidAmountCHF)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setManualMatchModalTx(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
