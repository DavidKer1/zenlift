import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE } from '@/i18n/locales';
import { defaultNS, resources } from '@/i18n/resources';

void i18n.use(initReactI18next).init({
  defaultNS,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
  lng: DEFAULT_LANGUAGE,
  resources,
  react: {
    useSuspense: false,
  },
});

export default i18n;
