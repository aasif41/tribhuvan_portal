import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { TimetableSlot } from '@tribhuvan/shared';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ArrowLeftRight, MapPin, User, Coffee, BookOpen } from 'lucide-react';

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

  const getTeacherInitials = (name?: string) => {
    if (!name) return 'TBA';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return parts.map(p => p[0]).join('').toUpperCase();
  };

  const renderDayRow = (day: string) => {
    const daySlots = slots.filter(s => s.day === day);
    const cells = [];

    const getSlotAtTime = (time: string) => daySlots.find(s => s.startTime === time);

    for (let i = 0; i < timeSlots.length; i++) {
      const timeSlot = timeSlots[i];
      
      if (timeSlot.isLunch) {
        // Lunch column is handled by rowSpan={6} in table body
        continue;
      }

      const classSlot = getSlotAtTime(timeSlot.start);

      if (classSlot) {
        const span = calculateSpan(classSlot.startTime, classSlot.endTime);
        const colSpan = span * 2 - 1;
        const teacherName = (classSlot as any).teacher?.user?.name || (classSlot.subject as any)?.teacher?.user?.name || '';
        const initials = getTeacherInitials(teacherName);
        
        cells.push(
          <td 
            key={`${day}-class-${i}`} 
            colSpan={colSpan} 
            className="bg-white hover:bg-slate-50 transition-colors border border-slate-700 p-2 text-center align-middle"
          >
            <div className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">
              {classSlot.subject.name}
            </div>
            {teacherName && (
              <div className="text-[11px] font-medium text-slate-600 mt-1 flex items-center justify-center gap-1">
                <User size={11} className="text-slate-400 shrink-0" />
                <span>({initials})</span>
              </div>
            )}
          </td>
        );
        cells.push(
          <td 
            key={`${day}-cr-${i}`} 
            className="font-bold text-xs text-slate-800 bg-slate-50 border border-slate-700 p-1 text-center align-middle whitespace-nowrap min-w-[50px]"
          >
            {classSlot.room && classSlot.room !== 'TBA' ? (
              <span className="inline-flex items-center justify-center gap-0.5 px-1 py-0.5 text-[11px] font-bold text-navy">
                <MapPin size={10} className="shrink-0 text-amber-700" />
                {classSlot.room}
              </span>
            ) : ''}
          </td>
        );
        
        i += (span - 1);
      } else {
        cells.push(<td key={`${day}-empty-${i}`} className="border border-slate-700 bg-white min-w-[140px]"></td>);
        cells.push(<td key={`${day}-cr-${i}`} className="border border-slate-700 bg-slate-50/50 min-w-[50px]"></td>);
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

      {/* Scrollable Official Timetable Frame */}
      <div 
        className="w-full max-w-full overflow-x-auto rounded-xl border-4 border-double border-slate-700 bg-white p-3 shadow-md scrollbar-thin relative"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .official-timetable {
              table-layout: fixed;
              border-collapse: separate;
              border-spacing: 2px;
              border: 2px solid #334155;
              min-width: 1350px;
              width: max-content;
              font-size: 0.825rem;
          }

          .official-timetable th, .official-timetable td {
              border: 1px solid #475569;
              padding: 6px;
              overflow: hidden;
          }

          .official-timetable th {
              white-space: nowrap;
          }

          .official-day-name {
              background-color: #334155 !important;
              color: #ffffff !important;
              writing-mode: vertical-rl;
              text-orientation: mixed;
              font-size: 0.95rem;
              font-weight: 700;
              text-align: center;
              width: 45px !important;
              min-width: 45px !important;
          }
        `}} />

        <table className="official-timetable" align="center">
          <thead>
            {/* Title Header Row */}
            <tr className="bg-white text-slate-900 border-b-2 border-slate-700">
              <th 
                colSpan={totalCols} 
                className="py-3 px-4 font-extrabold text-base text-slate-900 text-center border-2 border-slate-700 uppercase tracking-wide bg-slate-50"
              >
                <div className="flex items-center justify-center gap-2">
                  <BookOpen size={18} className="text-gold shrink-0" />
                  <span>{program} Timetable: Semester-{semester === 6 ? 'VIth' : semester}</span>
                </div>
              </th>
            </tr>

            {/* Time Slots + CR Header Row */}
            <tr className="bg-white text-slate-900">
              <th className="official-day-name sticky left-0 z-30 shadow-md">
                Day
              </th>
              <th className="w-2 min-w-[8px] border-2 border-slate-700 bg-slate-300 sticky left-[45px] z-30"></th>
              
              {timeSlots.map(slot => {
                if (slot.isLunch) {
                  return (
                    <th 
                      key={slot.id} 
                      className="w-24 min-w-[90px] p-2 font-bold text-slate-900 bg-slate-100 border-2 border-slate-700 text-center whitespace-nowrap text-xs"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Coffee size={12} className="text-amber-800 shrink-0" />
                        <span>{slot.label || '12:55 - 1:35'}</span>
                      </div>
                    </th>
                  );
                }
                return (
                  <React.Fragment key={slot.id}>
                    <th 
                      className="w-36 min-w-[140px] p-2 font-bold text-slate-900 bg-white border-2 border-slate-700 text-center whitespace-nowrap text-xs"
                    >
                      {slot.label || `${slot.start} - ${slot.end}`}
                    </th>
                    <th 
                      className="w-10 min-w-[42px] p-1.5 font-bold text-white bg-slate-700 border-2 border-slate-700 text-center text-xs lowercase"
                    >
                      cr
                    </th>
                  </React.Fragment>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {/* LUNCH TALL COLUMN + DAY ROWS */}
            {DAYS.map((day, index) => (
              <tr key={day} className="h-24">
                <td className="official-day-name sticky left-0 z-20 shadow-md">
                  {day}
                </td>
                <td className="border-2 border-slate-700 bg-slate-300 sticky left-[45px] z-20"></td>
                
                {/* Render Lunch cell with rowSpan={5} on Monday row */}
                {index === 0 ? (
                  <>
                    {/* Cells before lunch */}
                    {renderDayRow(day).slice(0, 8)}
                    
                    {/* Tall Vertical LUNCH Column */}
                    <td 
                      rowSpan={5} 
                      className="bg-white font-extrabold text-slate-900 text-center tracking-widest border-2 border-slate-700 p-2 align-middle select-none text-2xl leading-relaxed"
                      style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
                    >
                      <div className="flex flex-col items-center justify-center tracking-[0.6em] font-serif font-black">
                        L U N C H
                      </div>
                    </td>

                    {/* Cells after lunch */}
                    {renderDayRow(day).slice(8)}
                  </>
                ) : (
                  renderDayRow(day)
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
