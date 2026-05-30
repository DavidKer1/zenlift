import { getLocales } from 'expo-localization';
import React, { useEffect, useState, type PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n from '@/i18n/i18n';
import { DEFAULT_LANGUAGE, resolveSupportedLanguage } from '@/i18n/locales';

function getDeviceLanguage() {
  const [locale] = getLocales();
  return resolveSupportedLanguage(locale?.languageTag ?? locale?.languageCode);
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(() => i18n.language === getDeviceLanguage());

  useEffect(() => {
    let mounted = true;

    async function syncLanguage() {
      const language = getDeviceLanguage();

      if (i18n.language !== language) {
        await i18n.changeLanguage(language);
      }

      if (mounted) {
        setReady(true);
      }
    }

    syncLanguage().catch(() => {
      void i18n.changeLanguage(DEFAULT_LANGUAGE);
      if (mounted) {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
