import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ACCENT, COLORS } from '@/src/themes/rn-tokens';

interface PremiumCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Premium card with Rose Mist gradient border accent and dark inner surface.
 */
export default function PremiumCard({ children, style }: PremiumCardProps) {
  return (
    <View style={[s.outer, style]}>
      <View style={s.glowTop} pointerEvents="none" />
      <View style={s.inner}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  outer: {
    borderRadius: 16,
    padding: 1,
    backgroundColor: ACCENT.border,
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -40,
    left: '20%',
    right: '20%',
    height: 80,
    borderRadius: 40,
    backgroundColor: `rgba(${ACCENT.rgb}, 0.15)`,
    zIndex: 0,
  },
  inner: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 15,
    padding: 16,
    overflow: 'hidden',
  },
});
