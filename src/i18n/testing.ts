import i18n from '@/i18n/i18n';
import type { SupportedLanguage } from '@/i18n/locales';

export async function setTestLanguage(language: SupportedLanguage) {
  await i18n.changeLanguage(language);
}
