import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { colors } from '../../constants/colors';
import { Button } from '../../components/ui/Button';
import { COLLEGE } from '@tribhuvan/shared';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { setSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLoginSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Please provide your admin email/username and password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/admin/login', { email, password });
      const { token, user } = res.data.data;
      await setSession(token, user);
      router.replace('/(admin)');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid administrator credentials or unauthorized access.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.shieldContainer}>
              <View style={styles.shieldRing}>
                <Text style={styles.shieldIcon}>🛡️</Text>
              </View>
            </View>

            <Text style={styles.collegeName}>{COLLEGE.name.toUpperCase()}</Text>
            <Text style={styles.tagline}>ADMINISTRATOR MANAGEMENT PORTAL</Text>
            <View style={styles.goldDivider} />
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>SECURE ADMIN ACCESS</Text>
            <Text style={styles.cardSubtitle}>
              Restricted portal for authorized system administrators
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>ADMIN EMAIL / USERNAME *</Text>
              <TextInput
                style={styles.input}
                placeholder="admin@tribhuvancollege.ac.in"
                placeholderTextColor="#9a917e"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>ADMIN PASSWORD *</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#9a917e"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  <Text style={styles.eyeText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="AUTHENTICATE ADMIN"
              onPress={handleAdminLoginSubmit}
              variant="gold"
              loading={loading}
              style={{ marginTop: 14 }}
            />
          </View>

          {/* Back link */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>← RETURN TO STUDENT & FACULTY PORTAL</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  shieldContainer: {
    marginBottom: 12,
  },
  shieldRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(200, 146, 42, 0.1)',
  },
  shieldIcon: {
    fontSize: 28,
  },
  collegeName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldMuted,
    letterSpacing: 1,
    marginTop: 4,
    textAlign: 'center',
  },
  goldDivider: {
    width: 50,
    height: 2,
    backgroundColor: colors.gold,
    marginTop: 14,
    borderRadius: 1,
  },
  card: {
    width: '100%',
    backgroundColor: colors.navyCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.navyBorder,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 1,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.goldMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.creamInput,
    borderWidth: 1,
    borderColor: colors.creamBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textDark,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    paddingVertical: 6,
  },
  eyeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldMuted,
    letterSpacing: 0.5,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 201, 176, 0.25)',
  },
  backText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldMuted,
    letterSpacing: 1,
  },
});
