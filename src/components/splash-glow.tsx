import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ACCENT } from '@/src/themes/rn-tokens';

/** Soft Rose Mist bloom behind the shark */
export function RoseMistGlow({ size = 320 }: { size?: number }) {
  return (
    <View pointerEvents="none" style={glow.wrap}>
      <View
        style={[
          glow.layer,
          { width: size, height: size, borderRadius: size / 2, opacity: 0.14 },
        ]}
      />
      <View
        style={[
          glow.layer,
          {
            width: size * 0.82,
            height: size * 0.82,
            borderRadius: size * 0.41,
            opacity: 0.2,
          },
        ]}
      />
      <View
        style={[
          glow.layer,
          {
            width: size * 0.64,
            height: size * 0.64,
            borderRadius: size * 0.32,
            opacity: 0.28,
          },
        ]}
      />
    </View>
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
