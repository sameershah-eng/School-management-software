import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Search,
  Bell,
  Plus,
  HelpCircle,
  Building,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatSwissDate } from '../../utils/swissQr';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  onOpenAddStudent: () => void;
  onOpenCreateInvoice: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  onOpenAddStudent,
  onOpenCreateInvoice
}) => {
  const {
    settings,
    students,
    invoices,
    classes,
    setSelectedStudentId,
    setSelectedInvoiceId,
    setActiveTab,
    role,
    setRole,
    registrations
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingRegs = registrations.filter(r => r.status === 'pending');
  const overdueInvs = invoices.filter(i => i.status === 'overdue');

  const filteredStudents = searchQuery.trim()
    ? students.filter(s =>
        `${s.firstName} ${s.lastName} ${s.studentId} ${s.email}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredInvoices = searchQuery.trim()
    ? invoices.filter(i =>
        `${i.invoiceNumber} ${i.studentName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredClasses = searchQuery.trim()
    ? classes.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasResults = filteredStudents.length > 0 || filteredInvoices.length > 0 || filteredClasses.length > 0;

  const todayStr = formatSwissDate(new Date().toISOString().split('T')[0]);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search students, invoices, classes..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 focus:bg-white border border-transparent focus:border-violet-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition"
            />
          </div>

          {/* Quick search popup */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
              <div className="flex justify-between items-center px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase">
                <span>Search results</span>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              {hasResults ? (
                <div className="space-y-2 mt-1 max-h-72 overflow-y-auto">
                  {filteredStudents.length > 0 && (
                    <div>
                      <div className="px-2 py-0.5 text-[10px] font-semibold text-slate-400">STUDENTS</div>
                      {filteredStudents.map(s => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedStudentId(s.id);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="px-2 py-1.5 hover:bg-violet-50 rounded-lg cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{s.firstName} {s.lastName}</span>
                            <span className="text-slate-400 ml-1.5 font-mono text-[11px]">{s.studentId}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{s.pricingCategory}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredInvoices.length > 0 && (
                    <div>
                      <div className="px-2 py-0.5 text-[10px] font-semibold text-slate-400">INVOICES</div>
                      {filteredInvoices.map(inv => (
                        <div
                          key={inv.id}
                          onClick={() => {
                            setSelectedInvoiceId(inv.id);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="px-2 py-1.5 hover:bg-violet-50 rounded-lg cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{inv.invoiceNumber}</span>
                            <span className="text-slate-500 ml-1.5">{inv.studentName}</span>
                          </div>
                          <span className="font-semibold font-mono text-slate-700">CHF {inv.totalAmountCHF.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredClasses.length > 0 && (
                    <div>
                      <div className="px-2 py-0.5 text-[10px] font-semibold text-slate-400">CLASSES</div>
                      {filteredClasses.map(c => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setActiveTab('classes');
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="px-2 py-1.5 hover:bg-violet-50 rounded-lg cursor-pointer flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800">{c.name}</span>
                          <span className="text-slate-400">{c.dayOfWeek} {c.startTime}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 text-center text-slate-400">No results found for "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium px-3 py-1.5 rounded-lg bg-slate-100/60 border border-slate-200/50">
          <Building className="w-3.5 h-3.5 text-violet-600" />
          <span>{settings.city} ({todayStr})</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {(pendingRegs.length > 0 || overdueInvs.length > 0) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
              <div className="font-semibold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Alerts & Activity</span>
                <span className="text-[10px] font-normal text-slate-400">Live</span>
              </div>
              <div className="py-2 space-y-2">
                {pendingRegs.length > 0 ? (
                  <div
                    onClick={() => {
                      setActiveTab('registrations');
                      setShowNotifications(false);
                    }}
                    className="p-2 bg-violet-50 rounded-lg cursor-pointer hover:bg-violet-100 transition flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-violet-900">{pendingRegs.length} Pending Registrations</p>
                      <p className="text-[11px] text-violet-700">Review online student submissions.</p>
                    </div>
                  </div>
                ) : null}

                {overdueInvs.length > 0 ? (
                  <div
                    onClick={() => {
                      setActiveTab('billing');
                      setShowNotifications(false);
                    }}
                    className="p-2 bg-rose-50 rounded-lg cursor-pointer hover:bg-rose-100 transition flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-900">{overdueInvs.length} Overdue Invoices</p>
                      <p className="text-[11px] text-rose-700">Send Swiss reminder notices.</p>
                    </div>
                  </div>
                ) : null}

                {pendingRegs.length === 0 && overdueInvs.length === 0 && (
                  <div className="py-4 text-center text-slate-400 flex flex-col items-center gap-1">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span>All records up to date!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenAddStudent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Student</span>
          </button>
          <button
            onClick={onOpenCreateInvoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 text-xs font-semibold border border-violet-200 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Invoice</span>
          </button>
        </div>
      </div>
    </header>
  );
};
