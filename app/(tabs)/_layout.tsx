import { Redirect, Tabs } from 'expo-router';
import { Calendar, Home, Shirt, Sparkles, User } from 'lucide-react-native';
import { useApp } from '@/src/context/AppContext';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

export default function TabLayout() {
  const { onboarded, t } = useApp();

  if (onboarded === false) {
    return <Redirect href="/onboarding" />;
  }

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
          title: t('tabHome'),
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={ICON_STROKE} />
          ),
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: t('tabWardrobe'),
          tabBarIcon: ({ color, size }) => (
            <Shirt size={size} color={color} strokeWidth={ICON_STROKE} />
          ),
        }}
      />
      <Tabs.Screen
        name="color-ai"
        options={{
          title: t('tabColorAi'),
          tabBarIcon: ({ color, size }) => (
            <Sparkles size={size} color={color} strokeWidth={ICON_STROKE} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tabCalendar'),
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} strokeWidth={ICON_STROKE} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabProfile'),
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={ICON_STROKE} />
          ),
        }}
      />
    </Tabs>
  );
}
