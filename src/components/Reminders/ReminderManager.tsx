import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BellRing,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  Languages,
  X,
  Sparkles
} from 'lucide-react';
import { formatSwissCHF, formatSwissDate, formatSwissQRReference } from '../../utils/swissQr';
import { Invoice } from '../../types';

export const ReminderManager: React.FC = () => {
  const {
    invoices,
    students,
    reminderLogs,
    sendReminder,
    settings
  } = useApp();

  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'DE' | 'FR'>('DE');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const overdueInvoices = invoices.filter(i => i.status === 'overdue');

  const templates = {
    DE: {
      subject: (invNum: string) => `Zahlungserinnerung: Rechnung ${invNum} — ${settings.name}`,
      body: (name: string, invNum: string, amt: string, due: string) =>
        `Sehr geehrte/r ${name},\n\nWir möchten Sie höflich daran erinnern, dass die Rechnung ${invNum} über CHF ${amt} per ${due} fällig war.\n\nBitte überweisen Sie den ausstehenden Betrag bequem mit dem beiliegenden Schweizer QR-Einzahlungsschein.\n\nSollten Sie die Zahlung bereits veranlasst haben, betrachten Sie diese Erinnerung bitte als gegenstandslos.\n\nFreundliche Grüsse,\n${settings.creditorName}`
    },
    EN: {
      subject: (invNum: string) => `Payment Reminder: Invoice ${invNum} — ${settings.name}`,
      body: (name: string, invNum: string, amt: string, due: string) =>
        `Dear ${name},\n\nThis is a polite reminder that invoice ${invNum} in the amount of CHF ${amt} was due on ${due}.\n\nPlease remit payment using the attached official Swiss QR-bill at your earliest convenience.\n\nIf you have already settled this balance, kindly disregard this notice.\n\nWarm regards,\n${settings.creditorName}`
    },
    FR: {
      subject: (invNum: string) => `Rappel de paiement : Facture ${invNum} — ${settings.name}`,
      body: (name: string, invNum: string, amt: string, due: string) =>
        `Chère/Cher ${name},\n\nNous vous rappelons que la facture ${invNum} d'un montant de CHF ${amt} était payable au ${due}.\n\nNous vous prions de bien vouloir régler ce solde au moyen de la facture QR suisse jointe.\n\nSi le règlement a déjà été effectué, veuillez ignorer ce message.\n\nAvec nos salutations les meilleures,\n${settings.creditorName}`
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Overdue Payment Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Polite Swiss dunning notices, automated template preview in German/French/English, and dispatch logs.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {(['DE', 'EN', 'FR'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                selectedLanguage === lang
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Overdue Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-sm text-rose-950">
              Invoices Requiring Reminder Notice ({overdueInvoices.length})
            </h3>
          </div>
          <span className="text-xs text-rose-700 font-semibold">Excludes settled invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Student & Billing Contact</th>
                <th className="py-3 px-4">Original Due Date</th>
                <th className="py-3 px-4 text-right">Outstanding CHF</th>
                <th className="py-3 px-4 text-center">Reminders Sent</th>
                <th className="py-3 px-4 text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {overdueInvoices.length > 0 ? (
                overdueInvoices.map(inv => {
                  const student = students.find(s => s.id === inv.studentId);
                  const recipient = student?.guardianEmail || student?.email || 'email@example.ch';
                  const balanceDue = inv.totalAmountCHF - inv.paidAmountCHF;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">{inv.studentName}</span>
                        <span className="block text-[11px] text-slate-400">
                          {student?.guardianName ? `Parent: ${student.guardianName} • ` : ''}{recipient}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono-num text-rose-600 font-semibold">
                        {formatSwissDate(inv.dueDate)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono-num font-bold text-rose-600 text-sm">
                        CHF {formatSwissCHF(balanceDue)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                          {inv.reminderCount || 0} sent
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewInvoice(inv)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => sendReminder(inv.id, 'first_notice')}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] shadow-sm transition flex items-center gap-1 active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Notice</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No overdue invoices at this time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reminder Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Dispatched Reminder History</h3>
          <span className="text-xs text-slate-400">{reminderLogs.length} simulated notifications</span>
        </div>

        <div className="divide-y divide-slate-100">
          {reminderLogs.length > 0 ? (
            reminderLogs.map(log => {
              const inv = invoices.find(i => i.id === log.invoiceId);
              return (
                <div key={log.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{inv?.studentName}</span>
                      <span className="font-mono text-[10px] text-slate-400">({inv?.invoiceNumber})</span>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-full">
                        Delivered (Simulated)
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      To: {log.recipientEmail} • {log.note}
                    </p>
                  </div>

                  <span className="font-mono-num text-slate-400 text-[11px]">
                    {formatSwissDate(log.sentAt.split('T')[0])}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No reminders have been dispatched yet.
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Reminder Preview ({selectedLanguage})</h3>
                <p className="text-slate-400 text-[11px]">Recipient: {previewInvoice.studentName}</p>
              </div>
              <button onClick={() => setPreviewInvoice(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs whitespace-pre-line text-slate-800 leading-relaxed">
              <strong className="block mb-2 font-sans font-bold text-slate-900">
                Subject: {templates[selectedLanguage].subject(previewInvoice.invoiceNumber)}
              </strong>
              {templates[selectedLanguage].body(
                previewInvoice.studentName,
                previewInvoice.invoiceNumber,
                formatSwissCHF(previewInvoice.totalAmountCHF - previewInvoice.paidAmountCHF),
                formatSwissDate(previewInvoice.dueDate)
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setPreviewInvoice(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  sendReminder(previewInvoice.id, 'first_notice');
                  setPreviewInvoice(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reminder Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
