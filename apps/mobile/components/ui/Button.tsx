import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'gold' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style }: ButtonProps) {
  const btnStyle = variant === 'gold' ? styles.gold : variant === 'outline' ? styles.outline : styles.primary;
  const txtStyle = variant === 'outline' ? styles.outlineText : styles.text;

  return (
    <TouchableOpacity style={[styles.base, btnStyle, disabled && styles.disabled, style]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      {loading ? <ActivityIndicator color={variant === 'outline' ? colors.navy : colors.white} /> : <Text style={[styles.text, txtStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  primary: { backgroundColor: colors.navy } as ViewStyle,
  gold: { backgroundColor: colors.gold } as ViewStyle,
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.navy } as ViewStyle,
  disabled: { opacity: 0.5 } as ViewStyle,
  text: { color: colors.white, fontSize: 16, fontWeight: '600' } as TextStyle,
  outlineText: { color: colors.navy } as TextStyle,
});
