import { useCallback, useState } from 'react';
import {
  Alert,
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
import type { WardrobeItem } from '@/src/types';

export default function WardrobeScreen() {
  const { wardrobe, addItem, deleteItem } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const neverWornPercent = computeNeverWornPercent(wardrobe);
  const currentSeason = getCurrentSeason();
  const outOfSeason = getOutOfSeasonUnworn(wardrobe, currentSeason);

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
        };
        await addItem(item);
      } catch (err) {
        const code = err instanceof Error ? err.message : 'network_error';
        const mapped = mapGeminiError(code);
        if (mapped === 'api_key_missing') {
          setError('Gemini API key missing. Add EXPO_PUBLIC_GEMINI_API_KEY to .env');
        } else {
          setError('Analyse fehlgeschlagen, bitte erneut versuchen.');
        }
      } finally {
        setLoading(false);
      }
    },
    [addItem],
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Remove item', 'Delete this piece from your wardrobe?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void deleteItem(id) },
      ]);
    },
    [deleteItem],
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Wardrobe</Text>
        <Text style={s.subtitle}>Your digital closet</Text>

        <View style={s.actionRow}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => void handleAdd('camera')}
            activeOpacity={0.85}
          >
            <Camera size={20} color={COLORS.white} strokeWidth={ICON_STROKE} />
            <Text style={s.actionBtnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionBtnSecondary}
            onPress={() => void handleAdd('library')}
            activeOpacity={0.85}
          >
            <ImagePlus size={20} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
            <Text style={s.actionBtnSecondaryText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {error && <ErrorCard message={error} onRetry={() => setError(null)} />}

        <PremiumCard>
          <View style={s.statRow}>
            <BarChart3 size={20} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
            <View style={s.statMeta}>
              <Text style={s.statValue}>{neverWornPercent}%</Text>
              <Text style={s.statLabel}>of clothes never worn</Text>
            </View>
          </View>
        </PremiumCard>

        {outOfSeason.length > 0 && (
          <PremiumCard>
            <View style={s.seasonRow}>
              <Leaf size={20} color={COLORS.success} strokeWidth={ICON_STROKE} />
              <View style={s.seasonMeta}>
                <Text style={s.seasonTitle}>Season tip</Text>
                <Text style={s.seasonHint}>
                  {outOfSeason.length} out-of-season unworn item
                  {outOfSeason.length > 1 ? 's' : ''} — consider selling or donating.
                </Text>
              </View>
            </View>
          </PremiumCard>
        )}

        {wardrobe.length === 0 ? (
          <PremiumCard>
            <Text style={s.emptyText}>No items yet. Upload your first piece above.</Text>
          </PremiumCard>
        ) : (
          <View style={s.grid}>
            {wardrobe.map((item) => (
              <WardrobeItemCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </View>
        )}
      </ScrollView>

      {loading && <LoadingOverlay message="Categorizing item..." />}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.mutedDark,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
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
  actionBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
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
  actionBtnSecondaryText: {
    color: ACCENT.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statMeta: {
    gap: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: ACCENT.primary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.mutedDark,
  },
  seasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  seasonMeta: {
    flex: 1,
    gap: 4,
  },
  seasonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  seasonHint: {
    fontSize: 13,
    color: COLORS.mutedDark,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  emptyText: {
    color: COLORS.mutedDark,
    fontSize: 14,
    textAlign: 'center',
  },
});
