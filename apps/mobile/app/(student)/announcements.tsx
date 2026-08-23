import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PageHeader } from '../../components/shared/PageHeader';
import { AnnouncementCard } from '../../components/shared/AnnouncementCard';
import api from '../../services/api';
import { colors } from '../../constants/colors';
import type { Announcement, AnnouncementCategory, AnnouncementListResponse } from '@tribhuvan/shared';
import { ANNOUNCEMENT_CATEGORIES } from '@tribhuvan/shared';

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AnnouncementCategory | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: page.toString(), limit: '10' });
        if (filter !== 'all') params.append('category', filter);
        const res = await api.get(`/announcements?${params}`);
        const data: AnnouncementListResponse = res.data.data;
        setAnnouncements(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (e) {
        console.error('Announcements fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filter, page]);

  const allFilters: Array<'all' | AnnouncementCategory> = ['all', ...ANNOUNCEMENT_CATEGORIES];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PageHeader title="Announcements" subtitle="Stay updated with college news" />

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {allFilters.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => { setFilter(cat); setPage(1); }}
            style={[styles.filterChip, filter === cat && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={colors.gold} style={{ marginTop: 32 }} />
      ) : (
        <>
          {announcements.length === 0 ? (
            <Text style={styles.empty}>No announcements found</Text>
          ) : (
            announcements.map((ann) => (
              <AnnouncementCard key={ann.id} announcement={ann} />
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                disabled={page === 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
              >
                <Text style={styles.pageBtnText}>← Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
              <TouchableOpacity
                disabled={page === totalPages}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
              >
                <Text style={styles.pageBtnText}>Next →</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  filterRow: { marginBottom: 14 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, backgroundColor: colors.white, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.mutedText },
  filterTextActive: { color: colors.white },
  empty: { textAlign: 'center', color: colors.mutedText, paddingVertical: 32, fontSize: 14 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 16 },
  pageBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: '#e5e7eb' },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  pageInfo: { fontSize: 13, color: colors.mutedText, fontWeight: '600' },
});
