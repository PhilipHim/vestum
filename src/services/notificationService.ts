import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { translate } from '@/src/i18n';
import type { AppLanguage, SavedOutfit, WardrobeItem } from '@/src/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleSeasonNotifications(lang: AppLanguage = 'en'): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const autumn = nextOccurrence(10, 1, 9, 0);
  const spring = nextOccurrence(4, 1, 9, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: translate(lang, 'notifAutumnTitle'),
      body: translate(lang, 'notifAutumnBody'),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: autumn,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: translate(lang, 'notifSpringTitle'),
      body: translate(lang, 'notifSpringBody'),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: spring,
    },
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('season', {
      name: lang === 'de' ? 'Saison-Wechsel' : 'Season change',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

function nextOccurrence(month: number, day: number, hour: number, minute: number): Date {
  const now = new Date();
  const target = new Date(now.getFullYear(), month - 1, day, hour, minute, 0);
  if (target <= now) {
    target.setFullYear(target.getFullYear() + 1);
  }
  return target;
}

export function calculateStyleScore(
  savedOutfits: SavedOutfit[],
  wardrobe: WardrobeItem[],
): number {
  if (savedOutfits.length < 10) return 0;

  const colorSet = new Set<string>();
  savedOutfits.forEach((o) => {
    colorSet.add(o.top.toLowerCase());
    colorSet.add(o.bottom.toLowerCase());
  });
  const colorVariety = Math.min(colorSet.size / 20, 1);

  const outfitKeys = savedOutfits.map((o) => `${o.top}|${o.bottom}`);
  const unique = new Set(outfitKeys).size;
  const repetitionRate = unique / outfitKeys.length;

  const wornItems = wardrobe.filter((w) => w.wearCount > 0).length;
  const utilization = wardrobe.length > 0 ? wornItems / wardrobe.length : 0;

  const score = Math.round(
    colorVariety * 35 + repetitionRate * 35 + utilization * 30,
  );
  return Math.min(100, Math.max(0, score));
}

export function buildStyleMetrics(
  savedOutfits: SavedOutfit[],
  wardrobe: WardrobeItem[],
): string {
  const colorSet = new Set(savedOutfits.flatMap((o) => [o.top, o.bottom]));
  const worn = wardrobe.filter((w) => w.wearCount > 0).length;
  return `color variety: ${colorSet.size} unique pieces, wardrobe utilization: ${worn}/${wardrobe.length} items worn`;
}
