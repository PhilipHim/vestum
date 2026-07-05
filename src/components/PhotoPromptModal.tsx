import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import { useApp } from '@/src/context/AppContext';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

interface PhotoPromptModalProps {
  visible: boolean;
  onCamera: () => void;
  onGallery: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function PhotoPromptModal({
  visible,
  onCamera,
  onGallery,
  onSkip,
  onClose,
}: PhotoPromptModalProps) {
  const { t } = useApp();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <TouchableOpacity style={s.close} onPress={onClose} hitSlop={12}>
            <X size={20} color={COLORS.mutedDark} strokeWidth={ICON_STROKE} />
          </TouchableOpacity>
          <Text style={s.title}>{t('photoModalTitle')}</Text>
          <Text style={s.hint}>{t('photoModalHint')}</Text>

          <TouchableOpacity style={s.btn} onPress={onCamera} activeOpacity={0.85}>
            <Camera size={18} color={COLORS.white} strokeWidth={ICON_STROKE} />
            <Text style={s.btnText}>{t('photoModalCamera')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.btnSecondary} onPress={onGallery} activeOpacity={0.85}>
            <ImagePlus size={18} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
            <Text style={s.btnSecondaryText}>{t('photoModalGallery')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.skip} onPress={onSkip} activeOpacity={0.85}>
            <Text style={s.skipText}>{t('photoModalSkip')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: ACCENT.border,
  },
  close: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
    paddingRight: 24,
  },
  hint: {
    fontSize: 14,
    color: COLORS.mutedDark,
    marginBottom: 20,
    lineHeight: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
  },
  btnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: ACCENT.border,
    backgroundColor: ACCENT.soft,
    marginBottom: 10,
  },
  btnSecondaryText: {
    color: ACCENT.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  skip: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    color: COLORS.mutedDark,
    fontSize: 14,
    fontWeight: '600',
  },
});
