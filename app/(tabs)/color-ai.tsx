import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ImagePlus, Sparkles } from 'lucide-react-native';
import PremiumCard from '@/src/components/PremiumCard';
import ColorSwatch from '@/src/components/ColorSwatch';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import ErrorCard from '@/src/components/ErrorCard';
import { useApp } from '@/src/context/AppContext';
import { pickImageFromCamera, pickImageFromLibrary } from '@/src/lib/imagePicker';
import { analyzeSelfie, mapGeminiError } from '@/src/services/geminiService';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';
import type { ColorPaletteResult } from '@/src/types';

export default function ColorAiScreen() {
  const { setPalette } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ColorPaletteResult | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const analyze = useCallback(
    async (source: 'camera' | 'library') => {
      setError(null);
      setResult(null);

      const picked =
        source === 'camera' ? await pickImageFromCamera() : await pickImageFromLibrary();
      if (!picked) return;

      setPreviewUri(picked.uri);
      setLoading(true);

      try {
        const palette = await analyzeSelfie(picked.base64, picked.mimeType);
        setResult(palette);
        await setPalette(palette);
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
    [setPalette],
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Sparkles size={28} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
          <Text style={s.title}>Color AI</Text>
        </View>
        <Text style={s.subtitle}>
          Upload a selfie to discover your perfect seasonal color palette.
        </Text>

        <View style={s.actionRow}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => void analyze('camera')}
            activeOpacity={0.85}
          >
            <Camera size={20} color={COLORS.white} strokeWidth={ICON_STROKE} />
            <Text style={s.actionBtnText}>Take Selfie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionBtnSecondary}
            onPress={() => void analyze('library')}
            activeOpacity={0.85}
          >
            <ImagePlus size={20} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
            <Text style={s.actionBtnSecondaryText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {previewUri && (
          <View style={s.previewWrap}>
            <Image source={{ uri: previewUri }} style={s.preview} />
          </View>
        )}

        {error && <ErrorCard message={error} onRetry={() => setError(null)} />}

        {result && (
          <>
            <PremiumCard>
              <Text style={s.seasonLabel}>Your Season</Text>
              <Text style={s.season}>{result.season}</Text>
              <View style={s.traits}>
                <Trait label="Skin" value={result.skin_tone} />
                <Trait label="Hair" value={result.hair_color} />
                <Trait label="Eyes" value={result.eye_color} />
              </View>
              <Text style={s.explanation}>{result.explanation}</Text>
            </PremiumCard>

            <PremiumCard>
              <ColorSwatch colors={result.palette} label="Your Palette" />
            </PremiumCard>

            <PremiumCard>
              <ColorSwatch colors={result.avoid_colors} label="Colors to Avoid" size={36} />
            </PremiumCard>
          </>
        )}
      </ScrollView>

      {loading && <LoadingOverlay message="Analyzing your colors..." />}
    </SafeAreaView>
  );
}

function Trait({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.trait}>
      <Text style={s.traitLabel}>{label}</Text>
      <Text style={s.traitValue}>{value}</Text>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    lineHeight: 22,
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
  previewWrap: {
    alignItems: 'center',
  },
  preview: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: ACCENT.border,
  },
  seasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: ACCENT.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  season: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  traits: {
    gap: 8,
    marginBottom: 12,
  },
  trait: {
    flexDirection: 'row',
    gap: 8,
  },
  traitLabel: {
    width: 40,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.mutedDark,
  },
  traitValue: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
  },
  explanation: {
    fontSize: 14,
    color: COLORS.mutedDark,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
