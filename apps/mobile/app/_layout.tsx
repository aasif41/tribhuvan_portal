// Polyfill DOMException for React Native / Hermes runtime compatibility
if (typeof globalThis.DOMException === 'undefined') {
  class DOMExceptionPolyfill extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name || 'DOMException';
    }
  }
  (globalThis as any).DOMException = DOMExceptionPolyfill;
}

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
      router.replace('/(auth)/login' as any);
    } else if (user) {
      if (user.status === 'PENDING') {
        if (segments[1] !== 'pending') {
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
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
