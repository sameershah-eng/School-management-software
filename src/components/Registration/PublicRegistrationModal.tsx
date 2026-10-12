import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  FileCheck
} from 'lucide-react';

interface PublicRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicRegistrationModal: React.FC<PublicRegistrationModalProps> = ({ isOpen, onClose }) => {
  const { classes, teachers, rooms, addRegistration, settings } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Class
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');

  // Step 2: Student details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2015-06-20');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+41 79 ');
  const [street, setStreet] = useState('Dufourstrasse 12');
  const [postalCode, setPostalCode] = useState('8008');
  const [city, setCity] = useState('Zürich');
  const [canton, setCanton] = useState('ZH');

  // Guardian details if minor
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('+41 79 ');

  // Step 3: Terms
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [notes, setNotes] = useState('');

  // Step 5: Submitted confirmation
  const [submittedRef, setSubmittedRef] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return Math.max(0, age);
  };

  const age = calculateAge(dateOfBirth);
  const isMinor = age < 18;
  const chosenClass = classes.find(c => c.id === selectedClassId);
  const chosenTeacher = teachers.find(t => t.id === chosenClass?.teacherId);
  const chosenRoom = rooms.find(r => r.id === chosenClass?.roomId);

  const handleNextFromDetails = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name required';
    if (!lastName.trim()) errs.lastName = 'Last name required';
    if (!dateOfBirth) errs.dateOfBirth = 'Date of birth required';
    if (!email.trim() && !isMinor) errs.email = 'Email required';
    if (isMinor) {
      if (!guardianName.trim()) errs.guardianName = 'Guardian name required for minors';
      if (!guardianEmail.trim()) errs.guardianEmail = 'Guardian email required for invoicing';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(3);
  };

  const handleSubmit = () => {
    if (!agreedToTerms) {
      setErrors({ terms: 'Please agree to the studio registration terms' });
      return;
    }

    const reg = addRegistration({
      studentFirstName: firstName.trim(),
      studentLastName: lastName.trim(),
      dateOfBirth,
      email: email.trim() || guardianEmail.trim(),
      phone: phone.trim(),
      street: street.trim(),
      postalCode: postalCode.trim(),
      city: city.trim(),
      canton: canton.trim().toUpperCase(),
      isMinor,
      guardianName: isMinor ? guardianName.trim() : undefined,
      guardianEmail: isMinor ? guardianEmail.trim() : undefined,
      guardianPhone: isMinor ? guardianPhone.trim() : undefined,
      requestedClassId: selectedClassId,
      notes: notes.trim(),
      agreedToTerms: true
    });

    setSubmittedRef(reg.registrationRef);
    setStep(5);

    // Launch celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl my-6 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Brand Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600/80 border border-violet-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">{settings.name}</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-violet-500/30 rounded text-violet-200">
                  Public Enrollment
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Official Swiss Dance School Registration</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        {step < 5 && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex items-center justify-between text-xs">
            {[
              { num: 1, label: 'Select Class' },
              { num: 2, label: 'Dancer Details' },
              { num: 3, label: 'Review & Terms' },
            ].map(s => (
              <div key={s.num} className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    step === s.num
                      ? 'bg-violet-600 text-white shadow-sm'
                      : step > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </span>
                <span className={`font-semibold ${step === s.num ? 'text-slate-900' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Body content */}
        <div className="p-6 max-h-[72vh] overflow-y-auto">
          {/* Step 1: Select Class */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Choose your dance class</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View schedule, instructor, age guidelines, and current studio availability.
                </p>
              </div>

              <div className="space-y-2.5">
                {classes.filter(c => c.active).map(cls => {
                  const teacher = teachers.find(t => t.id === cls.teacherId);
                  const isSelected = selectedClassId === cls.id;
                  const isFull = cls.enrolledStudentIds.length >= cls.capacity;

                  return (
                    <div
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between text-xs ${
                        isSelected
                          ? 'border-violet-600 bg-violet-50/60 shadow-sm ring-1 ring-violet-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-2.5 h-10 rounded-full shrink-0 mt-0.5"
                          style={{ backgroundColor: cls.color }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{cls.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-medium">
                              {cls.danceStyle}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-500 mt-1">
                            <span className="font-mono-num font-semibold text-slate-800">
                              {cls.dayOfWeek} {cls.startTime}–{cls.endTime}
                            </span>
                            <span>•</span>
                            <span>Ages {cls.minAge}–{cls.maxAge}</span>
                            <span>•</span>
                            <span>{teacher?.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-semibold ${isFull ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {isFull ? 'Waitlist Only' : `${cls.capacity - cls.enrolledStudentIds.length} spots left`}
                        </span>
                        <div className="mt-1">
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center ml-auto ${
                            isSelected ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && '✓'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/20 flex items-center gap-1.5 transition"
                >
                  <span>Continue to Dancer Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Student Details */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-base text-slate-900">Student & Contact Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selected course: <strong>{chosenClass?.name}</strong> ({chosenClass?.dayOfWeek} {chosenClass?.startTime})
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Sophie"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500"
                  />
                  {errors.firstName && <p className="text-[10px] text-rose-500 mt-0.5">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Brunner"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500"
                  />
                  {errors.lastName && <p className="text-[10px] text-rose-500 mt-0.5">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date of Birth * (Age: {age} yrs)
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+41 79 000 00 00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Guardian Info if Minor */}
              {isMinor && (
                <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-100 space-y-3">
                  <div className="flex items-center gap-2 text-violet-950 font-bold">
                    <ShieldAlert className="w-4 h-4 text-violet-600" />
                    <span>Parent or Legal Guardian Information (Required for Minors)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-violet-900 mb-1">Guardian Full Name *</label>
                      <input
                        type="text"
                        value={guardianName}
                        onChange={e => setGuardianName(e.target.value)}
                        placeholder="Andrea Brunner"
                        className="w-full px-3 py-1.5 rounded-lg border border-violet-200 bg-white"
                      />
                      {errors.guardianName && <p className="text-[10px] text-rose-500 mt-0.5">{errors.guardianName}</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-violet-900 mb-1">Guardian Email (for Invoicing) *</label>
                      <input
                        type="email"
                        value={guardianEmail}
                        onChange={e => setGuardianEmail(e.target.value)}
                        placeholder="andrea.brunner@postmail.ch"
                        className="w-full px-3 py-1.5 rounded-lg border border-violet-200 bg-white"
                      />
                      {errors.guardianEmail && <p className="text-[10px] text-rose-500 mt-0.5">{errors.guardianEmail}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-violet-900 mb-1">Guardian Phone (Emergency)</label>
                      <input
                        type="text"
                        value={guardianPhone}
                        onChange={e => setGuardianPhone(e.target.value)}
                        placeholder="+41 79 611 44 90"
                        className="w-full px-3 py-1.5 rounded-lg border border-violet-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Swiss Street & Number</label>
                  <input
                    type="text"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="Bellerivestrasse 28"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PLZ (Zip)</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    placeholder="8008"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Zürich"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Canton</label>
                  <input
                    type="text"
                    value={canton}
                    onChange={e => setCanton(e.target.value)}
                    placeholder="ZH"
                    maxLength={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleNextFromDetails}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-violet-600/20"
                >
                  <span>Review & Terms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Terms and Confirmation */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-base text-slate-900">Review & Confirmation</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm class registration details for {firstName} {lastName}.
                </p>
              </div>

              {/* Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Selected Class</span>
                  <span className="font-bold text-slate-900">{chosenClass?.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Schedule</span>
                  <span className="font-medium text-slate-800">
                    {chosenClass?.dayOfWeek} • {chosenClass?.startTime}–{chosenClass?.endTime}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Teacher & Studio</span>
                  <span className="font-medium text-slate-800">
                    {chosenTeacher?.name} • {chosenRoom?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Dancer Name</span>
                  <span className="font-bold text-slate-900">{firstName} {lastName} (Age {age})</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Invoice Recipient</span>
                  <span className="font-medium text-slate-800">
                    {isMinor ? `${guardianName} (${guardianEmail})` : email}
                  </span>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                  />
                  <span className="text-slate-700 leading-normal">
                    I acknowledge and accept the <strong>DanseFlow Dance Studio Terms of Registration</strong>. Invoicing will occur quarterly via official Swiss QR-bill payable within 30 days. Missed classes may be rescheduled within the same term.
                  </span>
                </label>
                {errors.terms && <p className="text-[11px] text-rose-500">{errors.terms}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Additional notes or medical details (optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Prior dance experience, special physical considerations..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-violet-600/25 active:scale-95 transition"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Submit Registration</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Submitted Confirmation */}
          {step === 5 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Registration Received!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Thank you! Your registration has been submitted to {settings.name}. The studio administration will review and confirm enrollment shortly.
                </p>
              </div>

              <div className="inline-block p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left max-w-sm mx-auto">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{submittedRef}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Class:</span>
                  <span className="font-semibold text-slate-800">{chosenClass?.name}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Dancer:</span>
                  <span className="font-semibold text-slate-800">{firstName} {lastName}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Payment:</span>
                  <span className="font-semibold text-slate-800">Swiss QR-Bill (Sent to Email)</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Return to Studio Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
