import { useState, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAttendance } from '../../hooks/useAttendance';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { AttendanceBar } from '../../components/shared/AttendanceBar';
import { Badge } from '../../components/shared/Badge';
import { colors } from '../../constants/colors';

export default function AttendanceScreen() {
  const { attendance, loading } = useAttendance();
  const [activeTab, setActiveTab] = useState<'summary' | 'history'>('summary');

  const overallAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length) : 0;

  const allRecords = useMemo(() =>
    attendance
      .flatMap((s) => (s.records || []).map((r) => ({
        ...r, subjectName: s.subjectName, subjectCode: s.subjectCode,
      })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [attendance]
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const getVariant = (status: string): 'success' | 'warning' | 'error' => {
    if (status === 'PRESENT') return 'success';
    if (status === 'LATE') return 'warning';
    return 'error';
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.gold} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PageHeader title="Attendance" subtitle="Track your attendance across all subjects" />

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Overall</Text>
          <Text style={[styles.statValue, { color: overallAttendance >= 75 ? colors.success : colors.error }]}>
            {overallAttendance}%
          </Text>
          <AttendanceBar percentage={overallAttendance} />
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Below 75%</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>
            {attendance.filter((a) => a.percentage < 75).length}
          </Text>
          <Text style={styles.statSub}>subjects at risk</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Total Attended</Text>
          <Text style={styles.statValue}>
            {attendance.reduce((s, a) => s + a.present + a.late, 0)}
          </Text>
          <Text style={styles.statSub}>of {attendance.reduce((s, a) => s + a.totalClasses, 0)} classes</Text>
        </Card>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'summary' && styles.tabActive]}
          onPress={() => setActiveTab('summary')}
        >
          <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>Subject Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Daily History</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <Card>
          <CardHeader title="Subject-wise Attendance" />
          {attendance.length === 0 ? (
            <Text style={styles.empty}>No attendance records yet</Text>
          ) : (
            attendance.map((att) => (
              <View key={att.subjectId} style={styles.subjectRow}>
                <View style={styles.subjectHeader}>
                  <View>
                    <Text style={styles.subjectName}>{att.subjectName}</Text>
                    <Text style={styles.subjectCode}>{att.subjectCode}</Text>
                  </View>
                  <Badge variant={att.percentage >= 75 ? 'success' : att.percentage >= 60 ? 'warning' : 'error'}>
                    {att.percentage}%
                  </Badge>
                </View>
                <AttendanceBar percentage={att.percentage} />
                <View style={styles.subjectStats}>
                  <Text style={styles.statChip}>Present: {att.present}</Text>
                  <Text style={styles.statChip}>Late: {att.late}</Text>
                  <Text style={styles.statChip}>Absent: {att.absent}</Text>
                  <Text style={styles.statChip}>Total: {att.totalClasses}</Text>
                </View>
              </View>
            ))
          )}
        </Card>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader title="Daily Attendance History" subtitle="Day-to-day class attendance records" />
          {allRecords.length === 0 ? (
            <Text style={styles.empty}>No records found</Text>
          ) : (
            allRecords.map((record) => (
              <View key={record.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyDate}>{formatDate(record.date)}</Text>
                  <Text style={styles.historySubject}>{record.subjectName}</Text>
                  <Text style={styles.historyCode}>{record.subjectCode}</Text>
                </View>
                <Badge variant={getVariant(record.status)}>{record.status}</Badge>
              </View>
            ))
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: '30%', marginBottom: 0 },
  statLabel: { fontSize: 11, color: colors.mutedText, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  statSub: { fontSize: 10, color: colors.mutedText },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.gold },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.mutedText },
  tabTextActive: { color: colors.text },
  subjectRow: { paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  subjectName: { fontSize: 14, fontWeight: '600', color: colors.text },
  subjectCode: { fontSize: 11, color: colors.mutedText },
  subjectStats: { flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  statChip: { fontSize: 11, color: colors.mutedText },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  historyLeft: { flex: 1 },
  historyDate: { fontSize: 11, color: colors.mutedText, marginBottom: 2 },
  historySubject: { fontSize: 14, fontWeight: '600', color: colors.text },
  historyCode: { fontSize: 11, color: colors.mutedText },
  empty: { textAlign: 'center', color: colors.mutedText, paddingVertical: 24, fontSize: 13 },
});
