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
      setTimeSlots(settingsRes.data.data);
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
      if (timeSlot.isLunch) continue;
      const classSlot = getSlotAtTime(timeSlot.start);

      if (classSlot) {
        const span = calculateSpan(classSlot.startTime, classSlot.endTime);
        const colSpan = span * 2 - 1;
        
        cells.push(
          <td key={`${day}-class-${i}`} colSpan={colSpan} className="bg-blue-50/70 border border-slate-300 p-2 text-center align-middle font-medium text-navy">
            <div className="font-bold text-xs sm:text-sm">{classSlot.subject.name}</div>
            <div className="text-[11px] text-brand-muted mt-0.5">
              ({(classSlot as any).teacher?.user?.name?.split(' ').map((n: string) => n[0]).join('') || (classSlot.subject as any)?.teacher?.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'TBA'})
            </div>
          </td>
        );
        cells.push(
          <td key={`${day}-cr-${i}`} className="font-bold text-xs text-slate-700 bg-amber-50/60 border border-slate-300 p-1.5 text-center align-middle">
            {classSlot.room !== 'TBA' ? classSlot.room : ''}
          </td>
        );
        
        i += (span - 1);
      } else {
        cells.push(<td key={`${day}-empty-${i}`} className="border border-slate-200 bg-white"></td>);
        cells.push(<td key={`${day}-cr-${i}`} className="border border-slate-200 bg-slate-50/50"></td>);
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

  return (
    <div className="space-y-6">
      <PageHeader title="Timetable" subtitle={`${program} • Semester ${semester}`} />

      {/* Responsive Horizontal Scroll Container */}
      <div className="w-full space-y-2">
        {/* Mobile Horizontal Scroll Indicator Banner */}
        <div className="sm:hidden flex items-center justify-between px-3 py-2 bg-slate-100/90 rounded-lg border border-slate-200 text-xs text-slate-700 font-semibold select-none">
          <span className="flex items-center gap-1.5">
            <ArrowLeftRight size={14} className="text-gold shrink-0" />
            <span>Scroll horizontally (left-to-right) to view full timetable</span>
          </span>
          <span className="text-xs font-bold text-navy">← →</span>
        </div>

        {/* Scrollable Table Card */}
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 sm:p-4 shadow-2xs">
          <style dangerouslySetInnerHTML={{__html: `
            .custom-timetable {
                table-layout: fixed;
                border-collapse: separate;
                border-spacing: 2px;
                border: 1px solid #cbd5e1;
                min-width: 1100px;
                width: 100%;
                font-size: 0.8rem;
            }

            .custom-timetable th, .custom-timetable td {
                border: 1px solid #cbd5e1;
                padding: 6px;
                overflow: hidden;
            }

            .custom-timetable th {
                white-space: nowrap;
            }

            .day-name {
                background-color: #0d1f3c;
                color: #c8922a;
                writing-mode: vertical-rl;
                text-orientation: mixed;
                font-size: 1rem;
                font-weight: 700;
                text-align: center;
                width: 45px;
                min-width: 45px;
            }
          `}} />

          <table align="center" bgcolor="White" className="custom-timetable" style={{ minWidth: '1100px' }}>
            <colgroup>
              <col style={{width: "4%"}} />
              <col style={{width: "0.5%"}} />

              <col style={{width: "7.25%"}} /><col style={{width: "4%"}} />
              <col style={{width: "7.25%"}} /><col style={{width: "4%"}} />
              <col style={{width: "7.25%"}} /><col style={{width: "4%"}} />
              <col style={{width: "7.25%"}} /><col style={{width: "4%"}} />

              <col style={{width: "6%"}} />

              <col style={{width: "7.25%"}} /><col style={{width: "4%"}} />
              <col style={{width: "7.25%"}} /><col style={{width: "4%"}} />
              <col style={{width: "7.25%"}} /><col style={{width: "4%"}} />
              <col style={{width: "7.25%"}} /><col style={{width: "4%"}} />
            </colgroup>

            <tbody>
              <tr className="bg-navy text-white">
                <th colSpan={19} className="py-2.5 font-bold text-sm bg-navy text-gold text-center border-b border-navy/20">
                  {program} Timetable: Semester-{semester}
                </th>
              </tr>

              {/* TIME ROW */}
              <tr className="bg-slate-100">
                <th className="bg-navy text-gold">Day</th>
                <th></th>
                {timeSlots.map(slot => {
                  if (slot.isLunch) {
                    return <th key={slot.id} className="bg-slate-200 font-bold text-slate-700">{slot.label || '12:55 - 1:35'}</th>;
                  }
                  return (
                    <React.Fragment key={slot.id}>
                      <th className="bg-slate-100 font-bold text-slate-800">{slot.label || `${slot.start} - ${slot.end}`}</th>
                      <th className="bg-slate-300 font-bold text-slate-700">CR</th>
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* LUNCH */}
              <tr>
                <td className="day-name"></td>
                <td></td>
                <td colSpan={8} className="bg-slate-50"></td>
                <td rowSpan={6} className="bg-amber-100/60 font-extrabold text-navy text-center tracking-widest leading-loose" style={{fontSize: "2rem"}}>
                  L<br/>U<br/>N<br/>C<br/>H
                </td>
                <td colSpan={8} className="bg-slate-50"></td>
              </tr>

              {DAYS.map(day => (
                <tr key={day} style={{height: "110px"}}>
                  <td className="day-name">{day}</td>
                  <td></td>
                  {renderDayRow(day)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
