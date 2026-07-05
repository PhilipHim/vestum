import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  ClothingCategory,
  ColorPaletteResult,
  DailyOutfitRecommendation,
  GeminiErrorCode,
  OutfitHistoryEntry,
  WardrobeItem,
  WeatherInfo,
} from '@/src/types';
import {
  parseJsonFromText,
  validateClothingCategory,
  validateColorPalette,
  validateDailyOutfit,
} from '@/src/lib/validate';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-2.5-flash';
const TIMEOUT_MS = 45000;

const COLOR_SYSTEM_PROMPT = `You are an expert fashion consultant and color theorist. Analyze this selfie and return ONLY a valid JSON object with these fields:
{
  "skin_tone": "description",
  "hair_color": "description",
  "eye_color": "description",
  "season": "e.g., Cool Summer, Warm Autumn",
  "palette": ["array of 5 perfect matching color HEX codes"],
  "avoid_colors": ["array of 3 color HEX codes that make the user look washed out"],
  "explanation": "2-3 sentences explaining why this palette works"
}
Always validate JSON before rendering. Return only JSON, no markdown.`;

const CLOTHING_SYSTEM_PROMPT = `You are a fashion wardrobe assistant. Analyze this clothing item photo and return ONLY a valid JSON object with these fields:
{
  "type": "e.g., Shirt, Jacket, Pants, Dress, Shoes",
  "color": "primary color name",
  "season": "Spring, Summer, Autumn, or Winter"
}
Return only JSON, no markdown.`;

function assertApiKey(): void {
  if (!API_KEY || API_KEY.includes('your_') || API_KEY.includes('dein_')) {
    throw new Error('api_key_missing');
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

function outfitSystemPrompt(
  palette: ColorPaletteResult | null,
  weather: WeatherInfo,
  wardrobe: WardrobeItem[],
  history: OutfitHistoryEntry[],
): string {
  const wardrobeJson = JSON.stringify(
    wardrobe.map((item) => ({
      id: item.id,
      type: item.type,
      color: item.color,
      season: item.season,
      lastWorn: item.lastWorn ?? null,
      wearCount: item.wearCount,
    })),
  );

  const historyJson = JSON.stringify(history.slice(0, 50));
  const paletteJson = palette ? JSON.stringify(palette) : 'null';

  return `You are an expert fashion stylist. Based on the user's color palette, current weather, wardrobe, and wear history, return ONLY a valid JSON object with these fields:
{
  "outfit_items": ["array of wardrobe item types/names to wear today"],
  "outfit_description": "2-3 sentences describing the recommended outfit",
  "weather_note": "brief note on how weather influences the choice",
  "repetition_warning": "warning if any suggested items were worn in the last 7 days, or null",
  "shopping_suggestion": "suggest a missing wardrobe piece that would unlock new outfits, or null"
}

Rules:
- Prefer items NOT worn in the last 7 days (check history).
- Match colors to the user's seasonal palette when possible.
- Weather: ${weather.temperature}C, ${weather.description}.
- User palette: ${paletteJson}
- Wardrobe: ${wardrobeJson}
- Wear history: ${historyJson}

Return only JSON, no markdown.`;
}

export async function analyzeSelfie(
  base64Image: string,
  mimeType = 'image/jpeg',
): Promise<ColorPaletteResult> {
  assertApiKey();

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { responseMimeType: 'application/json' },
  });

  try {
    const result = await withTimeout(
      model.generateContent([
        COLOR_SYSTEM_PROMPT,
        { inlineData: { mimeType, data: base64Image } },
      ]),
      TIMEOUT_MS,
    );

    const text = result.response.text();
    const parsed = parseJsonFromText(text);
    const validated = validateColorPalette(parsed);
    if (!validated) throw new Error('invalid_response');
    return validated;
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'api_key_missing') throw err;
      if (err.message === 'timeout') throw new Error('timeout');
      if (err.message === 'invalid_response' || err.message === 'invalid_json') {
        throw new Error('invalid_response');
      }
    }
    throw new Error('network_error');
  }
}

export async function categorizeClothing(
  base64Image: string,
  mimeType = 'image/jpeg',
): Promise<ClothingCategory> {
  assertApiKey();

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { responseMimeType: 'application/json' },
  });

  try {
    const result = await withTimeout(
      model.generateContent([
        CLOTHING_SYSTEM_PROMPT,
        { inlineData: { mimeType, data: base64Image } },
      ]),
      TIMEOUT_MS,
    );

    const text = result.response.text();
    const parsed = parseJsonFromText(text);
    const validated = validateClothingCategory(parsed);
    if (!validated) throw new Error('invalid_response');
    return validated;
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'api_key_missing') throw err;
      if (err.message === 'timeout') throw new Error('timeout');
      if (err.message === 'invalid_response' || err.message === 'invalid_json') {
        throw new Error('invalid_response');
      }
    }
    throw new Error('network_error');
  }
}

export async function getDailyOutfitRecommendation(
  palette: ColorPaletteResult | null,
  weather: WeatherInfo,
  wardrobe: WardrobeItem[],
  history: OutfitHistoryEntry[],
): Promise<DailyOutfitRecommendation> {
  assertApiKey();

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { responseMimeType: 'application/json' },
  });

  try {
    const result = await withTimeout(
      model.generateContent([outfitSystemPrompt(palette, weather, wardrobe, history)]),
      TIMEOUT_MS,
    );

    const text = result.response.text();
    const parsed = parseJsonFromText(text);
    const validated = validateDailyOutfit(parsed);
    if (!validated) throw new Error('invalid_response');
    return validated;
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'api_key_missing') throw err;
      if (err.message === 'timeout') throw new Error('timeout');
      if (err.message === 'invalid_response' || err.message === 'invalid_json') {
        throw new Error('invalid_response');
      }
    }
    throw new Error('network_error');
  }
}

export function mapGeminiError(code: string): GeminiErrorCode {
  if (code === 'api_key_missing' || code === 'timeout' || code === 'invalid_response') {
    return code;
  }
  return 'network_error';
}
