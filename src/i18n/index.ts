import type { AppLanguage } from '@/src/types';
import type { TranslationKey } from './types';
import en from './locales/en';
import de from './locales/de';

const locales = { en, de } as const;

export function translate(
  lang: AppLanguage,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  let text = locales[lang][key] ?? locales.en[key] ?? key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}

export { locales };
export type { TranslationKey };
export { LANGUAGE_LABELS } from './types';

export function localeTag(lang: AppLanguage): string {
  return lang === 'de' ? 'de-DE' : 'en-US';
}
