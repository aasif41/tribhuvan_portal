import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';

export default function PendingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⏳</Text>
      <Text style={styles.title}>Approval Pending</Text>
      <Text style={styles.text}>Your registration is being reviewed. You will be notified once approved.</Text>
      <Button title="Check Status" onPress={() => {}} variant="outline" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
  text: { fontSize: 14, color: colors.mutedText, textAlign: 'center', lineHeight: 22 },
});
