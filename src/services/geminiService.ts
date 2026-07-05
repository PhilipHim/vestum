import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  ClothingCategory,
  ColorPaletteResult,
  GeminiErrorCode,
  OutfitHistoryEntry,
  OutfitOfTheDay,
  SavedOutfit,
  StyleScoreResult,
  TrendCheckResult,
  WardrobeItem,
  WeatherInfo,
} from '@/src/types';
import {
  parseJsonFromText,
  validateClothingCategory,
  validateColorPalette,
  validateOutfitOfTheDay,
  validateTrendCheck,
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

async function generateJson(prompt: string): Promise<unknown> {
  assertApiKey();
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { responseMimeType: 'application/json' },
  });

  const result = await withTimeout(model.generateContent([prompt]), TIMEOUT_MS);
  return parseJsonFromText(result.response.text());
}

function handleGeminiError(err: unknown): never {
  if (err instanceof Error) {
    if (err.message === 'api_key_missing') throw err;
    if (err.message === 'timeout') throw new Error('timeout');
    if (err.message === 'invalid_response' || err.message === 'invalid_json') {
      throw new Error('invalid_response');
    }
  }
  throw new Error('network_error');
}

function outfitOfDayPrompt(
  wardrobe: WardrobeItem[],
  weather: WeatherInfo,
  recentOutfits: SavedOutfit[],
): string {
  const wardrobeJson = JSON.stringify(
    wardrobe.map((item) => ({
      name: `${item.color} ${item.type}`,
      type: item.type,
      color: item.color,
      season: item.season,
    })),
  );
  const historyJson = JSON.stringify(
    recentOutfits.slice(0, 7).map((o) => ({
      date: o.date,
      top: o.top,
      bottom: o.bottom,
      layer: o.optional_layer,
    })),
  );

  return `Based on this wardrobe, today's weather (${weather.temperature}°C, ${weather.description}), and recent outfit history, suggest one specific outfit.
Return ONLY valid JSON:
{
  "top": "item name from wardrobe or descriptive suggestion",
  "bottom": "item name",
  "optional_layer": "item name or null",
  "shoes_hint": "color/type suggestion",
  "reason": "one sentence why this works today",
  "shopping_suggestion": "missing piece suggestion or null"
}

Avoid repeating outfits worn in the last 7 days.
Wardrobe: ${wardrobeJson}
Recent history: ${historyJson}
Return only JSON, no markdown.`;
}

export async function getOutfitOfTheDay(
  wardrobe: WardrobeItem[],
  weather: WeatherInfo,
  recentOutfits: SavedOutfit[],
): Promise<OutfitOfTheDay> {
  try {
    const parsed = await generateJson(outfitOfDayPrompt(wardrobe, weather, recentOutfits));
    const validated = validateOutfitOfTheDay(parsed);
    if (!validated) throw new Error('invalid_response');
    return validated;
  } catch (err) {
    handleGeminiError(err);
  }
}

export async function getTrendCheck(
  type: string,
  color: string,
  season: string,
): Promise<TrendCheckResult> {
  const prompt = `Is a ${color} ${type} (${season} season) currently trendy in 2025/2026 fashion?
Return ONLY valid JSON:
{
  "is_trendy": boolean,
  "trend_score": number 1-10,
  "explanation": "2 sentences",
  "styling_tip": "one tip to make it work regardless of trend"
}
Return only JSON, no markdown.`;

  try {
    const parsed = await generateJson(prompt);
    const validated = validateTrendCheck(parsed);
    if (!validated) throw new Error('invalid_response');
    return validated;
  } catch (err) {
    handleGeminiError(err);
  }
}

export async function getStyleScoreTip(
  score: number,
  metrics: string,
  lang: 'en' | 'de' = 'en',
): Promise<string> {
  const language = lang === 'de' ? 'German' : 'English';
  const prompt = `A fashion app user has a Style Score of ${score}/100. Metrics: ${metrics}.
Return ONE short ${language} sentence tip to improve their style. Return only the sentence, no JSON.`;

  try {
    assertApiKey();
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await withTimeout(model.generateContent([prompt]), TIMEOUT_MS);
    return result.response.text().trim();
  } catch {
    return lang === 'de'
      ? 'Variiere deine Farben und trage mehr unterschiedliche Teile aus deinem Kleiderschrank.'
      : 'Mix up your colors and wear more different pieces from your wardrobe.';
  }
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

    const parsed = parseJsonFromText(result.response.text());
    const validated = validateColorPalette(parsed);
    if (!validated) throw new Error('invalid_response');
    return validated;
  } catch (err) {
    handleGeminiError(err);
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

    const parsed = parseJsonFromText(result.response.text());
    const validated = validateClothingCategory(parsed);
    if (!validated) throw new Error('invalid_response');
    return validated;
  } catch (err) {
    handleGeminiError(err);
  }
}

export function mapGeminiError(code: string): GeminiErrorCode {
  if (code === 'api_key_missing' || code === 'timeout' || code === 'invalid_response') {
    return code;
  }
  return 'network_error';
}
