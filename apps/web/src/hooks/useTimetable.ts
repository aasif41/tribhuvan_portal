import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { TimetableSlot } from '@tribhuvan/shared';

export function useTimetable() {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/students/timetable');
      setTimetable(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  return { timetable, loading, error, refetch: fetchTimetable };
}
