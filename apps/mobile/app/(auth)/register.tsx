import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNo, setRollNo] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Complete Registration</Text>
      <Text style={styles.subtitle}>Fill in your details</Text>
      <View style={styles.field}><Text style={styles.label}>Full Name</Text><TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" /></View>
      <View style={styles.field}><Text style={styles.label}>Phone</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+91-XXXXXXXXXX" keyboardType="phone-pad" /></View>
      <View style={styles.field}><Text style={styles.label}>Roll Number</Text><TextInput style={styles.input} value={rollNo} onChangeText={setRollNo} placeholder="e.g., BTECH-CSE-2024-001" /></View>
      <Button title="Submit Registration" onPress={() => {}} variant="gold" style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.mutedText, marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
});
