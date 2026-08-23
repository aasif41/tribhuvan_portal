import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import api from '../../services/api';
import { colors } from '../../constants/colors';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

export default function MyClassesScreen() {
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);

  useEffect(() => {
    api.get('/teachers/classes').then((r) => { setClassData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const prevDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); setExpandedSlot(null); };
  const nextDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); setExpandedSlot(null); };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.gold} /></View>;

  const dayName = DAYS[currentDate.getDay()];
  const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const todaySlots = (classData?.timetable || [])
    .filter((t: any) => t.day === dayName)
    .sort((a: any, b: any) => timeToNumber(a.startTime) - timeToNumber(b.startTime));

  const merged: any[] = [];
  todaySlots.forEach((slot: any) => {
    const last = merged[merged.length - 1];
    if (last && last.subject.code === slot.subject.code) last.endTime = slot.endTime;
    else merged.push({ ...slot });
  });

  const grouped: Record<number, any[]> = {};
  merged.forEach((t: any) => {
    const sub = classData?.subjects.find((s: any) => s.code === t.subject.code);
    const sem = sub?.semester || 0;
    if (!grouped[sem]) grouped[sem] = [];
    grouped[sem].push({ ...t, subjectDetails: sub });
  });
  const semesters = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PageHeader title="My Schedule" subtitle="Your daily class timetable" />

      {/* Day Navigator */}
      <View style={styles.dayNav}>
        <TouchableOpacity onPress={prevDay} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.navy} />
        </TouchableOpacity>
        <View style={styles.dayCenter}>
          <Text style={styles.dayName}>{dayName}</Text>
          <Text style={styles.dayDate}>{formattedDate}</Text>
        </View>
        <TouchableOpacity onPress={nextDay} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={colors.navy} />
        </TouchableOpacity>
      </View>

      {semesters.length === 0 ? (
        <Card>
          <View style={styles.noClass}>
            <Ionicons name="cafe-outline" size={32} color={colors.gold} />
            <Text style={styles.noClassText}>No classes on {dayName}</Text>
            <Text style={styles.noClassSub}>Enjoy your free time!</Text>
          </View>
        </Card>
      ) : (
        semesters.map((sem) => {
          const classes = grouped[Number(sem)].sort((a, b) => timeToNumber(a.startTime) - timeToNumber(b.startTime));
          return (
            <Card key={sem}>
              <CardHeader title={`Semester ${sem}`} subtitle="Classes scheduled for this semester" />
              {classes.map((slot: any, i: number) => {
                const uid = `${slot.id}-${i}`;
                const isExpanded = expandedSlot === uid;
                const enrollments = slot.subjectDetails?.enrollments || [];
                return (
                  <View key={uid} style={[styles.slotRow, i < classes.length - 1 && styles.slotBorder]}>
                    <View style={styles.slotMain}>
                      <View style={styles.timeBadge}>
                        <Text style={styles.timeText}>{slot.startTime}</Text>
                        <Text style={styles.timeTo}>to {slot.endTime}</Text>
                      </View>
                      <View style={styles.slotInfo}>
                        <Text style={styles.subjectName}>{slot.subject.name}</Text>
                        <Text style={styles.subjectCode}>{slot.subject.code}</Text>
                        <View style={styles.metaRow}>
                          <Text style={styles.metaText}>📍 {slot.room || 'TBA'}</Text>
                          <TouchableOpacity onPress={() => setExpandedSlot(isExpanded ? null : uid)}>
                            <Text style={styles.studentsLink}>
                              {enrollments.length} students {isExpanded ? '▲' : '▼'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    {isExpanded && (
                      <View style={styles.studentList}>
                        {enrollments.length === 0 ? (
                          <Text style={styles.noStudents}>No students enrolled</Text>
                        ) : (
                          enrollments.map((e: any, j: number) => (
                            <View key={j} style={styles.studentItem}>
                              <View style={styles.studentAvatar}>
                                <Text style={styles.studentAvatarText}>{e.student.user.name.charAt(0)}</Text>
                              </View>
                              <Text style={styles.studentName}>{e.student.user.name}</Text>
                            </View>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  dayNav: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#f0f0f0' },
  navBtn: { padding: 8 },
  dayCenter: { flex: 1, alignItems: 'center' },
  dayName: { fontSize: 18, fontWeight: '800', color: colors.navy },
  dayDate: { fontSize: 12, color: colors.mutedText, marginTop: 2 },
  noClass: { alignItems: 'center', paddingVertical: 24 },
  noClassText: { fontSize: 16, fontWeight: '700', color: colors.navy, marginTop: 10 },
  noClassSub: { fontSize: 13, color: colors.mutedText, marginTop: 4 },
  slotRow: { paddingVertical: 14 },
  slotBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  slotMain: { flexDirection: 'row', gap: 12 },
  timeBadge: { backgroundColor: '#eff6ff', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', minWidth: 86, borderWidth: 1, borderColor: '#bfdbfe' },
  timeText: { fontSize: 13, fontWeight: '700', color: '#1d4ed8' },
  timeTo: { fontSize: 10, color: '#93c5fd', marginTop: 2 },
  slotInfo: { flex: 1 },
  subjectName: { fontSize: 15, fontWeight: '800', color: colors.navy },
  subjectCode: { fontSize: 12, color: colors.mutedText, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  metaText: { fontSize: 12, color: colors.mutedText },
  studentsLink: { fontSize: 12, color: '#2563eb', fontWeight: '700' },
  studentList: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginTop: 10, gap: 8 },
  noStudents: { fontSize: 13, color: colors.mutedText, fontStyle: 'italic' },
  studentItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  studentAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  studentAvatarText: { fontSize: 12, fontWeight: '700', color: '#1d4ed8' },
  studentName: { fontSize: 13, color: colors.text, fontWeight: '500' },
});
