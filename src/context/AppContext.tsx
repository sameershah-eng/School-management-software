import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Role,
  Student,
  Teacher,
  Room,
  ClassItem,
  Registration,
  PricingRule,
  Invoice,
  PointCard,
  PointCardTransaction,
  AttendanceRecord,
  BankTransaction,
  ReminderLog,
  SchoolSettings
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_TEACHERS,
  INITIAL_ROOMS,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_PRICING_RULES,
  INITIAL_INVOICES,
  INITIAL_POINT_CARDS,
  INITIAL_POINT_CARD_TXS,
  INITIAL_ATTENDANCE,
  INITIAL_BANK_TRANSACTIONS
} from '../data/initialData';
import { generateSwissQRReference } from '../utils/swissQr';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;
  publicPortalOpen: boolean;
  setPublicPortalOpen: (open: boolean) => void;
  
  // Data
  settings: SchoolSettings;
  updateSettings: (settings: Partial<SchoolSettings>) => void;
  teachers: Teacher[];
  rooms: Room[];
  classes: ClassItem[];
  students: Student[];
  registrations: Registration[];
  pricingRules: PricingRule[];
  invoices: Invoice[];
  pointCards: PointCard[];
  pointCardTxs: PointCardTransaction[];
  attendance: AttendanceRecord[];
  bankTransactions: BankTransaction[];
  reminderLogs: ReminderLog[];
  
  // Actions
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  archiveStudent: (id: string) => void;
  
  addClass: (newClass: Omit<ClassItem, 'id' | 'enrolledStudentIds'>) => ClassItem;
  updateClass: (id: string, updates: Partial<ClassItem>) => void;
  deleteClass: (id: string) => void;
  duplicateClass: (id: string) => void;
  
  addRegistration: (reg: Omit<Registration, 'id' | 'registrationRef' | 'submittedAt' | 'status'>) => Registration;
  approveRegistration: (regId: string) => void;
  updateRegistrationStatus: (regId: string, status: Registration['status']) => void;
  
  createInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'qrReference'>) => Invoice;
  updateInvoiceStatus: (id: string, status: Invoice['status'], paidAmount?: number) => void;
  recordPayment: (invoiceId: string, amountCHF: number, note?: string) => void;
  sendReminder: (invoiceId: string, type: 'first_notice' | 'second_notice' | 'final_notice') => void;
  
  recordAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  bulkMarkClassAttendance: (classId: string, date: string, status: AttendanceRecord['status']) => void;
  
  issuePointCard: (card: Omit<PointCard, 'id' | 'cardCode'>) => PointCard;
  redeemPoint: (cardId: string, className: string, studentId: string) => boolean;
  
  reconcileTransaction: (transactionId: string, invoiceId: string) => void;
  rejectTransactionMatch: (transactionId: string) => void;
  importBankTransactions: (txs: BankTransaction[]) => void;
  importStudentsCSV: (newStudents: Partial<Student>[]) => { added: number; skipped: number };
  
  resetToDemoData: () => void;
  
  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'danseflow_saas_';

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage for ${key}`, e);
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => getStored('role', 'admin'));
  const [activeTab, setActiveTabState] = useState<string>(() => getStored('active_tab', 'overview'));
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [publicPortalOpen, setPublicPortalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persistent collections
  const [settings, setSettings] = useState<SchoolSettings>(() => getStored('settings', INITIAL_SETTINGS));
  const [teachers, setTeachers] = useState<Teacher[]>(() => getStored('teachers', INITIAL_TEACHERS));
  const [rooms, setRooms] = useState<Room[]>(() => getStored('rooms', INITIAL_ROOMS));
  const [classes, setClasses] = useState<ClassItem[]>(() => getStored('classes', INITIAL_CLASSES));
  const [students, setStudents] = useState<Student[]>(() => getStored('students', INITIAL_STUDENTS));
  const [registrations, setRegistrations] = useState<Registration[]>(() => getStored('registrations', INITIAL_REGISTRATIONS));
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(() => getStored('pricing_rules', INITIAL_PRICING_RULES));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStored('invoices', INITIAL_INVOICES));
  const [pointCards, setPointCards] = useState<PointCard[]>(() => getStored('point_cards', INITIAL_POINT_CARDS));
  const [pointCardTxs, setPointCardTxs] = useState<PointCardTransaction[]>(() => getStored('point_card_txs', INITIAL_POINT_CARD_TXS));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStored('attendance', INITIAL_ATTENDANCE));
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => getStored('bank_transactions', INITIAL_BANK_TRANSACTIONS));
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>(() => getStored('reminder_logs', []));

  // Sync with localStorage
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'role', JSON.stringify(role)); }, [role]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'active_tab', JSON.stringify(activeTab)); }, [activeTab]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'rooms', JSON.stringify(rooms)); }, [rooms]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'classes', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'registrations', JSON.stringify(registrations)); }, [registrations]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'pricing_rules', JSON.stringify(pricingRules)); }, [pricingRules]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'point_cards', JSON.stringify(pointCards)); }, [pointCards]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'point_card_txs', JSON.stringify(pointCardTxs)); }, [pointCardTxs]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'bank_transactions', JSON.stringify(bankTransactions)); }, [bankTransactions]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'reminder_logs', JSON.stringify(reminderLogs)); }, [reminderLogs]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    addToast({
      type: 'info',
      title: `Switched demo role to ${newRole.toUpperCase()}`,
      message: 'Navigation permissions and access controls updated.'
    });
  };

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateSettings = (updates: Partial<SchoolSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    addToast({
      type: 'success',
      title: 'School settings saved',
      message: 'Updated address and Swiss banking credentials.'
    });
  };

  // Student Actions
  const addStudent = (data: Omit<Student, 'id' | 'createdAt'>): Student => {
    const nextNumber = students.length + 1;
    const newStudent: Student = {
      ...data,
      id: `stu-${Date.now()}`,
      studentId: data.studentId || `STU-${String(nextNumber).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    setStudents(prev => [newStudent, ...prev]);
    addToast({
      type: 'success',
      title: 'Student registered successfully',
      message: `${newStudent.firstName} ${newStudent.lastName} has been added.`
    });
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    addToast({
      type: 'success',
      title: 'Student updated',
      message: 'Profile changes have been saved.'
    });
  };

  const archiveStudent = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: 'archived' } : s));
    addToast({
      type: 'info',
      title: 'Student archived',
      message: 'Student moved to archived records.'
    });
  };

  // Class Actions
  const addClass = (data: Omit<ClassItem, 'id' | 'enrolledStudentIds'>): ClassItem => {
    const newClass: ClassItem = {
      ...data,
      id: `cls-${Date.now()}`,
      enrolledStudentIds: []
    };
    setClasses(prev => [...prev, newClass]);
    addToast({
      type: 'success',
      title: 'Class created',
      message: `${newClass.name} is now on the schedule.`
    });
    return newClass;
  };

  const updateClass = (id: string, updates: Partial<ClassItem>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    addToast({
      type: 'success',
      title: 'Class updated',
      message: 'Schedule and details saved.'
    });
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    addToast({
      type: 'info',
      title: 'Class removed',
      message: 'Class has been deleted from the timetable.'
    });
  };

  const duplicateClass = (id: string) => {
    const original = classes.find(c => c.id === id);
    if (!original) return;
    const duplicated: ClassItem = {
      ...original,
      id: `cls-${Date.now()}`,
      name: `${original.name} (Copy)`,
      enrolledStudentIds: []
    };
    setClasses(prev => [...prev, duplicated]);
    addToast({
      type: 'success',
      title: 'Class duplicated',
      message: `Created duplicate of ${original.name}.`
    });
  };

  // Registration Actions
  const addRegistration = (data: Omit<Registration, 'id' | 'registrationRef' | 'submittedAt' | 'status'>): Registration => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newReg: Registration = {
      ...data,
      id: `reg-${Date.now()}`,
      registrationRef: `REG-2026-CH${randomSuffix}`,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    setRegistrations(prev => [newReg, ...prev]);
    return newReg;
  };

  const approveRegistration = (regId: string) => {
    const reg = registrations.find(r => r.id === regId);
    if (!reg) return;

    // Check if student already exists by email/name
    let student = students.find(s => s.email.toLowerCase() === reg.email.toLowerCase());
    
    if (!student) {
      // Calculate age from dateOfBirth
      const birthYear = new Date(reg.dateOfBirth).getFullYear();
      const age = new Date().getFullYear() - birthYear;
      let category = 'Adults';
      if (age < 10) category = 'Kids';
      else if (age < 17) category = 'Teens';

      const nextNum = students.length + 1;
      student = {
        id: `stu-${Date.now()}`,
        studentId: `STU-${String(nextNum).padStart(3, '0')}`,
        firstName: reg.studentFirstName,
        lastName: reg.studentLastName,
        dateOfBirth: reg.dateOfBirth,
        email: reg.email,
        phone: reg.phone,
        street: reg.street,
        postalCode: reg.postalCode,
        city: reg.city,
        canton: reg.canton,
        guardianName: reg.guardianName,
        guardianEmail: reg.guardianEmail,
        guardianPhone: reg.guardianPhone,
        emergencyContact: reg.guardianPhone || reg.phone,
        registrationDate: new Date().toISOString().split('T')[0],
        assignedClassIds: [reg.requestedClassId],
        pricingCategory: category,
        status: 'active',
        pointBalance: 0,
        billingContact: reg.isMinor ? 'guardian' : 'student',
        createdAt: new Date().toISOString()
      };
      setStudents(prev => [student!, ...prev]);
    } else {
      // Add class to existing student
      if (!student.assignedClassIds.includes(reg.requestedClassId)) {
        setStudents(prev => prev.map(s => s.id === student!.id ? {
          ...s,
          assignedClassIds: [...s.assignedClassIds, reg.requestedClassId]
        } : s));
      }
    }

    // Enroll into class
    setClasses(prev => prev.map(c => {
      if (c.id === reg.requestedClassId && !c.enrolledStudentIds.includes(student!.id)) {
        return { ...c, enrolledStudentIds: [...c.enrolledStudentIds, student!.id] };
      }
      return c;
    }));

    // Mark registration approved
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'approved' } : r));

    addToast({
      type: 'success',
      title: 'Registration approved!',
      message: `${reg.studentFirstName} ${reg.studentLastName} enrolled into selected class.`
    });
  };

  const updateRegistrationStatus = (regId: string, status: Registration['status']) => {
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status } : r));
    addToast({
      type: 'info',
      title: `Registration updated`,
      message: `Status marked as ${status}.`
    });
  };

  // Invoicing & Billing
  const createInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'qrReference'>): Invoice => {
    const nextNumber = 40 + invoices.length;
    const invNum = `INV-2026-${String(nextNumber).padStart(4, '0')}`;
    const qrNum = 20260000 + nextNumber;
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      invoiceNumber: invNum,
      qrReference: generateSwissQRReference(qrNum)
    };
    setInvoices(prev => [newInvoice, ...prev]);
    addToast({
      type: 'success',
      title: 'Invoice created',
      message: `${invNum} issued for CHF ${newInvoice.totalAmountCHF.toFixed(2)}.`
    });
    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status'], paidAmount?: number) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      return {
        ...inv,
        status,
        paidAmountCHF: paidAmount !== undefined ? paidAmount : (status === 'paid' ? inv.totalAmountCHF : inv.paidAmountCHF)
      };
    }));
  };

  const recordPayment = (invoiceId: string, amountCHF: number, note?: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const newPaid = Math.min(inv.totalAmountCHF, inv.paidAmountCHF + amountCHF);
      const isFullyPaid = newPaid >= inv.totalAmountCHF;
      return {
        ...inv,
        paidAmountCHF: newPaid,
        status: isFullyPaid ? 'paid' : 'partially_paid',
        notes: note ? `${inv.notes ? inv.notes + ' | ' : ''}${note}` : inv.notes
      };
    }));
    addToast({
      type: 'success',
      title: 'Payment recorded',
      message: `CHF ${amountCHF.toFixed(2)} applied to invoice.`
    });
  };

  const sendReminder = (invoiceId: string, type: 'first_notice' | 'second_notice' | 'final_notice') => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    const student = students.find(s => s.id === inv.studentId);
    const email = student?.guardianEmail || student?.email || 'contact@example.ch';

    const log: ReminderLog = {
      id: `rem-${Date.now()}`,
      invoiceId,
      studentId: inv.studentId,
      recipientEmail: email,
      reminderType: type,
      sentAt: new Date().toISOString(),
      status: 'sent',
      note: `Polite Swiss reminder sent for outstanding balance CHF ${(inv.totalAmountCHF - inv.paidAmountCHF).toFixed(2)}`,
      simulated: true
    };

    setReminderLogs(prev => [log, ...prev]);
    setInvoices(prev => prev.map(i => i.id === invoiceId ? {
      ...i,
      lastReminderSentAt: new Date().toISOString(),
      reminderCount: (i.reminderCount || 0) + 1
    } : i));

    addToast({
      type: 'success',
      title: 'Reminder sent (Simulated)',
      message: `Notice dispatched to ${email}.`
    });
  };

  // Attendance
  const recordAttendance = (recordData: Omit<AttendanceRecord, 'id'>) => {
    const existingIndex = attendance.findIndex(
      a => a.classId === recordData.classId && a.date === recordData.date && a.studentId === recordData.studentId
    );
    if (existingIndex >= 0) {
      setAttendance(prev => prev.map((a, idx) => idx === existingIndex ? { ...a, ...recordData } : a));
    } else {
      const newRec: AttendanceRecord = {
        ...recordData,
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`
      };
      setAttendance(prev => [...prev, newRec]);
    }
  };

  const bulkMarkClassAttendance = (classId: string, date: string, status: AttendanceRecord['status']) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;

    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.classId === classId && a.date === date));
      const newRecords: AttendanceRecord[] = cls.enrolledStudentIds.map(stuId => ({
        id: `att-${Date.now()}-${stuId}`,
        classId,
        date,
        studentId: stuId,
        status,
        isDropIn: false,
        recordedBy: teachers.find(t => t.id === cls.teacherId)?.name || 'Admin'
      }));
      return [...filtered, ...newRecords];
    });

    addToast({
      type: 'success',
      title: 'Class attendance recorded',
      message: `All enrolled students marked as ${status}.`
    });
  };

  // Point Cards
  const issuePointCard = (data: Omit<PointCard, 'id' | 'cardCode'>): PointCard => {
    const cardCode = `PC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newCard: PointCard = {
      ...data,
      id: `pc-${Date.now()}`,
      cardCode
    };
    setPointCards(prev => [newCard, ...prev]);

    // Update student balance
    setStudents(prev => prev.map(s => s.id === data.studentId ? {
      ...s,
      pointBalance: s.pointBalance + data.totalPoints
    } : s));

    // Ledger
    const tx: PointCardTransaction = {
      id: `ptx-${Date.now()}`,
      cardId: newCard.id,
      studentId: data.studentId,
      type: 'purchase',
      points: data.totalPoints,
      date: new Date().toISOString(),
      reason: `Purchased ${data.cardType} (${cardCode})`,
      recordedBy: 'Admin'
    };
    setPointCardTxs(prev => [tx, ...prev]);

    addToast({
      type: 'success',
      title: 'Point card issued',
      message: `${newCard.cardCode} issued with ${data.totalPoints} points.`
    });

    return newCard;
  };

  const redeemPoint = (cardId: string, className: string, studentId: string): boolean => {
    const card = pointCards.find(c => c.id === cardId);
    if (!card || card.remainingPoints <= 0 || card.status !== 'active') {
      addToast({
        type: 'error',
        title: 'Cannot redeem point',
        message: 'Point card is exhausted, expired, or invalid.'
      });
      return false;
    }

    const newPoints = card.remainingPoints - 1;
    setPointCards(prev => prev.map(c => c.id === cardId ? {
      ...c,
      remainingPoints: newPoints,
      status: newPoints === 0 ? 'exhausted' : 'active'
    } : c));

    setStudents(prev => prev.map(s => s.id === studentId ? {
      ...s,
      pointBalance: Math.max(0, s.pointBalance - 1)
    } : s));

    const tx: PointCardTransaction = {
      id: `ptx-${Date.now()}`,
      cardId,
      studentId,
      type: 'redemption',
      points: -1,
      date: new Date().toISOString(),
      className,
      reason: `Drop-in attendance redeemed for ${className}`,
      recordedBy: 'Teacher'
    };
    setPointCardTxs(prev => [tx, ...prev]);

    addToast({
      type: 'success',
      title: '1 Point redeemed',
      message: `${newPoints} points remaining on pass ${card.cardCode}.`
    });

    return true;
  };

  // Bank Reconciliation
  const reconcileTransaction = (transactionId: string, invoiceId: string) => {
    const tx = bankTransactions.find(t => t.id === transactionId);
    const inv = invoices.find(i => i.id === invoiceId);
    if (!tx || !inv) return;

    // Apply payment
    recordPayment(invoiceId, tx.amountCHF, `Reconciled from ${tx.transactionId} (${tx.debtorName})`);

    // Update transaction
    setBankTransactions(prev => prev.map(t => t.id === transactionId ? {
      ...t,
      status: 'matched',
      matchedInvoiceId: invoiceId,
      reconciledAt: new Date().toISOString(),
      reconciledBy: 'Finance'
    } : t));

    addToast({
      type: 'success',
      title: 'Reconciliation successful',
      message: `Bank payment matched to ${inv.invoiceNumber}.`
    });
  };

  const rejectTransactionMatch = (transactionId: string) => {
    setBankTransactions(prev => prev.map(t => t.id === transactionId ? {
      ...t,
      status: 'unmatched',
      matchedInvoiceId: undefined,
      confidenceScore: 0,
      matchReason: 'Manually unlinked by operator'
    } : t));
    addToast({
      type: 'info',
      title: 'Match dismissed',
      message: 'Transaction returned to unmatched queue.'
    });
  };

  const importBankTransactions = (newTxs: BankTransaction[]) => {
    setBankTransactions(prev => [...newTxs, ...prev]);
    addToast({
      type: 'success',
      title: 'Bank file imported',
      message: `${newTxs.length} bank transactions parsed and ready for reconciliation.`
    });
  };

  const importStudentsCSV = (newStudentsData: Partial<Student>[]) => {
    let added = 0;
    let skipped = 0;
    const existingEmails = new Set(students.map(s => s.email.toLowerCase()));

    const toAdd: Student[] = [];
    newStudentsData.forEach((row, idx) => {
      if (!row.firstName || !row.lastName || !row.email) {
        skipped++;
        return;
      }
      if (existingEmails.has(row.email.toLowerCase())) {
        skipped++;
        return;
      }

      existingEmails.add(row.email.toLowerCase());
      added++;
      toAdd.push({
        id: `stu-imp-${Date.now()}-${idx}`,
        studentId: row.studentId || `STU-${String(students.length + added).padStart(3, '0')}`,
        firstName: row.firstName,
        lastName: row.lastName,
        dateOfBirth: row.dateOfBirth || '2010-01-01',
        email: row.email,
        phone: row.phone || '+41 79 000 00 00',
        street: row.street || 'Bahnhofstrasse 1',
        postalCode: row.postalCode || '8001',
        city: row.city || 'Zürich',
        canton: row.canton || 'ZH',
        emergencyContact: row.emergencyContact || 'Parent',
        registrationDate: row.registrationDate || new Date().toISOString().split('T')[0],
        assignedClassIds: row.assignedClassIds || [],
        pricingCategory: row.pricingCategory || 'Teens',
        status: (row.status as any) || 'active',
        pointBalance: row.pointBalance || 0,
        billingContact: row.billingContact || 'student',
        createdAt: new Date().toISOString()
      });
    });

    if (toAdd.length > 0) {
      setStudents(prev => [...toAdd, ...prev]);
    }

    addToast({
      type: 'success',
      title: 'Migration complete',
      message: `Imported ${added} students (${skipped} skipped or duplicates).`
    });

    return { added, skipped };
  };

  const resetToDemoData = () => {
    setSettings(INITIAL_SETTINGS);
    setTeachers(INITIAL_TEACHERS);
    setRooms(INITIAL_ROOMS);
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setRegistrations(INITIAL_REGISTRATIONS);
    setPricingRules(INITIAL_PRICING_RULES);
    setInvoices(INITIAL_INVOICES);
    setPointCards(INITIAL_POINT_CARDS);
    setPointCardTxs(INITIAL_POINT_CARD_TXS);
    setAttendance(INITIAL_ATTENDANCE);
    setBankTransactions(INITIAL_BANK_TRANSACTIONS);
    setReminderLogs([]);
    
    // Clear localStorage items
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(STORAGE_PREFIX)) localStorage.removeItem(k);
    });

    addToast({
      type: 'info',
      title: 'Reset to Swiss demo state',
      message: 'All sample data, Swiss QR invoices, and classes have been reloaded.'
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        selectedStudentId,
        setSelectedStudentId,
        selectedInvoiceId,
        setSelectedInvoiceId,
        publicPortalOpen,
        setPublicPortalOpen,

        settings,
        updateSettings,
        teachers,
        rooms,
        classes,
        students,
        registrations,
        pricingRules,
        invoices,
        pointCards,
        pointCardTxs,
        attendance,
        bankTransactions,
        reminderLogs,

        addStudent,
        updateStudent,
        archiveStudent,

        addClass,
        updateClass,
        deleteClass,
        duplicateClass,

        addRegistration,
        approveRegistration,
        updateRegistrationStatus,

        createInvoice,
        updateInvoiceStatus,
        recordPayment,
        sendReminder,

        recordAttendance,
        bulkMarkClassAttendance,

        issuePointCard,
        redeemPoint,

        reconcileTransaction,
        rejectTransactionMatch,
        importBankTransactions,
        importStudentsCSV,

        resetToDemoData,

        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
