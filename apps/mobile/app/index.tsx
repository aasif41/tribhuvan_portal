import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (!user) return <Redirect href={"/(auth)/login" as any} />;
  if (user.status === 'PENDING') return <Redirect href={"/(auth)/pending" as any} />;

  const routes: Record<string, string> = { STUDENT: '/(student)', TEACHER: '/(teacher)', ADMIN: '/(admin)' };
  return <Redirect href={(routes[user.role] || '/(auth)/login') as any} />;
}


