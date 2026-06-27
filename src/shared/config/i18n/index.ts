import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { pt } from './locales/pt';
import { en } from './locales/en';

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'pt';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt,
      en,
    },
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;