import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { TimetableSlot } from '@tribhuvan/shared';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';



const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function Timetable() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  
  // Example hardcoded for student's program, could come from User Context
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

    // Helper to get slot
    const getSlotAtTime = (time: string) => daySlots.find(s => s.startTime === time);

    for (let i = 0; i < timeSlots.length; i++) {
      const timeSlot = timeSlots[i];
      if (timeSlot.isLunch) continue;
      const classSlot = getSlotAtTime(timeSlot.start);

      if (classSlot) {
        const span = calculateSpan(classSlot.startTime, classSlot.endTime);
        const colSpan = span * 2 - 1;
        
        cells.push(
          <td key={`${day}-class-${i}`} colSpan={colSpan}>
            {classSlot.subject.name}<br/>
            ({(classSlot as any).teacher?.user?.name?.split(' ').map((n: string) => n[0]).join('') || (classSlot.subject as any)?.teacher?.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'TBA'})
          </td>
        );
        cells.push(
          <td key={`${day}-cr-${i}`} className="font-bold text-gray-700">
            {classSlot.room !== 'TBA' ? classSlot.room : ''}
          </td>
        );
        
        // Skip the covered slots
        i += (span - 1);
      } else {
        cells.push(<td key={`${day}-empty-${i}`}></td>);
        cells.push(<td key={`${day}-cr-${i}`}></td>);
      }
    }

    return cells;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading timetable...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Timetable" subtitle="Your weekly class schedule" />

      <div className="full-width-table">
        <style dangerouslySetInnerHTML={{__html: `
          .full-width-table {
              width: calc(100vw - 256px); /* Full screen width minus sidebar */
              position: relative;
              left: 50%;
              transform: translateX(-50%);
              overflow-x: auto;
              padding: 0 24px;
          }

          .custom-timetable {
              table-layout: fixed;
              border-collapse: separate;
              border-spacing: 2px;
              border: 1px solid black;
              width: 100%;
              min-width: 1300px; /* Safe minimum width */
              font-size: 0.8rem;
          }

          .custom-timetable th, .custom-timetable td {
              border: 1px solid black;
              padding: 6px; /* Increased padding */
              overflow: hidden;
          }

          .custom-timetable th {
              white-space: nowrap;
          }

          .custom-timetable td {
              vertical-align: middle;
              white-space: normal;
              word-wrap: break-word;
              overflow-wrap: break-word;
              text-align: center;
          }

          /* DAY COLUMN – SIMPLE & STABLE */
          .day-name {
              background-color: grey;
              writing-mode: vertical-rl;
              text-orientation: mixed;
              font-size: large;
              font-weight: bold;
          }
        `}} />

        <table style={{marginTop: "4%"}} align="center"
               bgcolor="White" className="custom-timetable">

            <colgroup>
                <col style={{width: "3.5%"}} />
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
                <tr>
                    <th colSpan={19}>{program} Timetable: Semester-{semester}</th>
                </tr>

                {/* TIME ROW */}
                <tr>
                    <th></th><th></th>
                    {timeSlots.map(slot => {
                      if (slot.isLunch) {
                        return <th key={slot.id}>{slot.label || '12:55 - 1:35'}</th>;
                      }
                      return (
                        <React.Fragment key={slot.id}>
                          <th>{slot.label || `${slot.start} - ${slot.end}`}</th>
                          <th className="bg-gray-500">cr</th>
                        </React.Fragment>
                      );
                    })}
                </tr>

                {/* LUNCH */}
                <tr>
                    <td></td><td></td>
                    <td colSpan={8}></td>
                    <td rowSpan={6} style={{fontSize: "3rem"}}>L<br/><br/>U<br/><br/>N<br/><br/>C<br/><br/>H</td>
                    <td colSpan={8}></td>
                </tr>

                {DAYS.map(day => (
                  <tr key={day} style={{height: "120px"}}>
                      <td className="day-name">{day}</td>
                      <td></td>
                      {renderDayRow(day)}
                  </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
