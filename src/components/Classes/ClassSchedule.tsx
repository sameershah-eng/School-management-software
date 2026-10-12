import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  ListFilter,
  Plus,
  Clock,
  MapPin,
  User,
  Users,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';
import { ClassItem } from '../../types';

interface ClassScheduleProps {
  onOpenAddClass: () => void;
}

export const ClassSchedule: React.FC<ClassScheduleProps> = ({ onOpenAddClass }) => {
  const {
    classes,
    teachers,
    rooms,
    students,
    duplicateClass,
    deleteClass,
    addClass,
    updateClass,
    setSelectedStudentId
  } = useApp();

  const [viewMode, setViewMode] = useState<'timetable' | 'list'>('timetable');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');

  const [viewingClassRoster, setViewingClassRoster] = useState<ClassItem | null>(null);

  const daysOrder: Array<ClassItem['dayOfWeek']> = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  // Schedule conflict detection
  const conflicts: Array<{ classA: ClassItem; classB: ClassItem; reason: string }> = [];
  for (let i = 0; i < classes.length; i++) {
    for (let j = i + 1; j < classes.length; j++) {
      const a = classes[i];
      const b = classes[j];
      if (a.dayOfWeek === b.dayOfWeek && a.active && b.active) {
        // Time overlap test
        const overlap = a.startTime < b.endTime && b.startTime < a.endTime;
        if (overlap) {
          if (a.roomId === b.roomId) {
            conflicts.push({
              classA: a,
              classB: b,
              reason: `Room collision in ${rooms.find(r => r.id === a.roomId)?.name || 'Studio'}`
            });
          } else if (a.teacherId === b.teacherId) {
            conflicts.push({
              classA: a,
              classB: b,
              reason: `Instructor collision for ${teachers.find(t => t.id === a.teacherId)?.name}`
            });
          }
        }
      }
    }
  }

  // Filtered classes
  const filteredClasses = classes.filter(c => {
    if (selectedDay !== 'all' && c.dayOfWeek !== selectedDay) return false;
    if (selectedTeacherId !== 'all' && c.teacherId !== selectedTeacherId) return false;
    if (selectedRoomId !== 'all' && c.roomId !== selectedRoomId) return false;
    if (selectedStyle !== 'all' && c.danceStyle !== selectedStyle) return false;
    return true;
  });

  const danceStyles = Array.from(new Set(classes.map(c => c.danceStyle)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Classes & Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Weekly studio schedule, dance styles, teacher assignments, and capacity monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setViewMode('timetable')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'timetable'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Timetable Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={onOpenAddClass}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Conflict Alert Banner if any */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold">Schedule Overlap Detected</h4>
            <p className="mt-0.5 text-amber-800">
              {conflicts.map((c, idx) => (
                <span key={idx} className="block mt-1">
                  • <strong>{c.classA.name}</strong> and <strong>{c.classB.name}</strong> on {c.classA.dayOfWeek} ({c.classA.startTime}–{c.classA.endTime}): {c.reason}.
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center gap-2.5">
        <select
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Days</option>
          {daysOrder.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>

        <select
          value={selectedTeacherId}
          onChange={e => setSelectedTeacherId(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Instructors</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select
          value={selectedRoomId}
          onChange={e => setSelectedRoomId(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Studios / Rooms</option>
          {rooms.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <select
          value={selectedStyle}
          onChange={e => setSelectedStyle(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Dance Styles</option>
          {danceStyles.map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>

        <span className="text-xs text-slate-400 ml-auto font-medium">
          Showing {filteredClasses.length} of {classes.length} classes
        </span>
      </div>

      {/* Main Views */}
      {viewMode === 'timetable' ? (
        /* Weekly Timetable View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3.5 items-start">
          {daysOrder.map(day => {
            const dayClasses = filteredClasses.filter(c => c.dayOfWeek === day);
            const isToday = day === daysOrder[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

            return (
              <div
                key={day}
                className={`rounded-2xl border p-3.5 min-h-[340px] flex flex-col ${
                  isToday
                    ? 'bg-violet-50/40 border-violet-200 ring-2 ring-violet-500/20'
                    : 'bg-white border-slate-200/80 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{day}</span>
                    {isToday && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-violet-600 text-white">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 font-mono">
                    {dayClasses.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {dayClasses.length > 0 ? (
                    dayClasses.map(cls => {
                      const teacher = teachers.find(t => t.id === cls.teacherId);
                      const room = rooms.find(r => r.id === cls.roomId);
                      const enrolledCount = cls.enrolledStudentIds.length;
                      const isFull = enrolledCount >= cls.capacity;

                      return (
                        <div
                          key={cls.id}
                          className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-violet-300 transition group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1 mb-1.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0 mt-1"
                                style={{ backgroundColor: cls.color }}
                              />
                              <h4 className="font-bold text-xs text-slate-900 group-hover:text-violet-600 transition flex-1 leading-snug">
                                {cls.name}
                              </h4>
                            </div>

                            <div className="space-y-1 text-[11px] text-slate-500">
                              <p className="flex items-center gap-1 font-mono-num font-medium text-slate-700">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {cls.startTime} – {cls.endTime}
                              </p>
                              <p className="flex items-center gap-1 truncate">
                                <User className="w-3 h-3 text-slate-400" />
                                {teacher?.name.split(' ')[0] || 'Teacher'}
                              </p>
                              <p className="flex items-center gap-1 truncate text-slate-400">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {room?.name.split(' ')[0] || 'Studio'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className={`text-[10px] font-semibold ${isFull ? 'text-amber-600' : 'text-slate-500'}`}>
                              {enrolledCount}/{cls.capacity} spots
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setViewingClassRoster(cls)}
                                className="p-1 rounded text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition"
                                title="View enrolled dancers"
                              >
                                <Users className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => duplicateClass(cls.id)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                title="Duplicate class"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center py-8 text-center text-slate-300 text-[11px]">
                      No classes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Class Name</th>
                <th className="py-3 px-4">Style</th>
                <th className="py-3 px-4">Day & Time</th>
                <th className="py-3 px-4">Teacher</th>
                <th className="py-3 px-4">Studio Room</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClasses.map(cls => {
                const teacher = teachers.find(t => t.id === cls.teacherId);
                const room = rooms.find(r => r.id === cls.roomId);
                const enrolled = cls.enrolledStudentIds.length;

                return (
                  <tr key={cls.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cls.color }} />
                        <span className="font-bold text-slate-900">{cls.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{cls.danceStyle}</td>
                    <td className="py-3.5 px-4 font-mono-num font-medium text-slate-800">
                      {cls.dayOfWeek} {cls.startTime}–{cls.endTime}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{teacher?.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{room?.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold">{enrolled} / {cls.capacity}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => setViewingClassRoster(cls)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
                      >
                        Roster ({enrolled})
                      </button>
                      <button
                        onClick={() => duplicateClass(cls.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Class Enrolled Roster Modal */}
      {viewingClassRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{viewingClassRoster.name}</h3>
                <p className="text-xs text-slate-400">
                  {viewingClassRoster.dayOfWeek} • {viewingClassRoster.startTime}–{viewingClassRoster.endTime} • {viewingClassRoster.enrolledStudentIds.length} dancers enrolled
                </p>
              </div>
              <button
                onClick={() => setViewingClassRoster(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-80 overflow-y-auto space-y-2 text-xs">
              {viewingClassRoster.enrolledStudentIds.length > 0 ? (
                viewingClassRoster.enrolledStudentIds.map(stuId => {
                  const s = students.find(item => item.id === stuId);
                  if (!s) return null;
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setViewingClassRoster(null);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-violet-50/70 hover:border-violet-300 cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs">
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{s.firstName} {s.lastName}</p>
                          <p className="text-[10px] text-slate-400">{s.phone} • {s.city}</p>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{s.studentId}</span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400">
                  No students currently enrolled in this class.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingClassRoster(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
