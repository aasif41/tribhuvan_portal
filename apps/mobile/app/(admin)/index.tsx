import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function AdminDashboard() {
  const stats = [
    { label: 'Students', value: '120', icon: '🎓', bg: '#dbeafe' },
    { label: 'Teachers', value: '15', icon: '👨‍🏫', bg: '#dcfce7' },
    { label: 'Pending', value: '3', icon: '⏳', bg: '#fef3c7' },
    { label: 'Subjects', value: '24', icon: '📚', bg: '#f3e8ff' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <View style={styles.grid}>
        {stats.map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <View style={[styles.iconBg, { backgroundColor: s.bg }]}><Text style={styles.icon}>{s.icon}</Text></View>
            <Text style={styles.val}>{s.value}</Text>
            <Text style={styles.label}>{s.label}</Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%' },
  iconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  icon: { fontSize: 20 },
  val: { fontSize: 24, fontWeight: '800', color: colors.text },
  label: { fontSize: 12, color: colors.mutedText, marginTop: 2 },
});
