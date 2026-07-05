import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ACCENT, COLORS } from '@/src/themes/rn-tokens';

interface LoadingOverlayProps {
  message: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <View style={s.overlay}>
      <View style={s.box}>
        <ActivityIndicator size="large" color={ACCENT.primary} />
        <Text style={s.text}>{message}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,17,17,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  box: {
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  text: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
});
