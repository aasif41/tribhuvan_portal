import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { COLLEGE } from '@tribhuvan/shared';

export default function LoginScreen() {
  const handleGoogleSignIn = () => {
    // Firebase Auth Google sign-in will be configured with actual Firebase credentials
    console.log('Google Sign-In triggered');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}><Text style={styles.logoText}>T</Text></View>
        <Text style={styles.title}>{COLLEGE.name}</Text>
        <Text style={styles.subtitle}>{COLLEGE.location}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome to the Portal</Text>
        <Text style={styles.cardSubtitle}>Sign in with your college Google account</Text>
        <Button title="Sign in with Google" onPress={handleGoogleSignIn} variant="gold" />
        <Text style={styles.domainNote}>Only @{COLLEGE.domain} accounts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(200,146,42,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { fontSize: 40, fontWeight: '800', color: colors.gold },
  title: { fontSize: 28, fontWeight: '800', color: colors.white },
  subtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  card: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: colors.white, textAlign: 'center', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 24 },
  domainNote: { fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 20 },
});
