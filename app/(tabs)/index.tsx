import { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cloud, RefreshCw, ShoppingBag, Shirt, Layers } from 'lucide-react-native';
import PremiumCard from '@/src/components/PremiumCard';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import ErrorCard from '@/src/components/ErrorCard';
import PhotoPromptModal from '@/src/components/PhotoPromptModal';
import ShoppingBottomSheet from '@/src/components/ShoppingBottomSheet';
import { useToast } from '@/src/components/Toast';
import { useApp } from '@/src/context/AppContext';
import { pickImageFromCamera, pickImageFromLibrary } from '@/src/lib/imagePicker';
import { getOutfitOfTheDay, mapGeminiError } from '@/src/services/geminiService';
import { todayKey } from '@/src/services/storage';
import type { OutfitOfTheDay, SavedOutfit } from '@/src/types';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

export default function HomeScreen() {
  const {
    wardrobe,
    savedOutfits,
    colorPalette,
    weather,
    outfitOfDay,
    setOutfitOfDay,
    saveOutfit,
    refreshWeather,
    t,
  } = useApp();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);
  const [pendingOutfit, setPendingOutfit] = useState<OutfitOfTheDay | null>(null);
  const [shopItem, setShopItem] = useState<string | null>(null);

  const loadOutfit = useCallback(
    async (force = false) => {
      if (wardrobe.length === 0) return;
      if (!force && outfitOfDay) return;

      setLoading(true);
      setError(null);
      try {
        const recommendation = await getOutfitOfTheDay(
          wardrobe,
          weather ?? { temperature: 18, condition: 'partly_cloudy', description: 'Mild' },
          savedOutfits,
        );
        await setOutfitOfDay(recommendation);
      } catch (err) {
        const code = err instanceof Error ? err.message : 'network_error';
        const mapped = mapGeminiError(code);
        if (mapped === 'api_key_missing') {
          setError(t('errorApiKey'));
        } else {
          setError(t('errorAnalysis'));
        }
      } finally {
        setLoading(false);
      }
    },
    [wardrobe, weather, savedOutfits, outfitOfDay, setOutfitOfDay, t],
  );

  useEffect(() => {
    void loadOutfit();
  }, [wardrobe.length, weather?.temperature]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshWeather();
    await loadOutfit(true);
    setRefreshing(false);
  }, [refreshWeather, loadOutfit]);

  const finalizeSave = useCallback(
    async (photoUri?: string) => {
      const outfit = pendingOutfit ?? outfitOfDay;
      if (!outfit) return;

      const saved: SavedOutfit = {
        id: `${Date.now()}`,
        date: todayKey(),
        top: outfit.top,
        bottom: outfit.bottom,
        optional_layer: outfit.optional_layer,
        shoes_hint: outfit.shoes_hint,
        reason: outfit.reason,
        photoUri,
        paletteColors: colorPalette?.palette,
      };
      await saveOutfit(saved);
      setPhotoModal(false);
      setPendingOutfit(null);
      showToast(t('homeOutfitSaved'));
    },
    [pendingOutfit, outfitOfDay, colorPalette, saveOutfit, showToast, t],
  );

  const handleWearToday = useCallback(() => {
    if (!outfitOfDay) return;
    setPendingOutfit(outfitOfDay);
    setPhotoModal(true);
  }, [outfitOfDay]);

  const handlePhoto = useCallback(
    async (source: 'camera' | 'library') => {
      const picked =
        source === 'camera' ? await pickImageFromCamera() : await pickImageFromLibrary();
      await finalizeSave(picked?.uri);
    },
    [finalizeSave],
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT.primary} />
        }
      >
        <Text style={s.greeting}>{t('homeGreeting')}</Text>
        <Text style={s.subtitle}>{t('homeSubtitle')}</Text>

        {weather && (
          <PremiumCard style={s.weatherCard}>
            <View style={s.weatherRow}>
              <Cloud size={22} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
              <View style={s.weatherMeta}>
                <Text style={s.weatherTemp}>{weather.temperature}°C</Text>
                <Text style={s.weatherDesc}>{weather.description}</Text>
              </View>
            </View>
          </PremiumCard>
        )}

        {wardrobe.length === 0 ? (
          <PremiumCard>
            <Text style={s.emptyTitle}>{t('homeEmptyTitle')}</Text>
            <Text style={s.emptyHint}>{t('homeEmptyHint')}</Text>
          </PremiumCard>
        ) : loading && !outfitOfDay ? (
          <PremiumCard>
            <Text style={s.loadingText}>{t('homeLoading')}</Text>
          </PremiumCard>
        ) : error ? (
          <ErrorCard message={error} onRetry={() => void loadOutfit(true)} />
        ) : outfitOfDay ? (
          <>
            <PremiumCard style={s.outfitCard}>
              <Text style={s.cardLabel}>{t('homeOutfitLabel')}</Text>

              <OutfitRow icon={Shirt} label={t('homeTop')} value={outfitOfDay.top} />
              <OutfitRow icon={Shirt} label={t('homeBottom')} value={outfitOfDay.bottom} />
              {outfitOfDay.optional_layer && (
                <OutfitRow icon={Layers} label={t('homeLayer')} value={outfitOfDay.optional_layer} />
              )}
              <OutfitRow icon={Shirt} label={t('homeShoes')} value={outfitOfDay.shoes_hint} />

              <Text style={s.reason}>{outfitOfDay.reason}</Text>

              <TouchableOpacity style={s.wearBtn} onPress={handleWearToday} activeOpacity={0.85}>
                <Text style={s.wearBtnText}>{t('homeWearToday')}</Text>
              </TouchableOpacity>
            </PremiumCard>

            {outfitOfDay.shopping_suggestion && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setShopItem(outfitOfDay.shopping_suggestion!)}
              >
                <PremiumCard style={s.shopCard}>
                  <View style={s.shopRow}>
                    <ShoppingBag size={20} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
                    <View style={s.shopMeta}>
                      <Text style={s.shopLabel}>{t('homeShoppingTip')}</Text>
                      <Text style={s.shopText}>{outfitOfDay.shopping_suggestion}</Text>
                      <Text style={s.shopTap}>{t('homeTapToShop')}</Text>
                    </View>
                  </View>
                </PremiumCard>
              </TouchableOpacity>
            )}
          </>
        ) : null}

        <TouchableOpacity style={s.refreshBtn} onPress={() => void loadOutfit(true)} activeOpacity={0.85}>
          <RefreshCw size={18} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
          <Text style={s.refreshText}>{t('homeRegenerate')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading && <LoadingOverlay message={t('homeStylingLook')} />}

      <PhotoPromptModal
        visible={photoModal}
        onCamera={() => void handlePhoto('camera')}
        onGallery={() => void handlePhoto('library')}
        onSkip={() => void finalizeSave()}
        onClose={() => {
          setPhotoModal(false);
          setPendingOutfit(null);
        }}
      />

      <ShoppingBottomSheet
        visible={!!shopItem}
        itemName={shopItem ?? ''}
        onClose={() => setShopItem(null)}
        onSelect={(url) => {
          void Linking.openURL(url);
          setShopItem(null);
        }}
      />
    </SafeAreaView>
  );
}

function OutfitRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Shirt;
  label: string;
  value: string;
}) {
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
  greeting: { fontSize: 28, fontWeight: '700', color: COLORS.textDark, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: COLORS.mutedDark, marginBottom: 8 },
  weatherCard: { marginBottom: 4 },
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weatherMeta: { gap: 2 },
  weatherTemp: { fontSize: 20, fontWeight: '700', color: COLORS.textDark },
  weatherDesc: { fontSize: 13, color: COLORS.mutedDark },
  outfitCard: {},
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: ACCENT.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rowLabel: { width: 72, fontSize: 13, color: COLORS.mutedDark, fontWeight: '600' },
  rowValue: { flex: 1, fontSize: 14, color: COLORS.textDark, fontWeight: '600' },
  reason: { fontSize: 14, color: COLORS.mutedDark, lineHeight: 20, marginTop: 8, fontStyle: 'italic' },
  wearBtn: {
    marginTop: 16,
    backgroundColor: ACCENT.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  wearBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  shopCard: {},
  shopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  shopMeta: { flex: 1, gap: 4 },
  shopLabel: { fontSize: 11, fontWeight: '700', color: ACCENT.primary, textTransform: 'uppercase' },
  shopText: { fontSize: 14, color: COLORS.textDark, lineHeight: 20 },
  shopTap: { fontSize: 12, color: ACCENT.primary, fontWeight: '600' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 6 },
  emptyHint: { fontSize: 14, color: COLORS.mutedDark, lineHeight: 20 },
  loadingText: { color: COLORS.mutedDark, fontSize: 14 },
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
  refreshText: { color: ACCENT.primary, fontSize: 14, fontWeight: '600' },
});
