import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download } from 'lucide-react';
import api from '../../services/api';

interface StudentRecord {
  studentId: string;
  name: string;
  rollNo: string;
  subjectId: string;
  program: string;
}

interface GroupedSubject {
  id: string; // e.g. "Data Warehouse - Sem 6"
  name: string;
  semester: number;
  originalSubjects: any[];
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getDaysArray = (year: number, month: number) => {
  const numDays = getDaysInMonth(year, month);
  return Array.from({ length: numDays }, (_, i) => {
    const d = new Date(year, month, i + 1);
    // Use local time for timezone safety when sending dates to backend
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    return {
      date: i + 1,
      dayStr: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateStr,
    };
  });
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export function MarkAttendance() {
  const { } = useAuth();
  const [subjects, setSubjects] = useState<GroupedSubject[]>([]);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  
  // Format: { [studentId]: { [dateStr]: 'PRESENT' | 'ABSENT' | 'LATE' } }
  const [attendanceMatrix, setAttendanceMatrix] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const pendingSaves = useRef<Record<string, NodeJS.Timeout>>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/teachers/classes').then((r) => {
      const rawSubjects = r.data.data.subjects;
      
      const grouped = new Map<string, GroupedSubject>();
      rawSubjects.forEach((s: any) => {
        const key = `${s.name} (Sem ${s.semester})`;
        if (!grouped.has(key)) {
          grouped.set(key, {
            id: key,
            name: s.name,
            semester: s.semester,
            originalSubjects: []
          });
        }
        grouped.get(key)!.originalSubjects.push(s);
      });
      
      const subs = Array.from(grouped.values());
      setSubjects(subs);
      
      const uniqueSemesters = Array.from(new Set(subs.map(s => s.semester))).sort((a, b) => a - b);
      setSemesters(uniqueSemesters);
      
      if (uniqueSemesters.length > 0) {
        const firstSem = uniqueSemesters[0];
        setSelectedSemester(firstSem);
        
        const semSubjects = subs.filter(s => s.semester === firstSem);
        if (semSubjects.length > 0) {
          setSelectedSubject(semSubjects[0].id);
          loadStudents(semSubjects[0].id, subs);
          fetchAttendance(semSubjects[0].id, subs);
        }
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysArray = useMemo(() => getDaysArray(year, month), [year, month]);

  // Auto-scroll to today
  useEffect(() => {
    if (!loading && students.length > 0 && tableContainerRef.current) {
      const today = new Date();
      if (month === today.getMonth() && year === today.getFullYear()) {
        // give dom a moment to render
        setTimeout(() => {
          const todayElem = tableContainerRef.current?.querySelector(`[data-day="${today.getDate()}"]`);
          if (todayElem) {
            tableContainerRef.current?.scrollTo({
              left: (todayElem as HTMLElement).offsetLeft - 300,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }, [loading, students, month, year]);

  const loadStudents = (groupKey: string, allSubjects: GroupedSubject[]) => {
    const group = allSubjects.find((s) => s.id === groupKey);
    if (group) {
      const allStudents: StudentRecord[] = [];
      group.originalSubjects.forEach((sub: any) => {
        sub.enrollments.forEach((e: any) => {
          // ensure no duplicate student IDs if they are somehow enrolled twice
          if (!allStudents.find(s => s.studentId === e.student.id)) {
            allStudents.push({
              studentId: e.student.id,
              name: e.student.user.name,
              rollNo: e.student.rollNo,
              subjectId: sub.id,
              program: e.student.program
            });
          }
        });
      });
      allStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
      setStudents(allStudents);
    } else {
      setStudents([]);
    }
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sem = Number(e.target.value);
    setSelectedSemester(sem);
    const semSubjects = subjects.filter(s => s.semester === sem);
    if (semSubjects.length > 0) {
      const subId = semSubjects[0].id;
      setSelectedSubject(subId);
      loadStudents(subId, subjects);
      fetchAttendance(subId, subjects);
    } else {
      setSelectedSubject('');
      setStudents([]);
    }
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = e.target.value;
    setSelectedSubject(subId);
    loadStudents(subId, subjects);
    fetchAttendance(subId, subjects);
  };

  const fetchAttendance = async (groupKey: string, allSubjects: GroupedSubject[]) => {
    setLoading(true);
    try {
      const group = allSubjects.find((s) => s.id === groupKey);
      if (!group) return;

      const newMatrix: Record<string, Record<string, string>> = {};

      await Promise.all(group.originalSubjects.map(async (sub: any) => {
        const res = await api.get(`/attendance/${sub.id}`);
        const records = res.data.data.records || [];
        records.forEach((r: any) => {
          const dateStr = r.date.split('T')[0];
          if (!newMatrix[r.studentId]) newMatrix[r.studentId] = {};
          newMatrix[r.studentId][dateStr] = r.status;
        });
      }));
      
      setAttendanceMatrix(newMatrix);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  const cycleStatus = (currentStatus?: string) => {
    if (!currentStatus || currentStatus === 'EMPTY') return 'PRESENT';
    if (currentStatus === 'PRESENT') return 'ABSENT';
    if (currentStatus === 'ABSENT') return 'LATE';
    if (currentStatus === 'LATE') return 'EMPTY';
    return 'PRESENT'; // loop back
  };

  const handleCellClick = (student: StudentRecord, dateStr: string) => {
    if (!selectedSubject) return;

    const currentStatus = attendanceMatrix[student.studentId]?.[dateStr];
    const nextStatus = cycleStatus(currentStatus);
    
    // Optimistic UI update for instant feedback
    setAttendanceMatrix(prev => ({
      ...prev,
      [student.studentId]: {
        ...(prev[student.studentId] || {}),
        [dateStr]: nextStatus
      }
    }));

    const cellKey = `${student.studentId}-${dateStr}`;
    
    // Clear any existing pending save for this cell
    if (pendingSaves.current[cellKey]) {
      clearTimeout(pendingSaves.current[cellKey]);
    }

    // Debounce the API call by 400ms so rapid tapping only sends the final status
    pendingSaves.current[cellKey] = setTimeout(() => {
      api.post('/attendance/mark', {
        subjectId: student.subjectId,
        date: dateStr,
        records: [{ studentId: student.studentId, status: nextStatus }]
      }).catch(err => {
        console.error('Failed to mark attendance', err);
      });
      delete pendingSaves.current[cellKey];
    }, 400);
  };

  const getStudentSummary = (studentId: string) => {
    let p = 0, a = 0, l = 0;
    let op = 0, oa = 0, ol = 0;
    const studentRecords = attendanceMatrix[studentId] || {};
    
    // Monthly stats
    daysArray.forEach(d => {
      const status = studentRecords[d.dateStr];
      if (status === 'PRESENT') p++;
      if (status === 'ABSENT') a++;
      if (status === 'LATE') l++;
    });

    // Overall stats
    Object.values(studentRecords).forEach(status => {
      if (status === 'PRESENT') op++;
      if (status === 'ABSENT') oa++;
      if (status === 'LATE') ol++;
    });

    const total = p + a + l;
    const perc = total > 0 ? Math.round(((p + l) / total) * 100) : 0;
    
    const oTotal = op + oa + ol;
    const oPerc = oTotal > 0 ? Math.round(((op + ol) / oTotal) * 100) : 0;

    return { p, a, l, total, perc, oPerc };
  };

  const downloadCSV = () => {
    if (!students.length) return;
    
    const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'Subject';
    const filename = `Attendance_${subjectName}_${MONTH_NAMES[month]}_${year}.csv`;
    
    // Create headers
    const headers = ['Roll No.', 'Name', ...daysArray.map(d => `${d.date} ${d.dayStr}`), 'P', 'A', 'L', 'Month %', 'Overall %'];
    
    // Create rows
    const rows = students.map(student => {
      const summary = getStudentSummary(student.studentId);
      
      const dayStatuses = daysArray.map(d => {
        const status = attendanceMatrix[student.studentId]?.[d.dateStr];
        if (status === 'PRESENT') return 'P';
        if (status === 'ABSENT') return 'A';
        if (status === 'LATE') return 'L';
        return '';
      });
      
      return [
        student.rollNo,
        `"${student.name}"`, // Quote name to handle commas
        ...dayStatuses,
        summary.p,
        summary.a,
        summary.l,
        `${summary.perc}%`,
        `${summary.oPerc}%`
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && subjects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const todayDateStr = getLocalDateString(new Date());

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <PageHeader title="Mark Attendance" subtitle="Manage attendance records for your students" />
      
      <Card>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-1.5 min-w-[120px]">
              <label className="block text-sm font-medium text-brand-text">Semester</label>
              <select 
                value={selectedSemester} 
                onChange={handleSemesterChange} 
                className="input-field"
              >
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5 min-w-[200px]">
              <label className="block text-sm font-medium text-brand-text">Subject</label>
              <select 
                value={selectedSubject} 
                onChange={handleSubjectChange} 
                className="input-field"
                disabled={!selectedSemester || semesters.length === 0}
              >
                {subjects.filter(s => s.semester === selectedSemester).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-brand-bg/50 p-2 rounded-lg border border-brand-divider">
            <Button variant="ghost" size="sm" onClick={prevMonth}>&larr; Prev</Button>
            <div className="font-semibold text-brand-text w-32 text-center">
              {MONTH_NAMES[month]} {year}
            </div>
            <Button variant="ghost" size="sm" onClick={nextMonth}>Next &rarr;</Button>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center"><span className="w-4 h-4 bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold rounded mr-1">P</span> Present</div>
              <div className="flex items-center"><span className="w-4 h-4 bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold rounded mr-1">A</span> Absent</div>
              <div className="flex items-center"><span className="w-4 h-4 bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold rounded mr-1">L</span> Late</div>
            </div>

            <Button variant="outline" size="sm" onClick={downloadCSV} className="flex items-center gap-2">
              <Download size={16} className="text-green-600" />
              Download Excel
            </Button>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-12 text-brand-muted border border-brand-divider rounded-lg bg-brand-bg/30">
            No students enrolled in this subject.
          </div>
        ) : (
          <div ref={tableContainerRef} className="overflow-x-auto border border-brand-divider rounded-lg scroll-smooth pb-4">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-navy text-white">
                <tr>
                  <th colSpan={2} className="bg-navy border-b border-navy/10 sticky left-0 z-20"></th>
                  <th colSpan={daysArray.length} className="px-4 py-1 text-center text-[10px] uppercase tracking-wider bg-navy/80 border-b border-white/10">Daily Attendance Records</th>
                  <th colSpan={4} className="px-2 py-1 text-center text-[10px] uppercase tracking-wider bg-gold/20 text-gold border-b border-white/10 border-l border-white/10">Current Month</th>
                  <th className="px-2 py-1 text-center text-[10px] uppercase tracking-wider bg-blue-500/20 text-blue-200 border-b border-white/10 border-l border-white/10">Summary</th>
                </tr>
                <tr>
                  <th className="px-4 py-3 font-semibold border-b border-r border-navy/20 bg-navy sticky left-0 z-10">Roll No.</th>
                  <th className="px-4 py-3 font-semibold border-b border-r border-navy/20 bg-navy sticky left-[80px] z-10">Name</th>
                  {daysArray.map(d => {
                    const isToday = d.dateStr === todayDateStr;
                    return (
                      <th 
                        key={d.date} 
                        data-day={d.date}
                        className={`px-1 py-1 text-center font-medium border-b border-r border-navy/20 min-w-[36px] ${isToday ? 'bg-gold text-navy' : ''}`}
                      >
                        <div className={`text-[10px] ${isToday ? 'text-navy/80' : 'text-white/80'}`}>{d.dayStr}</div>
                        <div>{d.date}</div>
                      </th>
                    );
                  })}
                  <th className="px-2 py-3 text-center font-semibold border-b border-l border-navy/20 bg-navy/90">P</th>
                  <th className="px-2 py-3 text-center font-semibold border-b border-navy/20 bg-navy/90">A</th>
                  <th className="px-2 py-3 text-center font-semibold border-b border-navy/20 bg-navy/90">L</th>
                  <th className="px-2 py-3 text-center font-semibold border-b border-navy/20 bg-navy/90 border-r border-white/10">%</th>
                  <th className="px-2 py-3 text-center font-bold border-b border-navy/20 bg-blue-900/40 text-blue-200">Overall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-divider">
                {students.map((student) => {
                  const summary = getStudentSummary(student.studentId);
                  return (
                    <tr key={student.studentId} className="hover:bg-brand-bg/50 transition-colors">
                      <td className="px-4 py-2 border-r border-brand-divider font-medium text-brand-muted bg-white sticky left-0 z-10">{student.rollNo}</td>
                      <td className="px-4 py-2 border-r border-brand-divider font-medium text-brand-text bg-white sticky left-[80px] z-10">
                        {student.name}
                        <div className="text-[10px] font-normal text-brand-muted mt-0.5">{student.program}</div>
                      </td>
                      
                      {daysArray.map(d => {
                        const status = attendanceMatrix[student.studentId]?.[d.dateStr];
                        const isToday = d.dateStr === todayDateStr;
                        
                        let bgClass = isToday ? "bg-gold/10 hover:bg-gold/20" : "bg-transparent hover:bg-gray-100";
                        let textClass = "text-transparent hover:text-gray-400";
                        let label = "";
                        
                        if (status === 'PRESENT') {
                          bgClass = "bg-green-50 hover:bg-green-100";
                          textClass = "text-green-700 font-bold";
                          label = "P";
                        } else if (status === 'ABSENT') {
                          bgClass = "bg-red-50 hover:bg-red-100";
                          textClass = "text-red-700 font-bold";
                          label = "A";
                        } else if (status === 'LATE') {
                          bgClass = "bg-yellow-50 hover:bg-yellow-100";
                          textClass = "text-yellow-700 font-bold";
                          label = "L";
                        }
                        
                        return (
                          <td key={d.date} className={`p-0 border-r border-brand-divider relative ${isToday ? 'border-x-gold border-x-2' : ''}`}>
                            <button
                              onClick={() => handleCellClick(student, d.dateStr)}
                              className={`w-full h-10 flex items-center justify-center transition-colors ${bgClass} cursor-pointer`}
                            >
                              <span className={textClass}>{label || '-'}</span>
                            </button>
                          </td>
                        );
                      })}
                      
                      <td className="px-2 py-2 text-center border-l border-brand-divider font-semibold text-green-600 bg-brand-bg/30">{summary.p}</td>
                      <td className="px-2 py-2 text-center text-red-600 font-semibold bg-brand-bg/30">{summary.a}</td>
                      <td className="px-2 py-2 text-center text-yellow-600 font-semibold bg-brand-bg/30">{summary.l}</td>
                      <td className={`px-2 py-2 text-center font-bold bg-brand-bg/50 border-r border-brand-divider ${summary.perc >= 75 ? 'text-green-600' : summary.perc >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {summary.perc}%
                      </td>
                      <td className={`px-2 py-2 text-center font-black bg-blue-50/50 ${summary.oPerc >= 75 ? 'text-blue-700' : summary.oPerc >= 60 ? 'text-blue-500' : 'text-red-600'}`}>
                        {summary.oPerc}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
