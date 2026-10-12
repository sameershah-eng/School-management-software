import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Calendar,
  AlertTriangle,
  CreditCard,
  Plus,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  FileText,
  UserCheck
} from 'lucide-react';
import { formatSwissCHF, formatSwissDate } from '../../utils/swissQr';

interface OverviewProps {
  onOpenAddStudent: () => void;
  onOpenCreateInvoice: () => void;
  onOpenAddClass: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  onOpenAddStudent,
  onOpenCreateInvoice,
  onOpenAddClass
}) => {
  const {
    students,
    classes,
    invoices,
    teachers,
    rooms,
    registrations,
    setActiveTab,
    setSelectedStudentId,
    setSelectedInvoiceId,
    approveRegistration,
    settings
  } = useApp();

  const activeStudents = students.filter(s => s.status === 'active');
  const activeClasses = classes.filter(c => c.active);

  // Financial aggregates
  const totalOutstandingCHF = invoices
    .filter(i => i.status === 'issued' || i.status === 'overdue' || i.status === 'partially_paid')
    .reduce((sum, i) => sum + (i.totalAmountCHF - i.paidAmountCHF), 0);

  const totalCollectedCHF = invoices.reduce((sum, i) => sum + i.paidAmountCHF, 0);

  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const pendingRegistrations = registrations.filter(r => r.status === 'pending');

  // Days of week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];
  const todaysClasses = classes.filter(c => c.dayOfWeek === todayName);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Operational Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
        {/* Subtle decorative graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-400 via-rose-300 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider text-violet-300 font-semibold">Studio Operations</span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-300">{settings.name}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back to DanseFlow
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Everything is on schedule. You have {todaysClasses.length} {todaysClasses.length === 1 ? 'class' : 'classes'} today, {pendingRegistrations.length} new student {pendingRegistrations.length === 1 ? 'registration' : 'registrations'} to review, and CHF {formatSwissCHF(totalOutstandingCHF)} in open receivables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddStudent}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-700/30 transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
            <button
              onClick={onOpenCreateInvoice}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur border border-white/10 transition flex items-center gap-1.5 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>New Invoice</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur border border-white/10 transition flex items-center gap-1.5 active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>Take Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Students */}
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Students</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeStudents.length}</span>
            <span className="text-xs text-emerald-600 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12% this term
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {students.filter(s => s.status === 'archived').length} archived records
          </p>
        </div>

        {/* Card 2: Weekly Classes */}
        <div
          onClick={() => setActiveTab('classes')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Weekly Classes</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeClasses.length}</span>
            <span className="text-xs text-slate-500 font-medium">
              across {rooms.length} studio rooms
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {teachers.length} certified dance instructors
          </p>
        </div>

        {/* Card 3: Outstanding Receivables */}
        <div
          onClick={() => setActiveTab('billing')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open Invoices</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono-num">
              CHF {formatSwissCHF(totalOutstandingCHF)}
            </span>
          </div>
          <p className="text-[11px] text-rose-500 font-medium mt-2 flex items-center gap-1">
            <span>{overdueInvoices.length} overdue</span>
            <span className="text-slate-400 font-normal">• Swiss QR-bill issued</span>
          </p>
        </div>

        {/* Card 4: Payments Collected */}
        <div
          onClick={() => setActiveTab('reconciliation')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Collected Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono-num">
              CHF {formatSwissCHF(totalCollectedCHF)}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Bank & Point Card verified</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Schedule & Pending Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Today's Schedule + Overdue Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Today's Timetable ({todayName})</h3>
                  <p className="text-xs text-slate-400">Live studio schedule and room assignments</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('classes')}
                className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-4 divide-y divide-slate-100">
              {todaysClasses.length > 0 ? (
                todaysClasses.map(cls => {
                  const teacher = teachers.find(t => t.id === cls.teacherId);
                  const room = rooms.find(r => r.id === cls.roomId);
                  const occupancy = cls.enrolledStudentIds.length;
                  const isFull = occupancy >= cls.capacity;

                  return (
                    <div key={cls.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0 hover:bg-slate-50/50 rounded-xl px-2 transition">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-2.5 h-10 rounded-full shrink-0 mt-0.5"
                          style={{ backgroundColor: cls.color || '#8B5CF6' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900">{cls.name}</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {cls.danceStyle}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1 font-mono-num font-medium text-slate-600">
                              <Clock className="w-3 h-3 text-slate-400" /> {cls.startTime} – {cls.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" /> {room?.name || 'Studio'}
                            </span>
                            <span>•</span>
                            <span>{teacher?.name || 'Instructor'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <span className={`text-xs font-semibold ${isFull ? 'text-amber-600' : 'text-slate-600'}`}>
                            {occupancy} / {cls.capacity} dancers
                          </span>
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isFull ? 'bg-amber-500' : 'bg-violet-600'}`}
                              style={{ width: `${Math.min(100, (occupancy / cls.capacity) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab('attendance')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 transition"
                        >
                          Check In
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  <p>No regular classes scheduled for today.</p>
                  <button
                    onClick={() => setActiveTab('classes')}
                    className="mt-2 text-xs font-semibold text-violet-600 hover:underline"
                  >
                    View weekly schedule
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Overdue Invoices Requiring Attention */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Overdue Invoices</h3>
                  <p className="text-xs text-slate-400">Swiss QR payment slips awaiting settlement</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('reminders')}
                className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                <span>Reminder Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-4 divide-y divide-slate-100">
              {overdueInvoices.length > 0 ? (
                overdueInvoices.map(inv => {
                  const student = students.find(s => s.id === inv.studentId);
                  const openBalance = inv.totalAmountCHF - inv.paidAmountCHF;
                  return (
                    <div
                      key={inv.id}
                      className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0 hover:bg-slate-50/50 rounded-xl px-2 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">{inv.studentName}</span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium">
                            {inv.invoiceNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Due: {formatSwissDate(inv.dueDate)} • {inv.billingPeriod}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono-num font-bold text-slate-900 text-sm">
                          CHF {formatSwissCHF(openBalance)}
                        </span>
                        <button
                          onClick={() => setSelectedInvoiceId(inv.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                        >
                          View QR-Bill
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No overdue accounts at this time. All payments settled!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Online Registrations & Quick Stats */}
        <div className="space-y-6">
          {/* Recent Registrations Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">New Registrations</h3>
                <p className="text-xs text-slate-400">From public student registration portal</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                {pendingRegistrations.length} Pending
              </span>
            </div>

            <div className="pt-3 space-y-3">
              {pendingRegistrations.length > 0 ? (
                pendingRegistrations.map(reg => {
                  const targetClass = classes.find(c => c.id === reg.requestedClassId);
                  return (
                    <div
                      key={reg.id}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-violet-200 transition space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-xs text-slate-900">
                            {reg.studentFirstName} {reg.studentLastName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {targetClass?.name || 'Class Registration'}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {reg.registrationRef}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{reg.city}, {reg.canton}</span>
                        <span className="text-slate-400">{formatSwissDate(reg.submittedAt.split('T')[0])}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                        <button
                          onClick={() => approveRegistration(reg.id)}
                          className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition active:scale-95"
                        >
                          Approve & Enroll
                        </button>
                        <button
                          onClick={() => setActiveTab('registrations')}
                          className="py-1 px-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-medium transition"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No pending registrations. Ready for new students.
                </div>
              )}
            </div>
          </div>

          {/* Swiss Financial Highlights Card */}
          <div className="bg-gradient-to-br from-violet-50 via-white to-indigo-50/40 rounded-2xl border border-violet-100 p-5 shadow-sm">
            <h4 className="text-xs font-bold text-violet-950 uppercase tracking-wider mb-2">
              Swiss Banking Integration
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-violet-100/60">
                <span className="text-slate-600">Standard</span>
                <span className="font-semibold text-slate-900">SIX Swiss QR-Bill (SPC)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-violet-100/60">
                <span className="text-slate-600">Clearing Currency</span>
                <span className="font-semibold font-mono text-slate-900">CHF (Swiss Franc)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-violet-100/60">
                <span className="text-slate-600">Bank Statement</span>
                <span className="font-semibold text-slate-900">ISO 20022 CAMT.053</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-600">QR-IBAN Status</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('reconciliation')}
              className="w-full mt-4 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-violet-600/20"
            >
              <span>Match Bank Statements</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
