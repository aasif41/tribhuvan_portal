import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';

export default function ApprovalsScreen() {
  const pending = [
    { name: 'Neha Gupta', email: 'neha.gupta@tribhuvancollege.ac.in', role: 'STUDENT' },
    { name: 'Vikram Rao', email: 'vikram.rao@tribhuvancollege.ac.in', role: 'TEACHER' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pending Approvals</Text>
      {pending.map((u, i) => (
        <Card key={i}>
          <View style={styles.userRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{u.name.charAt(0)}</Text></View>
            <View style={styles.info}>
              <Text style={styles.name}>{u.name}</Text>
              <Text style={styles.email}>{u.email}</Text>
              <View style={styles.roleBadge}><Text style={styles.roleText}>{u.role}</Text></View>
            </View>
          </View>
          <View style={styles.actions}>
            <Button title="Approve" onPress={() => {}} variant="gold" style={{ flex: 1, marginRight: 8 }} />
            <Button title="Reject" onPress={() => {}} variant="outline" style={{ flex: 1 }} />
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
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: colors.gold, fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  email: { fontSize: 12, color: colors.mutedText, marginTop: 2 },
  roleBadge: { backgroundColor: '#e0e7ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
  roleText: { fontSize: 11, fontWeight: '600', color: '#4338ca' },
  actions: { flexDirection: 'row' },
});
