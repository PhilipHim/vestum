import { useCallback, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ImagePlus, Leaf, BarChart3 } from 'lucide-react-native';
import PremiumCard from '@/src/components/PremiumCard';
import WardrobeItemCard from '@/src/components/WardrobeItemCard';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import ErrorCard from '@/src/components/ErrorCard';
import { useApp } from '@/src/context/AppContext';
import { pickImageFromCamera, pickImageFromLibrary } from '@/src/lib/imagePicker';
import { getCurrentSeason } from '@/src/lib/validate';
import { categorizeClothing, mapGeminiError } from '@/src/services/geminiService';
import { computeNeverWornPercent, getOutOfSeasonUnworn } from '@/src/services/storage';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';
import type { WardrobeFilter, WardrobeItem } from '@/src/types';

export default function WardrobeScreen() {
  const { wardrobe, addItem, deleteItem, toggleForSale, t } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<WardrobeFilter>('all');

  const neverWornPercent = computeNeverWornPercent(wardrobe);
  const currentSeason = getCurrentSeason();
  const outOfSeason = getOutOfSeasonUnworn(wardrobe, currentSeason);

  const filtered = useMemo(() => {
    if (filter === 'for_sale') return wardrobe.filter((w) => w.forSale);
    return wardrobe;
  }, [wardrobe, filter]);

  const handleAdd = useCallback(
    async (source: 'camera' | 'library') => {
      setError(null);
      const picked =
        source === 'camera' ? await pickImageFromCamera() : await pickImageFromLibrary();
      if (!picked) return;

      setLoading(true);
      try {
        const category = await categorizeClothing(picked.base64, picked.mimeType);
        const item: WardrobeItem = {
          id: `${Date.now()}`,
          imageUri: picked.uri,
          type: category.type,
          color: category.color,
          season: category.season,
          createdAt: new Date().toISOString(),
          wearCount: 0,
          forSale: false,
        };
        await addItem(item);
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
    [addItem, t],
  );

  const confirmDelete = useCallback(
    (id: string) => {
      Alert.alert(t('wardrobeDeleteTitle'), t('wardrobeDeleteMsg'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => void deleteItem(id) },
      ]);
    },
    [deleteItem, t],
  );

  const showContextMenu = useCallback(
    (item: WardrobeItem) => {
      const markLabel = item.forSale ? t('wardrobeUnmarkSale') : t('wardrobeMarkSale');

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: [t('cancel'), markLabel, t('delete')],
            destructiveButtonIndex: 2,
            cancelButtonIndex: 0,
          },
          (index) => {
            if (index === 1) void toggleForSale(item.id);
            if (index === 2) confirmDelete(item.id);
          },
        );
      } else {
        Alert.alert(item.type, undefined, [
          { text: t('cancel'), style: 'cancel' },
          { text: markLabel, onPress: () => void toggleForSale(item.id) },
          { text: t('delete'), style: 'destructive', onPress: () => confirmDelete(item.id) },
        ]);
      }
    },
    [toggleForSale, confirmDelete, t],
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>{t('wardrobeTitle')}</Text>
        <Text style={s.subtitle}>{t('wardrobeSubtitle')}</Text>

        <View style={s.filterRow}>
          <FilterChip label={t('wardrobeAll')} active={filter === 'all'} onPress={() => setFilter('all')} />
          <FilterChip
            label={t('wardrobeForSale')}
            active={filter === 'for_sale'}
            onPress={() => setFilter('for_sale')}
          />
        </View>

        <View style={s.actionRow}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => void handleAdd('camera')}
            activeOpacity={0.85}
          >
            <Camera size={20} color={COLORS.white} strokeWidth={ICON_STROKE} />
            <Text style={s.actionBtnText}>{t('camera')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionBtnSecondary}
            onPress={() => void handleAdd('library')}
            activeOpacity={0.85}
          >
            <ImagePlus size={20} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
            <Text style={s.actionBtnSecondaryText}>{t('gallery')}</Text>
          </TouchableOpacity>
        </View>

        {error && <ErrorCard message={error} onRetry={() => setError(null)} />}

        <PremiumCard>
          <View style={s.statRow}>
            <BarChart3 size={20} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
            <View style={s.statMeta}>
              <Text style={s.statValue}>{neverWornPercent}%</Text>
              <Text style={s.statLabel}>{t('wardrobeNeverWorn')}</Text>
            </View>
          </View>
        </PremiumCard>

        {outOfSeason.length > 0 && (
          <PremiumCard>
            <View style={s.seasonRow}>
              <Leaf size={20} color={COLORS.success} strokeWidth={ICON_STROKE} />
              <View style={s.seasonMeta}>
                <Text style={s.seasonTitle}>{t('wardrobeSeasonTip')}</Text>
                <Text style={s.seasonHint}>
                  {t('wardrobeSeasonHint', { count: outOfSeason.length })}
                </Text>
              </View>
            </View>
          </PremiumCard>
        )}

        {filtered.length === 0 ? (
          <PremiumCard>
            <Text style={s.emptyText}>
              {filter === 'for_sale' ? t('wardrobeEmptyForSale') : t('wardrobeEmpty')}
            </Text>
          </PremiumCard>
        ) : (
          <View style={s.grid}>
            {filtered.map((item) => (
              <WardrobeItemCard key={item.id} item={item} onLongPress={showContextMenu} />
            ))}
          </View>
        )}
      </ScrollView>

      {loading && <LoadingOverlay message={t('wardrobeCategorizing')} />}
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.chip, active && s.chipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textDark, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: COLORS.mutedDark, marginBottom: 4 },
  filterRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { borderColor: ACCENT.border, backgroundColor: ACCENT.soft },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.mutedDark },
  chipTextActive: { color: ACCENT.primary },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  actionBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: ACCENT.border,
    backgroundColor: ACCENT.soft,
  },
  actionBtnSecondaryText: { color: ACCENT.primary, fontSize: 14, fontWeight: '700' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statMeta: { gap: 2 },
  statValue: { fontSize: 24, fontWeight: '700', color: ACCENT.primary },
  statLabel: { fontSize: 13, color: COLORS.mutedDark },
  seasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  seasonMeta: { flex: 1, gap: 4 },
  seasonTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  seasonHint: { fontSize: 13, color: COLORS.mutedDark, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  emptyText: { color: COLORS.mutedDark, fontSize: 14, textAlign: 'center' },
});
