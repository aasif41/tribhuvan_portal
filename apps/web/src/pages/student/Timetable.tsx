import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { TimetableSlot } from '@tribhuvan/shared';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Clock, MapPin, User, Calendar as CalendarIcon, Grid, List } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function Timetable() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [viewMode, setViewMode] = useState<'day' | 'grid'>('day');

  const { user } = useAuth();
  
  const program = user?.student?.program || 'B.Sc (Hons.) Computer Science';
  const semester = user?.student?.semester || 6;

  useEffect(() => {
    // Auto-select current day of week if Monday-Friday
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (DAYS.includes(today)) {
      setSelectedDay(today);
    }
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
              {(classSlot as any).teacher?.user?.name || (classSlot.subject as any)?.teacher?.user?.name || 'Faculty TBA'}
            </div>
          </td>
        );
        cells.push(
          <td key={`${day}-cr-${i}`} className="font-bold text-xs text-slate-700 bg-amber-50/60 border border-slate-300 p-1.5 text-center align-middle">
            {classSlot.room !== 'TBA' ? classSlot.room : '-'}
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

  // Filter slots for mobile day view
  const selectedDaySlots = slots
    .filter(s => s.day === selectedDay)
    .sort((a, b) => (a.startTime > b.startTime ? 1 : -1));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Timetable" subtitle={`${program} • Semester ${semester}`} />
        
        {/* Mobile View Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setViewMode('day')}
            className={`sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'day' ? 'bg-navy text-gold shadow-2xs' : 'text-slate-600 hover:text-navy'
            }`}
          >
            <List size={14} />
            <span>Day View</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid' || window.innerWidth >= 640 ? 'bg-navy text-gold shadow-2xs' : 'text-slate-600 hover:text-navy'
            }`}
          >
            <Grid size={14} />
            <span>Full Grid</span>
          </button>
        </div>
      </div>

      {/* Mobile Day-by-Day Segmented View */}
      {viewMode === 'day' && (
        <div className="sm:hidden space-y-4">
          {/* Day Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto select-none">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-navy text-gold shadow-sm'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          {/* Selected Day Schedule List */}
          <div className="space-y-3">
            {selectedDaySlots.map(slot => (
              <div
                key={slot.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5 hover:border-gold/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-navy/10 text-navy text-xs font-bold rounded-md">
                    <Clock size={12} className="text-gold" />
                    {slot.startTime} - {slot.endTime}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 text-xs font-semibold rounded border border-amber-200/60">
                    <MapPin size={11} /> Room {slot.room}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-brand-text text-base">{slot.subject.name}</h4>
                  <p className="text-xs text-brand-muted mt-0.5">{slot.subject.code}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <User size={13} className="text-slate-400 shrink-0" />
                  <span className="font-medium">
                    {(slot as any).teacher?.user?.name || (slot.subject as any)?.teacher?.user?.name || 'Faculty TBA'}
                  </span>
                </div>
              </div>
            ))}

            {selectedDaySlots.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 space-y-2">
                <CalendarIcon size={32} className="mx-auto text-slate-300" />
                <p className="text-sm font-medium">No classes scheduled for {selectedDay}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid View with Sticky Left Day Column & Sticky Header */}
      {(viewMode === 'grid' || window.innerWidth >= 640) && (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 sm:p-4 shadow-2xs relative">
          <style dangerouslySetInnerHTML={{__html: `
            .custom-timetable {
                table-layout: fixed;
                border-collapse: separate;
                border-spacing: 2px;
                border: 1px solid #e2e8f0;
                width: 100%;
                min-width: 1050px;
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

            /* STICKY DAY COLUMN FOR PORTRAIT & MOBILE SCROLLING */
            .sticky-day-col {
                position: sticky;
                left: 0;
                z-index: 20;
                background-color: #0d1f3c !important;
                color: #c8922a !important;
                writing-mode: vertical-rl;
                text-orientation: mixed;
                font-size: 1rem;
                font-weight: 700;
                text-align: center;
                box-shadow: 2px 0 5px rgba(0,0,0,0.1);
            }

            .sticky-header-row th {
                position: sticky;
                top: 0;
                z-index: 10;
                background-color: #f8fafc;
            }
          `}} />

          <table align="center" bgcolor="White" className="custom-timetable">
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
              <tr className="sticky-header-row">
                <th className="sticky-day-col bg-navy text-gold">Day</th>
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
                <td className="sticky-day-col bg-navy text-gold"></td>
                <td></td>
                <td colSpan={8} className="bg-slate-50"></td>
                <td rowSpan={6} className="bg-amber-100/60 font-extrabold text-navy text-center tracking-widest leading-loose" style={{fontSize: "2rem"}}>
                  L<br/>U<br/>N<br/>C<br/>H
                </td>
                <td colSpan={8} className="bg-slate-50"></td>
              </tr>

              {DAYS.map(day => (
                <tr key={day} style={{height: "110px"}}>
                  <td className="sticky-day-col">{day}</td>
                  <td></td>
                  {renderDayRow(day)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
