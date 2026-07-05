import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { ACCENT, COLORS } from '@/src/themes/rn-tokens';

const SPLASH_DURATION_MS = 1200;
const FADE_DURATION_MS = 500;

const SHARK_IMAGE = require('@/assets/jph-shark-splash.png');

/** Soft Rose Mist bloom behind the shark — same idea as Atrium MintGlow */
export function RoseMistGlow({ size = 320 }: { size?: number }) {
  return (
    <View pointerEvents="none" style={glow.wrap}>
      <View
        style={[glow.layer, { width: size, height: size, borderRadius: size / 2, opacity: 0.14 }]}
      />
      <View
        style={[
          glow.layer,
          { width: size * 0.82, height: size * 0.82, borderRadius: size * 0.41, opacity: 0.2 },
        ]}
      />
      <View
        style={[
          glow.layer,
          { width: size * 0.64, height: size * 0.64, borderRadius: size * 0.32, opacity: 0.28 },
        ]}
      />
    </View>
  );
}

/** Shared shark + branding — used on splash and loading overlay */
export function SplashContent({ subtitle }: { subtitle?: string }) {
  return (
    <View style={s.content}>
      <RoseMistGlow />
      <Image
        source={SHARK_IMAGE}
        style={s.logo}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <Text style={s.title}>Vestum</Text>
      <Text style={s.tagline}>by JPH</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

interface SplashScreenProps {
  ready: boolean;
  onComplete?: () => void;
}

/**
 * Boot splash overlay. Data loads underneath; fade starts only after min show time AND app ready.
 */
export default function SplashScreen({ ready, onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const fading = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!minElapsed || !ready || fading.current) return;
    fading.current = true;

    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_DURATION_MS,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onComplete?.();
    });
  }, [minElapsed, ready, onComplete, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[s.overlay, { opacity }]} accessibilityElementsHidden pointerEvents="none">
      <SplashContent />
    </Animated.View>
  );
}

const glow = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
    backgroundColor: `rgba(${ACCENT.rgb}, 0.25)`,
  },
});

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: COLORS.bgDark,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 224,
    height: 224,
    zIndex: 2,
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
    zIndex: 2,
  },
  tagline: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 4.8,
    textTransform: 'uppercase',
    color: ACCENT.primary,
    opacity: 0.7,
    zIndex: 2,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mutedDark,
    zIndex: 2,
  },
});
