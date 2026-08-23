import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.mutedText,
    marginTop: 3,
  },
});
