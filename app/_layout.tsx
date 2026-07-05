import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import SplashScreenComponent, { SplashContent } from '@/src/components/SplashScreen';
import { AppProvider, useApp } from '@/src/context/AppContext';
import { COLORS } from '@/src/themes/rn-tokens';

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

  if (!ready) {
    return (
      <View style={loading.root}>
        <SplashContent subtitle="Vestum lädt…" />
      </View>
    );
  }

  return <NavigationGate />;
}

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return (
      <SafeAreaProvider>
        <View style={loading.root}>
          <SplashScreenComponent onComplete={() => setSplashDone(true)} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const loading = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
});
