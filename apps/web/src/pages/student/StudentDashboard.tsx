import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { AttendanceBar } from '../../components/shared/AttendanceBar';
import { AnnouncementCard } from '../../components/shared/AnnouncementCard';
import api from '../../services/api';
import type { AttendanceSummary, Announcement, TimetableSlot } from '@tribhuvan/shared';

export function StudentDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [todayClasses, setTodayClasses] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, annRes, ttRes] = await Promise.all([
          api.get('/students/attendance'),
          api.get('/announcements?limit=3'),
          api.get('/students/timetable'),
        ]);
        setAttendance(attRes.data.data);
        setAnnouncements(annRes.data.data.data || []);

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todaySlots = (ttRes.data.data || []).filter(
          (slot: TimetableSlot) => slot.day === today
        );
        setTodayClasses(todaySlots);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const overallAttendance =
    attendance.length > 0
      ? Math.round(attendance.reduce((sum, a) => sum + a.percentage, 0) / attendance.length)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0]}!`}
        subtitle="Here's your academic overview"
      />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover>
          <p className="text-sm text-brand-muted">Overall Attendance</p>
          <p className="text-3xl font-bold text-brand-text mt-1">{overallAttendance}%</p>
          <AttendanceBar percentage={overallAttendance} height="sm" showText={false} />
        </Card>
        <Card hover>
          <p className="text-sm text-brand-muted">Subjects</p>
          <p className="text-3xl font-bold text-brand-text mt-1">{attendance.length}</p>
          <p className="text-xs text-brand-muted mt-1">Enrolled this semester</p>
        </Card>
        <Card hover>
          <p className="text-sm text-brand-muted">Today's Classes</p>
          <p className="text-3xl font-bold text-brand-text mt-1">{todayClasses.length}</p>
          <p className="text-xs text-brand-muted mt-1">
            {todayClasses.length > 0 ? `Next: ${todayClasses[0].startTime}` : 'No classes today'}
          </p>
        </Card>
        <Card hover>
          <p className="text-sm text-brand-muted">Semester</p>
          <p className="text-3xl font-bold text-brand-text mt-1">
            {user?.student?.semester || '-'}
          </p>
          <p className="text-xs text-brand-muted mt-1">{user?.student?.program || ''}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance breakdown */}
        <Card>
          <CardHeader title="Attendance by Subject" subtitle="Current semester" />
          <div className="space-y-4">
            {attendance.map((att) => (
              <div key={att.subjectId}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-brand-text">{att.subjectName}</span>
                  <span className="text-xs text-brand-muted">{att.subjectCode}</span>
                </div>
                <AttendanceBar percentage={att.percentage} height="sm" />
              </div>
            ))}
            {attendance.length === 0 && (
              <p className="text-sm text-brand-muted text-center py-4">No attendance data yet</p>
            )}
          </div>
        </Card>

        {/* Recent announcements */}
        <Card>
          <CardHeader title="Recent Announcements" />
          <div className="space-y-3">
            {announcements.map((ann) => (
              <AnnouncementCard key={ann.id} announcement={ann} />
            ))}
            {announcements.length === 0 && (
              <p className="text-sm text-brand-muted text-center py-4">No announcements yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
