import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';

export default function TeacherLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.gold, tabBarInactiveTintColor: colors.mutedText, tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border }, headerStyle: { backgroundColor: colors.navy }, headerTintColor: colors.white, headerTitleStyle: { fontWeight: '700' } }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', headerTitle: 'Tribhuvan College' }} />
      <Tabs.Screen name="my-classes" options={{ title: 'Classes' }} />
      <Tabs.Screen name="mark-attendance" options={{ title: 'Attendance' }} />
    </Tabs>
  );
}
