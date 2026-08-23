import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { colors } from '../../constants/colors';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  pendingApprovals: number;
  totalAnnouncements: number;
  recentRegistrations: Array<{ id: string; name: string; email: string; role: string; status: string; createdAt: string }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    api.get('/users/stats').then((r) => { setStats(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDownloadCSV = async () => {
    try {
      setDownloading(true);
      const res = await api.get('/audit/export', { responseType: 'text' });
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Tribhuvan_Audit_${dateStr}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, res.data, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Save Audit CSV' });
      } else {
        Alert.alert('Downloaded', `Saved as ${fileName}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to download audit CSV file.');
    } finally {
      setDownloading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/login' as any); } },
    ]);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.gold} /></View>;

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: 'school-outline' as const, bg: '#dbeafe', color: '#2563eb' },
    { label: 'Total Teachers', value: stats?.totalTeachers || 0, icon: 'people-outline' as const, bg: '#dcfce7', color: '#16a34a' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: 'time-outline' as const, bg: '#fef3c7', color: '#d97706' },
    { label: 'Announcements', value: stats?.totalAnnouncements || 0, icon: 'megaphone-outline' as const, bg: '#f3e8ff', color: '#9333ea' },
  ];

  const statusStyle = (status: string) => {
    if (status === 'APPROVED') return { bg: '#dcfce7', text: '#15803d' };
    if (status === 'PENDING') return { bg: '#fef3c7', text: '#b45309' };
    return { bg: '#fee2e2', text: '#dc2626' };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header row with Download CSV button — matches web */}
      <View style={styles.topRow}>
        <PageHeader title="Admin Dashboard" subtitle="Manage Tribhuvan College Portal" />
        <TouchableOpacity
          onPress={handleDownloadCSV}
          disabled={downloading}
          style={[styles.csvBtn, downloading && styles.csvBtnDisabled]}
        >
          {downloading
            ? <ActivityIndicator size="small" color={colors.navy} />
            : <Ionicons name="download-outline" size={14} color={colors.navy} />}
          <Text style={styles.csvBtnText}>{downloading ? 'Exporting...' : 'Download CSV'}</Text>
        </TouchableOpacity>
      </View>

      {/* 4 stat cards — 2×2 grid matching web */}
      <View style={styles.statsGrid}>
        {statCards.map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <View style={styles.statCardInner}>
              <View style={[styles.iconCircle, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={24} color={s.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Two cards side by side — Recent Registrations + Quick Management */}
      <Card>
        <Text style={styles.sectionTitle}>Recent Registrations</Text>
        {(stats?.recentRegistrations || []).length === 0 ? (
          <Text style={styles.emptyText}>No recent registrations</Text>
        ) : (
          (stats?.recentRegistrations || []).map((r) => {
            const sc = statusStyle(r.status);
            return (
              <View key={r.id} style={styles.regRow}>
                <View style={styles.regLeft}>
                  <Text style={styles.regName}>{r.name}</Text>
                  <Text style={styles.regEmail}>{r.email}</Text>
                </View>
                <View style={styles.regBadges}>
                  <View style={styles.roleBadge}><Text style={styles.roleText}>{r.role}</Text></View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}><Text style={[styles.statusText, { color: sc.text }]}>{r.status}</Text></View>
                </View>
              </View>
            );
          })
        )}
      </Card>

      {/* Quick Management & Audits — matches web grid */}
      <Card>
        <Text style={styles.sectionTitle}>Quick Management & Audits</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity
            onPress={handleDownloadCSV}
            disabled={downloading}
            style={styles.quickBtn}
          >
            <View style={[styles.quickIcon, { backgroundColor: '#fff' }]}>
              <Ionicons name="download-outline" size={22} color={downloading ? colors.mutedText : colors.navy} />
            </View>
            <Text style={styles.quickLabel}>Download Audit CSV</Text>
            <Text style={styles.quickSub}>Export system audit logs & records</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(admin)/approvals' as any)}
            style={styles.quickBtn}
          >
            <View style={[styles.quickIcon, { backgroundColor: '#fff' }]}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#2563eb" />
            </View>
            <Text style={styles.quickLabel}>Pending Approvals</Text>
            <Text style={styles.quickSub}>{stats?.pendingApprovals || 0} users waiting</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* SIGN OUT */}
      <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
        <Ionicons name="log-out-outline" size={18} color="#374151" />
        <Text style={styles.signOutText}>Sign Out</Text>
        <Text style={styles.signOutArrow}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  csvBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.gold, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 4 },
  csvBtnDisabled: { opacity: 0.6 },
  csvBtnText: { fontSize: 12, fontWeight: '700', color: colors.navy },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  statCard: { width: '47%', marginBottom: 0 },
  statCardInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statLabel: { fontSize: 11, color: colors.mutedText },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  emptyText: { color: colors.mutedText, fontSize: 13, textAlign: 'center', paddingVertical: 16 },
  regRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, backgroundColor: '#f8fafc', borderRadius: 8, paddingHorizontal: 12, marginBottom: 6 },
  regLeft: { flex: 1 },
  regName: { fontSize: 13, fontWeight: '600', color: colors.text },
  regEmail: { fontSize: 11, color: colors.mutedText, marginTop: 1 },
  regBadges: { flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  roleBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  roleText: { fontSize: 10, fontWeight: '700', color: '#1d4ed8', textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  statusText: { fontSize: 10, fontWeight: '700' },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickBtn: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: '#f8fafc', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, borderStyle: 'dashed' },
  quickIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  quickLabel: { fontSize: 12, fontWeight: '700', color: colors.navy, textAlign: 'center' },
  quickSub: { fontSize: 10, color: colors.mutedText, marginTop: 4, textAlign: 'center' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  signOutText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.8, marginLeft: 10 },
  signOutArrow: { fontSize: 14, color: colors.mutedText },
});
