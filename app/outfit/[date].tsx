import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shirt, Layers } from 'lucide-react-native';
import PremiumCard from '@/src/components/PremiumCard';
import { useApp } from '@/src/context/AppContext';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

export default function OutfitDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { savedOutfits, t } = useApp();
  const outfit = savedOutfits.find((o) => o.date === date);

  if (!outfit) {
    return (
      <SafeAreaView style={s.root}>
        <Text style={s.empty}>{t('outfitDetailNotFound')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        <TouchableOpacity style={s.back} onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={22} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
          <Text style={s.backText}>{t('back')}</Text>
        </TouchableOpacity>

        <Text style={s.date}>{outfit.date}</Text>

        {outfit.photoUri && (
          <Image source={{ uri: outfit.photoUri }} style={s.photo} />
        )}

        <PremiumCard>
          <Row icon={Shirt} label={t('homeTop')} value={outfit.top} />
          <Row icon={Shirt} label={t('homeBottom')} value={outfit.bottom} />
          {outfit.optional_layer && (
            <Row icon={Layers} label={t('homeLayer')} value={outfit.optional_layer} />
          )}
          <Row icon={Shirt} label={t('homeShoes')} value={outfit.shoes_hint} />
          <Text style={s.reason}>{outfit.reason}</Text>
        </PremiumCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Shirt; label: string; value: string }) {
  return (
    <View style={s.row}>
      <Icon size={16} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: ACCENT.primary, fontSize: 15, fontWeight: '600' },
  date: { fontSize: 24, fontWeight: '700', color: COLORS.textDark },
  photo: { width: '100%', height: 320, borderRadius: 16, backgroundColor: COLORS.cardInner },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rowLabel: { width: 72, fontSize: 13, color: COLORS.mutedDark, fontWeight: '600' },
  rowValue: { flex: 1, fontSize: 14, color: COLORS.textDark, fontWeight: '600' },
  reason: { fontSize: 14, color: COLORS.mutedDark, lineHeight: 20, marginTop: 8, fontStyle: 'italic' },
  empty: { color: COLORS.textDark, padding: 20 },
});
