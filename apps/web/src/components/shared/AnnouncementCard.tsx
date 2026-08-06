import { Badge } from '../ui/Badge';
import type { Announcement } from '@tribhuvan/shared';

interface AnnouncementCardProps {
  announcement: Announcement;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

const categoryColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  general: 'default',
  academic: 'info',
  exam: 'warning',
  event: 'success',
  placement: 'info',
  hostel: 'default',
  urgent: 'error',
};

export function AnnouncementCard({ announcement, onDelete, showDelete = false }: AnnouncementCardProps) {
  const formattedDate = new Date(announcement.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 transition-all duration-200 hover:shadow-sm animate-slide-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={categoryColors[announcement.category] || 'default'}>
              {announcement.category}
            </Badge>
            <span className="text-xs text-brand-muted">{formattedDate}</span>
          </div>
          <h3 className="text-base font-semibold text-brand-text mb-1.5">
            {announcement.title}
          </h3>
          <p className="text-sm text-brand-muted leading-relaxed line-clamp-3">
            {announcement.body}
          </p>
        </div>

        {showDelete && onDelete && (
          <button
            onClick={() => onDelete(announcement.id)}
            className="p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
