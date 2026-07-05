import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SplashContent } from '@/src/components/SplashScreen';
import { COLORS } from '@/src/themes/rn-tokens';

interface LoadingOverlayProps {
  message: string;
}

/** In-app loading — same JPH shark as boot splash, Rose Mist accent. */
export default function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <View style={s.overlay}>
      <SplashContent subtitle={message} />
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bgDark,
    zIndex: 100,
  },
});
