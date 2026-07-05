import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { ACCENT, COLORS } from '@/src/themes/rn-tokens';
import { RoseMistGlow } from './splash-glow';

const SPLASH_SHOW_MS = 1200;
const SPLASH_EXIT_MS = 500;

const SHARK_GLOW = `rgba(${ACCENT.rgb}, 0.35)`;

function SplashContent() {
  return (
    <>
      <RoseMistGlow />
      <View style={s.sharkWrap}>
        <Image
          source={require('@/assets/jph-shark.png')}
          style={s.shark}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <View style={s.sharkTint} />
      </View>
      <Text style={s.title}>Vestum</Text>
      <Text style={s.tagline}>by JPH</Text>
    </>
  );
}

interface SplashScreenProps {
  onComplete?: () => void;
}

/**
 * JPH boot splash — dark surface, soft Rose Mist glow, tinted shark.
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
      <SplashContent />
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
  sharkWrap: {
    width: 224,
    height: 224,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shark: {
    width: 224,
    height: 224,
    shadowColor: SHARK_GLOW,
    shadowOpacity: 1,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 0 },
  },
  sharkTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `rgba(${ACCENT.rgb}, 0.42)`,
    mixBlendMode: 'color',
    borderRadius: 8,
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.4,
    color: COLORS.textDark,
  },
  tagline: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: ACCENT.primary,
    opacity: 0.7,
  },
});
