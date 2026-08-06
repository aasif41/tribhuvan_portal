import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function StudentDashboard() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hello, Student! 👋</Text>
      <Text style={styles.subtitle}>Here's your academic overview</Text>
      <View style={styles.statsRow}>
        <Card style={styles.statCard}><Text style={styles.statValue}>85%</Text><Text style={styles.statLabel}>Attendance</Text></Card>
        <Card style={styles.statCard}><Text style={styles.statValue}>5</Text><Text style={styles.statLabel}>Subjects</Text></Card>
      </View>
      <View style={styles.statsRow}>
        <Card style={styles.statCard}><Text style={styles.statValue}>3</Text><Text style={styles.statLabel}>Today</Text></Card>
        <Card style={styles.statCard}><Text style={styles.statValue}>3</Text><Text style={styles.statLabel}>Semester</Text></Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  greeting: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.mutedText, marginBottom: 20, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  statCard: { flex: 1 },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 13, color: colors.mutedText, marginTop: 2 },
});
