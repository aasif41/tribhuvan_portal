import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface CardProps { children: React.ReactNode; title?: string; style?: object; }

export function Card({ children, title, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
});
