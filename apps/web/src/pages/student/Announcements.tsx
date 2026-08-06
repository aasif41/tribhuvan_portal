import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { AnnouncementCard } from '../../components/shared/AnnouncementCard';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';
import type { Announcement, AnnouncementCategory, AnnouncementListResponse } from '@tribhuvan/shared';
import { ANNOUNCEMENT_CATEGORIES } from '@tribhuvan/shared';

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AnnouncementCategory | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: page.toString(), limit: '10' });
        if (filter !== 'all') params.append('category', filter);
        const response = await api.get(`/announcements?${params}`);
        const data: AnnouncementListResponse = response.data.data;
        setAnnouncements(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [filter, page]);

  return (
    <div className="space-y-6">
      <PageHeader title="Announcements" subtitle="Stay updated with college news" />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setFilter('all'); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filter === 'all' ? 'bg-navy text-white' : 'bg-white text-brand-muted hover:bg-gray-50'
          }`}
        >
          All
        </button>
        {ANNOUNCEMENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setFilter(cat); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
              filter === cat ? 'bg-navy text-white' : 'bg-white text-brand-muted hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements list */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <AnnouncementCard key={ann.id} announcement={ann} />
          ))}
          {announcements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-brand-muted">No announcements found</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg bg-white border border-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <Badge>{page} / {totalPages}</Badge>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg bg-white border border-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
