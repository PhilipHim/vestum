import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Bell, Palette, Leaf } from 'lucide-react-native';
import PremiumCard from '@/src/components/PremiumCard';
import ColorSwatch from '@/src/components/ColorSwatch';
import StyleScoreRing from '@/src/components/StyleScoreRing';
import { useApp } from '@/src/context/AppContext';
import {
  buildStyleMetrics,
  calculateStyleScore,
} from '@/src/services/notificationService';
import { getStyleScoreTip } from '@/src/services/geminiService';
import type { AppLanguage } from '@/src/types';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

const LANGUAGES: AppLanguage[] = ['en', 'de'];

export default function ProfileScreen() {
  const router = useRouter();
  const {
    colorPalette,
    settings,
    updateSettings,
    setLanguage,
    resetOnboarding,
    savedOutfits,
    wardrobe,
    t,
  } = useApp();

  const [styleScore, setStyleScore] = useState(0);
  const [styleTip, setStyleTip] = useState('');

  useEffect(() => {
    const score = calculateStyleScore(savedOutfits, wardrobe);
    setStyleScore(score);
    if (score > 0) {
      const metrics = buildStyleMetrics(savedOutfits, wardrobe);
      void getStyleScoreTip(score, metrics, settings.language).then(setStyleTip);
    }
  }, [savedOutfits, wardrobe, settings.language]);

  const toggleNotifications = useCallback(
    (value: boolean) => {
      void updateSettings({ ...settings, notificationsEnabled: value });
    },
    [settings, updateSettings],
  );

  const toggleLocation = useCallback(
    (value: boolean) => {
      void updateSettings({ ...settings, useLocation: value });
    },
    [settings, updateSettings],
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>{t('profileTitle')}</Text>
        <Text style={s.subtitle}>{t('profileSubtitle')}</Text>

        {savedOutfits.length >= 10 && (
          <PremiumCard>
            <StyleScoreRing score={styleScore} tip={styleTip} label={t('profileStyleScore')} />
          </PremiumCard>
        )}

        <PremiumCard>
          <Text style={s.sectionTitle}>{t('profileSettings')}</Text>
          <View style={s.settingRow}>
            <View style={s.settingMeta}>
              <Bell size={18} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
              <Text style={s.settingLabel}>{t('profileNotifications')}</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: COLORS.border, true: ACCENT.medium }}
              thumbColor={settings.notificationsEnabled ? ACCENT.primary : COLORS.muted}
            />
          </View>
          <View style={s.divider} />
          <View style={s.settingRow}>
            <View style={s.settingMeta}>
              <MapPin size={18} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
              <Text style={s.settingLabel}>{t('profileLocation')}</Text>
            </View>
            <Switch
              value={settings.useLocation}
              onValueChange={toggleLocation}
              trackColor={{ false: COLORS.border, true: ACCENT.medium }}
              thumbColor={settings.useLocation ? ACCENT.primary : COLORS.muted}
            />
          </View>
          <View style={s.divider} />
          <View style={s.languageSection}>
            <Text style={s.settingLabel}>{t('profileLanguage')}</Text>
            <View style={s.languageRow}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[s.langChip, settings.language === lang && s.langChipActive]}
                  onPress={() => void setLanguage(lang)}
                  activeOpacity={0.85}
                >
                  <Text style={[s.langChipText, settings.language === lang && s.langChipTextActive]}>
                    {lang === 'en' ? t('profileLanguageEn') : t('profileLanguageDe')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={s.divider} />
          <TouchableOpacity
            style={s.linkRow}
            onPress={() => router.push('/season-change' as Href)}
            activeOpacity={0.85}
          >
            <Leaf size={18} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
            <Text style={s.linkText}>{t('profileSeasonChange')}</Text>
          </TouchableOpacity>
        </PremiumCard>

        <PremiumCard>
          <View style={s.paletteHeader}>
            <Palette size={18} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
            <Text style={s.sectionTitle}>{t('profileSavedPalette')}</Text>
          </View>
          {colorPalette ? (
            <>
              <Text style={s.season}>{colorPalette.season}</Text>
              <ColorSwatch colors={colorPalette.palette} />
              <Text style={s.explanation}>{colorPalette.explanation}</Text>
            </>
          ) : (
            <Text style={s.emptyText}>{t('profileNoPalette')}</Text>
          )}
        </PremiumCard>

        <Text style={s.footer}>Lethe by JPH Product Studio</Text>

        {__DEV__ && (
          <TouchableOpacity
            style={s.devReset}
            onPress={async () => {
              await resetOnboarding();
              router.replace('/onboarding');
            }}
            activeOpacity={0.85}
          >
            <Text style={s.devResetText}>{t('profileDevReset')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textDark, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: COLORS.mutedDark, marginBottom: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  settingMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingLabel: { fontSize: 15, color: COLORS.textDark },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  languageSection: { paddingVertical: 10, gap: 10 },
  languageRow: { flexDirection: 'row', gap: 8 },
  langChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langChipActive: { borderColor: ACCENT.border, backgroundColor: ACCENT.soft },
  langChipText: { fontSize: 13, fontWeight: '600', color: COLORS.mutedDark },
  langChipTextActive: { color: ACCENT.primary },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  linkText: { fontSize: 15, color: ACCENT.primary, fontWeight: '600' },
  paletteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  season: { fontSize: 18, fontWeight: '700', color: ACCENT.primary, marginBottom: 12 },
  explanation: { fontSize: 13, color: COLORS.mutedDark, lineHeight: 18, marginTop: 12 },
  emptyText: { fontSize: 14, color: COLORS.mutedDark, lineHeight: 20 },
  footer: { textAlign: 'center', fontSize: 11, color: COLORS.muted, letterSpacing: 1, textTransform: 'uppercase', marginTop: 8 },
  devReset: { marginTop: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  devResetText: { color: COLORS.mutedDark, fontSize: 13, fontWeight: '600' },
});
