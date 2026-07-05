import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Tag, Archive } from 'lucide-react-native';
import PremiumCard from '@/src/components/PremiumCard';
import { useApp } from '@/src/context/AppContext';
import { getCurrentSeason } from '@/src/lib/validate';
import { getOppositeSeason } from '@/src/services/storage';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

export default function SeasonChangeScreen() {
  const router = useRouter();
  const { wardrobe, toggleForSale, t } = useApp();
  const currentSeason = getCurrentSeason();
  const opposite = getOppositeSeason(currentSeason);

  const oppositeItems = useMemo(
    () => wardrobe.filter((w) => w.season.toLowerCase() === opposite.toLowerCase()),
    [wardrobe, opposite],
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        <TouchableOpacity style={s.back} onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={22} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
          <Text style={s.backText}>{t('back')}</Text>
        </TouchableOpacity>

        <Text style={s.title}>{t('seasonChangeTitle')}</Text>
        <Text style={s.subtitle}>
          {t('seasonChangeSubtitle', { current: currentSeason, opposite })}
        </Text>

        {oppositeItems.length === 0 ? (
          <PremiumCard>
            <Text style={s.empty}>{t('seasonChangeEmpty', { opposite })}</Text>
          </PremiumCard>
        ) : (
          oppositeItems.map((item) => (
            <PremiumCard key={item.id}>
              <Text style={s.itemType}>{item.type}</Text>
              <Text style={s.itemDetail}>{item.color} · {item.season}</Text>
              <View style={s.actions}>
                <TouchableOpacity
                  style={s.actionBtn}
                  onPress={() => void toggleForSale(item.id)}
                  activeOpacity={0.85}
                >
                  <Tag size={16} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
                  <Text style={s.actionText}>
                    {item.forSale ? t('seasonChangeUnmarkSale') : t('seasonChangeMarkSale')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtnSecondary} activeOpacity={0.85}>
                  <Archive size={16} color={COLORS.mutedDark} strokeWidth={ICON_STROKE} />
                  <Text style={s.actionTextSecondary}>{t('seasonChangeStore')}</Text>
                </TouchableOpacity>
              </View>
            </PremiumCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  backText: { color: ACCENT.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textDark },
  subtitle: { fontSize: 15, color: COLORS.mutedDark, lineHeight: 22, marginBottom: 8 },
  empty: { color: COLORS.mutedDark, fontSize: 14, textAlign: 'center' },
  itemType: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  itemDetail: { fontSize: 13, color: COLORS.mutedDark, marginTop: 4, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ACCENT.border,
    backgroundColor: ACCENT.soft,
  },
  actionText: { fontSize: 12, fontWeight: '600', color: ACCENT.primary },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionTextSecondary: { fontSize: 12, fontWeight: '600', color: COLORS.mutedDark },
});
