import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

interface FeedbackStarsProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export default function FeedbackStars({ value, onChange, max = 5 }: FeedbackStarsProps) {
  return (
    <View style={s.row}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= value;
        return (
          <TouchableOpacity
            key={starValue}
            onPress={() => onChange(starValue)}
            activeOpacity={0.7}
            hitSlop={6}
            accessibilityLabel={`Rate ${starValue} stars`}
          >
            <Star
              size={32}
              color={filled ? ACCENT.primary : COLORS.border}
              fill={filled ? ACCENT.primary : 'transparent'}
              strokeWidth={ICON_STROKE}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
});
