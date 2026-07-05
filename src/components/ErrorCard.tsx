import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorCard({
  message = 'Analyse fehlgeschlagen, bitte erneut versuchen.',
  onRetry,
}: ErrorCardProps) {
  return (
    <View style={s.card}>
      <AlertTriangle size={24} color={COLORS.error} strokeWidth={ICON_STROKE} />
      <Text style={s.title}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} activeOpacity={0.7}>
          <Text style={s.retry}>Erneut versuchen</Text>
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
