import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Receipt, Plus, Trash2, Calculator, Calendar } from 'lucide-react';
import { InvoiceItem } from '../../types';
import { formatSwissCHF } from '../../utils/swissQr';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose }) => {
  const { students, classes, pricingRules, createInvoice, invoices, settings } = useApp();

  const [studentId, setStudentId] = useState<string>(students[0]?.id || '');
  const [billingPeriod, setBillingPeriod] = useState<string>('Q2 2026 (Apr–Jun)');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discountCHF, setDiscountCHF] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Payment due within 30 days via Swiss QR-bill or e-Banking.');

  const [duplicateWarning, setDuplicateWarning] = useState<boolean>(false);

  // Auto-populate line items based on selected student and enrolled classes
  useEffect(() => {
    if (!studentId) return;

    const selectedStu = students.find(s => s.id === studentId);
    if (!selectedStu) return;

    // Check duplicate invoice for same student and period
    const exists = invoices.some(i => i.studentId === studentId && i.billingPeriod === billingPeriod && i.status !== 'cancelled');
    setDuplicateWarning(exists);

    // Compute age
    const birthYear = new Date(selectedStu.dateOfBirth).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    const weeklyCount = selectedStu.assignedClassIds.length;

    // Find applicable rule or generate standard lines
    const enrolledClasses = classes.filter(c => selectedStu.assignedClassIds.includes(c.id));

    if (enrolledClasses.length > 0) {
      const generatedItems: InvoiceItem[] = enrolledClasses.map(c => {
        let baseFee = 270;
        if (age < 10) baseFee = 270;
        else if (age < 17) baseFee = 340;
        else baseFee = 390;

        return {
          description: `${c.name} — Term Fee (${billingPeriod})`,
          quantity: 1,
          unitPriceCHF: baseFee,
          totalCHF: baseFee
        };
      });

      // Sibling discount if note mentions sibling
      let discount = 0;
      if (selectedStu.notes?.toLowerCase().includes('sibling')) {
        discount = 27; // 10%
      }

      setItems(generatedItems);
      setDiscountCHF(discount);
    } else {
      // Drop in default
      setItems([
        {
          description: `10-Class Drop-In Dance Pass (${billingPeriod})`,
          quantity: 1,
          unitPriceCHF: 280,
          totalCHF: 280
        }
      ]);
      setDiscountCHF(0);
    }
  }, [studentId, billingPeriod, students, classes, invoices]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.totalCHF, 0);
  const totalAmount = Math.max(0, subtotal - discountCHF);

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        description: 'Studio Showcase & Costume Fee',
        quantity: 1,
        unitPriceCHF: 50,
        totalCHF: 50
      }
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPriceCHF') {
        updated.totalCHF = updated.quantity * updated.unitPriceCHF;
      }
      return updated;
    }));
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStu = students.find(s => s.id === studentId);
    if (!selectedStu || items.length === 0) return;

    createInvoice({
      studentId: selectedStu.id,
      studentName: `${selectedStu.firstName} ${selectedStu.lastName}`,
      billingPeriod,
      issueDate,
      dueDate,
      status: 'issued',
      items,
      subtotalCHF: subtotal,
      discountCHF,
      totalAmountCHF: totalAmount,
      paidAmountCHF: 0,
      paymentTerms: 'Payment due within 30 days via official Swiss QR-bill.',
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-sm">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create Swiss QR Invoice</h3>
              <p className="text-xs text-slate-400">Automated age calculation and line items breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {duplicateWarning && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
              <span>⚠️ Notice: An active invoice already exists for this student for <strong>{billingPeriod}</strong>. Please ensure this is not an unintentional duplicate.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student / Debtor *</label>
              <select
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 font-medium"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.studentId} • {s.pricingCategory})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing Period</label>
              <select
                value={billingPeriod}
                onChange={e => setBillingPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 font-medium"
              >
                <option value="Q2 2026 (Apr–Jun)">Q2 2026 (Apr–Jun Term)</option>
                <option value="Q3 2026 (Jul–Sep)">Q3 2026 (Jul–Sep Term)</option>
                <option value="Q4 2026 (Oct–Dec)">Q4 2026 (Oct–Dec Term)</option>
                <option value="April 2026 Monthly">April 2026 Monthly Fee</option>
                <option value="Drop-In 10-Class Card">Drop-In 10-Class Pass</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Itemized Invoice Positions
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/50">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => handleUpdateItem(idx, 'description', e.target.value)}
                    placeholder="Description"
                    className="flex-1 px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                    className="w-14 px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-center"
                    placeholder="Qty"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">CHF</span>
                    <input
                      type="number"
                      step="any"
                      value={item.unitPriceCHF}
                      onChange={e => handleUpdateItem(idx, 'unitPriceCHF', Number(e.target.value))}
                      className="w-20 px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-right font-mono"
                    />
                  </div>
                  <span className="w-20 text-right font-mono font-bold text-slate-800">
                    CHF {item.totalCHF.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">CHF {formatSwissCHF(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Discounts / Sibling Rebate (CHF):</span>
              <input
                type="number"
                value={discountCHF}
                onChange={e => setDiscountCHF(Number(e.target.value))}
                className="w-24 px-2 py-1 rounded border border-slate-200 text-right font-mono text-xs bg-white"
              />
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold text-sm text-slate-900">
              <span>Total Invoice Amount (CHF):</span>
              <span className="text-violet-700 font-mono text-base">CHF {formatSwissCHF(totalAmount)}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Instructions / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 transition active:scale-95"
            >
              Issue Invoice with Swiss QR-Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
