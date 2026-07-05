import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ACCENT, COLORS } from '@/src/themes/rn-tokens';

interface StyleScoreRingProps {
  score: number;
  tip?: string;
  label?: string;
}

export default function StyleScoreRing({ score, tip, label }: StyleScoreRingProps) {
  const size = 120;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <View style={s.wrap}>
      <View style={s.ringWrap}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.border}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ACCENT.primary}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={s.scoreCenter}>
          <Text style={s.score}>{score}</Text>
        </View>
      </View>
      <Text style={s.label}>{label ?? 'Style Score'}</Text>
      {tip ? <Text style={s.tip}>{tip}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 8,
  },
  ringWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 32,
    fontWeight: '700',
    color: ACCENT.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 4,
  },
  tip: {
    fontSize: 13,
    color: COLORS.mutedDark,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
