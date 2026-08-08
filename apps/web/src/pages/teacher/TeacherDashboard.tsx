import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/layout/PageHeader';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Card, CardHeader } from '../../components/ui/Card';
import api from '../../services/api';
import { BookOpen, Clock, GraduationCap, PartyPopper } from 'lucide-react';

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

export function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ subjects: 0, todayClasses: 0, students: 0 });
  const [todaySchedule, setTodaySchedule] = useState<Array<{ id: string; day: string; startTime: string; endTime: string; room: string; subject: { name: string; code: string } }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teachers/classes')
      .then((r) => {
        const data = r.data.data;
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todaySlots = (data.timetable || []).filter((t: any) => t.day === today);
        
        // Sort todaySlots by time
        const sortedSlots = [...todaySlots].sort((a, b) => timeToNumber(a.startTime) - timeToNumber(b.startTime));
        
        // Merge consecutive slots for the same subject
        const mergedSlots: any[] = [];
        sortedSlots.forEach(slot => {
          const last = mergedSlots[mergedSlots.length - 1];
          if (last && last.subject.code === slot.subject.code) {
            last.endTime = slot.endTime; // Extend the end time
          } else {
            mergedSlots.push({ ...slot });
          }
        });

        const uniqueStudentIds = new Set<string>();
        (data.subjects || []).forEach((s: any) => {
          (s.enrollments || []).forEach((e: any) => {
            if (e.student?.id) {
              uniqueStudentIds.add(e.student.id);
            }
          });
        });
        const totalStudents = uniqueStudentIds.size;
        
        setStats({
          subjects: data.subjects?.length || 0,
          todayClasses: mergedSlots.length,
          students: totalStudents,
        });
        setTodaySchedule(mergedSlots);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ').pop() || 'Professor'}!`}
        subtitle="Here's your teaching overview for today"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-text">{stats.subjects}</p>
              <p className="text-sm text-brand-muted">Subjects</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-text">{stats.todayClasses}</p>
              <p className="text-sm text-brand-muted">Today's Classes</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-text">{stats.students}</p>
              <p className="text-sm text-brand-muted">Total Students</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader title="Today's Schedule" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
        {todaySchedule.length === 0 ? (
          <p className="text-brand-muted text-center py-8 flex items-center justify-center">
            No classes scheduled for today <PartyPopper size={20} className="inline ml-2 text-gold" />
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {todaySchedule.map((slot, idx) => (
              <div key={`${slot.id}-${idx}`} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <div className="bg-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg min-w-[90px] text-center">
                    {slot.startTime}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-text">{slot.subject.name}</p>
                    <p className="text-sm text-brand-muted">{slot.subject.code} • {slot.startTime} - {slot.endTime}</p>
                  </div>
                </div>
                <span className="text-sm text-brand-muted bg-brand-bg px-3 py-1 rounded-lg">{slot.room}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

