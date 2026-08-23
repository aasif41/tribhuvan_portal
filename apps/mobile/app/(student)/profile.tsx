import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/shared/Badge';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors } from '../../constants/colors';
import { COLLEGE } from '@tribhuvan/shared';

export default function ProfileScreen() {
  const { user, setUser, signOut } = useAuth();
  const router = useRouter();
  const student = user?.student;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    program: student?.program || '',
    year: String(student?.year || ''),
    semester: String(student?.semester || ''),
    section: student?.section || '',
    hostel: student?.hostel || '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (newPassword || currentPassword || confirmPassword) {
        if (!currentPassword) { Alert.alert('Error', 'Enter your current password'); setLoading(false); return; }
        if (newPassword.length < 6) { Alert.alert('Error', 'New password must be at least 6 characters'); setLoading(false); return; }
        if (newPassword !== confirmPassword) { Alert.alert('Error', 'Passwords do not match'); setLoading(false); return; }
        await api.put('/users/change-password', { currentPassword, newPassword, confirmPassword });
      }
      const res = await api.put('/users/profile', {
        name: formData.name,
        phone: formData.phone,
        student: {
          program: formData.program,
          year: Number(formData.year),
          semester: Number(formData.semester),
          section: formData.section,
          hostel: formData.hostel,
        },
      });
      if (user) setUser({ ...user, ...res.data.data });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setIsEditing(false);
      Alert.alert('Success', newPassword ? 'Profile and password updated!' : 'Profile updated!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <PageHeader title="My Profile" subtitle="Your personal information" />
        <TouchableOpacity
          onPress={() => {
            if (isEditing) { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setIsEditing(false); }
            else setIsEditing(true);
          }}
          style={[styles.editBtn, isEditing && styles.cancelBtn]}
        >
          <Text style={[styles.editBtnText, isEditing && styles.cancelBtnText]}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Card */}
      <Card>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
          </View>
          {isEditing ? (
            <View style={styles.editNameFields}>
              <TextInput style={styles.input} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="Full Name" />
              <TextInput style={styles.input} value={formData.phone} onChangeText={(v) => setFormData({ ...formData, phone: v })} placeholder="Phone Number" keyboardType="phone-pad" />
            </View>
          ) : (
            <View style={styles.nameSection}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userPhone}>{user?.phone || 'No phone added'}</Text>
              <View style={{ marginTop: 8 }}>
                <Badge variant="success">{user?.status}</Badge>
              </View>
            </View>
          )}
        </View>
      </Card>

      {/* Academic Info Card */}
      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          {isEditing && (
            <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
              {loading ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          )}
        </View>

        <InfoRow label="Roll Number (Read-only)" value={student?.rollNo || 'N/A'} readonly />
        <InfoRow label="College" value={COLLEGE.name} readonly />

        {isEditing ? (
          <>
            <EditRow label="Program" value={formData.program} onChangeText={(v: string) => setFormData({ ...formData, program: v })} />
            <EditRow label="Year" value={formData.year} onChangeText={(v: string) => setFormData({ ...formData, year: v })} keyboardType="numeric" />
            <EditRow label="Semester" value={formData.semester} onChangeText={(v: string) => setFormData({ ...formData, semester: v })} keyboardType="numeric" />
            <EditRow label="Section" value={formData.section} onChangeText={(v: string) => setFormData({ ...formData, section: v })} />
            <EditRow label="Hostel" value={formData.hostel} onChangeText={(v: string) => setFormData({ ...formData, hostel: v })} />
          </>
        ) : (
          <>
            <InfoRow label="Program" value={student?.program || 'N/A'} />
            <InfoRow label="Year" value={String(student?.year || 'N/A')} />
            <InfoRow label="Semester" value={String(student?.semester || 'N/A')} />
            <InfoRow label="Section" value={student?.section || 'N/A'} />
            <InfoRow label="Hostel" value={student?.hostel || 'N/A'} />
          </>
        )}
      </Card>

      {/* Change Password Card */}
      {isEditing && (
        <Card>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Text style={styles.passwordHint}>Leave blank if you don't want to change your password</Text>
          <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current Password" secureTextEntry placeholderTextColor={colors.mutedText} />
          <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="New Password" secureTextEntry placeholderTextColor={colors.mutedText} />
          <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm New Password" secureTextEntry placeholderTextColor={colors.mutedText} />
        </Card>
      )}

      {/* SIGN OUT BUTTON — matches web sidebar sign out */}
      <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
        <Ionicons name="log-out-outline" size={18} color="#374151" />
        <Text style={styles.signOutText}>Sign Out</Text>
        <Text style={styles.signOutArrow}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value, readonly }: { label: string; value: string; readonly?: boolean }) {
  return (
    <View style={[infoS.row, readonly && infoS.readonly]}>
      <Text style={infoS.label}>{label}</Text>
      <Text style={infoS.value}>{value}</Text>
    </View>
  );
}

function EditRow({ label, value, onChangeText, keyboardType }: any) {
  return (
    <View style={infoS.editRow}>
      <Text style={infoS.label}>{label}</Text>
      <TextInput style={infoS.editInput} value={value} onChangeText={onChangeText} keyboardType={keyboardType || 'default'} />
    </View>
  );
}

const infoS = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  readonly: { opacity: 0.6 },
  editRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 12 },
  label: { fontSize: 12, color: colors.mutedText, flex: 1 },
  value: { fontSize: 13, fontWeight: '600', color: colors.text, textAlign: 'right', maxWidth: '55%' },
  editInput: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, color: colors.text, backgroundColor: '#fff' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  editBtn: { backgroundColor: colors.gold, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginTop: 4 },
  cancelBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#d1d5db' },
  editBtnText: { fontSize: 13, fontWeight: '700', color: colors.white },
  cancelBtnText: { color: colors.text },
  avatarSection: { alignItems: 'center', paddingVertical: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: colors.gold },
  nameSection: { alignItems: 'center', gap: 4 },
  userName: { fontSize: 20, fontWeight: '800', color: colors.text },
  userEmail: { fontSize: 13, color: colors.mutedText },
  userPhone: { fontSize: 13, color: colors.mutedText },
  editNameFields: { width: '100%', gap: 8, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  saveBtn: { backgroundColor: colors.gold, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: colors.white },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text, backgroundColor: '#fff', marginBottom: 8 },
  passwordHint: { fontSize: 12, color: colors.mutedText, marginBottom: 12, marginTop: -4 },
  // Sign Out button — matches web sidebar design
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  signOutText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.8, marginLeft: 10 },
  signOutArrow: { fontSize: 14, color: colors.mutedText },
});
