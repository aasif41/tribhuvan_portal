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

    const timer = setTimeout(() => {
      try {
        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
          router.replace('/(auth)/login' as any);
        } else if (user) {
          if (user.status === 'PENDING') {
            if ((segments as string[])[1] !== 'pending') {
              router.replace('/(auth)/pending' as any);
            }
          } else if (user.status === 'APPROVED') {
            if (inAuthGroup) {
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
    }, 10);

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
