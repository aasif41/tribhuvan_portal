import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors } from '../../constants/colors';

const timeToNumber = (t: string) => {
  if (!t) return 0;
  const m = t.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
  if (!m) return 0;
  let h = parseInt(m[1]), min = parseInt(m[2]);
  const period = m[3];
  if (period) {
    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  } else if (h >= 1 && h <= 7) h += 12;
  return h * 60 + min;
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ subjects: 0, todayClasses: 0, students: 0 });
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teachers/classes').then((r) => {
      const data = r.data.data;
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todaySlots = (data.timetable || []).filter((t: any) => t.day === today);
      const sorted = [...todaySlots].sort((a: any, b: any) => timeToNumber(a.startTime) - timeToNumber(b.startTime));
      const merged: any[] = [];
      sorted.forEach((slot: any) => {
        const last = merged[merged.length - 1];
        if (last && last.subject.code === slot.subject.code) last.endTime = slot.endTime;
        else merged.push({ ...slot });
      });
      const ids = new Set<string>();
      (data.subjects || []).forEach((s: any) => (s.enrollments || []).forEach((e: any) => { if (e.student?.id) ids.add(e.student.id); }));
      setStats({ subjects: data.subjects?.length || 0, todayClasses: merged.length, students: ids.size });
      setTodaySchedule(merged);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.gold} /></View>;

  // Matches web: icon (circle bg) on left, number + label on right — horizontal layout
  const statCards = [
    { label: 'Subjects', value: stats.subjects, icon: 'book-outline' as const, bg: '#dbeafe', color: '#2563eb' },
    { label: "Today's Classes", value: stats.todayClasses, icon: 'time-outline' as const, bg: '#dcfce7', color: '#16a34a' },
    { label: 'Total Students', value: stats.students, icon: 'school-outline' as const, bg: '#f3e8ff', color: '#9333ea' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ').pop() || 'Professor'}!`}
        subtitle="Here's your teaching overview for today"
      />

      {/* 3 Stat cards — horizontal icon+number layout matching web */}
      <View style={styles.statsCol}>
        {statCards.map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <View style={styles.statCardInner}>
              <View style={[styles.iconCircle, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={24} color={s.color} />
              </View>
              <View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Today's Schedule card — matches web exactly */}
      <Card>
        <CardHeader
          title="Today's Schedule"
          subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        />
        {todaySchedule.length === 0 ? (
          <View style={styles.noClass}>
            <Text style={styles.noClassText}>No classes scheduled for today 🎉</Text>
          </View>
        ) : (
          todaySchedule.map((slot, idx) => (
            <View key={`${slot.id}-${idx}`} style={[styles.scheduleRow, idx < todaySchedule.length - 1 && styles.rowDivider]}>
              {/* Navy time pill — matches web exactly */}
              <View style={styles.timePill}>
                <Text style={styles.timePillText}>{slot.startTime}</Text>
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.subjectName}>{slot.subject.name}</Text>
                <Text style={styles.subjectMeta}>{slot.subject.code} • {slot.startTime} - {slot.endTime}</Text>
              </View>
              {/* Room badge — matches web `bg-brand-bg` style */}
              <View style={styles.roomBadge}>
                <Text style={styles.roomText}>{slot.room || 'TBA'}</Text>
              </View>
            </View>
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
  // Stats — vertical stack of horizontal cards (matching web's 3-column grid)
  statsCol: { gap: 10, marginBottom: 12 },
  statCard: { marginBottom: 0 },
  statCardInner: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconCircle: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 13, color: colors.mutedText, marginTop: 2 },
  // Schedule
  noClass: { paddingVertical: 24, alignItems: 'center' },
  noClassText: { fontSize: 15, color: colors.mutedText, textAlign: 'center' },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  timePill: { backgroundColor: colors.navy, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, minWidth: 90, alignItems: 'center' },
  timePillText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  scheduleInfo: { flex: 1 },
  subjectName: { fontSize: 15, fontWeight: '700', color: colors.text },
  subjectMeta: { fontSize: 12, color: colors.mutedText, marginTop: 2 },
  roomBadge: { backgroundColor: '#f4f6fb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  roomText: { fontSize: 12, color: colors.mutedText, fontWeight: '600' },
});
