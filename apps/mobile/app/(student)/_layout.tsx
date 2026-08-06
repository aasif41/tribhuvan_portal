import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';

export default function StudentLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.gold, tabBarInactiveTintColor: colors.mutedText, tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border }, headerStyle: { backgroundColor: colors.navy }, headerTintColor: colors.white, headerTitleStyle: { fontWeight: '700' } }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: () => null, headerTitle: 'Tribhuvan College' }} />
      <Tabs.Screen name="timetable" options={{ title: 'Timetable', tabBarIcon: () => null }} />
      <Tabs.Screen name="attendance" options={{ title: 'Attendance', tabBarIcon: () => null }} />
      <Tabs.Screen name="announcements" options={{ title: 'News', tabBarIcon: () => null }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: () => null }} />
    </Tabs>
  );
}
