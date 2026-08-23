import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'navy' | 'gold' | 'outline' | 'goldOutline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, onPress, variant = 'navy', loading = false, disabled = false, style, textStyle }: ButtonProps) {
  const getBtnStyle = (): ViewStyle => {
    switch (variant) {
      case 'navy':
      case 'primary':
        return styles.navy;
      case 'gold':
        return styles.gold;
      case 'outline':
        return styles.outline;
      case 'goldOutline':
        return styles.goldOutline;
      default:
        return styles.navy;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'navy':
      case 'primary':
        return styles.navyText;
      case 'gold':
        return styles.goldText;
      case 'outline':
        return styles.outlineText;
      case 'goldOutline':
        return styles.goldOutlineText;
      default:
        return styles.navyText;
    }
  };

  const getSpinnerColor = (): string => {
    if (variant === 'gold') return colors.webNavy;
    if (variant === 'goldOutline') return colors.gold;
    if (variant === 'outline') return colors.webNavy;
    return '#f0ece4';
  };

  return (
    <TouchableOpacity
      style={[styles.base, getBtnStyle(), (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getSpinnerColor()} size="small" />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  } as ViewStyle,
  navy: {
    backgroundColor: '#0d1f3c',
  } as ViewStyle,
  gold: {
    backgroundColor: colors.gold,
  } as ViewStyle,
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d4c9b0',
  } as ViewStyle,
  goldOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gold,
  } as ViewStyle,
  disabled: {
    opacity: 0.5,
  } as ViewStyle,
  navyText: {
    color: '#f0ece4',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as TextStyle,
  goldText: {
    color: '#0d1f3c',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as TextStyle,
  outlineText: {
    color: '#0d1f3c',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  } as TextStyle,
  goldOutlineText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  } as TextStyle,
});
