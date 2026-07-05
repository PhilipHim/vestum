import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import SplashScreenComponent from '@/src/components/SplashScreen';
import { AppProvider, useApp } from '@/src/context/AppContext';
import { COLORS } from '@/src/themes/rn-tokens';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export { ErrorBoundary } from 'expo-router';

function NavigationGate() {
  const { onboarded, ready } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready || onboarded === null) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!onboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboarded && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [onboarded, ready, router, segments]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bgDark } }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

function RootContent() {
  const { ready } = useApp();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (splashDone && ready) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [splashDone, ready]);

  if (!splashDone) {
    return <SplashScreenComponent onComplete={() => setSplashDone(true)} />;
  }

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: COLORS.bgDark }} />;
  }

  return <NavigationGate />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
