import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, ChevronRight, Users, ChevronDown, ChevronUp, MapPin, Coffee } from 'lucide-react';
import api from '../../services/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper to convert time like "09:00 AM" to a comparable number
const timeToNumber = (timeStr: string) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
  if (!match) return 0;
  let [_, hours, minutes, period] = match;
  let h = parseInt(hours);
  let m = parseInt(minutes);
  
  if (period) {
    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  } else {
    // No AM/PM. If hours are 1-7, assume PM (13-19) for typical college schedules.
    if (h >= 1 && h <= 7) h += 12;
  }
  
  return h * 60 + m;
};

export function MyClasses() {
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);

  useEffect(() => {
    api.get('/teachers/classes').then((r) => { 
      setClassData(r.data.data); 
      setLoading(false); 
    }).catch(() => setLoading(false));
  }, []);

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
    setExpandedSlot(null);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
    setExpandedSlot(null);
  };

  const toggleStudents = (slotId: string) => {
    setExpandedSlot(prev => prev === slotId ? null : slotId);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;

  const currentDayName = DAYS[currentDate.getDay()];
  const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Filter timetable for the current day
  const todaysClasses = (classData?.timetable || []).filter((t: any) => t.day === currentDayName);

  // Sort todaysClasses by time before merging
  const sortedTodaysClasses = [...todaysClasses].sort((a, b) => timeToNumber(a.startTime) - timeToNumber(b.startTime));

  // Merge consecutive slots for the same subject
  const mergedClasses: any[] = [];
  sortedTodaysClasses.forEach(slot => {
    const last = mergedClasses[mergedClasses.length - 1];
    if (last && last.subject.code === slot.subject.code) {
      last.endTime = slot.endTime; // Extend the end time
    } else {
      mergedClasses.push({ ...slot });
    }
  });

  // Group by semester
  const groupedClasses: Record<number, any[]> = {};
  
  mergedClasses.forEach((t: any) => {
    // Find subject details to get semester and enrollments
    const subjectDetails = classData?.subjects.find((s: any) => s.code === t.subject.code);
    const semester = subjectDetails?.semester || 0;
    
    if (!groupedClasses[semester]) {
      groupedClasses[semester] = [];
    }
    groupedClasses[semester].push({
      ...t,
      subjectDetails
    });
  });

  // Sort semesters
  const sortedSemesters = Object.keys(groupedClasses).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-10">
      <PageHeader title="My Schedule" subtitle="Your daily class timetable" />
      
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <Button variant="outline" onClick={handlePrevDay} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
          <ChevronLeft size={16} /> <span className="hidden sm:inline">Previous Day</span>
        </Button>
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold text-navy">{currentDayName}</h2>
          <p className="text-xs sm:text-sm text-brand-muted">{formattedDate}</p>
        </div>
        <Button variant="outline" onClick={handleNextDay} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
          <span className="hidden sm:inline">Next Day</span> <ChevronRight size={16} />
        </Button>
      </div>

      {sortedSemesters.length === 0 ? (
        <Card>
          <div className="p-12 text-center text-brand-muted">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-xs">
              <Coffee className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-lg font-medium text-navy mb-1">No classes scheduled for {currentDayName}.</p>
            <p className="text-sm">Enjoy your free time!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedSemesters.map(semester => {
            // Sort classes by time
            const classes = groupedClasses[Number(semester)].sort((a, b) => timeToNumber(a.startTime) - timeToNumber(b.startTime));
            
            return (
              <Card key={semester}>
                <CardHeader title={`Semester ${semester}`} subtitle="Classes scheduled for this semester" />
                <div className="divide-y divide-gray-100">
                  {classes.map((slot: any, idx: number) => {
                    const uniqueId = `${slot.id}-${idx}`;
                    const isExpanded = expandedSlot === uniqueId;
                    const enrollments = slot.subjectDetails?.enrollments || [];
                    
                    return (
                      <div key={uniqueId} className="transition-colors hover:bg-gray-50/50">
                        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start md:items-center gap-4">
                            <div className="bg-blue-50 text-blue-700 px-3 sm:px-4 py-2 rounded-lg text-center min-w-[100px] sm:min-w-[120px] border border-blue-100">
                              <div className="font-bold text-sm sm:text-base">{slot.startTime}</div>
                              <div className="text-xs text-blue-500 font-medium">to {slot.endTime}</div>
                            </div>
                            <div>
                              <h4 className="font-bold text-navy text-base sm:text-lg">{slot.subject.name}</h4>
                              <p className="text-xs sm:text-sm text-brand-muted flex flex-wrap items-center gap-2 mt-1">
                                <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{slot.subject.code}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{slot.subjectDetails?.program || 'Program'}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 sm:gap-6 text-sm ml-[116px] md:ml-0">
                            <div className="flex flex-col md:items-end">
                              <span className="text-brand-muted text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><MapPin size={12}/> Room</span>
                              <span className="font-medium text-navy">{slot.room || 'TBA'}</span>
                            </div>
                            <div className="flex flex-col md:items-end border-l border-gray-200 pl-4 sm:pl-6">
                              <span className="text-brand-muted text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><Users size={12}/> Students</span>
                              <button 
                                onClick={() => toggleStudents(uniqueId)}
                                className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded transition-colors"
                              >
                                {enrollments.length} Enrolled
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Students List */}
                        {isExpanded && (
                          <div className="bg-gray-50 p-4 border-t border-gray-100">
                            <h5 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                              <Users size={14} /> Enrolled Students List
                            </h5>
                            {enrollments.length === 0 ? (
                              <p className="text-sm text-gray-500 italic">No students enrolled yet.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {enrollments.map((e: any, i: number) => (
                                  <div key={i} className="text-sm text-brand-text p-2 bg-white border border-gray-200 rounded flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-navy/10 text-navy flex items-center justify-center font-bold text-xs">
                                      {e.student.user.name.charAt(0)}
                                    </div>
                                    <span className="truncate">{e.student.user.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
