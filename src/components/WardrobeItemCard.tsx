import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import type { WardrobeItem } from '@/src/types';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onDelete?: (id: string) => void;
}

export default function WardrobeItemCard({ item, onDelete }: WardrobeItemCardProps) {
  return (
    <View style={s.card}>
      <Image source={{ uri: item.imageUri }} style={s.image} />
      <View style={s.meta}>
        <Text style={s.type}>{item.type}</Text>
        <Text style={s.detail}>{item.color}</Text>
        <Text style={s.season}>{item.season}</Text>
        {item.wearCount === 0 && <Text style={s.unworn}>Never worn</Text>}
      </View>
      {onDelete && (
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={() => onDelete(item.id)}
          hitSlop={8}
          accessibilityLabel="Delete item"
        >
          <Trash2 size={16} color={COLORS.mutedDark} strokeWidth={ICON_STROKE} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ACCENT.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.cardInner,
  },
  meta: {
    padding: 10,
    gap: 2,
  },
  type: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '700',
  },
  detail: {
    color: COLORS.mutedDark,
    fontSize: 12,
  },
  season: {
    color: ACCENT.primary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  unworn: {
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(17,17,17,0.7)',
    borderRadius: 8,
    padding: 6,
  },
});
