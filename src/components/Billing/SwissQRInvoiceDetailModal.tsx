import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  Download,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Building,
  FileText,
  Share2
} from 'lucide-react';
import {
  formatSwissCHF,
  formatSwissDate,
  formatSwissQRReference,
  formatIBAN,
  buildSwissQRPayload,
  generateSwissQRCodeDataURL
} from '../../utils/swissQr';

interface SwissQRInvoiceDetailModalProps {
  invoiceId: string | null;
  onClose: () => void;
}

export const SwissQRInvoiceDetailModal: React.FC<SwissQRInvoiceDetailModalProps> = ({
  invoiceId,
  onClose
}) => {
  const {
    invoices,
    students,
    settings,
    recordPayment,
    sendReminder,
    updateInvoiceStatus
  } = useApp();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const invoice = invoices.find(i => i.id === invoiceId);
  const student = invoice ? students.find(s => s.id === invoice.studentId) : null;

  // Generate real SIX Swiss Payments Code (SPC) QR Code
  useEffect(() => {
    if (!invoice || !student) return;

    const debtorName = student.guardianName || `${student.firstName} ${student.lastName}`;

    const payload = buildSwissQRPayload({
      creditor: {
        iban: settings.qrIban || settings.iban,
        name: settings.creditorName,
        street: settings.street,
        postalCode: settings.postalCode,
        city: settings.city,
        country: 'CH'
      },
      debtor: {
        name: debtorName,
        street: student.street || 'Strasse 1',
        postalCode: student.postalCode || '8000',
        city: student.city || 'Zürich',
        country: 'CH'
      },
      amount: invoice.totalAmountCHF,
      currency: 'CHF',
      reference: invoice.qrReference,
      referenceType: 'QRR',
      unstructuredMessage: `Invoice ${invoice.invoiceNumber} ${invoice.billingPeriod}`,
      billInformation: `//S1/10/${invoice.invoiceNumber}`
    });

    generateSwissQRCodeDataURL(payload).then(dataUrl => {
      setQrCodeDataUrl(dataUrl);
    });
  }, [invoice, student, settings]);

  if (!invoice || !student) return null;

  const openBalance = Math.max(0, invoice.totalAmountCHF - invoice.paidAmountCHF);
  const debtorName = student.guardianName || `${student.firstName} ${student.lastName}`;

  const handlePrint = () => {
    window.print();
  };

  const handleApplyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmountInput);
    if (isNaN(amt) || amt <= 0) return;
    recordPayment(invoice.id, amt, 'Manual counter/e-banking payment');
    setShowPaymentForm(false);
    setPaymentAmountInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl my-4 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Action Top Bar (Hidden during print) */}
        <div className="no-print px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm bg-violet-600 px-2.5 py-1 rounded-lg">
              {invoice.invoiceNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{invoice.studentName}</span>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  invoice.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300' :
                  invoice.status === 'overdue' ? 'bg-rose-500/20 text-rose-300' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  {invoice.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Swiss QR-Bill (SIX Swiss Payment Standards 2.0)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {openBalance > 0 && (
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                Record Payment
              </button>
            )}

            {invoice.status === 'overdue' && (
              <button
                onClick={() => sendReminder(invoice.id, 'first_notice')}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reminder</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Payment Input Popover if opened */}
        {showPaymentForm && (
          <div className="no-print bg-emerald-50 border-b border-emerald-100 p-4">
            <form onSubmit={handleApplyPayment} className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-emerald-900">Apply Payment to Invoice:</span>
              <div className="flex items-center gap-1">
                <span className="text-emerald-700 font-bold">CHF</span>
                <input
                  type="number"
                  step="0.05"
                  max={openBalance}
                  value={paymentAmountInput}
                  onChange={e => setPaymentAmountInput(e.target.value)}
                  placeholder={openBalance.toFixed(2)}
                  className="w-28 px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs font-mono bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
              >
                Confirm Payment
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="text-slate-500 hover:underline text-xs"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* PRINTABLE A4 INVOICE CONTAINER */}
        <div id="printable-invoice" className="p-8 sm:p-10 max-h-[80vh] overflow-y-auto bg-white text-slate-900 text-xs">
          {/* Invoice Header: School & Debtor */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-8 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  DF
                </div>
                <span className="font-bold text-base tracking-tight text-slate-900">{settings.name}</span>
              </div>
              <p className="text-slate-600">{settings.legalName}</p>
              <p className="text-slate-600">{settings.street}</p>
              <p className="text-slate-600">{settings.postalCode} {settings.city}, Switzerland</p>
              <p className="text-slate-500 mt-1">{settings.email} • {settings.phone}</p>
              <p className="text-slate-400 font-mono text-[11px] mt-1">UID: CHE-341.890.112 MWST ({settings.taxRatePercent}%)</p>
            </div>

            <div className="text-left sm:text-right">
              <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">INVOICE / RECHNUNG</h2>
              <p className="font-mono font-bold text-sm text-violet-700 mt-1">{invoice.invoiceNumber}</p>
              <div className="mt-3 space-y-1 text-slate-600">
                <p>Issue Date: <strong className="text-slate-900">{formatSwissDate(invoice.issueDate)}</strong></p>
                <p>Due Date: <strong className="text-slate-900">{formatSwissDate(invoice.dueDate)}</strong></p>
                <p>Billing Term: <span className="font-medium">{invoice.billingPeriod}</span></p>
              </div>
            </div>
          </div>

          {/* Billed To Debtor Box */}
          <div className="py-6 flex justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Billed To / Rechnungsempfänger:
              </p>
              <p className="font-bold text-sm text-slate-900">{debtorName}</p>
              <p className="text-slate-600">{student.street}</p>
              <p className="text-slate-600">{student.postalCode} {student.city}</p>
              <p className="text-slate-600">Switzerland</p>
              <p className="text-slate-500 mt-1">Student ID: {student.studentId} ({student.firstName} {student.lastName})</p>
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Method</p>
              <p className="font-semibold text-slate-800">Swiss QR-Bill (SIX Standard)</p>
              <p className="text-slate-500">PostFinance & all Swiss Banks</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mt-4 mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-[11px]">
                  <th className="py-2.5">Position / Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Amount (CHF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-medium text-slate-900">{item.description}</td>
                    <td className="py-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 text-right font-mono-num text-slate-600">CHF {formatSwissCHF(item.unitPriceCHF)}</td>
                    <td className="py-3 text-right font-mono-num font-bold text-slate-900">CHF {formatSwissCHF(item.totalCHF)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Subtotal and Discount */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono-num">CHF {formatSwissCHF(invoice.subtotalCHF)}</span>
                </div>
                {invoice.discountCHF > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount / Sibling rebate:</span>
                    <span className="font-mono-num">- CHF {formatSwissCHF(invoice.discountCHF)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-900 flex justify-between font-bold text-base text-slate-900">
                  <span>Total Amount Due:</span>
                  <span className="font-mono-num text-violet-700">CHF {formatSwissCHF(invoice.totalAmountCHF)}</span>
                </div>
                {invoice.paidAmountCHF > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium pt-1">
                    <span>Paid to date:</span>
                    <span className="font-mono-num">CHF {formatSwissCHF(invoice.paidAmountCHF)}</span>
                  </div>
                )}
                {openBalance > 0 && invoice.paidAmountCHF > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold pt-1">
                    <span>Remaining Balance:</span>
                    <span className="font-mono-num">CHF {formatSwissCHF(openBalance)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mb-8 space-y-1">
            <p><strong>Payment terms:</strong> {invoice.paymentTerms}</p>
            <p>Please use the QR-reference number below for e-banking and automatic reconciliation.</p>
          </div>

          {/* OFFICIAL SIX SWISS QR-BILL SECTION (Empfangsschein & Zahlteil) */}
          <div className="mt-8 border-t-2 border-dashed border-slate-400 pt-4 bg-white relative">
            {/* Scissor perforation indicator */}
            <div className="text-[10px] text-slate-400 mb-2 flex items-center justify-between font-mono">
              <span>✂ Perforation / Bitte hier abtrennen</span>
              <span>Swiss Payment Standard 2.0 (SPS)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[360px] border border-slate-300 rounded-lg p-5">
              {/* Left Column: Empfangsschein (Receipt Slip) - 4 cols */}
              <div className="md:col-span-4 border-r-0 md:border-r border-slate-300 pr-0 md:pr-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                    Empfangsschein / Récépissé
                  </h3>

                  <div className="space-y-2.5 text-[11px]">
                    <div>
                      <p className="font-bold text-slate-400 uppercase text-[9px]">Konto / Zahlbar an</p>
                      <p className="font-mono font-bold text-slate-900">{formatIBAN(settings.qrIban || settings.iban)}</p>
                      <p className="text-slate-800">{settings.creditorName}</p>
                      <p className="text-slate-600">{settings.street}</p>
                      <p className="text-slate-600">{settings.postalCode} {settings.city}</p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-400 uppercase text-[9px]">Referenz</p>
                      <p className="font-mono font-medium text-slate-900 break-all text-[10px]">
                        {formatSwissQRReference(invoice.qrReference)}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-400 uppercase text-[9px]">Zahlbar durch</p>
                      <p className="font-medium text-slate-900">{debtorName}</p>
                      <p className="text-slate-600">{student.street}</p>
                      <p className="text-slate-600">{student.postalCode} {student.city}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-end">
                  <div>
                    <span className="font-bold text-[9px] uppercase text-slate-400 block">Währung</span>
                    <span className="font-bold text-xs text-slate-900">CHF</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[9px] uppercase text-slate-400 block">Betrag</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {formatSwissCHF(invoice.totalAmountCHF)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Zahlteil (Payment Part) - 8 cols */}
              <div className="md:col-span-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                    Zahlteil / Section paiement
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* QR Code with official Swiss Cross */}
                    <div className="flex flex-col items-center sm:items-start">
                      <div className="relative w-44 h-44 bg-white p-1 border border-slate-200 rounded-lg shadow-sm flex items-center justify-center">
                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt="Swiss QR Code"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-[10px] text-slate-400">
                            Generating Swiss QR...
                          </div>
                        )}

                        {/* Official Swiss Cross centered emblem overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-7 h-7 bg-black rounded flex items-center justify-center ring-2 ring-white shadow">
                            <div className="relative w-4 h-4">
                              <div className="absolute inset-x-1.5 top-0 bottom-0 bg-white" />
                              <div className="absolute inset-y-1.5 left-0 right-0 bg-white" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-end gap-6 text-xs">
                        <div>
                          <span className="font-bold text-[9px] uppercase text-slate-400 block">Währung</span>
                          <span className="font-bold text-sm text-slate-900">CHF</span>
                        </div>
                        <div>
                          <span className="font-bold text-[9px] uppercase text-slate-400 block">Betrag</span>
                          <span className="font-mono font-bold text-base text-slate-900">
                            {formatSwissCHF(invoice.totalAmountCHF)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Creditor, Reference and Debtor Details */}
                    <div className="space-y-2.5 text-[11px]">
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Konto / Zahlbar an</p>
                        <p className="font-mono font-bold text-slate-900">{formatIBAN(settings.qrIban || settings.iban)}</p>
                        <p className="text-slate-800">{settings.creditorName}</p>
                        <p className="text-slate-600">{settings.street}</p>
                        <p className="text-slate-600">{settings.postalCode} {settings.city}</p>
                      </div>

                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Referenz / Référence</p>
                        <p className="font-mono font-bold text-slate-900 text-xs">
                          {formatSwissQRReference(invoice.qrReference)}
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Zusätzliche Informationen</p>
                        <p className="text-slate-700">Invoice {invoice.invoiceNumber} {invoice.billingPeriod}</p>
                      </div>

                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Zahlbar durch</p>
                        <p className="font-medium text-slate-900">{debtorName}</p>
                        <p className="text-slate-600">{student.street}</p>
                        <p className="text-slate-600">{student.postalCode} {student.city}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
