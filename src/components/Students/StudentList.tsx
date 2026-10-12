import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Mail,
  Phone,
  FileText,
  CreditCard,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { formatSwissCHF, formatSwissDate } from '../../utils/swissQr';

interface StudentListProps {
  onOpenAddStudent: () => void;
  onOpenCreateInvoice: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  onOpenAddStudent,
  onOpenCreateInvoice
}) => {
  const {
    students,
    classes,
    invoices,
    setSelectedStudentId
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('active');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  const filteredStudents = students.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && s.pricingCategory !== categoryFilter) return false;
    if (classFilter !== 'all' && !s.assignedClassIds.includes(classFilter)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${s.firstName} ${s.lastName}`.toLowerCase().includes(q);
      const matchId = s.studentId.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      const matchCity = s.city.toLowerCase().includes(q);
      return matchName || matchId || matchEmail || matchCity;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['StudentID', 'FirstName', 'LastName', 'DOB', 'Email', 'Phone', 'City', 'Category', 'Status', 'Points'];
    const rows = filteredStudents.map(s => [
      s.studentId,
      `"${s.firstName}"`,
      `"${s.lastName}"`,
      s.dateOfBirth,
      s.email,
      s.phone,
      s.city,
      s.pricingCategory,
      s.status,
      s.pointBalance
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DanseFlow_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Student Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage dancer profiles, parental guardians, class assignments, and Swiss billing data.
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
            onClick={onOpenAddStudent}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name, ID, email, city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 font-medium focus:outline-none focus:border-violet-500"
          >
            <option value="active">Active Only</option>
            <option value="all">All Statuses</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>

          {/* Age Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 font-medium focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Age Groups</option>
            <option value="Kids">Kids (4–9)</option>
            <option value="Teens">Teens (10–16)</option>
            <option value="Adults">Adults (17+)</option>
            <option value="Drop-in">Drop-in Pass</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 font-medium focus:outline-none focus:border-violet-500 max-w-[160px]"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Age & DOB</th>
                <th className="py-3 px-4">Contact / Guardian</th>
                <th className="py-3 px-4">Enrolled Classes</th>
                <th className="py-3 px-4">Open Balance</th>
                <th className="py-3 px-4">Pass Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const birthYear = new Date(student.dateOfBirth).getFullYear();
                  const age = new Date().getFullYear() - birthYear;
                  const isMinor = age < 18;

                  // Compute student invoices
                  const studentInvs = invoices.filter(i => i.studentId === student.id);
                  const openCHF = studentInvs.reduce((sum, i) => sum + (i.totalAmountCHF - i.paidAmountCHF), 0);
                  const assignedClasses = classes.filter(c => student.assignedClassIds.includes(c.id));

                  return (
                    <tr
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className="hover:bg-slate-50/70 transition cursor-pointer group"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {student.firstName[0]}{student.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-violet-600 transition flex items-center gap-1.5">
                              <span>{student.firstName} {student.lastName}</span>
                              {isMinor && (
                                <span title="Minor under 18">
                                  <ShieldAlert className="w-3.5 h-3.5 text-violet-500" />
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 font-medium">
                              {student.studentId} • {student.city}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Age & DOB */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{age} yrs</span>
                        <span className="block text-[11px] text-slate-400">
                          {formatSwissDate(student.dateOfBirth)}
                        </span>
                      </td>

                      {/* Contact info */}
                      <td className="py-3.5 px-4">
                        {isMinor && student.guardianName ? (
                          <div>
                            <span className="font-medium text-slate-800">{student.guardianName}</span>
                            <span className="block text-[11px] text-slate-400 truncate max-w-[150px]">
                              {student.guardianEmail}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium text-slate-800">{student.phone}</span>
                            <span className="block text-[11px] text-slate-400 truncate max-w-[150px]">
                              {student.email}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Classes */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {assignedClasses.length > 0 ? (
                            assignedClasses.map(c => (
                              <span
                                key={c.id}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                              >
                                {c.name.split('(')[0].trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No active class</span>
                          )}
                        </div>
                      </td>

                      {/* Open Balance */}
                      <td className="py-3.5 px-4 font-mono-num font-semibold">
                        {openCHF > 0 ? (
                          <span className="text-rose-600">CHF {formatSwissCHF(openCHF)}</span>
                        ) : (
                          <span className="text-emerald-600">CHF 0.00</span>
                        )}
                      </td>

                      {/* Point Card */}
                      <td className="py-3.5 px-4">
                        {student.pointBalance > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold font-mono text-[11px]">
                            {student.pointBalance} pts
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          student.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {student.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedStudentId(student.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No students match the current filter or search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table summary bar */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredStudents.length} of {students.length} total dance students</span>
          <span className="font-medium text-slate-700">Swiss Federal Data Protection Act compliant</span>
        </div>
      </div>
    </div>
  );
};
