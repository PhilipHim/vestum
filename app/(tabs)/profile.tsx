import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Bell, Users, Palette } from 'lucide-react-native';
import PremiumCard from '@/src/components/PremiumCard';
import ColorSwatch from '@/src/components/ColorSwatch';
import FeedbackStars from '@/src/components/FeedbackStars';
import { useApp } from '@/src/context/AppContext';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';

export default function ProfileScreen() {
  const router = useRouter();
  const { colorPalette, settings, updateSettings, resetOnboarding } = useApp();
  const [friendRating, setFriendRating] = useState(0);

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
        <Text style={s.title}>Profile</Text>
        <Text style={s.subtitle}>Settings and your color palette</Text>

        <PremiumCard>
          <Text style={s.sectionTitle}>Settings</Text>

          <View style={s.settingRow}>
            <View style={s.settingMeta}>
              <Bell size={18} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
              <Text style={s.settingLabel}>Notifications</Text>
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
              <Text style={s.settingLabel}>Weather location</Text>
            </View>
            <Switch
              value={settings.useLocation}
              onValueChange={toggleLocation}
              trackColor={{ false: COLORS.border, true: ACCENT.medium }}
              thumbColor={settings.useLocation ? ACCENT.primary : COLORS.muted}
            />
          </View>
        </PremiumCard>

        <PremiumCard>
          <View style={s.paletteHeader}>
            <Palette size={18} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
            <Text style={s.sectionTitle}>Saved Color Palette</Text>
          </View>
          {colorPalette ? (
            <>
              <Text style={s.season}>{colorPalette.season}</Text>
              <ColorSwatch colors={colorPalette.palette} />
              <Text style={s.explanation}>{colorPalette.explanation}</Text>
            </>
          ) : (
            <Text style={s.emptyText}>
              No palette saved yet. Use Color AI to analyze your selfie.
            </Text>
          )}
        </PremiumCard>

        <PremiumCard>
          <View style={s.paletteHeader}>
            <Users size={18} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
            <Text style={s.sectionTitle}>Friends Rating</Text>
          </View>
          <Text style={s.friendsHint}>
            How would your friends rate your style? (UI preview only)
          </Text>
          <FeedbackStars value={friendRating} onChange={setFriendRating} />
          {friendRating > 0 && (
            <Text style={s.ratingNote}>
              {friendRating >= 4
                ? 'Your friends think you look great!'
                : 'Room for a style upgrade — try Color AI!'}
            </Text>
          )}
        </PremiumCard>

        <Text style={s.footer}>Vestum by JPH Product Studio</Text>

        {__DEV__ && (
          <TouchableOpacity
            style={s.devReset}
            onPress={async () => {
              await resetOnboarding();
              router.replace('/onboarding');
            }}
            activeOpacity={0.85}
          >
            <Text style={s.devResetText}>Reset onboarding (Dev)</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 15,
    color: COLORS.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  paletteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  season: {
    fontSize: 18,
    fontWeight: '700',
    color: ACCENT.primary,
    marginBottom: 12,
  },
  explanation: {
    fontSize: 13,
    color: COLORS.mutedDark,
    lineHeight: 18,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.mutedDark,
    lineHeight: 20,
  },
  friendsHint: {
    fontSize: 13,
    color: COLORS.mutedDark,
    marginBottom: 12,
    lineHeight: 18,
  },
  ratingNote: {
    fontSize: 13,
    color: ACCENT.primary,
    marginTop: 10,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  devReset: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  devResetText: {
    color: COLORS.mutedDark,
    fontSize: 13,
    fontWeight: '600',
  },
});
