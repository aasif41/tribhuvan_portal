import { useState, useEffect } from 'react';
import { Save, Clock, X, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core';
import { Subject, PROGRAM_NAMES } from '@tribhuvan/shared';
import api from '../../services/api';



const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Components for Dnd
function DraggableSubject({ subject }: { subject: Subject }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `subject-${subject.id}`,
    data: { subject },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-white border border-gray-200 rounded shadow-sm cursor-grab ${isDragging ? 'opacity-50' : 'hover:border-gold'}`}
    >
      <div className="font-semibold text-navy text-sm">{subject.name}</div>
      <div className="text-xs text-gray-500">{subject.code}</div>
    </div>
  );
}

function DroppableCell({ day, slot, children }: { day: string, slot: any, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${day}-${slot.id}`,
    data: { day, slot },
  });

  if (slot.isLunch) {
    return <div className="bg-gray-100 p-2 text-center text-xs font-bold text-gray-500 border border-gray-200 h-full flex items-center justify-center">LUNCH</div>;
  }

  return (
    <div
      ref={setNodeRef}
      className={`border border-gray-200 p-1 min-h-[80px] transition-colors relative ${isOver ? 'bg-gold/20 border-gold' : 'bg-white'}`}
    >
      {children}
    </div>
  );
}

export function TimetableEditor() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Placed slots map: cellId -> slot data
  const [gridData, setGridData] = useState<Record<string, any>>({});
  
  const [program, setProgram] = useState(PROGRAM_NAMES[0]);
  const [semester, setSemester] = useState('6');
  const [saving, setSaving] = useState(false);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [isEditingTimes, setIsEditingTimes] = useState(false);
  const [editedTimes, setEditedTimes] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    fetchMetadata();
    fetchTimeSlots();
  }, []);

  useEffect(() => {
    if (program && semester && timeSlots.length > 0) {
      fetchTimetable();
    }
  }, [program, semester, timeSlots]);

  const fetchTimeSlots = async () => {
    try {
      const { data: responseData } = await api.get('/timetable/settings');
      setTimeSlots(responseData.data);
      setEditedTimes(responseData.data);
    } catch (error) {
      console.error('Error fetching time slots', error);
    }
  };

  const handleSaveTimes = async () => {
    try {
      await api.put('/timetable/settings', { timeSlots: editedTimes });
      setTimeSlots(editedTimes);
      setIsEditingTimes(false);
      alert('Time slots updated globally');
    } catch (error) {
      console.error('Error saving time slots', error);
      alert('Failed to save time slots');
    }
  };

  const fetchMetadata = async () => {
    try {
      const { data: responseData } = await api.get('/timetable/metadata');
      const payload = responseData.data || { subjects: [], teachers: [] };
      setSubjects(payload.subjects || []);
      
    } catch (error) {
      console.error('Error fetching metadata', error);
    }
  };

  const fetchTimetable = async () => {
    try {
      const { data: responseData } = await api.get(`/timetable?program=${program}&semester=${semester}`);
      const newGrid: Record<string, any> = {};
      const slotsArray = responseData.data || [];
      slotsArray.forEach((slot: any) => {
        // Find which TIME_SLOT matches the startTime
        const timeSlot = timeSlots.find(t => t.start === slot.startTime);
        if (timeSlot) {
          const cellId = `cell-${slot.day}-${timeSlot.id}`;
          newGrid[cellId] = {
            subject: slot.subject,
            teacherId: slot.teacherId,
            span: calculateSpan(slot.startTime, slot.endTime),
            room: slot.room || ''
          };
        }
      });
      setGridData(newGrid);
    } catch (error) {
      console.error('Error fetching timetable', error);
    }
  };

  const calculateSpan = (start: string, end: string) => {
    const startIndex = timeSlots.findIndex(t => t.start === start);
    const endIndex = timeSlots.findIndex(t => t.end === end);
    if (startIndex !== -1 && endIndex !== -1 && !timeSlots[startIndex].isLunch) {
      let count = 0;
      for(let i = startIndex; i <= endIndex; i++) {
        if(!timeSlots[i].isLunch) count++;
      }
      return count;
    }
    return 1;
  };

  const getActiveSubject = () => {
    if (!activeId) return null;
    if (activeId.startsWith('subject-')) {
      const id = activeId.replace('subject-', '');
      return subjects.find(s => s.id === id);
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return; // Dropped outside

    const overId = over.id as string;
    if (overId.startsWith('cell-')) {
      const activeData = active.data.current as any;
      if (activeData?.subject) {
        // Dropped a subject into a cell
        setGridData(prev => ({
          ...prev,
          [overId]: {
            subject: activeData.subject,
            teacherId: activeData.subject.teacherId, // Default to subject's teacher
            span: 1, // Default to 1 period
            room: ''
          }
        }));
      }
    }
  };

  const removeCell = (cellId: string) => {
    setGridData(prev => {
      const next = { ...prev };
      delete next[cellId];
      return next;
    });
  };

  const updateRoom = (cellId: string, room: string) => {
    setGridData(prev => ({
      ...prev,
      [cellId]: {
        ...prev[cellId],
        room
      }
    }));
  };

  const increaseSpan = (cellId: string) => {
    setGridData(prev => ({
      ...prev,
      [cellId]: {
        ...prev[cellId],
        span: (prev[cellId].span || 1) + 1
      }
    }));
  };

  const decreaseSpan = (cellId: string) => {
    setGridData(prev => {
      if (prev[cellId].span <= 1) return prev;
      return {
        ...prev,
        [cellId]: {
          ...prev[cellId],
          span: prev[cellId].span - 1
        }
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payloadSlots = [];
      for (const day of DAYS) {
        for (let i = 0; i < timeSlots.length; i++) {
          const slot = timeSlots[i];
          if (slot.isLunch) continue;

          const cellId = `cell-${day}-${slot.id}`;
          const cellData = gridData[cellId];
          if (cellData) {
            let endIdx = i;
            let spansLeft = cellData.span - 1;
            while(spansLeft > 0 && endIdx < timeSlots.length - 1) {
              endIdx++;
              if(!timeSlots[endIdx].isLunch) {
                spansLeft--;
              }
            }
            
            payloadSlots.push({
              day,
              startTime: slot.start,
              endTime: timeSlots[endIdx].end,
              subjectId: cellData.subject.id,
              teacherId: cellData.teacherId || cellData.subject.teacherId,
              room: cellData.room || 'TBA'
            });
          }
        }
      }

      await api.post('/timetable/bulk', {
        program,
        semester,
        slots: payloadSlots
      });
      alert('Timetable saved successfully!');
    } catch (error) {
      console.error('Error saving timetable', error);
      alert('Failed to save timetable');
    } finally {
      setSaving(false);
    }
  };

  // Filter subjects for the selected program/semester
  const availableSubjects = subjects.filter(s => s.program === program && s.semester.toString() === semester);

  return (
    <div className="space-y-6">
      <PageHeader title="Timetable Editor" subtitle="Drag and drop subjects to create timetable" />
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
          <select 
            value={program} 
            onChange={(e) => setProgram(e.target.value)} 
            className="input-field"
          >
            {PROGRAM_NAMES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
          <input 
            type="text" 
            value={semester} 
            onChange={(e) => setSemester(e.target.value)} 
            className="input-field"
          />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary ml-auto flex items-center gap-2">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Timetable'}
        </button>
        <button onClick={() => setIsEditingTimes(true)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors flex items-center gap-2">
          <Clock size={16} /> Edit Times
        </button>
      </div>

      {isEditingTimes && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-navy">Edit Global Time Slots</h2>
              <button onClick={() => setIsEditingTimes(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {editedTimes.map((slot, index) => (
                <div key={slot.id} className={`flex gap-4 items-center p-3 rounded border ${slot.isLunch ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
                  <div className="w-16 font-semibold text-gray-500">{slot.isLunch ? 'LUNCH' : `P${index + (index > 4 ? 0 : 1)}`}</div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block">Label</label>
                    <input type="text" className="input-field py-1" value={slot.label} onChange={(e) => {
                      const newTimes = [...editedTimes];
                      newTimes[index].label = e.target.value;
                      setEditedTimes(newTimes);
                    }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block">Start Time</label>
                    <input type="text" className="input-field py-1" value={slot.start} onChange={(e) => {
                      const newTimes = [...editedTimes];
                      newTimes[index].start = e.target.value;
                      setEditedTimes(newTimes);
                    }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block">End Time</label>
                    <input type="text" className="input-field py-1" value={slot.end} onChange={(e) => {
                      const newTimes = [...editedTimes];
                      newTimes[index].end = e.target.value;
                      setEditedTimes(newTimes);
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => { setEditedTimes([...timeSlots]); setIsEditingTimes(false); }} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveTimes} className="btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 h-[700px]">
          {/* Sidebar */}
          <div className="w-64 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="font-bold text-navy mb-4 border-b pb-2">Available Subjects</h3>
            <div className="flex-1 overflow-y-auto space-y-3">
              {availableSubjects.map(subject => (
                <DraggableSubject key={subject.id} subject={subject} />
              ))}
              {availableSubjects.length === 0 && (
                <p className="text-sm text-gray-500">No subjects found for this program and semester.</p>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="w-full max-w-full overflow-x-auto bg-white p-2 sm:p-4 rounded-xl shadow-2xs border border-gray-100 touch-pan-x">
            <table className="w-full text-sm border-collapse min-w-[1050px]" style={{ minWidth: '1050px', width: '1050px' }}>
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50 w-24">Day</th>
                  {timeSlots.map(slot => (
                    <th key={slot.id} className="border p-2 bg-gray-50 whitespace-nowrap">
                      {slot.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  <tr key={day}>
                    <td className="border p-2 font-bold text-navy bg-gray-50 text-center">{day}</td>
                    {timeSlots.map(slot => {
                      const cellId = `cell-${day}-${slot.id}`;
                      const cellData = gridData[cellId];
                      
                      return (
                        <td key={slot.id} className="border min-w-[120px] p-0">
                          <DroppableCell day={day} slot={slot}>
                            {cellData && (
                              <div className="h-full w-full bg-blue-50 border border-blue-200 p-2 relative group flex flex-col justify-between" style={{ minHeight: '80px' }}>
                                <div>
                                  <div className="font-bold text-navy text-xs leading-tight">{cellData.subject.name}</div>
                                  <div className="text-xs text-blue-600 mt-1 flex items-center justify-between">
                                    <span>Span: {cellData.span}</span>
                                    <div className="flex items-center gap-1">
                                      <span>Rm:</span>
                                      <input 
                                        type="text" 
                                        value={cellData.room || ''} 
                                        onChange={(e) => updateRoom(cellId, e.target.value)}
                                        className="border border-blue-300 rounded px-1 w-12 text-xs bg-white text-navy focus:outline-none focus:border-gold"
                                        placeholder="101"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex gap-1">
                                    <button onClick={() => decreaseSpan(cellId)} className="bg-gray-200 hover:bg-gray-300 w-6 h-6 rounded flex items-center justify-center text-xs">-</button>
                                    <button onClick={() => increaseSpan(cellId)} className="bg-gray-200 hover:bg-gray-300 w-6 h-6 rounded flex items-center justify-center text-xs">+</button>
                                  </div>
                                  <button onClick={() => removeCell(cellId)} className="text-red-500 hover:text-red-700 text-xs">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </DroppableCell>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="p-3 bg-white border-2 border-gold rounded shadow-lg transform scale-105">
              <div className="font-semibold text-navy text-sm">{getActiveSubject()?.name}</div>
              <div className="text-xs text-gray-500">{getActiveSubject()?.code}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
