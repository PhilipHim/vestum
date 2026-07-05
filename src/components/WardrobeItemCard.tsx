import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Tag, Trash2 } from 'lucide-react-native';
import { useApp } from '@/src/context/AppContext';
import type { WardrobeItem } from '@/src/types';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onLongPress?: (item: WardrobeItem) => void;
  onPress?: (item: WardrobeItem) => void;
}

export default function WardrobeItemCard({ item, onLongPress, onPress }: WardrobeItemCardProps) {
  const router = useRouter();
  const { t } = useApp();

  return (
    <Pressable
      style={s.card}
      onPress={() => (onPress ? onPress(item) : router.push(`/wardrobe/${item.id}` as Href))}
      onLongPress={() => onLongPress?.(item)}
      delayLongPress={400}
    >
      <Image source={{ uri: item.imageUri }} style={s.image} />
      {item.forSale && (
        <View style={s.saleBadge}>
          <Tag size={12} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
        </View>
      )}
      <View style={s.meta}>
        <Text style={s.type}>{item.type}</Text>
        <Text style={s.detail}>{item.color}</Text>
        <Text style={s.season}>{item.season}</Text>
        {item.wearCount === 0 && <Text style={s.unworn}>{t('wardrobeNeverWornLabel')}</Text>}
      </View>
    </Pressable>
  );
}

export function WardrobeDeleteButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={s.deleteBtn} onPress={onPress} hitSlop={8}>
      <Trash2 size={16} color={COLORS.mutedDark} strokeWidth={ICON_STROKE} />
    </Pressable>
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
  image: { width: '100%', height: 120, backgroundColor: COLORS.cardInner },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(17,17,17,0.85)',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: ACCENT.border,
  },
  meta: { padding: 10, gap: 2 },
  type: { color: COLORS.textDark, fontSize: 14, fontWeight: '700' },
  detail: { color: COLORS.mutedDark, fontSize: 12 },
  season: { color: ACCENT.primary, fontSize: 11, fontWeight: '600', marginTop: 2 },
  unworn: { color: COLORS.warning, fontSize: 10, fontWeight: '600', marginTop: 4 },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(17,17,17,0.7)',
    borderRadius: 8,
    padding: 6,
  },
});
