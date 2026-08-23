import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageHeader } from '../../components/shared/PageHeader';
import { AttendanceBar } from '../../components/shared/AttendanceBar';
import { AnnouncementCard } from '../../components/shared/AnnouncementCard';
import api from '../../services/api';
import { colors } from '../../constants/colors';
import type { AttendanceSummary, Announcement, TimetableSlot } from '@tribhuvan/shared';

export default function StudentDashboard() {
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
        setAttendance(attRes.data.data || []);
        setAnnouncements(annRes.data.data?.data || []);
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        setTodayClasses((ttRes.data.data || []).filter((s: TimetableSlot) => s.day === today));
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const overallAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((sum, a) => sum + a.percentage, 0) / attendance.length) : 0;

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.gold} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0]}!`}
        subtitle="Here's your academic overview"
      />

      {/* 4 Stat cards — 2×2 grid matching web */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Overall Attendance</Text>
          <Text style={styles.statBig}>{overallAttendance}%</Text>
          <AttendanceBar percentage={overallAttendance} />
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Subjects</Text>
          <Text style={styles.statBig}>{attendance.length}</Text>
          <Text style={styles.statSub}>Enrolled this semester</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Today's Classes</Text>
          <Text style={styles.statBig}>{todayClasses.length}</Text>
          <Text style={styles.statSub}>
            {todayClasses.length > 0 ? `Next: ${todayClasses[0].startTime}` : 'No classes today'}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Semester</Text>
          <Text style={styles.statBig}>{user?.student?.semester || '-'}</Text>
          <Text style={styles.statSub} numberOfLines={1}>{user?.student?.program || ''}</Text>
        </Card>
      </View>

      {/* Two cards stacked — Attendance breakdown + Recent announcements */}
      {/* On web these are side-by-side lg:grid-cols-2; on mobile we stack them */}
      <Card>
        <CardHeader title="Attendance by Subject" subtitle="Current semester" />
        {attendance.length === 0 ? (
          <Text style={styles.emptyText}>No attendance data yet</Text>
        ) : (
          attendance.map((att) => (
            <View key={att.subjectId} style={styles.attRow}>
              <View style={styles.attRowHeader}>
                <Text style={styles.attSubjectName}>{att.subjectName}</Text>
                <Text style={styles.attSubjectCode}>{att.subjectCode}</Text>
              </View>
              <AttendanceBar percentage={att.percentage} label={`${att.percentage}%`} />
            </View>
          ))
        )}
      </Card>

      <Card>
        <CardHeader title="Recent Announcements" />
        {announcements.length === 0 ? (
          <Text style={styles.emptyText}>No announcements yet</Text>
        ) : (
          announcements.map((ann) => (
            <AnnouncementCard key={ann.id} announcement={ann} />
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  statCard: { width: '47%', marginBottom: 0 },
  statLabel: { fontSize: 12, color: colors.mutedText, marginBottom: 4 },
  statBig: { fontSize: 30, fontWeight: '800', color: colors.text, marginBottom: 4 },
  statSub: { fontSize: 11, color: colors.mutedText },
  attRow: { marginBottom: 12 },
  attRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  attSubjectName: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 1 },
  attSubjectCode: { fontSize: 11, color: colors.mutedText },
  emptyText: { fontSize: 13, color: colors.mutedText, textAlign: 'center', paddingVertical: 16 },
});
