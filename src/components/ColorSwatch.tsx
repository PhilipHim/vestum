import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/src/themes/rn-tokens';

interface ColorSwatchProps {
  colors: string[];
  label?: string;
  size?: number;
}

export default function ColorSwatch({ colors, label, size = 40 }: ColorSwatchProps) {
  return (
    <View style={s.wrap}>
      {label && <Text style={s.label}>{label}</Text>}
      <View style={s.row}>
        {colors.map((hex) => (
          <View key={hex} style={[s.swatch, { backgroundColor: hex, width: size, height: size }]}>
            <Text style={s.hex}>{hex.toUpperCase()}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    color: COLORS.mutedDark,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  hex: {
    fontSize: 8,
    fontWeight: '600',
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
