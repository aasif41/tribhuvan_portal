import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.gold, tabBarInactiveTintColor: colors.mutedText, tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border }, headerStyle: { backgroundColor: colors.navy }, headerTintColor: colors.white, headerTitleStyle: { fontWeight: '700' } }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', headerTitle: 'Admin Panel' }} />
      <Tabs.Screen name="approvals" options={{ title: 'Approvals' }} />
    </Tabs>
  );
}
