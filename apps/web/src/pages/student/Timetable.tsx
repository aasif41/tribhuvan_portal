import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { TimetableSlot } from '@tribhuvan/shared';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ArrowLeftRight, MapPin, User, Coffee } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function Timetable() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  
  const program = user?.student?.program || 'B.Sc (Hons.) Computer Science';
  const semester = user?.student?.semester || 6;

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const [settingsRes, slotsRes] = await Promise.all([
        api.get('/timetable/settings'),
        api.get(`/timetable?program=${program}&semester=${semester}`)
      ]);
      setTimeSlots(settingsRes.data.data || []);
      setSlots(slotsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching timetable', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSpan = (start: string, end: string) => {
    const startIndex = timeSlots.findIndex(t => t.start === start);
    const endIndex = timeSlots.findIndex(t => t.end === end);
    if (startIndex !== -1 && endIndex !== -1) {
      return (endIndex - startIndex) + 1;
    }
    return 1;
  };

  const renderDayRow = (day: string) => {
    const daySlots = slots.filter(s => s.day === day);
    const cells = [];

    const getSlotAtTime = (time: string) => daySlots.find(s => s.startTime === time);

    for (let i = 0; i < timeSlots.length; i++) {
      const timeSlot = timeSlots[i];
      
      if (timeSlot.isLunch) {
        cells.push(
          <td 
            key={`${day}-lunch-${i}`} 
            className="bg-amber-100 text-amber-950 border border-amber-300 p-2 text-center align-middle font-extrabold text-xs select-none tracking-widest min-w-[100px]"
          >
            LUNCH
          </td>
        );
        continue;
      }

      const classSlot = getSlotAtTime(timeSlot.start);

      if (classSlot) {
        const span = calculateSpan(classSlot.startTime, classSlot.endTime);
        const colSpan = span * 2 - 1;
        const teacherName = (classSlot as any).teacher?.user?.name || (classSlot.subject as any)?.teacher?.user?.name || 'Faculty TBA';
        
        cells.push(
          <td 
            key={`${day}-class-${i}`} 
            colSpan={colSpan} 
            className="bg-blue-50 hover:bg-blue-100/90 transition-colors border border-slate-300 p-2.5 text-center align-middle"
          >
            <div className="font-bold text-xs sm:text-sm text-navy leading-tight whitespace-normal">
              {classSlot.subject.name}
            </div>
            <div className="text-[11px] text-slate-600 font-medium mt-1 flex items-center justify-center gap-1 whitespace-nowrap">
              <User size={11} className="text-slate-400 shrink-0" />
              <span>{teacherName}</span>
            </div>
          </td>
        );
        cells.push(
          <td 
            key={`${day}-cr-${i}`} 
            className="font-bold text-xs text-amber-950 bg-amber-50 border border-slate-300 p-1.5 text-center align-middle whitespace-nowrap min-w-[55px]"
          >
            {classSlot.room && classSlot.room !== 'TBA' ? (
              <span className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-amber-200/80 rounded text-[11px]">
                <MapPin size={10} className="shrink-0" />
                {classSlot.room}
              </span>
            ) : '-'}
          </td>
        );
        
        i += (span - 1);
      } else {
        cells.push(<td key={`${day}-empty-${i}`} className="border border-slate-200 bg-white min-w-[140px]"></td>);
        cells.push(<td key={`${day}-cr-${i}`} className="border border-slate-200 bg-slate-50/40 min-w-[55px]"></td>);
      }
    }

    return cells;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Timetable" subtitle="Your weekly class schedule" />
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  // Calculate total columns count for title header
  const totalCols = 1 + 1 + timeSlots.reduce((acc, t) => acc + (t.isLunch ? 1 : 2), 0);

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader title="Timetable" subtitle={`${program} • Semester ${semester}`} />

      {/* Horizontal Scroll Hint Banner for Mobile */}
      <div className="sm:hidden flex items-center justify-between px-3.5 py-2.5 bg-navy/5 rounded-xl border border-navy/10 text-xs font-semibold text-navy select-none">
        <span className="flex items-center gap-2">
          <ArrowLeftRight size={14} className="text-gold shrink-0 animate-pulse" />
          <span>Swipe left to right to see full timetable</span>
        </span>
        <span className="text-xs font-bold text-gold bg-navy px-2 py-0.5 rounded">← →</span>
      </div>

      {/* Scrollable Timetable Card */}
      <div 
        className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm scrollbar-thin relative"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
      >
        <table 
          className="border-collapse border border-slate-300 text-xs" 
          style={{ minWidth: '1350px', width: 'max-content' }}
        >
          <thead>
            {/* Title Header */}
            <tr className="bg-navy text-white">
              <th 
                colSpan={totalCols} 
                className="py-3 px-4 font-bold text-sm bg-navy text-gold text-center border-b-2 border-gold/30 tracking-wide"
              >
                {program} — Semester {semester} Class Timetable
              </th>
            </tr>

            {/* Time Header Slots */}
            <tr className="bg-slate-100 text-slate-800">
              <th className="w-28 min-w-[110px] p-3 font-extrabold bg-navy text-gold border border-slate-300 text-center uppercase tracking-wider text-xs sticky left-0 z-30 shadow-md">
                Day
              </th>
              <th className="w-3 min-w-[12px] border border-slate-300 bg-slate-200 sticky left-[110px] z-30"></th>
              
              {timeSlots.map(slot => {
                if (slot.isLunch) {
                  return (
                    <th 
                      key={slot.id} 
                      className="w-28 min-w-[100px] p-2.5 font-bold text-amber-900 bg-amber-200/90 border border-slate-300 text-center whitespace-nowrap text-xs"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Coffee size={13} className="text-amber-800 shrink-0" />
                        <span>LUNCH ({slot.label || '12:55 - 1:35'})</span>
                      </div>
                    </th>
                  );
                }
                return (
                  <React.Fragment key={slot.id}>
                    <th 
                      className="w-36 min-w-[140px] p-2.5 font-bold text-slate-800 bg-slate-100 border border-slate-300 text-center whitespace-nowrap text-xs"
                    >
                      {slot.label || `${slot.start} - ${slot.end}`}
                    </th>
                    <th 
                      className="w-14 min-w-[55px] p-2 font-bold text-slate-600 bg-slate-200 border border-slate-300 text-center text-[11px]"
                    >
                      CR
                    </th>
                  </React.Fragment>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {/* DAY ROWS */}
            {DAYS.map(day => (
              <tr key={day} className="h-24">
                <td className="p-3 bg-navy text-gold font-bold text-center border border-slate-300 align-middle text-sm sticky left-0 z-20 shadow-md">
                  {day}
                </td>
                <td className="border border-slate-300 bg-slate-200 sticky left-[110px] z-20"></td>
                {renderDayRow(day)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
