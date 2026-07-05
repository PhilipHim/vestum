import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useApp } from '@/src/context/AppContext';
import { COLORS } from '@/src/themes/rn-tokens';

/** Entry route — sends users to onboarding or tabs without stack animation. */
export default function Index() {
  const { onboarded, ready } = useApp();

  if (!ready || onboarded === null) {
    return <View style={{ flex: 1, backgroundColor: COLORS.bgDark }} />;
  }

  if (!onboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
