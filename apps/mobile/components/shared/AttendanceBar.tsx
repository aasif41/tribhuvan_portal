import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface AttendanceBarProps { percentage: number; label?: string; }

export function AttendanceBar({ percentage, label }: AttendanceBarProps) {
  const barColor = percentage >= 75 ? colors.success : percentage >= 60 ? colors.warning : colors.error;
  return (
    <View style={styles.container}>
      {label && <View style={styles.header}><Text style={styles.label}>{label}</Text><Text style={[styles.pct, { color: barColor }]}>{percentage}%</Text></View>}
      <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, percentage)}%`, backgroundColor: barColor }]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 13, color: colors.mutedText },
  pct: { fontSize: 13, fontWeight: '600' },
  track: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});
