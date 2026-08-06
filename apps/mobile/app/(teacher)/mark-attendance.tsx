import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';

type Status = 'PRESENT' | 'ABSENT' | 'LATE';

export default function MarkAttendanceScreen() {
  const [students, setStudents] = useState([
    { id: '1', name: 'Rahul Verma', rollNo: 'BTECH-CSE-2024-001', status: 'PRESENT' as Status },
    { id: '2', name: 'Sneha Patel', rollNo: 'BTECH-CSE-2024-002', status: 'PRESENT' as Status },
    { id: '3', name: 'Amit Sharma', rollNo: 'BTECH-CSE-2024-003', status: 'PRESENT' as Status },
  ]);

  const toggle = (idx: number) => {
    setStudents((prev) => prev.map((s, i) => i === idx ? { ...s, status: (s.status === 'PRESENT' ? 'ABSENT' : s.status === 'ABSENT' ? 'LATE' : 'PRESENT') as Status } : s));
  };

  const statusColor: Record<Status, string> = { PRESENT: colors.success, ABSENT: colors.error, LATE: colors.warning };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mark Attendance</Text>
      <Card>
        {students.map((s, i) => (
          <TouchableOpacity key={s.id} onPress={() => toggle(i)} style={styles.row}>
            <View><Text style={styles.name}>{s.name}</Text><Text style={styles.roll}>{s.rollNo}</Text></View>
            <View style={[styles.badge, { backgroundColor: statusColor[s.status] + '20' }]}><Text style={[styles.badgeText, { color: statusColor[s.status] }]}>{s.status}</Text></View>
          </TouchableOpacity>
        ))}
      </Card>
      <Button title="Submit Attendance" onPress={() => {}} variant="gold" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  name: { fontSize: 14, fontWeight: '600', color: colors.text },
  roll: { fontSize: 12, color: colors.mutedText, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
