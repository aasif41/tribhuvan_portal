interface AttendanceBarProps {
  percentage: number;
  label?: string;
  showText?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const heightClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

function getBarColor(percentage: number): string {
  if (percentage >= 75) return 'bg-green-500';
  if (percentage >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

export function AttendanceBar({
  percentage,
  label,
  showText = true,
  height = 'md',
}: AttendanceBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="space-y-1">
      {(label || showText) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm text-brand-muted">{label}</span>}
          {showText && (
            <span className={`text-sm font-semibold ${
              clampedPercentage >= 75 ? 'text-green-600' :
              clampedPercentage >= 60 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {clampedPercentage}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${getBarColor(clampedPercentage)} rounded-full transition-all duration-500 ease-out ${heightClasses[height]}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}
