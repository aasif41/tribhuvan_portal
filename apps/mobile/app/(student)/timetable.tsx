import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { DAYS_OF_WEEK } from '@tribhuvan/shared';

export default function TimetableScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Weekly Schedule</Text>
      {DAYS_OF_WEEK.filter((d) => d !== 'Saturday').map((day) => (
        <Card key={day} title={day}>
          <View style={styles.slot}>
            <Text style={styles.time}>09:00 - 10:00</Text>
            <View style={styles.divider} />
            <View><Text style={styles.subjectName}>Data Structures</Text><Text style={styles.room}>Room 301</Text></View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 16 },
  slot: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: colors.background, borderRadius: 10 },
  time: { fontSize: 13, fontWeight: '600', color: colors.navy, width: 90 },
  divider: { width: 1, height: 30, backgroundColor: colors.gold, marginHorizontal: 12, opacity: 0.3 },
  subjectName: { fontSize: 14, fontWeight: '600', color: colors.text },
  room: { fontSize: 12, color: colors.mutedText },
});
