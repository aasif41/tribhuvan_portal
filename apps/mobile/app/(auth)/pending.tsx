import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/colors';
import { Button } from '../../components/ui/Button';
import { COLLEGE } from '@tribhuvan/shared';

export default function PendingScreen() {
  const router = useRouter();
  const { user, refreshUser, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage(null);
    try {
      await refreshUser();
      setMessage('Status checked. If your account is approved, you will be redirected automatically.');
    } catch {
      setMessage('Unable to verify approval status. Please check your internet connection.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <View style={styles.iconRing}>
              <Ionicons name="time-outline" size={34} color={colors.gold} />
            </View>
          </View>

          <Text style={styles.collegeTag}>{COLLEGE.name.toUpperCase()}</Text>
          <Text style={styles.title}>FACULTY APPROVAL PENDING</Text>

          <View style={styles.divider} />

          <Text style={styles.description}>
            Your teacher account application for{' '}
            <Text style={styles.highlight}>{user?.email || 'your account'}</Text> has been received
            and is currently awaiting administrator review.
          </Text>

          <Text style={styles.subtext}>
            Once approved by the college administration, full access to the faculty portal will be
            unlocked automatically.
          </Text>

          {message ? (
            <View style={styles.msgBox}>
              <Text style={styles.msgText}>{message}</Text>
            </View>
          ) : null}

          <Button
            title="CHECK APPROVAL STATUS"
            onPress={handleCheckStatus}
            variant="gold"
            loading={checking}
            style={{ width: '100%', marginTop: 20 }}
          />

          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
            <Text style={styles.signOutText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.navyDark,
  },
  container: {
    flex: 1,
    backgroundColor: colors.navyDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: colors.navyCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.navyBorder,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: 'rgba(200, 146, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collegeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.goldMuted,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: colors.gold,
    marginVertical: 14,
    borderRadius: 1,
  },
  description: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  highlight: {
    color: colors.gold,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'center',
    lineHeight: 18,
  },
  msgBox: {
    backgroundColor: 'rgba(200, 146, 42, 0.15)',
    borderWidth: 1,
    borderColor: colors.goldMuted,
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
    width: '100%',
  },
  msgText: {
    color: colors.goldLight,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  signOutBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
    letterSpacing: 1,
  },
});
