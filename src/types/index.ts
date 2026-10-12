export type Role = 'admin' | 'owner' | 'teacher' | 'finance';

export interface Student {
  id: string;
  studentId: string; // e.g., 'STU-001'
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  canton: string;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  emergencyContact: string;
  registrationDate: string;
  assignedClassIds: string[];
  pricingCategory: string; // e.g., 'Kids', 'Teens', 'Adult'
  notes?: string;
  status: 'active' | 'inactive' | 'archived';
  pointBalance: number;
  billingContact: 'student' | 'guardian';
  createdAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialities: string[];
  bio: string;
  color: string;
  hourlyRateCHF: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  equipment: string[];
}

export interface ClassItem {
  id: string;
  name: string;
  danceStyle: string; // 'Ballet', 'Contemporary', 'Hip-Hop', 'Salsa', 'Jazz', etc.
  teacherId: string;
  roomId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacity: number;
  enrolledStudentIds: string[];
  minAge: number;
  maxAge: number;
  priceCategoryId: string;
  active: boolean;
  color: string;
  description?: string;
}

export interface Registration {
  id: string;
  registrationRef: string; // e.g., 'REG-2026-CH842'
  studentFirstName: string;
  studentLastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  canton: string;
  isMinor: boolean;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  requestedClassId: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  notes?: string;
  agreedToTerms: boolean;
}

export interface PricingRule {
  id: string;
  name: string;
  category: 'Kids' | 'Teens' | 'Adults' | 'Drop-in' | 'Unlimited';
  minAge: number;
  maxAge: number;
  weeklyClasses: number;
  monthlyCHF: number;
  termCHF: number; // 3-month term
  siblingDiscountPercent: number;
  description: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPriceCHF: number;
  totalCHF: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g., 'INV-2026-0042'
  studentId: string;
  studentName: string;
  billingPeriod: string; // e.g., 'Q1 2026' or 'March 2026'
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotalCHF: number;
  discountCHF: number;
  totalAmountCHF: number;
  paidAmountCHF: number;
  qrReference: string; // 27-digit Swiss QR reference
  paymentTerms: string;
  notes?: string;
  lastReminderSentAt?: string;
  reminderCount?: number;
}

export interface PointCard {
  id: string;
  cardCode: string; // e.g., 'PC-2026-904'
  studentId: string;
  studentName: string;
  cardType: '5-Class Pass' | '10-Class Pass' | '20-Class Pass';
  totalPoints: number;
  remainingPoints: number;
  purchaseDate: string;
  expiryDate: string;
  priceCHF: number;
  status: 'active' | 'exhausted' | 'expired' | 'cancelled';
}

export interface PointCardTransaction {
  id: string;
  cardId: string;
  studentId: string;
  type: 'purchase' | 'redemption' | 'refund' | 'adjustment';
  points: number; // e.g. -1 for redemption, +10 for purchase
  date: string;
  className?: string;
  reason: string;
  recordedBy: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  isDropIn: boolean;
  pointCardId?: string;
  note?: string;
  recordedBy: string;
}

export interface BankTransaction {
  id: string;
  transactionId: string;
  bookingDate: string;
  amountCHF: number;
  creditorName: string;
  debtorName: string;
  debtorIBAN: string;
  paymentReference: string;
  remittanceInfo: string;
  status: 'matched' | 'unmatched' | 'ambiguous' | 'ignored';
  matchedInvoiceId?: string;
  confidenceScore?: number; // 0-100
  matchReason?: string;
  reconciledAt?: string;
  reconciledBy?: string;
}

export interface ReminderLog {
  id: string;
  invoiceId: string;
  studentId: string;
  recipientEmail: string;
  reminderType: 'first_notice' | 'second_notice' | 'final_notice';
  sentAt: string;
  status: 'sent' | 'scheduled' | 'failed';
  note: string;
  simulated: boolean;
}

export interface SchoolSettings {
  name: string;
  legalName: string;
  street: string;
  postalCode: string;
  city: string;
  canton: string;
  country: string;
  email: string;
  phone: string;
  website: string;
  iban: string;
  qrIban: string;
  creditorName: string;
  currency: string;
  timezone: string;
  taxRatePercent: number;
  defaultPaymentTermsDays: number;
}
