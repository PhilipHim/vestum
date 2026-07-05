import '../global.css';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import SplashScreenComponent from '@/src/components/SplashScreen';
import { ToastProvider } from '@/src/components/Toast';
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
      <Stack.Screen name="season-change" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="wardrobe/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="outfit/[date]" options={{ animation: 'slide_from_right' }} />
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
      <ToastProvider>
        <AppProvider>
          <RootContent />
        </AppProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const loading = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
});
