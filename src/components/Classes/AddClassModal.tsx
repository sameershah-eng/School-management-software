import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Clock, MapPin, User, Sparkles } from 'lucide-react';
import { ClassItem } from '../../types';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose }) => {
  const { addClass, teachers, rooms } = useApp();

  const [name, setName] = useState('');
  const [danceStyle, setDanceStyle] = useState('Ballet');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [dayOfWeek, setDayOfWeek] = useState<ClassItem['dayOfWeek']>('Monday');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:15');
  const [capacity, setCapacity] = useState(16);
  const [minAge, setMinAge] = useState(8);
  const [maxAge, setMaxAge] = useState(16);
  const [color, setColor] = useState('#8B5CF6');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Class name is required';
    if (!teacherId) newErrors.teacherId = 'Select a dance teacher';
    if (!roomId) newErrors.roomId = 'Select a studio room';
    if (startTime >= endTime) newErrors.time = 'End time must be after start time';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addClass({
      name: name.trim(),
      danceStyle,
      teacherId,
      roomId,
      dayOfWeek,
      startTime,
      endTime,
      capacity,
      minAge,
      maxAge,
      priceCategoryId: 'prc-teens-1',
      active: true,
      color,
      description: description.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Dance Class</h3>
              <p className="text-xs text-slate-400">Schedule timetable session and studio room</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Class Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Contemporary Floorwork & Flow"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dance Style</label>
              <select
                value={danceStyle}
                onChange={e => setDanceStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Ballet">Ballet</option>
                <option value="Contemporary">Contemporary</option>
                <option value="Hip-Hop">Hip-Hop & Urban</option>
                <option value="Salsa">Salsa & Latin</option>
                <option value="Jazz">Jazz Dance</option>
                <option value="Creative Movement">Creative Movement</option>
                <option value="Pointe & Barre">Pointe & Barre</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Studio Color Accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-9 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <span className="font-mono text-slate-500">{color}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Instructor *</label>
              <select
                value={teacherId}
                onChange={e => setTeacherId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.specialities.join(', ')})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Studio Room *</label>
              <select
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name} (Max {r.capacity})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Day of the Week</label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Capacity</label>
              <input
                type="number"
                min={5}
                max={40}
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Min Age</label>
                <input
                  type="number"
                  min={3}
                  max={99}
                  value={minAge}
                  onChange={e => setMinAge(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Age</label>
                <input
                  type="number"
                  min={4}
                  max={99}
                  value={maxAge}
                  onChange={e => setMaxAge(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description & Requirements</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Barefoot or socks, suitable for intermediate level dancers..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              Add Class to Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
