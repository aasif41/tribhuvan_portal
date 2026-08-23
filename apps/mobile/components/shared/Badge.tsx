import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#dcfce7', text: '#15803d' },
  warning: { bg: '#fef3c7', text: '#b45309' },
  error:   { bg: '#fee2e2', text: '#dc2626' },
  info:    { bg: '#dbeafe', text: '#1d4ed8' },
  default: { bg: '#f3f4f6', text: '#374151' },
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const { bg, text } = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
