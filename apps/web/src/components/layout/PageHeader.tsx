import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-brand-text leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5 sm:mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0 w-full sm:w-auto">{action}</div>}
    </div>
  );
}
