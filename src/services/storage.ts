import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ColorPaletteResult,
  OutfitHistoryEntry,
  OutfitOfTheDay,
  SavedOutfit,
  UserSettings,
  WardrobeItem,
} from '@/src/types';

export const STORAGE_KEYS = {
  wardrobe: 'vestum_wardrobe',
  outfitHistory: 'vestum_outfit_history',
  savedOutfits: 'vestum_saved_outfits',
  outfitOfDay: 'vestum_outfit_of_day',
  outfitOfDayDate: 'vestum_outfit_of_day_date',
  colorPalette: 'vestum_color_palette',
  settings: 'vestum_settings',
  onboarded: 'vestum_onboarded_v1',
} as const;

const DEFAULT_SETTINGS: UserSettings = {
  notificationsEnabled: true,
  useLocation: true,
  language: 'en',
};

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

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

export async function updateWardrobeItem(
  id: string,
  patch: Partial<WardrobeItem>,
): Promise<WardrobeItem[]> {
  const existing = await getWardrobe();
  const updated = existing.map((item) => (item.id === id ? { ...item, ...patch } : item));
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

export async function getSavedOutfits(): Promise<SavedOutfit[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.savedOutfits);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedOutfit[];
  } catch {
    return [];
  }
}

export async function saveSavedOutfits(outfits: SavedOutfit[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.savedOutfits, JSON.stringify(outfits));
}

export async function addSavedOutfit(outfit: SavedOutfit): Promise<SavedOutfit[]> {
  const existing = await getSavedOutfits();
  const filtered = existing.filter((o) => o.date !== outfit.date);
  const updated = [outfit, ...filtered];
  await saveSavedOutfits(updated);
  return updated;
}

export async function getOutfitOfDayDate(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.outfitOfDayDate);
}

export async function getOutfitOfDay(): Promise<OutfitOfTheDay | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.outfitOfDay);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OutfitOfTheDay;
  } catch {
    return null;
  }
}

export async function saveOutfitOfDay(outfit: OutfitOfTheDay): Promise<void> {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.outfitOfDay, JSON.stringify(outfit)],
    [STORAGE_KEYS.outfitOfDayDate, todayKey()],
  ]);
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

export async function clearOnboarded(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.onboarded);
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

export function getOppositeSeason(season: string): string {
  const s = season.toLowerCase();
  if (s === 'spring') return 'Autumn';
  if (s === 'summer') return 'Winter';
  if (s === 'autumn') return 'Spring';
  if (s === 'winter') return 'Summer';
  return 'Summer';
}
