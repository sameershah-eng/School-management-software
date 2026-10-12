import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UserPlus,
  CheckSquare,
  Receipt,
  CreditCard,
  Building2,
  BellRing,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    registrations,
    invoices,
    bankTransactions,
    setPublicPortalOpen,
    role
  } = useApp();

  const pendingRegistrationsCount = registrations.filter(r => r.status === 'pending').length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'overdue').length;
  const unmatchedTransactionsCount = bankTransactions.filter(t => t.status === 'unmatched' || t.status === 'ambiguous').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'classes', label: 'Classes & Schedule', icon: CalendarDays },
    {
      id: 'registrations',
      label: 'Registrations',
      icon: UserPlus,
      badge: pendingRegistrationsCount > 0 ? pendingRegistrationsCount : undefined,
      badgeColor: 'bg-violet-500 text-white'
    },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare },
    {
      id: 'billing',
      label: 'Billing & Invoices',
      icon: Receipt,
      badge: overdueInvoicesCount > 0 ? overdueInvoicesCount : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'point-cards', label: 'Point Cards', icon: CreditCard },
    {
      id: 'reconciliation',
      label: 'Bank Reconciliation',
      icon: Building2,
      badge: unmatchedTransactionsCount > 0 ? unmatchedTransactionsCount : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    { id: 'reminders', label: 'Reminders', icon: BellRing },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'import', label: 'Data Import', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-rose-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900">DanseFlow</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">CH</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Swiss Studio Suite</p>
            </div>
          </div>
        </div>

        {/* Demo Role Indicator */}
        <div className="px-4 pt-3 pb-2">
          <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider leading-none">Active Role</p>
                <p className="text-xs font-semibold text-slate-700 capitalize mt-0.5">{role}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-[11px] font-medium text-violet-600 hover:text-violet-700 hover:underline"
            >
              Switch
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-violet-300' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Public Portal Callout */}
        <div className="p-3 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50/60 border border-violet-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-violet-900">Student Portal</span>
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">Live</span>
            </div>
            <p className="text-[11px] text-violet-700/80 mb-2.5 leading-relaxed">
              Test the public student registration experience with Swiss address and class picker.
            </p>
            <button
              onClick={() => setPublicPortalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-sm shadow-violet-600/20 transition"
            >
              <span>Open Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Studio Info Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">CHF • Zurich</span>
          <span>v1.2 Swiss Ready</span>
        </div>
      </aside>
    </>
  );
};
