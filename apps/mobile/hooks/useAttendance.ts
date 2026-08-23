import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { AttendanceSummary } from '@tribhuvan/shared';

export function useAttendance() {
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/students/attendance');
      setAttendance(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return { attendance, loading, error, refetch: fetchAttendance };
}
