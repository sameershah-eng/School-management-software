import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Navigation/Sidebar';
import { TopNavbar } from './components/Navigation/TopNavbar';
import { ToastContainer } from './components/Navigation/ToastContainer';

import { Overview } from './components/Dashboard/Overview';
import { StudentList } from './components/Students/StudentList';
import { AddStudentModal } from './components/Students/AddStudentModal';
import { StudentDetailModal } from './components/Students/StudentDetailModal';

import { ClassSchedule } from './components/Classes/ClassSchedule';
import { AddClassModal } from './components/Classes/AddClassModal';

import { RegistrationList } from './components/Registration/RegistrationList';
import { PublicRegistrationModal } from './components/Registration/PublicRegistrationModal';

import { InvoiceList } from './components/Billing/InvoiceList';
import { CreateInvoiceModal } from './components/Billing/CreateInvoiceModal';
import { SwissQRInvoiceDetailModal } from './components/Billing/SwissQRInvoiceDetailModal';

import { AttendanceTracker } from './components/Attendance/AttendanceTracker';
import { PointCardManager } from './components/PointCards/PointCardManager';
import { BankReconciliation } from './components/Reconciliation/BankReconciliation';
import { ReminderManager } from './components/Reminders/ReminderManager';
import { ReportsAnalytics } from './components/Reports/ReportsAnalytics';
import { DataMigration } from './components/DataImport/DataMigration';
import { SettingsAdmin } from './components/Settings/SettingsAdmin';

function MainAppShell() {
  const {
    activeTab,
    selectedStudentId,
    setSelectedStudentId,
    selectedInvoiceId,
    setSelectedInvoiceId,
    publicPortalOpen,
    setPublicPortalOpen
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#1E232A]">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenAddStudent={() => setAddStudentOpen(true)}
          onOpenCreateInvoice={() => setCreateInvoiceOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <Overview
              onOpenAddStudent={() => setAddStudentOpen(true)}
              onOpenCreateInvoice={() => setCreateInvoiceOpen(true)}
              onOpenAddClass={() => setAddClassOpen(true)}
            />
          )}

          {activeTab === 'students' && (
            <StudentList
              onOpenAddStudent={() => setAddStudentOpen(true)}
              onOpenCreateInvoice={() => setCreateInvoiceOpen(true)}
            />
          )}

          {activeTab === 'classes' && (
            <ClassSchedule
              onOpenAddClass={() => setAddClassOpen(true)}
            />
          )}

          {activeTab === 'registrations' && (
            <RegistrationList />
          )}

          {activeTab === 'attendance' && (
            <AttendanceTracker />
          )}

          {activeTab === 'billing' && (
            <InvoiceList
              onOpenCreateInvoice={() => setCreateInvoiceOpen(true)}
            />
          )}

          {activeTab === 'point-cards' && (
            <PointCardManager />
          )}

          {activeTab === 'reconciliation' && (
            <BankReconciliation />
          )}

          {activeTab === 'reminders' && (
            <ReminderManager />
          )}

          {activeTab === 'reports' && (
            <ReportsAnalytics />
          )}

          {activeTab === 'import' && (
            <DataMigration />
          )}

          {activeTab === 'settings' && (
            <SettingsAdmin />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AddStudentModal
        isOpen={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
      />

      <AddClassModal
        isOpen={addClassOpen}
        onClose={() => setAddClassOpen(false)}
      />

      <CreateInvoiceModal
        isOpen={createInvoiceOpen}
        onClose={() => setCreateInvoiceOpen(false)}
      />

      <StudentDetailModal
        studentId={selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
        onOpenCreateInvoice={() => {
          setSelectedStudentId(null);
          setCreateInvoiceOpen(true);
        }}
      />

      <SwissQRInvoiceDetailModal
        invoiceId={selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />

      <PublicRegistrationModal
        isOpen={publicPortalOpen}
        onClose={() => setPublicPortalOpen(false)}
      />

      {/* Notifications Container */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
