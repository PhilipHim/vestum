import '../global.css';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import SplashScreenComponent from '@/src/components/SplashScreen';
import { AppProvider, useApp } from '@/src/context/AppContext';
import { COLORS } from '@/src/themes/rn-tokens';

export { ErrorBoundary } from 'expo-router';

function NavigationGate() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: COLORS.bgDark },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

function RootContent() {
  const { ready } = useApp();
  const [splashGone, setSplashGone] = useState(false);

  return (
    <View style={loading.root}>
      {ready && <NavigationGate />}
      {!splashGone && (
        <SplashScreenComponent ready={ready} onComplete={() => setSplashGone(true)} />
      )}
    </View>
  );
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

const loading = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
});
