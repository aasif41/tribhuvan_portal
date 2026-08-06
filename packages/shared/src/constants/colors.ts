export const BRAND_COLORS = {
  navy: '#0d1f3c',
  gold: '#c8922a',
  goldLight: '#f0b93a',
  background: '#f4f6fb',
  text: '#1a2744',
  mutedText: '#64748b',
  white: '#ffffff',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;

export const STATUS_COLORS = {
  PRESENT: BRAND_COLORS.success,
  ABSENT: BRAND_COLORS.error,
  LATE: BRAND_COLORS.warning,
  PENDING: BRAND_COLORS.warning,
  APPROVED: BRAND_COLORS.success,
  REJECTED: BRAND_COLORS.error,
} as const;
