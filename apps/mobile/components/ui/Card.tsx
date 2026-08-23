import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
}

export function Card({ children, style, title }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function CardHeader({ title, subtitle }: CardHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  header: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 2,
  },
});
