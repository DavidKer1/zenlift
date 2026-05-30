import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { WeightUnit } from '@/features/settings/constants';
import { i18nLanguageToLocale, type SupportedLanguage } from '@/i18n/locales';

export function formatCompactDuration(
  seconds: number | null,
  _language: SupportedLanguage,
): string {
  if (seconds === null || seconds <= 0) {
    return '--';
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}min ${remainingSeconds}s` : `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}min`;
}

export function formatWeightValue(
  value: number,
  unit: WeightUnit,
  language: SupportedLanguage,
): string {
  const locale = i18nLanguageToLocale(language);
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);

  return `${formatted} ${unit}`;
}

function getSupportedLanguage(language: string): SupportedLanguage {
  return language === 'es' ? 'es' : 'en';
}

export function useI18nFormatters() {
  const { i18n } = useTranslation();
  const language = getSupportedLanguage(i18n.language);
  const locale = i18nLanguageToLocale(language);

  return useMemo(() => {
    const number = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
    const percent = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
      signDisplay: 'exceptZero',
      style: 'percent',
    });
    const shortDate = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
    });
    const month = new Intl.DateTimeFormat(locale, {
      month: 'short',
    });

    return {
      formatDuration: (seconds: number | null) => formatCompactDuration(seconds, language),
      formatMonth: (value: Date | string) => month.format(new Date(value)),
      formatNumber: (value: number) => number.format(value),
      formatPercent: (value: number) => percent.format(value / 100),
      formatShortDate: (value: Date | string) => shortDate.format(new Date(value)),
      formatVolume: (value: number, unit: WeightUnit) => `${number.format(value)} ${unit}`,
      formatWeight: (value: number, unit: WeightUnit) => formatWeightValue(value, unit, language),
      language,
      locale,
    };
  }, [language, locale]);
}
