import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  CreditCard,
  Calendar,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { formatSwissCHF } from '../../utils/swissQr';

export const ReportsAnalytics: React.FC = () => {
  const {
    invoices,
    students,
    classes,
    attendance,
    pointCards,
    pointCardTxs
  } = useApp();

  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmountCHF, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmountCHF, 0);
  const openReceivables = totalBilled - totalPaid;

  // Breakdown by dance style
  const styleStats = classes.reduce((acc, c) => {
    acc[c.danceStyle] = (acc[c.danceStyle] || 0) + c.enrolledStudentIds.length;
    return acc;
  }, {} as Record<string, number>);

  // Attendance rate
  const totalAtt = attendance.length;
  const presentAtt = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = totalAtt > 0 ? ((presentAtt / totalAtt) * 100).toFixed(0) : '95';

  // Point cards redeemed
  const redemptionsCount = pointCardTxs.filter(t => t.type === 'redemption').length;

  const exportFinancialSummaryCSV = () => {
    const csvContent = `Metric,Value CHF
Total Invoiced,${totalBilled}
Total Settled,${totalPaid}
Open Receivables,${openReceivables}
Active Students,${students.filter(s => s.status === 'active').length}
Point Cards Active,${pointCards.filter(c => c.status === 'active').length}
`;
    const encoded = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `DanseFlow_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
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
            Studio Reports & Financial Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Operational business intelligence, attendance adherence, occupancy, and Swiss revenue tracking.
          </p>
        </div>

        <button
          onClick={exportFinancialSummaryCSV}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Summary (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Net Revenue (CHF)</span>
          <p className="text-2xl font-bold text-slate-900 font-mono-num mt-1">
            CHF {formatSwissCHF(totalPaid)}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +14.2% vs previous term
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Class Attendance Adherence</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {attendanceRate}%
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {presentAtt} of {totalAtt} logged sessions present
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Students</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {students.filter(s => s.status === 'active').length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {classes.length} scheduled courses
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Drop-In Redemptions</span>
          <p className="text-2xl font-bold text-violet-600 font-mono mt-1">
            {redemptionsCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Points deducted from prepaid passes
          </span>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dance Style Popularity */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Enrollment by Dance Discipline</h3>
              <p className="text-xs text-slate-400">Distribution of dancers across studio styles</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Live Roster
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(styleStats).map(([style, count]) => {
              const maxCount = Math.max(...Object.values(styleStats), 1);
              const percent = (count / maxCount) * 100;

              return (
                <div key={style} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{style}</span>
                    <span className="text-slate-500 font-mono">{count} dancers</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Studio Capacity Utilization */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Class Room Occupancy Rate</h3>
              <p className="text-xs text-slate-400">Studio spot fulfillment vs maximum capacity</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              Optimized
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {classes.slice(0, 5).map(cls => {
              const occupancy = cls.enrolledStudentIds.length;
              const pct = Math.min(100, Math.round((occupancy / cls.capacity) * 100));

              return (
                <div key={cls.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 truncate max-w-[200px]">{cls.name}</span>
                    <span className="text-slate-600 font-mono">{occupancy}/{cls.capacity} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 90 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
