import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  ColorPaletteResult,
  DailyOutfitRecommendation,
  OutfitHistoryEntry,
  UserSettings,
  WardrobeItem,
  WeatherInfo,
} from '@/src/types';
import {
  addWardrobeItem,
  getColorPalette,
  getOutfitHistory,
  getSettings,
  getWardrobe,
  isOnboarded,
  removeWardrobeItem,
  saveColorPalette,
  saveSettings,
  clearOnboarded,
  setOnboarded,
} from '@/src/services/storage';
import { fetchWeather } from '@/src/services/weatherService';

interface AppContextValue {
  wardrobe: WardrobeItem[];
  outfitHistory: OutfitHistoryEntry[];
  colorPalette: ColorPaletteResult | null;
  settings: UserSettings;
  weather: WeatherInfo | null;
  dailyOutfit: DailyOutfitRecommendation | null;
  ready: boolean;
  onboarded: boolean | null;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  refreshWardrobe: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  refreshPalette: () => Promise<void>;
  refreshWeather: () => Promise<void>;
  addItem: (item: WardrobeItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setPalette: (palette: ColorPaletteResult) => Promise<void>;
  updateSettings: (settings: UserSettings) => Promise<void>;
  setDailyOutfit: (outfit: DailyOutfitRecommendation | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [outfitHistory, setOutfitHistory] = useState<OutfitHistoryEntry[]>([]);
  const [colorPalette, setColorPaletteState] = useState<ColorPaletteResult | null>(null);
  const [settings, setSettingsState] = useState<UserSettings>({
    notificationsEnabled: true,
    useLocation: true,
  });
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [dailyOutfit, setDailyOutfit] = useState<DailyOutfitRecommendation | null>(null);
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboardedState] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    const [items, history, palette, userSettings, onboardedFlag] = await Promise.all([
      getWardrobe(),
      getOutfitHistory(),
      getColorPalette(),
      getSettings(),
      isOnboarded(),
    ]);
    setWardrobe(items);
    setOutfitHistory(history);
    setColorPaletteState(palette);
    setSettingsState(userSettings);
    setOnboardedState(onboardedFlag);
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

  const refreshPalette = useCallback(async () => {
    setColorPaletteState(await getColorPalette());
  }, []);

  const refreshWeather = useCallback(async () => {
    const userSettings = await getSettings();
    setWeather(await fetchWeather(userSettings.useLocation));
  }, []);

  const addItem = useCallback(async (item: WardrobeItem) => {
    const updated = await addWardrobeItem(item);
    setWardrobe(updated);
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const updated = await removeWardrobeItem(id);
    setWardrobe(updated);
  }, []);

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
  }, [settings.useLocation]);

  const completeOnboarding = useCallback(async () => {
    await setOnboarded();
    setOnboardedState(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await clearOnboarded();
    setOnboardedState(false);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      wardrobe,
      outfitHistory,
      colorPalette,
      settings,
      weather,
      dailyOutfit,
      ready,
      onboarded,
      completeOnboarding,
      resetOnboarding,
      refreshWardrobe,
      refreshHistory,
      refreshPalette,
      refreshWeather,
      addItem,
      deleteItem,
      setPalette,
      updateSettings,
      setDailyOutfit,
    }),
    [
      wardrobe,
      outfitHistory,
      colorPalette,
      settings,
      weather,
      dailyOutfit,
      ready,
      onboarded,
      completeOnboarding,
      resetOnboarding,
      refreshWardrobe,
      refreshHistory,
      refreshPalette,
      refreshWeather,
      addItem,
      deleteItem,
      setPalette,
      updateSettings,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
