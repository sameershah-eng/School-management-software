import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Eye,
  Filter
} from 'lucide-react';
import { formatSwissDate } from '../../utils/swissQr';

export const RegistrationList: React.FC = () => {
  const {
    registrations,
    classes,
    approveRegistration,
    updateRegistrationStatus,
    setPublicPortalOpen
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'waitlisted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = registrations.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${r.studentFirstName} ${r.studentLastName}`.toLowerCase().includes(q);
      const matchRef = r.registrationRef.toLowerCase().includes(q);
      const matchEmail = r.email.toLowerCase().includes(q);
      return matchName || matchRef || matchEmail;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Online Registrations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review incoming registration requests from the public portal, approve enrollments, and manage waitlists.
          </p>
        </div>

        <button
          onClick={() => setPublicPortalOpen(true)}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Open Public Portal Preview</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dancer name, ref code, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {(['all', 'pending', 'approved', 'waitlisted', 'rejected'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filterStatus === st
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Reference & Dancer</th>
                <th className="py-3 px-4">Requested Class</th>
                <th className="py-3 px-4">Location / Guardian</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length > 0 ? (
                filtered.map(reg => {
                  const targetClass = classes.find(c => c.id === reg.requestedClassId);
                  const isFull = targetClass ? targetClass.enrolledStudentIds.length >= targetClass.capacity : false;

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{reg.studentFirstName} {reg.studentLastName}</span>
                            {reg.isMinor && (
                              <span title="Minor dancer">
                                <ShieldAlert className="w-3.5 h-3.5 text-violet-500" />
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 font-medium">
                            {reg.registrationRef} • {formatSwissDate(reg.dateOfBirth)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{targetClass?.name || 'Class'}</span>
                        <span className="block text-[11px] text-slate-400">
                          {targetClass?.dayOfWeek} {targetClass?.startTime} • {isFull ? 'Capacity Reached' : 'Spots Available'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-800">{reg.city}, {reg.canton}</span>
                        {reg.isMinor && reg.guardianName && (
                          <span className="block text-[11px] text-slate-400">
                            Parent: {reg.guardianName}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono-num text-slate-500">
                        {formatSwissDate(reg.submittedAt.split('T')[0])}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          reg.status === 'pending' ? 'bg-violet-100 text-violet-800' :
                          reg.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          reg.status === 'waitlisted' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {reg.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {reg.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => approveRegistration(reg.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition shadow-sm active:scale-95"
                            >
                              Approve & Enroll
                            </button>
                            <button
                              onClick={() => updateRegistrationStatus(reg.id, 'waitlisted')}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] border border-amber-200 transition"
                            >
                              Waitlist
                            </button>
                            <button
                              onClick={() => updateRegistrationStatus(reg.id, 'rejected')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Reject registration"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-medium">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No registrations found matching the criteria.
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
