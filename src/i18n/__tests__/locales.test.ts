import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  i18nLanguageToLocale,
  resolveSupportedLanguage,
} from '../locales';

describe('i18n locale resolution', () => {
  it('supports only Spanish and English', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'es']);
  });

  it('uses English as the fallback language', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
  });

  it.each([
    ['es', 'es'],
    ['es-MX', 'es'],
    ['es-ES', 'es'],
    ['es-419', 'es'],
    ['en', 'en'],
    ['en-US', 'en'],
    ['fr-FR', 'en'],
    [undefined, 'en'],
    [null, 'en'],
  ] as const)('resolves %s to %s', (locale, expected) => {
    expect(resolveSupportedLanguage(locale)).toBe(expected);
  });

  it('returns Intl locale tags for each app language', () => {
    expect(i18nLanguageToLocale('en')).toBe('en-US');
    expect(i18nLanguageToLocale('es')).toBe('es-MX');
  });
});
