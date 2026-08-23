import { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { colors } from '../../constants/colors';

type Status = 'PRESENT' | 'ABSENT' | 'LATE';

interface StudentRecord {
  studentId: string;
  name: string;
  rollNo: string;
  subjectId: string;
  program: string;
}

interface GroupedSubject {
  id: string;
  name: string;
  semester: number;
  originalSubjects: any[];
}

const getLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function MarkAttendanceScreen() {
  const [subjects, setSubjects] = useState<GroupedSubject[]>([]);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate] = useState(getLocalDateString(new Date()));
  const pendingSaves = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    api.get('/teachers/classes').then((r) => {
      const rawSubjects = r.data.data.subjects;
      const grouped = new Map<string, GroupedSubject>();
      rawSubjects.forEach((s: any) => {
        const key = `${s.name} (Sem ${s.semester})`;
        if (!grouped.has(key)) grouped.set(key, { id: key, name: s.name, semester: s.semester, originalSubjects: [] });
        grouped.get(key)!.originalSubjects.push(s);
      });
      const subs = Array.from(grouped.values()).sort((a, b) => a.semester - b.semester);
      setSubjects(subs);
      const sems = [...new Set(subs.map((s) => s.semester))].sort((a, b) => a - b);
      setSemesters(sems);
      if (sems.length > 0) setSelectedSemester(sems[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredSubjects = subjects.filter((s) => s.semester === selectedSemester);

  useEffect(() => {
    if (!selectedSubject) return;
    const sub = subjects.find((s) => s.id === selectedSubject);
    if (!sub) return;
    const allStudents: StudentRecord[] = [];
    sub.originalSubjects.forEach((orig: any) => {
      (orig.enrollments || []).forEach((e: any) => {
        if (e.student?.id) {
          allStudents.push({
            studentId: e.student.id,
            name: e.student.user?.name || 'Unknown',
            rollNo: e.student.rollNo || '',
            subjectId: orig.id,
            program: orig.program || '',
          });
        }
      });
    });
    setStudents(allStudents);
    const init: Record<string, Status> = {};
    allStudents.forEach((s) => { init[s.studentId] = 'PRESENT'; });
    setAttendanceMap(init);
    // Load existing attendance
    loadExistingAttendance(sub, selectedDate, init);
  }, [selectedSubject]);

  const loadExistingAttendance = async (sub: GroupedSubject, date: string, init: Record<string, Status>) => {
    try {
      const subjectId = sub.originalSubjects[0]?.id;
      if (!subjectId) return;
      const res = await api.get(`/attendance/${subjectId}/${date}`);
      const records = res.data?.data || [];
      const updated = { ...init };
      records.forEach((r: any) => { if (updated[r.studentId] !== undefined) updated[r.studentId] = r.status; });
      setAttendanceMap(updated);
    } catch { /* no existing record */ }
  };

  const cycleStatus = (studentId: string) => {
    const cycle: Status[] = ['PRESENT', 'ABSENT', 'LATE'];
    setAttendanceMap((prev) => {
      const current = prev[studentId] || 'PRESENT';
      const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
      const updated = { ...prev, [studentId]: next };
      // Debounced auto-save
      clearTimeout(pendingSaves.current[studentId]);
      pendingSaves.current[studentId] = setTimeout(() => autoSave(studentId, next), 800);
      return updated;
    });
  };

  const autoSave = async (studentId: string, status: Status) => {
    const sub = subjects.find((s) => s.id === selectedSubject);
    if (!sub) return;
    const student = students.find((s) => s.studentId === studentId);
    if (!student) return;
    try {
      await api.post('/attendance', {
        subjectId: student.subjectId,
        date: selectedDate,
        records: [{ studentId, status }],
      });
    } catch { /* silent */ }
  };

  const handleSubmitAll = async () => {
    if (!selectedSubject) return;
    const sub = subjects.find((s) => s.id === selectedSubject);
    if (!sub) return;
    setSubmitting(true);
    try {
      const records = students.map((s) => ({ studentId: s.studentId, status: attendanceMap[s.studentId] || 'PRESENT' }));
      await api.post('/attendance', { subjectId: sub.originalSubjects[0]?.id, date: selectedDate, records });
      Alert.alert('Success', 'Attendance submitted successfully!');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<Status, { bg: string; text: string; label: string }> = {
    PRESENT: { bg: '#dcfce7', text: '#15803d', label: 'P' },
    ABSENT: { bg: '#fee2e2', text: '#dc2626', label: 'A' },
    LATE: { bg: '#fef3c7', text: '#b45309', label: 'L' },
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.gold} /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PageHeader title="Mark Attendance" subtitle={`Date: ${selectedDate}`} />

      {/* Semester Selector */}
      <View style={styles.pickerSection}>
        <Text style={styles.pickerLabel}>Semester</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {semesters.map((sem) => (
            <TouchableOpacity
              key={sem}
              onPress={() => { setSelectedSemester(sem); setSelectedSubject(''); setStudents([]); }}
              style={[styles.chip, selectedSemester === sem && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedSemester === sem && styles.chipTextActive]}>Sem {sem}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Subject Selector */}
      {filteredSubjects.length > 0 && (
        <View style={styles.pickerSection}>
          <Text style={styles.pickerLabel}>Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredSubjects.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                onPress={() => setSelectedSubject(sub.id)}
                style={[styles.chip, selectedSubject === sub.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedSubject === sub.id && styles.chipTextActive]}>{sub.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Student List */}
      {selectedSubject && (
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Students ({students.length})</Text>
            <Text style={styles.tapHint}>Tap to cycle: P → A → L</Text>
          </View>
          {students.length === 0 ? (
            <Text style={styles.empty}>No students enrolled in this subject</Text>
          ) : (
            students.map((s) => {
              const status = attendanceMap[s.studentId] || 'PRESENT';
              const { bg, text, label } = statusColors[status];
              return (
                <TouchableOpacity key={s.studentId} onPress={() => cycleStatus(s.studentId)} style={styles.studentRow}>
                  <View style={styles.studentLeft}>
                    <Text style={styles.studentName}>{s.name}</Text>
                    <Text style={styles.studentRoll}>{s.rollNo}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                    <Text style={[styles.statusText, { color: text }]}>{status}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          {students.length > 0 && (
            <View style={styles.submitSection}>
              <View style={styles.summary}>
                <Text style={styles.summaryText}>P: {Object.values(attendanceMap).filter(v => v === 'PRESENT').length}</Text>
                <Text style={styles.summaryText}>A: {Object.values(attendanceMap).filter(v => v === 'ABSENT').length}</Text>
                <Text style={styles.summaryText}>L: {Object.values(attendanceMap).filter(v => v === 'LATE').length}</Text>
              </View>
              <Button title={submitting ? 'Submitting...' : 'Submit Attendance'} onPress={handleSubmitAll} variant="gold" />
            </View>
          )}
        </Card>
      )}

      {!selectedSubject && filteredSubjects.length > 0 && (
        <Text style={styles.selectHint}>← Select a subject above to load students</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  pickerSection: { marginBottom: 14 },
  pickerLabel: { fontSize: 12, fontWeight: '700', color: colors.mutedText, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: colors.white, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.mutedText },
  chipTextActive: { color: colors.white },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  tapHint: { fontSize: 11, color: colors.mutedText },
  studentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  studentLeft: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: '600', color: colors.text },
  studentRoll: { fontSize: 11, color: colors.mutedText, marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 },
  statusText: { fontSize: 12, fontWeight: '700' },
  submitSection: { marginTop: 16, gap: 10 },
  summary: { flexDirection: 'row', gap: 20, justifyContent: 'center' },
  summaryText: { fontSize: 14, fontWeight: '700', color: colors.text },
  empty: { textAlign: 'center', color: colors.mutedText, paddingVertical: 24, fontSize: 13 },
  selectHint: { textAlign: 'center', color: colors.mutedText, fontSize: 13, marginTop: 24 },
});
