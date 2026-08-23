import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/shared/Badge';
import api from '../../services/api';
import { colors } from '../../constants/colors';

interface PendingUser {
  id: string; name: string; email: string; role: string; createdAt: string;
  student: { rollNo: string; program: string } | null;
  teacher: { employeeId: string; department: string } | null;
}

export default function ApprovalsScreen() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchPending = () => {
    setLoading(true);
    api.get('/users/pending')
      .then((r) => { setUsers(r.data.data || []); setLoading(false); })
      .catch(() => { setUsers([]); setLoading(false); });
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    Alert.alert(
      action === 'approve' ? 'Approve User' : 'Reject User',
      `Are you sure you want to ${action} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approve' ? 'Approve' : 'Reject',
          style: action === 'reject' ? 'destructive' : 'default',
          onPress: async () => {
            setActionLoading((prev) => ({ ...prev, [userId]: true }));
            try {
              await api.patch(`/users/${userId}/${action}`);
              fetchPending();
            } catch {
              Alert.alert('Error', `Failed to ${action} user. Please try again.`);
            } finally {
              setActionLoading((prev) => ({ ...prev, [userId]: false }));
            }
          },
        },
      ]
    );
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.gold} /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PageHeader title="Pending Approvals" subtitle={`${users.length} user${users.length !== 1 ? 's' : ''} awaiting approval`} />

      {users.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="sparkles" size={40} color={colors.gold} style={{ alignSelf: 'center' }} />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>No pending approvals at this time</Text>
        </Card>
      ) : (
        users.map((u) => (
          <Card key={u.id} style={styles.userCard}>
            {/* User Header */}
            <View style={styles.userHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{u.name.charAt(0)}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
                <Text style={styles.userDate}>Registered: {formatDate(u.createdAt)}</Text>
              </View>
            </View>

            {/* Badges */}
            <View style={styles.badgeRow}>
              <Badge variant="info">{u.role}</Badge>
              {u.student && (
                <Text style={styles.detailText}>{u.student.program} • {u.student.rollNo}</Text>
              )}
              {u.teacher && (
                <Text style={styles.detailText}>{u.teacher.department} • {u.teacher.employeeId}</Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleAction(u.id, 'approve')}
                disabled={actionLoading[u.id]}
              >
                {actionLoading[u.id] ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleAction(u.id, 'reject')}
                disabled={actionLoading[u.id]}
              >
                <Ionicons name="close-circle-outline" size={16} color="#dc2626" />
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  emptyCard: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.navy, marginTop: 14 },
  emptySubtitle: { fontSize: 14, color: colors.mutedText, marginTop: 6, textAlign: 'center' },
  userCard: { marginBottom: 12 },
  userHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: colors.gold },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: colors.text },
  userEmail: { fontSize: 12, color: colors.mutedText, marginTop: 2 },
  userDate: { fontSize: 11, color: colors.mutedText, marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  detailText: { fontSize: 12, color: colors.mutedText },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  approveBtn: { backgroundColor: colors.gold },
  approveBtnText: { fontSize: 14, fontWeight: '700', color: colors.white },
  rejectBtn: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
  rejectBtnText: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
});
