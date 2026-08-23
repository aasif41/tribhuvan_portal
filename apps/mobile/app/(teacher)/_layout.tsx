import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color }: { name: IoniconsName; color: string }) {
  return <Ionicons name={name} size={22} color={color} />;
}

export default function TeacherLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.gold,
      tabBarInactiveTintColor: colors.mutedText,
      tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
      headerStyle: { backgroundColor: colors.navy },
      headerTintColor: colors.white,
      headerTitleStyle: { fontWeight: '700' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', headerTitle: 'Tribhuvan College', tabBarIcon: ({ color }) => <TabIcon name="grid-outline" color={color} /> }} />
      <Tabs.Screen name="my-classes" options={{ title: 'Classes', tabBarIcon: ({ color }) => <TabIcon name="book-outline" color={color} /> }} />
      <Tabs.Screen name="mark-attendance" options={{ title: 'Attendance', tabBarIcon: ({ color }) => <TabIcon name="checkmark-done-outline" color={color} /> }} />
      <Tabs.Screen name="announcements" options={{ title: 'News', tabBarIcon: ({ color }) => <TabIcon name="megaphone-outline" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <TabIcon name="person-outline" color={color} /> }} />
    </Tabs>
  );
}
