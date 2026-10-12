import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  Calendar,
  Users,
  Clock,
  UserCheck,
  UserX,
  CreditCard,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatSwissDate } from '../../utils/swissQr';
import { AttendanceRecord } from '../../types';

export const AttendanceTracker: React.FC = () => {
  const {
    classes,
    students,
    teachers,
    attendance,
    recordAttendance,
    bulkMarkClassAttendance,
    pointCards,
    redeemPoint,
    addToast
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dropInStudentId, setDropInStudentId] = useState<string>('');
  const [showDropInPicker, setShowDropInPicker] = useState(false);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const teacher = teachers.find(t => t.id === selectedClass?.teacherId);

  // Enrolled students for this class
  const enrolledStudents = students.filter(s => selectedClass?.enrolledStudentIds.includes(s.id));

  // Current attendance records for selected class and date
  const classRecords = attendance.filter(
    a => a.classId === selectedClassId && a.date === selectedDate
  );

  // Drop-in students present in this session
  const dropInRecords = classRecords.filter(a => a.isDropIn);

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status'], isDropIn = false, pointCardId?: string) => {
    recordAttendance({
      classId: selectedClassId,
      date: selectedDate,
      studentId,
      status,
      isDropIn,
      pointCardId,
      recordedBy: teacher?.name || 'Instructor'
    });
  };

  const handleAddDropIn = () => {
    if (!dropInStudentId || !selectedClass) return;
    const student = students.find(s => s.id === dropInStudentId);
    if (!student) return;

    // Check if student has active point card
    const activeCard = pointCards.find(c => c.studentId === student.id && c.status === 'active' && c.remainingPoints > 0);

    if (activeCard) {
      // Redeem 1 point
      const success = redeemPoint(activeCard.id, selectedClass.name, student.id);
      if (success) {
        handleStatusChange(student.id, 'present', true, activeCard.id);
      }
    } else {
      // Direct drop in without card
      handleStatusChange(student.id, 'present', true);
      addToast({
        type: 'info',
        title: 'Drop-In logged without pass',
        message: `${student.firstName} ${student.lastName} checked in as single drop-in.`
      });
    }

    setShowDropInPicker(false);
    setDropInStudentId('');
  };

  const presentCount = classRecords.filter(a => a.status === 'present').length;
  const lateCount = classRecords.filter(a => a.status === 'late').length;
  const absentCount = classRecords.filter(a => a.status === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Class Attendance Roll
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daily studio check-in, student attendance, and automatic point-card redemption for drop-ins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => bulkMarkClassAttendance(selectedClassId, selectedDate, 'present')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>
        </div>
      </div>

      {/* Selector Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:border-violet-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.dayOfWeek} {c.startTime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Session Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-violet-500"
            >
            </input>
          </div>
        </div>

        {/* Quick Session Stats */}
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{presentCount} Present</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{lateCount} Late</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{absentCount} Absent</span>
          </div>
        </div>
      </div>

      {/* Enrolled Students Roster */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Enrolled Dancers ({enrolledStudents.length})
            </h3>
            <p className="text-xs text-slate-400">
              Instructor: {teacher?.name || 'Staff'} • {formatSwissDate(selectedDate)}
            </p>
          </div>

          <button
            onClick={() => setShowDropInPicker(!showDropInPicker)}
            className="px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 text-xs font-semibold border border-violet-200 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Drop-In Student</span>
          </button>
        </div>

        {/* Drop in picker expansion */}
        {showDropInPicker && (
          <div className="p-4 bg-violet-50/50 border-b border-violet-100 flex flex-wrap items-center gap-3 animate-in fade-in">
            <span className="text-xs font-semibold text-violet-900">Choose Student for Drop-In:</span>
            <select
              value={dropInStudentId}
              onChange={e => setDropInStudentId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-violet-200 bg-white"
            >
              <option value="">Select dancer...</option>
              {students.map(s => {
                const pass = pointCards.find(c => c.studentId === s.id && c.status === 'active' && c.remainingPoints > 0);
                return (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} {pass ? `(${pass.remainingPoints} pts on card)` : '(No active card)'}
                  </option>
                );
              })}
            </select>
            <button
              onClick={handleAddDropIn}
              className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-sm"
            >
              Check-In & Deduct 1 Point
            </button>
            <button
              onClick={() => setShowDropInPicker(false)}
              className="text-xs text-slate-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {enrolledStudents.map(student => {
            const currentRecord = classRecords.find(a => a.studentId === student.id);
            const currentStatus = currentRecord?.status || 'present';

            return (
              <div
                key={student.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {student.firstName} {student.lastName}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {student.studentId} • {student.pricingCategory} • {student.phone}
                    </p>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {(['present', 'late', 'excused', 'absent'] as const).map(status => {
                    const isSelected = currentStatus === status;
                    const colors = {
                      present: isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'hover:bg-emerald-50 text-slate-600',
                      late: isSelected ? 'bg-amber-500 text-white shadow-sm' : 'hover:bg-amber-50 text-slate-600',
                      excused: isSelected ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-blue-50 text-slate-600',
                      absent: isSelected ? 'bg-rose-600 text-white shadow-sm' : 'hover:bg-rose-50 text-slate-600'
                    };

                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(student.id, status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${colors[status]}`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Render drop-in students if any */}
          {dropInRecords.map(rec => {
            const student = students.find(s => s.id === rec.studentId);
            if (!student) return null;

            return (
              <div
                key={rec.id}
                className="p-4 bg-violet-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{student.firstName} {student.lastName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-200 text-violet-800">
                        Drop-in Pass
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      1 Point deducted from active pass
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-semibold">
                  Present (Drop-In)
                </span>
              </div>
            );
          })}

          {enrolledStudents.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No students enrolled in this class yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
