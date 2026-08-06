export const colors = {
  primary: {
    navy: '#0d1f3c',
    navyLight: '#1a3460',
    navyDark: '#091529',
  },
  accent: {
    gold: '#c8922a',
    goldLight: '#f0b93a',
    goldDark: '#a67820',
  },
  background: {
    default: '#f4f6fb',
    paper: '#ffffff',
    dark: '#0d1f3c',
  },
  text: {
    primary: '#1a2744',
    secondary: '#64748b',
    inverse: '#ffffff',
    muted: '#94a3b8',
  },
  status: {
    success: '#22c55e',
    successLight: '#dcfce7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    info: '#3b82f6',
    infoLight: '#dbeafe',
  },
  border: {
    default: '#e2e8f0',
    focus: '#c8922a',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;
