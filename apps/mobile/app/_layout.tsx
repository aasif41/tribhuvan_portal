import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../hooks/useAuth';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user) {
      if (user.status === 'PENDING') {
        router.replace('/(auth)/pending');
      } else if (user.status === 'APPROVED') {
        if (inAuthGroup) {
          const roleRoutes: Record<string, string> = {
            STUDENT: '/(student)',
            TEACHER: '/(teacher)',
            ADMIN: '/(admin)',
          };
          router.replace(roleRoutes[user.role] || '/(auth)/login');
        }
      }
    }
  }, [user, loading, segments]);

  return (
    <>
      <StatusBar style="auto" />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
