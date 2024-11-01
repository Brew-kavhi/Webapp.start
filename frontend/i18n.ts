import i18next from '/node_modules/i18next';
import enTranslations from './locales/en/common.json';
import deTranslations from './locales/de/common.json';

i18next.init({
  resources: {
    en: { common: enTranslations },
    de: { common: deTranslations }
  },
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false
  }
});

export default i18next;

