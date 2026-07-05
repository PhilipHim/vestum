import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text } from 'react-native';
import { ACCENT, COLORS } from '@/src/themes/rn-tokens';
import { RoseMistGlow } from './splash-glow';

const SPLASH_SHOW_MS = 1200;
const SPLASH_EXIT_MS = 500;

interface SplashScreenProps {
  onComplete?: () => void;
}

/**
 * Atrium/Geminus-style boot splash — dark surface, soft Rose Mist glow, JPH shark logo.
 * Shows 1.2s, fades 0.5s, then unlocks the app.
 */
export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: SPLASH_EXIT_MS,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        onComplete?.();
      });
    }, SPLASH_SHOW_MS);

    return () => clearTimeout(fadeTimer);
  }, [onComplete, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[s.root, { opacity }]} accessibilityElementsHidden pointerEvents="none">
      <RoseMistGlow />
      <Image
        source={require('@/assets/jph-shark-splash.png')}
        style={s.logo}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <Text style={s.title}>Vestum</Text>
      <Text style={s.tagline}>by JPH</Text>
    </Animated.View>
  );
}

export { RoseMistGlow } from './splash-glow';

const s = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgDark,
  },
  logo: {
    width: 224,
    height: 224,
    shadowColor: ACCENT.primary,
    shadowOpacity: 0.35,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORS.textDark,
  },
  tagline: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 4.8,
    textTransform: 'uppercase',
    color: ACCENT.primary,
    opacity: 0.7,
  },
});
