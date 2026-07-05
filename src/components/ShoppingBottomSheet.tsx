import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useApp } from '@/src/context/AppContext';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

interface ShopOption {
  label: string;
  url: string;
}

interface ShoppingBottomSheetProps {
  visible: boolean;
  itemName: string;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function buildShoppingOptions(itemName: string): ShopOption[] {
  const q = encodeURIComponent(itemName);
  return [
    { label: 'Zalando', url: `https://www.zalando.de/suche/?q=${q}` },
    { label: 'H&M', url: `https://www2.hm.com/de_de/search-results.html?q=${q}` },
    { label: 'ZARA', url: `https://www.zara.com/de/de/search?searchTerm=${q}` },
  ];
}

export default function ShoppingBottomSheet({
  visible,
  itemName,
  onClose,
  onSelect,
}: ShoppingBottomSheetProps) {
  const { t } = useApp();
  const options = buildShoppingOptions(itemName);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.header}>
            <Text style={s.title}>{t('shopSheetTitle')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <X size={20} color={COLORS.mutedDark} strokeWidth={ICON_STROKE} />
            </TouchableOpacity>
          </View>
          <Text style={s.subtitle}>{itemName}</Text>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={s.option}
              onPress={() => onSelect(opt.url)}
              activeOpacity={0.85}
            >
              <Text style={s.optionText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.cardDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: ACCENT.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.mutedDark,
    marginBottom: 16,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCENT.primary,
  },
});
