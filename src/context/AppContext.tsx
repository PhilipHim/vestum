import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  ColorPaletteResult,
  OutfitHistoryEntry,
  OutfitOfTheDay,
  SavedOutfit,
  UserSettings,
  WardrobeItem,
  WeatherInfo,
} from '@/src/types';
import {
  addSavedOutfit,
  addWardrobeItem,
  getColorPalette,
  getOutfitHistory,
  getOutfitOfDay,
  getOutfitOfDayDate,
  getSavedOutfits,
  getSettings,
  getWardrobe,
  isOnboarded,
  removeWardrobeItem,
  saveColorPalette,
  saveOutfitOfDay,
  saveSettings,
  clearOnboarded,
  setOnboarded,
  todayKey,
  updateWardrobeItem,
} from '@/src/services/storage';
import { translate } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import { scheduleSeasonNotifications } from '@/src/services/notificationService';
import { fetchWeather } from '@/src/services/weatherService';
import type { AppLanguage } from '@/src/types';

interface AppContextValue {
  wardrobe: WardrobeItem[];
  outfitHistory: OutfitHistoryEntry[];
  savedOutfits: SavedOutfit[];
  colorPalette: ColorPaletteResult | null;
  settings: UserSettings;
  weather: WeatherInfo | null;
  outfitOfDay: OutfitOfTheDay | null;
  ready: boolean;
  onboarded: boolean | null;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  refreshWardrobe: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  refreshSavedOutfits: () => Promise<void>;
  refreshPalette: () => Promise<void>;
  refreshWeather: () => Promise<void>;
  refreshOutfitOfDay: () => Promise<void>;
  addItem: (item: WardrobeItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleForSale: (id: string) => Promise<void>;
  setPalette: (palette: ColorPaletteResult) => Promise<void>;
  updateSettings: (settings: UserSettings) => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  setOutfitOfDay: (outfit: OutfitOfTheDay) => Promise<void>;
  saveOutfit: (outfit: SavedOutfit) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [outfitHistory, setOutfitHistory] = useState<OutfitHistoryEntry[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [colorPalette, setColorPaletteState] = useState<ColorPaletteResult | null>(null);
  const [settings, setSettingsState] = useState<UserSettings>({
    notificationsEnabled: true,
    useLocation: true,
    language: 'en',
  });
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [outfitOfDay, setOutfitOfDayState] = useState<OutfitOfTheDay | null>(null);
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboardedState] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    const [items, history, outfits, palette, userSettings, onboardedFlag, oodDate, ood] =
      await Promise.all([
        getWardrobe(),
        getOutfitHistory(),
        getSavedOutfits(),
        getColorPalette(),
        getSettings(),
        isOnboarded(),
        getOutfitOfDayDate(),
        getOutfitOfDay(),
      ]);
    setWardrobe(items);
    setOutfitHistory(history);
    setSavedOutfits(outfits);
    setColorPaletteState(palette);
    setSettingsState(userSettings);
    setOnboardedState(onboardedFlag);
    if (oodDate === todayKey() && ood) {
      setOutfitOfDayState(ood);
    }
    setReady(true);
    void fetchWeather(userSettings.useLocation).then(setWeather);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshWardrobe = useCallback(async () => {
    setWardrobe(await getWardrobe());
  }, []);

  const refreshHistory = useCallback(async () => {
    setOutfitHistory(await getOutfitHistory());
  }, []);

  const refreshSavedOutfits = useCallback(async () => {
    setSavedOutfits(await getSavedOutfits());
  }, []);

  const refreshPalette = useCallback(async () => {
    setColorPaletteState(await getColorPalette());
  }, []);

  const refreshWeather = useCallback(async () => {
    const userSettings = await getSettings();
    setWeather(await fetchWeather(userSettings.useLocation));
  }, []);

  const refreshOutfitOfDay = useCallback(async () => {
    const [oodDate, ood] = await Promise.all([getOutfitOfDayDate(), getOutfitOfDay()]);
    if (oodDate === todayKey() && ood) {
      setOutfitOfDayState(ood);
    } else {
      setOutfitOfDayState(null);
    }
  }, []);

  const addItem = useCallback(async (item: WardrobeItem) => {
    setWardrobe(await addWardrobeItem(item));
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setWardrobe(await removeWardrobeItem(id));
  }, []);

  const toggleForSale = useCallback(async (id: string) => {
    const item = wardrobe.find((w) => w.id === id);
    if (!item) return;
    setWardrobe(await updateWardrobeItem(id, { forSale: !item.forSale }));
  }, [wardrobe]);

  const setPalette = useCallback(async (palette: ColorPaletteResult) => {
    await saveColorPalette(palette);
    setColorPaletteState(palette);
  }, []);

  const updateSettings = useCallback(async (next: UserSettings) => {
    await saveSettings(next);
    setSettingsState(next);
    if (next.useLocation !== settings.useLocation) {
      setWeather(await fetchWeather(next.useLocation));
    }
    if (next.language !== settings.language && next.notificationsEnabled) {
      void scheduleSeasonNotifications(next.language);
    }
  }, [settings.useLocation, settings.language]);

  const setLanguage = useCallback(
    async (language: AppLanguage) => {
      await updateSettings({ ...settings, language });
    },
    [settings, updateSettings],
  );

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(settings.language, key, params),
    [settings.language],
  );

  const completeOnboarding = useCallback(async () => {
    await setOnboarded();
    setOnboardedState(true);
    const userSettings = await getSettings();
    void scheduleSeasonNotifications(userSettings.language);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await clearOnboarded();
    setOnboardedState(false);
  }, []);

  const setOutfitOfDay = useCallback(async (outfit: OutfitOfTheDay) => {
    await saveOutfitOfDay(outfit);
    setOutfitOfDayState(outfit);
  }, []);

  const saveOutfit = useCallback(async (outfit: SavedOutfit) => {
    setSavedOutfits(await addSavedOutfit(outfit));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      wardrobe,
      outfitHistory,
      savedOutfits,
      colorPalette,
      settings,
      weather,
      outfitOfDay,
      ready,
      onboarded,
      completeOnboarding,
      resetOnboarding,
      refreshWardrobe,
      refreshHistory,
      refreshSavedOutfits,
      refreshPalette,
      refreshWeather,
      refreshOutfitOfDay,
      addItem,
      deleteItem,
      toggleForSale,
      setPalette,
      updateSettings,
      setLanguage,
      t,
      setOutfitOfDay,
      saveOutfit,
    }),
    [
      wardrobe,
      outfitHistory,
      savedOutfits,
      colorPalette,
      settings,
      weather,
      outfitOfDay,
      ready,
      onboarded,
      completeOnboarding,
      resetOnboarding,
      refreshWardrobe,
      refreshHistory,
      refreshSavedOutfits,
      refreshPalette,
      refreshWeather,
      refreshOutfitOfDay,
      addItem,
      deleteItem,
      toggleForSale,
      setPalette,
      updateSettings,
      setLanguage,
      t,
      setOutfitOfDay,
      saveOutfit,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
