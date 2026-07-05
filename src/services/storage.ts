import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ColorPaletteResult,
  OutfitHistoryEntry,
  UserSettings,
  WardrobeItem,
} from '@/src/types';

export const STORAGE_KEYS = {
  wardrobe: 'vestum_wardrobe',
  outfitHistory: 'vestum_outfit_history',
  colorPalette: 'vestum_color_palette',
  settings: 'vestum_settings',
  onboarded: 'vestum_onboarded_v1',
} as const;

const DEFAULT_SETTINGS: UserSettings = {
  notificationsEnabled: true,
  useLocation: true,
};

export async function getWardrobe(): Promise<WardrobeItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.wardrobe);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WardrobeItem[];
  } catch {
    return [];
  }
}

export async function saveWardrobe(items: WardrobeItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.wardrobe, JSON.stringify(items));
}

export async function addWardrobeItem(item: WardrobeItem): Promise<WardrobeItem[]> {
  const existing = await getWardrobe();
  const updated = [item, ...existing];
  await saveWardrobe(updated);
  return updated;
}

export async function removeWardrobeItem(id: string): Promise<WardrobeItem[]> {
  const existing = await getWardrobe();
  const updated = existing.filter((item) => item.id !== id);
  await saveWardrobe(updated);
  return updated;
}

export async function getOutfitHistory(): Promise<OutfitHistoryEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.outfitHistory);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OutfitHistoryEntry[];
  } catch {
    return [];
  }
}

export async function saveOutfitHistory(history: OutfitHistoryEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.outfitHistory, JSON.stringify(history));
}

export async function recordOutfitWorn(itemIds: string[]): Promise<OutfitHistoryEntry[]> {
  const today = new Date().toISOString().slice(0, 10);
  const existing = await getOutfitHistory();
  const newEntries = itemIds.map((itemId) => ({ itemId, wornDate: today }));
  const updated = [...newEntries, ...existing];
  await saveOutfitHistory(updated);

  const wardrobe = await getWardrobe();
  const updatedWardrobe = wardrobe.map((item) =>
    itemIds.includes(item.id)
      ? { ...item, lastWorn: today, wearCount: item.wearCount + 1 }
      : item,
  );
  await saveWardrobe(updatedWardrobe);

  return updated;
}

export async function getColorPalette(): Promise<ColorPaletteResult | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.colorPalette);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ColorPaletteResult;
  } catch {
    return null;
  }
}

export async function saveColorPalette(palette: ColorPaletteResult): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.colorPalette, JSON.stringify(palette));
}

export async function clearColorPalette(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.colorPalette);
}

export async function getSettings(): Promise<UserSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.settings);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as UserSettings) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export async function isOnboarded(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.onboarded);
  return value === 'true';
}

export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.onboarded, 'true');
}

export function computeNeverWornPercent(items: WardrobeItem[]): number {
  if (items.length === 0) return 0;
  const neverWorn = items.filter((item) => item.wearCount === 0).length;
  return Math.round((neverWorn / items.length) * 100);
}

export function getOutOfSeasonUnworn(items: WardrobeItem[], currentSeason: string): WardrobeItem[] {
  return items.filter(
    (item) => item.wearCount === 0 && item.season.toLowerCase() !== currentSeason.toLowerCase(),
  );
}
