import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, Calendar, Phone, Mail, MapPin, AlertCircle, ShieldAlert } from 'lucide-react';
import { Student } from '../../types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const { addStudent, classes, pricingRules } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2014-05-15');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+41 79 ');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [canton, setCanton] = useState('ZH');
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('+41 79 ');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>([]);
  const [pricingCategory, setPricingCategory] = useState('Teens');
  const [notes, setNotes] = useState('');
  const [billingContact, setBillingContact] = useState<'student' | 'guardian'>('guardian');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Compute age from DOB
  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const age = calculateAge(dateOfBirth);
  const isMinor = age < 18;

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateOfBirth(val);
    const computedAge = calculateAge(val);
    if (computedAge < 10) setPricingCategory('Kids');
    else if (computedAge < 17) setPricingCategory('Teens');
    else setPricingCategory('Adults');

    if (computedAge < 18) {
      setBillingContact('guardian');
    }
  };

  const toggleClass = (classId: string) => {
    setAssignedClassIds(prev =>
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!email.trim() && !isMinor) newErrors.email = 'Email is required';
    if (isMinor && !guardianName.trim()) newErrors.guardianName = 'Parent/Guardian name is required for minors';
    if (isMinor && !guardianEmail.trim()) newErrors.guardianEmail = 'Parent/Guardian email is required for invoicing';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addStudent({
      studentId: '',
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      email: email.trim() || guardianEmail.trim(),
      phone: phone.trim(),
      street: street.trim() || 'Strasse 1',
      postalCode: postalCode.trim() || '8000',
      city: city.trim() || 'Zürich',
      canton: canton || 'ZH',
      guardianName: isMinor ? guardianName.trim() : undefined,
      guardianEmail: isMinor ? guardianEmail.trim() : undefined,
      guardianPhone: isMinor ? guardianPhone.trim() : undefined,
      emergencyContact: emergencyContact.trim() || (isMinor ? guardianPhone : phone),
      registrationDate: new Date().toISOString().split('T')[0],
      assignedClassIds,
      pricingCategory,
      notes: notes.trim(),
      status: 'active',
      pointBalance: 0,
      billingContact: isMinor ? 'guardian' : billingContact
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-sm">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Dance Student</h3>
              <p className="text-xs text-slate-400">Swiss registration profile and class assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Personal Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Student Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. Mia"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                />
                {errors.firstName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="e.g. Zimmermann"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                />
                {errors.lastName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth * (Age: {age} yrs)
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={handleDobChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pricing Category</label>
                <select
                  value={pricingCategory}
                  onChange={e => setPricingCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                >
                  <option value="Kids">Kids (Ages 4–9)</option>
                  <option value="Teens">Teens (Ages 10–16)</option>
                  <option value="Adults">Adults (Ages 17+)</option>
                  <option value="Drop-in">Drop-in Point Card</option>
                </select>
              </div>
            </div>
          </div>

          {/* Minor Guardian Section */}
          {isMinor && (
            <div className="p-4 rounded-xl bg-violet-50/60 border border-violet-100 space-y-3">
              <div className="flex items-center gap-2 text-violet-900">
                <ShieldAlert className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-bold">Minor Contact & Legal Guardian (Age under 18)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-violet-900 mb-1">Guardian Name *</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={e => setGuardianName(e.target.value)}
                    placeholder="Beat Zimmermann"
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-violet-200 focus:outline-none focus:border-violet-500"
                  />
                  {errors.guardianName && <p className="text-[10px] text-rose-500 mt-0.5">{errors.guardianName}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-violet-900 mb-1">Guardian Email (for QR Invoices) *</label>
                  <input
                    type="email"
                    value={guardianEmail}
                    onChange={e => setGuardianEmail(e.target.value)}
                    placeholder="beat.zimmermann@bluewin.ch"
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-violet-200 focus:outline-none focus:border-violet-500"
                  />
                  {errors.guardianEmail && <p className="text-[10px] text-rose-500 mt-0.5">{errors.guardianEmail}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-violet-900 mb-1">Guardian Mobile</label>
                  <input
                    type="text"
                    value={guardianPhone}
                    onChange={e => setGuardianPhone(e.target.value)}
                    placeholder="+41 79 432 90 12"
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-violet-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact and Address */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Swiss Address & Emergency
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!isMinor && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@example.ch"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+41 79 123 45 67"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street & House Number</label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="Seestrasse 145"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PLZ (ZIP)</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    placeholder="8002"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City & Canton</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Zürich"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      value={canton}
                      onChange={e => setCanton(e.target.value.toUpperCase())}
                      placeholder="ZH"
                      maxLength={2}
                      className="w-14 px-2 py-2 text-xs text-center uppercase font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Dr. Müller / Grandparent +41 79 111 22 33"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Class Enrollment */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Enroll into Classes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {classes.map(cls => {
                const isSelected = assignedClassIds.includes(cls.id);
                return (
                  <div
                    key={cls.id}
                    onClick={() => toggleClass(cls.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50/70 text-violet-950 font-medium'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{cls.name}</p>
                      <p className="text-[11px] text-slate-500">{cls.dayOfWeek} • {cls.startTime}</p>
                    </div>
                    <span className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      isSelected ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && '✓'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Medical / Dance background</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Prior ballet experience at Conservatory, allergy notes..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 transition active:scale-95"
            >
              Save Student Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
