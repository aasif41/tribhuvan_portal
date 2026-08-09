import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { TimetableSlot } from '@tribhuvan/shared';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ArrowLeftRight } from 'lucide-react';

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

  const getTeacherInitials = (teacherName?: string) => {
    if (!teacherName || teacherName === 'TBA') return '';
    if (teacherName === 'C') return 'C';
    const parts = teacherName.trim().split(' ');
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
        // Lunch column is handled by rowSpan={5} in table body
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
            className="bg-white border border-slate-800 p-2 text-center align-middle"
          >
            <div className="font-semibold text-xs sm:text-sm text-black leading-snug">
              {classSlot.subject.name}
            </div>
            {initials && (
              <div className="text-[11px] font-normal text-slate-800 mt-1">
                ({initials})
              </div>
            )}
          </td>
        );
        cells.push(
          <td 
            key={`${day}-cr-${i}`} 
            className="font-semibold text-xs text-black bg-white border border-slate-800 p-1 text-center align-middle whitespace-normal leading-tight min-w-[45px]"
          >
            {classSlot.room && classSlot.room !== 'TBA' ? classSlot.room : ''}
          </td>
        );
        
        i += (span - 1);
      } else {
        cells.push(<td key={`${day}-empty-${i}`} className="border border-slate-800 bg-white min-w-[130px]"></td>);
        cells.push(<td key={`${day}-cr-${i}`} className="border border-slate-800 bg-white min-w-[45px]"></td>);
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

  // Calculate total columns count for title header row
  const totalCols = 1 + 1 + timeSlots.reduce((acc, t) => acc + (t.isLunch ? 1 : 2), 0);

  // Program header title string matching exact screenshot e.g. "BSC CS Timetable: Semester-VIth"
  const titleProgram = program.includes('Computer Science') ? 'BSC CS' : program.toUpperCase();
  const semRoman = semester === 6 ? 'VIth' : `Sem-${semester}`;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader title="Timetable" subtitle={`${program} • Semester ${semester}`} />

      {/* Horizontal Scroll Hint Banner for Mobile */}
      <div className="sm:hidden flex items-center justify-between px-3.5 py-2.5 bg-slate-100 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 select-none">
        <span className="flex items-center gap-2">
          <ArrowLeftRight size={14} className="text-slate-700 shrink-0" />
          <span>Swipe left to right to see full timetable</span>
        </span>
        <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">← →</span>
      </div>

      {/* Scrollable Official Timetable Frame - NO PADDING (p-0) TO ELIMINATE LEFT GAPS */}
      <div 
        className="w-full max-w-full overflow-x-auto rounded-lg border-4 border-double border-slate-800 bg-white p-0 shadow-sm scrollbar-thin relative"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .official-double-timetable {
              table-layout: fixed;
              border-collapse: separate !important;
              border-spacing: 2px !important;
              border: 2px solid #27272a !important;
              min-width: 1350px;
              width: max-content;
              font-size: 0.825rem;
              background-color: #ffffff;
              color: #000000;
              margin: 0;
          }

          .official-double-timetable th, .official-double-timetable td {
              border: 1px solid #27272a !important;
              padding: 6px 8px;
              overflow: hidden;
              vertical-align: middle;
          }

          .official-double-timetable th {
              white-space: nowrap;
          }

          .doc-day-name {
              background-color: #52525b !important;
              color: #ffffff !important;
              writing-mode: vertical-rl;
              text-orientation: mixed;
              font-size: 0.95rem;
              font-weight: 700;
              text-align: center;
              width: 42px !important;
              min-width: 42px !important;
              position: sticky;
              left: 0px;
              z-index: 30;
              box-shadow: -15px 0 0 0 #52525b, 3px 0 5px rgba(0,0,0,0.2);
          }

          .doc-spacer {
              position: sticky;
              left: 44px;
              z-index: 30;
              background-color: #ffffff !important;
              width: 6px !important;
              min-width: 6px !important;
              padding: 0 !important;
          }
        `}} />

        <table className="official-double-timetable">
          <thead>
            {/* Title Header Row (Exact match with screenshot) */}
            <tr className="bg-white text-black">
              <th 
                colSpan={totalCols} 
                className="py-2.5 px-4 font-extrabold text-sm text-black text-center border-2 border-slate-800 uppercase tracking-wide bg-white"
              >
                {titleProgram} Timetable: Semester-{semRoman}
              </th>
            </tr>

            {/* Time Slots + CR Header Row */}
            <tr className="bg-white text-black">
              {/* Top-left cell left BLANK and STICKY */}
              <th className="doc-day-name"></th>
              <th className="doc-spacer"></th>
              
              {timeSlots.map(slot => {
                if (slot.isLunch) {
                  return (
                    <th 
                      key={slot.id} 
                      className="w-24 min-w-[90px] p-2 font-bold text-black bg-white border-2 border-slate-800 text-center whitespace-nowrap text-xs"
                    >
                      {slot.label || '12:55 - 1:35'}
                    </th>
                  );
                }
                return (
                  <React.Fragment key={slot.id}>
                    <th 
                      className="w-36 min-w-[130px] p-2 font-bold text-black bg-white border-2 border-slate-800 text-center whitespace-nowrap text-xs"
                    >
                      {slot.label || `${slot.start} - ${slot.end}`}
                    </th>
                    <th 
                      className="w-10 min-w-[36px] p-1.5 font-bold text-white bg-zinc-600 border-2 border-slate-800 text-center text-xs lowercase"
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
                <td className="doc-day-name">
                  {day}
                </td>
                <td className="doc-spacer"></td>
                
                {/* Render Lunch cell with rowSpan={5} on Monday row */}
                {index === 0 ? (
                  <>
                    {/* Cells before lunch */}
                    {renderDayRow(day).slice(0, 8)}
                    
                    {/* Tall Vertical LUNCH Column */}
                    <td 
                      rowSpan={5} 
                      className="bg-white font-black text-black text-center tracking-widest border-2 border-slate-800 p-2 align-middle select-none text-2xl"
                      style={{ 
                        writingMode: 'vertical-rl', 
                        textOrientation: 'upright'
                      }}
                    >
                      <div className="flex flex-col items-center justify-center tracking-[0.5em] font-serif font-black">
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
