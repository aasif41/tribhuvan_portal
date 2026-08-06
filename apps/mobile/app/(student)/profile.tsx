import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}><Text style={styles.avatarText}>R</Text></View>
        <Text style={styles.name}>Rahul Verma</Text>
        <Text style={styles.email}>rahul.verma@tribhuvancollege.ac.in</Text>
      </View>
      <Card title="Academic Info">
        {[
          { label: 'Roll Number', value: 'BTECH-CSE-2024-001' },
          { label: 'Program', value: 'B.Tech CSE' },
          { label: 'Year / Semester', value: 'Year 2 / Sem 3' },
          { label: 'Section', value: 'A' },
        ].map((item) => (
          <View key={item.label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: colors.gold },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  email: { fontSize: 13, color: colors.mutedText, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 13, color: colors.mutedText },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.text },
});
