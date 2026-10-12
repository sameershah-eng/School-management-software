import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Receipt,
  CheckCircle2,
  Clock,
  CreditCard,
  Plus,
  AlertTriangle,
  Archive,
  Edit,
  Sparkles
} from 'lucide-react';
import { formatSwissCHF, formatSwissDate } from '../../utils/swissQr';

interface StudentDetailModalProps {
  studentId: string | null;
  onClose: () => void;
  onOpenCreateInvoice: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  onClose,
  onOpenCreateInvoice
}) => {
  const {
    students,
    classes,
    invoices,
    attendance,
    pointCards,
    pointCardTxs,
    setSelectedInvoiceId,
    archiveStudent,
    issuePointCard
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'billing' | 'attendance' | 'points'>('overview');

  if (!studentId) return null;

  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  const studentClasses = classes.filter(c => student.assignedClassIds.includes(c.id));
  const studentInvoices = invoices.filter(i => i.studentId === student.id);
  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const studentPointCards = pointCards.filter(p => p.studentId === student.id);
  const studentTxs = pointCardTxs.filter(tx => tx.studentId === student.id);

  // Age
  const birthYear = new Date(student.dateOfBirth).getFullYear();
  const age = new Date().getFullYear() - birthYear;
  const isMinor = age < 18;

  const totalBilled = studentInvoices.reduce((sum, i) => sum + i.totalAmountCHF, 0);
  const totalPaid = studentInvoices.reduce((sum, i) => sum + i.paidAmountCHF, 0);
  const outstanding = totalBilled - totalPaid;

  const handleIssue10Pass = () => {
    issuePointCard({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      cardType: '10-Class Pass',
      totalPoints: 10,
      remainingPoints: 10,
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priceCHF: 280,
      status: 'active'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header Profile Bar */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {student.firstName[0]}{student.lastName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{student.firstName} {student.lastName}</h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-violet-200">
                    {student.studentId}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    student.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/30 text-slate-300'
                  }`}>
                    {student.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Age {age} ({formatSwissDate(student.dateOfBirth)}) • {student.pricingCategory} • Enrolled {formatSwissDate(student.registrationDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCreateInvoice}
                className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Invoice</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-6 border-b border-white/10 text-xs font-medium">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'classes', label: `Classes (${studentClasses.length})` },
              { id: 'billing', label: `Invoices (${studentInvoices.length})` },
              { id: 'attendance', label: `Attendance (${studentAttendance.length})` },
              { id: 'points', label: `Point Cards (${studentPointCards.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-violet-400 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Billed</p>
                  <p className="text-lg font-bold text-slate-900 font-mono-num mt-1">
                    CHF {formatSwissCHF(totalBilled)}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <p className="text-[11px] font-semibold text-emerald-600 uppercase">Total Paid</p>
                  <p className="text-lg font-bold text-emerald-700 font-mono-num mt-1">
                    CHF {formatSwissCHF(totalPaid)}
                  </p>
                </div>
                <div className={`p-3.5 rounded-xl border ${
                  outstanding > 0 ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50 border-slate-100'
                }`}>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Open Balance</p>
                  <p className={`text-lg font-bold font-mono-num mt-1 ${
                    outstanding > 0 ? 'text-rose-600' : 'text-slate-700'
                  }`}>
                    CHF {formatSwissCHF(outstanding)}
                  </p>
                </div>
              </div>

              {/* Details & Guardian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Contact & Swiss Address
                  </h4>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{student.street}, {student.postalCode} {student.city} ({student.canton})</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-slate-500">
                    <span className="font-semibold text-slate-700">Emergency:</span> {student.emergencyContact}
                  </div>
                </div>

                {isMinor && student.guardianName ? (
                  <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-100 space-y-2.5 text-xs">
                    <h4 className="font-bold text-violet-950 uppercase tracking-wider text-[11px]">
                      Legal Guardian (Minor)
                    </h4>
                    <p className="font-semibold text-violet-900">{student.guardianName}</p>
                    <div className="flex items-center gap-2 text-violet-700">
                      <Mail className="w-3.5 h-3.5 text-violet-400" />
                      <span>{student.guardianEmail}</span>
                    </div>
                    {student.guardianPhone && (
                      <div className="flex items-center gap-2 text-violet-700">
                        <Phone className="w-3.5 h-3.5 text-violet-400" />
                        <span>{student.guardianPhone}</span>
                      </div>
                    )}
                    <p className="text-[11px] text-violet-600/80 pt-1 border-t border-violet-200/50">
                      Invoices & payment slips dispatched to guardian email.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Drop-in Point Balance
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-violet-600 font-mono">
                        {student.pointBalance}
                      </div>
                      <span className="text-slate-500">active class credits available</span>
                    </div>
                    <button
                      onClick={handleIssue10Pass}
                      className="mt-2 text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline"
                    >
                      + Issue 10-Class Drop-In Card
                    </button>
                  </div>
                )}
              </div>

              {student.notes && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">Pedagogical & Health Notes:</span>
                  <p className="text-slate-600">{student.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="space-y-3">
              {studentClasses.length > 0 ? (
                studentClasses.map(cls => (
                  <div
                    key={cls.id}
                    className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{cls.name}</p>
                      <p className="text-slate-500 mt-0.5">
                        {cls.dayOfWeek} • {cls.startTime}–{cls.endTime} • {cls.danceStyle}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 font-semibold text-[11px]">
                      Enrolled
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Student is not currently enrolled in any scheduled class.
                </div>
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-3">
              {studentInvoices.length > 0 ? (
                studentInvoices.map(inv => (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-violet-300 cursor-pointer transition flex items-center justify-between text-xs group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-slate-900">{inv.invoiceNumber}</span>
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          inv.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1">
                        {inv.billingPeriod} • Due {formatSwissDate(inv.dueDate)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold font-mono-num text-sm text-slate-900">
                        CHF {formatSwissCHF(inv.totalAmountCHF)}
                      </p>
                      <span className="text-[11px] text-violet-600 group-hover:underline">
                        View QR-Bill →
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No invoices generated yet for this student.
                </div>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-2">
              {studentAttendance.length > 0 ? (
                studentAttendance.map(att => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{formatSwissDate(att.date)}</span>
                      {att.note && <p className="text-slate-500 text-[11px] mt-0.5">{att.note}</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                      att.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                      att.status === 'late' ? 'bg-amber-100 text-amber-800' :
                      att.status === 'excused' ? 'bg-blue-100 text-blue-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {att.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No attendance records logged yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Drop-In Point Cards
                </h4>
                <button
                  onClick={handleIssue10Pass}
                  className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 text-xs font-semibold border border-violet-200 transition"
                >
                  + Issue 10-Class Card (CHF 280)
                </button>
              </div>

              {studentPointCards.length > 0 ? (
                studentPointCards.map(card => (
                  <div key={card.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-sm">{card.cardCode}</span>
                        <p className="text-xs text-slate-500">{card.cardType} • Expires {formatSwissDate(card.expiryDate)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-violet-600 font-mono">
                          {card.remainingPoints} / {card.totalPoints}
                        </span>
                        <p className="text-[10px] text-slate-400">points left</p>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-violet-600 h-full rounded-full"
                        style={{ width: `${(card.remainingPoints / card.totalPoints) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No point cards assigned. Click above to issue a drop-in card.
                </div>
              )}

              {/* Transactions Ledger */}
              {studentTxs.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Redemption Ledger</h5>
                  <div className="space-y-1.5">
                    {studentTxs.map(tx => (
                      <div key={tx.id} className="p-2 rounded-lg bg-white border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium text-slate-800">{tx.reason}</p>
                          <p className="text-[10px] text-slate-400">{formatSwissDate(tx.date.split('T')[0])} by {tx.recordedBy}</p>
                        </div>
                        <span className={`font-mono font-bold ${tx.points > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              archiveStudent(student.id);
              onClose();
            }}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive Student</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
