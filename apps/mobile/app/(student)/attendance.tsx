import { ScrollView, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/ui/Card';
import { AttendanceBar } from '../../components/shared/AttendanceBar';
import { colors } from '../../constants/colors';

export default function AttendanceScreen() {
  const subjects = [
    { name: 'Data Structures & Algorithms', code: 'CSE-301', pct: 85 },
    { name: 'Object Oriented Programming', code: 'CSE-302', pct: 78 },
    { name: 'Database Management Systems', code: 'CSE-303', pct: 92 },
    { name: 'Computer Networks', code: 'CSE-304', pct: 65 },
    { name: 'Discrete Mathematics', code: 'CSE-305', pct: 88 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Attendance</Text>
      <Card title="Overall">
        <AttendanceBar percentage={82} label="All Subjects" />
      </Card>
      <Card title="By Subject">
        {subjects.map((s) => (
          <AttendanceBar key={s.code} percentage={s.pct} label={`${s.name} (${s.code})`} />
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 16 },
});
