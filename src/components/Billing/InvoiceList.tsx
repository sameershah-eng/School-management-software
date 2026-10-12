import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { formatSwissCHF, formatSwissDate } from '../../utils/swissQr';

interface InvoiceListProps {
  onOpenCreateInvoice: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ onOpenCreateInvoice }) => {
  const {
    invoices,
    setSelectedInvoiceId,
    settings
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (periodFilter !== 'all' && inv.billingPeriod !== periodFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchName = inv.studentName.toLowerCase().includes(q);
      const matchPeriod = inv.billingPeriod.toLowerCase().includes(q);
      return matchNum || matchName || matchPeriod;
    }
    return true;
  });

  // Financial statistics
  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmountCHF, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmountCHF, 0);
  const totalOutstanding = invoices
    .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + (i.totalAmountCHF - i.paidAmountCHF), 0);
  const totalOverdue = invoices
    .filter(i => i.status === 'overdue')
    .reduce((sum, i) => sum + (i.totalAmountCHF - i.paidAmountCHF), 0);

  const periods = Array.from(new Set(invoices.map(i => i.billingPeriod)));

  const exportCSV = () => {
    const headers = ['InvoiceNumber', 'StudentName', 'Period', 'IssueDate', 'DueDate', 'TotalCHF', 'PaidCHF', 'Status', 'QRReference'];
    const rows = filteredInvoices.map(i => [
      i.invoiceNumber,
      `"${i.studentName}"`,
      `"${i.billingPeriod}"`,
      i.issueDate,
      i.dueDate,
      i.totalAmountCHF,
      i.paidAmountCHF,
      i.status,
      i.qrReference
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DanseFlow_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Billing & Swiss QR-Bills
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Compliant Swiss QR invoicing, tuition tracking, partial payments, and overdue controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenCreateInvoice}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Billed</span>
          <p className="text-xl font-bold text-slate-900 font-mono-num mt-1">
            CHF {formatSwissCHF(totalBilled)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">{invoices.length} total invoices issued</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Settled Payments</span>
          <p className="text-xl font-bold text-emerald-700 font-mono-num mt-1">
            CHF {formatSwissCHF(totalPaid)}
          </p>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            {((totalPaid / (totalBilled || 1)) * 100).toFixed(0)}% collection rate
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Open Receivables</span>
          <p className="text-xl font-bold text-amber-800 font-mono-num mt-1">
            CHF {formatSwissCHF(totalOutstanding)}
          </p>
          <span className="text-[11px] text-amber-600 mt-1 block">Pending term fees</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">Overdue Balance</span>
          <p className="text-xl font-bold text-rose-700 font-mono-num mt-1">
            CHF {formatSwissCHF(totalOverdue)}
          </p>
          <span className="text-[11px] text-rose-600 mt-1 block">
            {invoices.filter(i => i.status === 'overdue').length} overdue accounts
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number (e.g. INV-2026-0040), student name, or term..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 font-medium focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="issued">Issued / Unpaid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid in Full</option>
            <option value="overdue">Overdue</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 font-medium focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Terms & Periods</option>
            {periods.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Student Debtor</th>
                <th className="py-3 px-4">Billing Term</th>
                <th className="py-3 px-4">Issue & Due Date</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map(inv => {
                  const balanceDue = inv.totalAmountCHF - inv.paidAmountCHF;
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoiceId(inv.id)}
                      className="hover:bg-slate-50/70 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 group-hover:text-violet-600 transition">
                          {inv.invoiceNumber}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          QRR ••••• {inv.qrReference.slice(-6)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">{inv.studentName}</span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {inv.billingPeriod}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <span>Issued: {formatSwissDate(inv.issueDate)}</span>
                        <span className="block text-[11px] text-slate-400">
                          Due: {formatSwissDate(inv.dueDate)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono-num font-bold text-slate-900">
                        CHF {formatSwissCHF(inv.totalAmountCHF)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono-num font-semibold">
                        {balanceDue > 0 ? (
                          <span className={inv.status === 'overdue' ? 'text-rose-600' : 'text-slate-800'}>
                            CHF {formatSwissCHF(balanceDue)}
                          </span>
                        ) : (
                          <span className="text-emerald-600">CHF 0.00</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'overdue' ? 'bg-rose-100 text-rose-800' :
                          inv.status === 'partially_paid' ? 'bg-amber-100 text-amber-800' :
                          'bg-violet-100 text-violet-800'
                        }`}>
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedInvoiceId(inv.id);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-700 font-semibold text-[11px] transition flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>QR-Bill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No invoices match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
