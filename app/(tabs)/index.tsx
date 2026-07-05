import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cloud, RefreshCw, ShoppingBag, AlertCircle } from 'lucide-react-native';
import PremiumCard from '@/src/components/PremiumCard';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import ErrorCard from '@/src/components/ErrorCard';
import { useApp } from '@/src/context/AppContext';
import { getDailyOutfitRecommendation, mapGeminiError } from '@/src/services/geminiService';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

export default function HomeScreen() {
  const {
    wardrobe,
    outfitHistory,
    colorPalette,
    weather,
    dailyOutfit,
    setDailyOutfit,
    refreshWeather,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadOutfit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const recommendation = await getDailyOutfitRecommendation(
        colorPalette,
        weather ?? { temperature: 18, condition: 'partly_cloudy', description: 'Mild' },
        wardrobe,
        outfitHistory,
      );
      setDailyOutfit(recommendation);
    } catch (err) {
      const code = err instanceof Error ? err.message : 'network_error';
      const mapped = mapGeminiError(code);
      if (mapped === 'api_key_missing') {
        setError('Gemini API key missing. Add EXPO_PUBLIC_GEMINI_API_KEY to .env');
      } else {
        setError('Analyse fehlgeschlagen, bitte erneut versuchen.');
      }
      setDailyOutfit(null);
    } finally {
      setLoading(false);
    }
  }, [colorPalette, weather, wardrobe, outfitHistory, setDailyOutfit]);

  useEffect(() => {
    if (wardrobe.length > 0) {
      void loadOutfit();
    }
  }, [wardrobe.length, colorPalette?.season]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshWeather();
    await loadOutfit();
    setRefreshing(false);
  }, [refreshWeather, loadOutfit]);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ACCENT.primary}
          />
        }
      >
        <Text style={s.greeting}>Good morning</Text>
        <Text style={s.subtitle}>What to wear today</Text>

        {weather && (
          <PremiumCard style={s.weatherCard}>
            <View style={s.weatherRow}>
              <Cloud size={22} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
              <View style={s.weatherMeta}>
                <Text style={s.weatherTemp}>{weather.temperature}C</Text>
                <Text style={s.weatherDesc}>{weather.description}</Text>
              </View>
            </View>
          </PremiumCard>
        )}

        {wardrobe.length === 0 ? (
          <PremiumCard>
            <Text style={s.emptyTitle}>Your wardrobe is empty</Text>
            <Text style={s.emptyHint}>
              Add clothes in the Wardrobe tab to get personalized outfit suggestions.
            </Text>
          </PremiumCard>
        ) : loading ? (
          <PremiumCard>
            <Text style={s.loadingText}>Generating your outfit...</Text>
          </PremiumCard>
        ) : error ? (
          <ErrorCard message={error} onRetry={loadOutfit} />
        ) : dailyOutfit ? (
          <>
            <PremiumCard style={s.outfitCard}>
              <Text style={s.cardLabel}>Today&apos;s Outfit</Text>
              <Text style={s.outfitDesc}>{dailyOutfit.outfit_description}</Text>
              <View style={s.itemTags}>
                {dailyOutfit.outfit_items.map((item) => (
                  <View key={item} style={s.tag}>
                    <Text style={s.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.weatherNote}>{dailyOutfit.weather_note}</Text>
            </PremiumCard>

            {dailyOutfit.repetition_warning && (
              <PremiumCard style={s.warningCard}>
                <View style={s.warningRow}>
                  <AlertCircle size={20} color={COLORS.warning} strokeWidth={ICON_STROKE} />
                  <Text style={s.warningText}>{dailyOutfit.repetition_warning}</Text>
                </View>
              </PremiumCard>
            )}

            {dailyOutfit.shopping_suggestion && (
              <PremiumCard style={s.shopCard}>
                <View style={s.warningRow}>
                  <ShoppingBag size={20} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
                  <Text style={s.shopText}>{dailyOutfit.shopping_suggestion}</Text>
                </View>
              </PremiumCard>
            )}
          </>
        ) : null}

        <TouchableOpacity style={s.refreshBtn} onPress={loadOutfit} activeOpacity={0.85}>
          <RefreshCw size={18} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
          <Text style={s.refreshText}>Refresh suggestion</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading && <LoadingOverlay message="Styling your look..." />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.mutedDark,
    marginBottom: 8,
  },
  weatherCard: {
    marginBottom: 4,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherMeta: {
    gap: 2,
  },
  weatherTemp: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  weatherDesc: {
    fontSize: 13,
    color: COLORS.mutedDark,
  },
  outfitCard: {},
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: ACCENT.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  outfitDesc: {
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 24,
    marginBottom: 12,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: ACCENT.soft,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: ACCENT.border,
  },
  tagText: {
    color: ACCENT.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  weatherNote: {
    fontSize: 13,
    color: COLORS.mutedDark,
    fontStyle: 'italic',
  },
  warningCard: {
    borderColor: COLORS.warning,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  warningText: {
    flex: 1,
    color: COLORS.warning,
    fontSize: 14,
    lineHeight: 20,
  },
  shopCard: {},
  shopText: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 14,
    color: COLORS.mutedDark,
    lineHeight: 20,
  },
  loadingText: {
    color: COLORS.mutedDark,
    fontSize: 14,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ACCENT.border,
    marginTop: 8,
  },
  refreshText: {
    color: ACCENT.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
