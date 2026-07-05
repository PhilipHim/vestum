import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useApp } from '@/src/context/AppContext';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorCard({ message, onRetry }: ErrorCardProps) {
  const { t } = useApp();
  const displayMessage = message ?? t('errorAnalysis');

  return (
    <View style={s.card}>
      <AlertTriangle size={24} color={COLORS.error} strokeWidth={ICON_STROKE} />
      <Text style={s.title}>{displayMessage}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} activeOpacity={0.7}>
          <Text style={s.retry}>{t('retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.error,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  retry: {
    color: ACCENT.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});
