import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function MyClassesScreen() {
  const subjects = [
    { name: 'Data Structures & Algorithms', code: 'CSE-301', students: 45 },
    { name: 'Object Oriented Programming', code: 'CSE-302', students: 42 },
    { name: 'Discrete Mathematics', code: 'CSE-305', students: 48 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Classes</Text>
      {subjects.map((s) => (
        <Card key={s.code}>
          <Text style={styles.subName}>{s.name}</Text>
          <Text style={styles.subCode}>{s.code} • {s.students} students</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 16 },
  subName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subCode: { fontSize: 12, color: colors.mutedText },
});
