import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ErrorBoundary } from '../components/ErrorBoundary';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    if (!segments || (segments as any[]).length === 0) return;

    const timer = setTimeout(() => {
      try {
        const currentSegment = segments[0];
        const inAuthGroup = currentSegment === '(auth)';

        if (!user && !inAuthGroup) {
          router.replace('/(auth)/login' as any);
        } else if (user) {
          if (user.status === 'PENDING') {
            if ((segments as string[])[1] !== 'pending') {
              router.replace('/(auth)/pending' as any);
            }
          } else if (user.status === 'APPROVED') {
            if (inAuthGroup || !currentSegment) {
              const roleRoutes: Record<string, string> = {
                STUDENT: '/(student)',
                TEACHER: '/(teacher)',
                ADMIN: '/(admin)',
              };
              router.replace((roleRoutes[user.role] || '/(auth)/login') as any);
            }
          }
        }
      } catch (e) {
        console.error('Initial navigation error:', e);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [user, loading, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ErrorBoundary>
  );
}
