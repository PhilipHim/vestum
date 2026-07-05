import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Image, StyleSheet, Text, View } from 'react-native';
import { ACCENT, COLORS } from '@/src/themes/rn-tokens';
import { RoseMistGlow } from './splash-glow';

interface LoadingOverlayProps {
  message: string;
}

/** In-app loading state — mini JPH splash with Rose Mist accent. */
export default function LoadingOverlay({ message }: LoadingOverlayProps) {
  const pulse = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.85, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={s.overlay}>
      <View style={s.box}>
        <View style={s.logoWrap}>
          <RoseMistGlow size={200} />
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Image
              source={require('@/assets/jph-shark-splash.png')}
              style={s.logo}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </Animated.View>
        </View>
        <ActivityIndicator size="large" color={ACCENT.primary} />
        <Text style={s.text}>{message}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,17,17,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  box: {
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  logoWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 96,
    height: 96,
    shadowColor: ACCENT.primary,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  text: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
