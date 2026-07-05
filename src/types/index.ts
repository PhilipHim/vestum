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
}

export interface OutfitHistoryEntry {
  itemId: string;
  wornDate: string;
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

export interface UserSettings {
  notificationsEnabled: boolean;
  useLocation: boolean;
}

export type GeminiErrorCode =
  | 'api_key_missing'
  | 'timeout'
  | 'invalid_response'
  | 'network_error';
