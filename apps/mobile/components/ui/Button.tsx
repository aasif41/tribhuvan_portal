import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'gold' | 'outline' | 'goldOutline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, onPress, variant = 'gold', loading = false, disabled = false, style, textStyle }: ButtonProps) {
  const getBtnStyle = (): ViewStyle => {
    switch (variant) {
      case 'gold':
        return styles.gold;
      case 'primary':
        return styles.primary;
      case 'outline':
        return styles.outline;
      case 'goldOutline':
        return styles.goldOutline;
      default:
        return styles.gold;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'gold':
        return styles.goldText;
      case 'primary':
        return styles.whiteText;
      case 'outline':
        return styles.outlineText;
      case 'goldOutline':
        return styles.goldOutlineText;
      default:
        return styles.goldText;
    }
  };

  const getSpinnerColor = (): string => {
    if (variant === 'gold') return colors.navyDark;
    if (variant === 'goldOutline') return colors.gold;
    if (variant === 'outline') return colors.white;
    return colors.white;
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
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  } as ViewStyle,
  gold: {
    backgroundColor: colors.gold,
  } as ViewStyle,
  primary: {
    backgroundColor: colors.navyLight,
  } as ViewStyle,
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  } as ViewStyle,
  goldOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gold,
  } as ViewStyle,
  disabled: {
    opacity: 0.5,
  } as ViewStyle,
  goldText: {
    color: colors.navyDark,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  } as TextStyle,
  whiteText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  } as TextStyle,
  outlineText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
  goldOutlineText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
});
