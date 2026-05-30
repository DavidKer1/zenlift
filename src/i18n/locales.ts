export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export function resolveSupportedLanguage(locale: string | null | undefined): SupportedLanguage {
  if (!locale) {
    return DEFAULT_LANGUAGE;
  }

  const normalized = locale.trim().toLowerCase();

  if (normalized === 'es' || normalized.startsWith('es-') || normalized.startsWith('es_')) {
    return 'es';
  }

  if (normalized === 'en' || normalized.startsWith('en-') || normalized.startsWith('en_')) {
    return 'en';
  }

  return DEFAULT_LANGUAGE;
}

export function i18nLanguageToLocale(language: SupportedLanguage): string {
  return language === 'es' ? 'es-MX' : 'en-US';
}
