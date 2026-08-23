import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color }: { name: IoniconsName; color: string }) {
  return <Ionicons name={name} size={22} color={color} />;
}

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.gold,
      tabBarInactiveTintColor: colors.mutedText,
      tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
      headerStyle: { backgroundColor: colors.navy },
      headerTintColor: colors.white,
      headerTitleStyle: { fontWeight: '700' },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerTitle: 'Admin Panel — Tribhuvan College',
          tabBarIcon: ({ color }) => <TabIcon name="shield-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Approvals',
          tabBarIcon: ({ color }) => <TabIcon name="person-add-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
