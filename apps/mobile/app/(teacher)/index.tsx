import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function TeacherDashboard() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Welcome, Professor! 👋</Text>
      <View style={styles.row}>
        <Card style={styles.stat}><Text style={styles.val}>3</Text><Text style={styles.label}>Subjects</Text></Card>
        <Card style={styles.stat}><Text style={styles.val}>2</Text><Text style={styles.label}>Today</Text></Card>
      </View>
      <Card title="Today's Classes">
        <View style={styles.slot}><Text style={styles.time}>09:00</Text><Text style={styles.name}>Data Structures</Text><Text style={styles.room}>Room 301</Text></View>
        <View style={styles.slot}><Text style={styles.time}>10:00</Text><Text style={styles.name}>OOP</Text><Text style={styles.room}>Room 302</Text></View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  greeting: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  stat: { flex: 1 },
  val: { fontSize: 28, fontWeight: '800', color: colors.text },
  label: { fontSize: 13, color: colors.mutedText },
  slot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  time: { fontSize: 14, fontWeight: '600', color: colors.navy, width: 50 },
  name: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.text },
  room: { fontSize: 12, color: colors.mutedText },
});
