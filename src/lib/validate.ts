import type {
  ClothingCategory,
  ColorPaletteResult,
  DailyOutfitRecommendation,
  OutfitHistoryEntry,
  OutfitOfTheDay,
  SavedOutfit,
  TrendCheckResult,
  UserSettings,
  WardrobeItem,
} from '@/src/types';

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function parseJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error('invalid_json');
  }
}

export function validateColorPalette(data: unknown): ColorPaletteResult | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (!isString(obj.skin_tone)) return null;
  if (!isString(obj.hair_color)) return null;
  if (!isString(obj.eye_color)) return null;
  if (!isString(obj.season)) return null;
  if (!isString(obj.explanation)) return null;
  if (!isStringArray(obj.palette) || obj.palette.length < 5) return null;
  if (!isStringArray(obj.avoid_colors) || obj.avoid_colors.length < 3) return null;

  const palette = obj.palette.filter((c) => isHexColor(c)).slice(0, 5);
  const avoid = obj.avoid_colors.filter((c) => isHexColor(c)).slice(0, 3);

  if (palette.length < 5 || avoid.length < 3) return null;

  return {
    skin_tone: obj.skin_tone,
    hair_color: obj.hair_color,
    eye_color: obj.eye_color,
    season: obj.season,
    palette,
    avoid_colors: avoid,
    explanation: obj.explanation,
  };
}

export function validateClothingCategory(data: unknown): ClothingCategory | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (!isString(obj.type)) return null;
  if (!isString(obj.color)) return null;
  if (!isString(obj.season)) return null;

  return {
    type: obj.type,
    color: obj.color,
    season: obj.season,
  };
}

export function validateOutfitOfTheDay(data: unknown): OutfitOfTheDay | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (!isString(obj.top)) return null;
  if (!isString(obj.bottom)) return null;
  if (obj.optional_layer !== null && !isString(obj.optional_layer)) return null;
  if (!isString(obj.shoes_hint)) return null;
  if (!isString(obj.reason)) return null;

  return {
    top: obj.top,
    bottom: obj.bottom,
    optional_layer: obj.optional_layer as string | null,
    shoes_hint: obj.shoes_hint,
    reason: obj.reason,
    shopping_suggestion:
      obj.shopping_suggestion === null || obj.shopping_suggestion === undefined
        ? null
        : isString(obj.shopping_suggestion)
          ? obj.shopping_suggestion
          : null,
  };
}

export function validateTrendCheck(data: unknown): TrendCheckResult | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (typeof obj.is_trendy !== 'boolean') return null;
  if (typeof obj.trend_score !== 'number') return null;
  if (!isString(obj.explanation)) return null;
  if (!isString(obj.styling_tip)) return null;

  let badge: TrendCheckResult['badge'] = 'Klassiker';
  if (obj.is_trendy && obj.trend_score >= 7) badge = 'On Trend';
  else if (!obj.is_trendy && obj.trend_score <= 4) badge = 'Veraltet';

  return {
    is_trendy: obj.is_trendy,
    trend_score: obj.trend_score,
    explanation: obj.explanation,
    styling_tip: obj.styling_tip,
    badge,
  };
}

export function validateSavedOutfit(data: unknown): SavedOutfit | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (!isString(obj.id)) return null;
  if (!isString(obj.date)) return null;
  if (!isString(obj.top)) return null;
  if (!isString(obj.bottom)) return null;
  if (obj.optional_layer !== null && obj.optional_layer !== undefined && !isString(obj.optional_layer))
    return null;
  if (!isString(obj.shoes_hint)) return null;
  if (!isString(obj.reason)) return null;

  return {
    id: obj.id,
    date: obj.date,
    top: obj.top,
    bottom: obj.bottom,
    optional_layer: (obj.optional_layer as string | null) ?? null,
    shoes_hint: obj.shoes_hint,
    reason: obj.reason,
    photoUri: isString(obj.photoUri) ? obj.photoUri : undefined,
    caption: isString(obj.caption) ? obj.caption : undefined,
    paletteColors: isStringArray(obj.paletteColors) ? obj.paletteColors : undefined,
  };
}

export function validateDailyOutfit(data: unknown): DailyOutfitRecommendation | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (!isStringArray(obj.outfit_items)) return null;
  if (!isString(obj.outfit_description)) return null;
  if (!isString(obj.weather_note)) return null;
  if (obj.repetition_warning !== null && !isString(obj.repetition_warning)) return null;
  if (obj.shopping_suggestion !== null && !isString(obj.shopping_suggestion)) return null;

  return {
    outfit_items: obj.outfit_items,
    outfit_description: obj.outfit_description,
    weather_note: obj.weather_note,
    repetition_warning: obj.repetition_warning as string | null,
    shopping_suggestion: obj.shopping_suggestion as string | null,
  };
}

export function validateWardrobeItem(data: unknown): WardrobeItem | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (!isString(obj.id)) return null;
  if (!isString(obj.imageUri)) return null;
  if (!isString(obj.type)) return null;
  if (!isString(obj.color)) return null;
  if (!isString(obj.season)) return null;
  if (!isString(obj.createdAt)) return null;
  if (typeof obj.wearCount !== 'number') return null;

  return {
    id: obj.id,
    imageUri: obj.imageUri,
    type: obj.type,
    color: obj.color,
    season: obj.season,
    createdAt: obj.createdAt,
    lastWorn: isString(obj.lastWorn) ? obj.lastWorn : undefined,
    wearCount: obj.wearCount,
  };
}

export function validateOutfitHistory(data: unknown): OutfitHistoryEntry[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object')
    .filter((entry) => isString(entry.itemId) && isString(entry.wornDate))
    .map((entry) => ({
      itemId: entry.itemId as string,
      wornDate: entry.wornDate as string,
    }));
}

export function validateSettings(data: unknown): UserSettings | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (typeof obj.notificationsEnabled !== 'boolean') return null;
  if (typeof obj.useLocation !== 'boolean') return null;

  const language = obj.language === 'de' ? 'de' : 'en';

  return {
    notificationsEnabled: obj.notificationsEnabled,
    useLocation: obj.useLocation,
    language,
  };
}

export function daysSince(dateIso: string): number {
  const target = new Date(dateIso);
  if (Number.isNaN(target.getTime())) return Infinity;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
}

export function wasWornInLastDays(
  itemId: string,
  history: OutfitHistoryEntry[],
  days: number,
): boolean {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return history.some((entry) => {
    if (entry.itemId !== itemId) return false;
    const worn = new Date(entry.wornDate);
    return !Number.isNaN(worn.getTime()) && worn >= cutoff;
  });
}

export function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Autumn';
  return 'Winter';
}
