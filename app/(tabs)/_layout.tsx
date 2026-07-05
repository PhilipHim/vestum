import { Tabs } from 'expo-router';
import { Home, Shirt, Sparkles, User } from 'lucide-react-native';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACCENT.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.cardDark,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
          height: 85,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={ICON_STROKE} />
          ),
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'Wardrobe',
          tabBarIcon: ({ color, size }) => (
            <Shirt size={size} color={color} strokeWidth={ICON_STROKE} />
          ),
        }}
      />
      <Tabs.Screen
        name="color-ai"
        options={{
          title: 'Color AI',
          tabBarIcon: ({ color, size }) => (
            <Sparkles size={size} color={color} strokeWidth={ICON_STROKE} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={ICON_STROKE} />
          ),
        }}
      />
    </Tabs>
  );
}
