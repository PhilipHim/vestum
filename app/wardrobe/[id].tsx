import { useCallback, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles, Tag, ExternalLink } from 'lucide-react-native';
import PremiumCard from '@/src/components/PremiumCard';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import ErrorCard from '@/src/components/ErrorCard';
import { useApp } from '@/src/context/AppContext';
import { getTrendCheck, mapGeminiError } from '@/src/services/geminiService';
import type { TrendCheckResult } from '@/src/types';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

import type { TranslationKey } from '@/src/i18n';

function trendBadgeLabel(
  badge: TrendCheckResult['badge'],
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
): string {
  if (badge === 'On Trend') return t('trendOnTrend');
  if (badge === 'Veraltet') return t('trendOutdated');
  return t('trendClassic');
}

export default function WardrobeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { wardrobe, toggleForSale, t } = useApp();
  const item = wardrobe.find((w) => w.id === id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<TrendCheckResult | null>(null);

  const runTrendCheck = useCallback(async () => {
    if (!item) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getTrendCheck(item.type, item.color, item.season);
      setTrend(result);
    } catch (err) {
      const code = err instanceof Error ? err.message : 'network_error';
      if (mapGeminiError(code) === 'api_key_missing') {
        setError(t('errorApiKey'));
      } else {
        setError(t('errorAnalysis'));
      }
    } finally {
      setLoading(false);
    }
  }, [item, t]);

  if (!item) {
    return (
      <SafeAreaView style={s.root}>
        <Text style={s.title}>{t('wardrobeDetailNotFound')}</Text>
      </SafeAreaView>
    );
  }

  const badgeLabel = trend ? trendBadgeLabel(trend.badge, t) : '';
  const badgeColor =
    trend?.badge === 'On Trend'
      ? COLORS.success
      : trend?.badge === 'Veraltet'
        ? COLORS.error
        : ACCENT.primary;

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        <TouchableOpacity style={s.back} onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={22} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
          <Text style={s.backText}>{t('back')}</Text>
        </TouchableOpacity>

        <Image source={{ uri: item.imageUri }} style={s.image} />

        <PremiumCard>
          <Text style={s.type}>{item.type}</Text>
          <Text style={s.detail}>{item.color} · {item.season}</Text>
          <Text style={s.wear}>{t('wardrobeDetailWorn', { count: item.wearCount })}</Text>
          {item.forSale && (
            <View style={s.saleRow}>
              <Tag size={16} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
              <Text style={s.saleText}>{t('wardrobeDetailForSale')}</Text>
            </View>
          )}
        </PremiumCard>

        {item.forSale && (
          <PremiumCard>
            <Text style={s.sectionLabel}>{t('wardrobeDetailSell')}</Text>
            <TouchableOpacity
              style={s.marketBtn}
              onPress={() => void Linking.openURL('https://www.vinted.de/sell')}
              activeOpacity={0.85}
            >
              <ExternalLink size={16} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
              <Text style={s.marketText}>{t('wardrobeDetailVinted')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.marketBtn}
              onPress={() =>
                void Linking.openURL('https://www.kleinanzeigen.de/m-anzeige-aufgeben.html')
              }
              activeOpacity={0.85}
            >
              <ExternalLink size={16} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
              <Text style={s.marketText}>{t('wardrobeDetailEbay')}</Text>
            </TouchableOpacity>
          </PremiumCard>
        )}

        <TouchableOpacity style={s.trendBtn} onPress={() => void runTrendCheck()} activeOpacity={0.85}>
          <Sparkles size={18} color={COLORS.white} strokeWidth={ICON_STROKE} />
          <Text style={s.trendBtnText}>{t('wardrobeDetailTrendCheck')}</Text>
        </TouchableOpacity>

        {error && <ErrorCard message={error} onRetry={() => void runTrendCheck()} />}

        {trend && (
          <PremiumCard>
            <View style={[s.badge, { borderColor: badgeColor }]}>
              <Text style={[s.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
            </View>
            <Text style={s.trendScore}>
              {t('wardrobeDetailTrendScore', { score: trend.trend_score })}
            </Text>
            <Text style={s.trendBody}>{trend.explanation}</Text>
            <Text style={s.trendTip}>{trend.styling_tip}</Text>
          </PremiumCard>
        )}

        <TouchableOpacity
          style={s.toggleSale}
          onPress={() => void toggleForSale(item.id)}
          activeOpacity={0.85}
        >
          <Tag size={16} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
          <Text style={s.toggleSaleText}>
            {item.forSale ? t('wardrobeDetailUnmarkSale') : t('wardrobeDetailMarkSale')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {loading && <LoadingOverlay message={t('wardrobeDetailCheckingTrend')} />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  backText: { color: ACCENT.primary, fontSize: 15, fontWeight: '600' },
  image: { width: '100%', height: 280, borderRadius: 16, backgroundColor: COLORS.cardInner },
  type: { fontSize: 22, fontWeight: '700', color: COLORS.textDark },
  detail: { fontSize: 15, color: COLORS.mutedDark, marginTop: 4 },
  wear: { fontSize: 13, color: ACCENT.primary, marginTop: 8, fontWeight: '600' },
  saleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  saleText: { color: ACCENT.primary, fontWeight: '600', fontSize: 14 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: ACCENT.primary, textTransform: 'uppercase', marginBottom: 12 },
  marketBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  marketText: { fontSize: 15, color: COLORS.textDark, fontWeight: '600' },
  trendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  trendBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  trendScore: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  trendBody: { fontSize: 14, color: COLORS.mutedDark, lineHeight: 20, marginBottom: 8 },
  trendTip: { fontSize: 13, color: ACCENT.primary, fontStyle: 'italic' },
  toggleSale: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ACCENT.border,
  },
  toggleSaleText: { color: ACCENT.primary, fontSize: 14, fontWeight: '600' },
  title: { color: COLORS.textDark, padding: 20 },
});
