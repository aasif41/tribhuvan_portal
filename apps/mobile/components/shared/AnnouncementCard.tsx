import { View, Text, StyleSheet } from 'react-native';
import { Badge } from './Badge';
import type { Announcement } from '@tribhuvan/shared';
import { colors } from '../../constants/colors';

interface AnnouncementCardProps {
  announcement: Announcement;
}

const categoryVariant: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  general:   'default',
  academic:  'info',
  exam:      'warning',
  event:     'success',
  placement: 'info',
  hostel:    'default',
  urgent:    'error',
};

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const formattedDate = new Date(announcement.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Badge variant={categoryVariant[announcement.category] || 'default'}>
          {announcement.category}
        </Badge>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <Text style={styles.title}>{announcement.title}</Text>
      <Text style={styles.body} numberOfLines={3}>{announcement.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 16,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  date: {
    fontSize: 11,
    color: colors.mutedText,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  body: {
    fontSize: 13,
    color: colors.mutedText,
    lineHeight: 20,
  },
});
