export interface ColorPaletteResult {
  skin_tone: string;
  hair_color: string;
  eye_color: string;
  season: string;
  palette: string[];
  avoid_colors: string[];
  explanation: string;
}

export interface WardrobeItem {
  id: string;
  imageUri: string;
  type: string;
  color: string;
  season: string;
  createdAt: string;
  lastWorn?: string;
  wearCount: number;
  forSale?: boolean;
}

/** Legacy per-item wear tracking */
export interface OutfitHistoryEntry {
  itemId: string;
  wornDate: string;
}

/** Outfit des Tages from Gemini */
export interface OutfitOfTheDay {
  top: string;
  bottom: string;
  optional_layer: string | null;
  shoes_hint: string;
  reason: string;
  shopping_suggestion?: string | null;
}

/** Full saved outfit record for calendar */
export interface SavedOutfit {
  id: string;
  date: string;
  top: string;
  bottom: string;
  optional_layer: string | null;
  shoes_hint: string;
  reason: string;
  photoUri?: string;
  caption?: string;
  paletteColors?: string[];
}

export interface TrendCheckResult {
  is_trendy: boolean;
  trend_score: number;
  explanation: string;
  styling_tip: string;
  badge: 'On Trend' | 'Klassiker' | 'Veraltet';
}

export interface ClothingCategory {
  type: string;
  color: string;
  season: string;
}

export interface DailyOutfitRecommendation {
  outfit_items: string[];
  outfit_description: string;
  weather_note: string;
  repetition_warning: string | null;
  shopping_suggestion: string | null;
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  description: string;
}

export type AppLanguage = 'en' | 'de';

export interface UserSettings {
  notificationsEnabled: boolean;
  useLocation: boolean;
  language: AppLanguage;
}

export interface StyleScoreResult {
  score: number;
  tip: string;
}

export type GeminiErrorCode =
  | 'api_key_missing'
  | 'timeout'
  | 'invalid_response'
  | 'network_error';

export type WardrobeFilter = 'all' | 'for_sale';
