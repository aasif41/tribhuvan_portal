import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function AnnouncementsScreen() {
  const items = [
    { title: 'Welcome to New Session', category: 'general', date: 'May 5, 2024' },
    { title: 'Mid-Semester Exam Schedule', category: 'exam', date: 'May 3, 2024' },
    { title: 'Annual Tech Fest', category: 'event', date: 'May 1, 2024' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Announcements</Text>
      {items.map((item, i) => (
        <Card key={i}>
          <View style={styles.badge}><Text style={styles.badgeText}>{item.category}</Text></View>
          <Text style={styles.annTitle}>{item.title}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 16 },
  badge: { backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 8 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#4338ca', textTransform: 'capitalize' },
  annTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  date: { fontSize: 12, color: colors.mutedText },
});
