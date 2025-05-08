import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en_common from '../locales/en/common.json';
import en_navigation from '../locales/en/navigation.json';
import en_dashboard from '../locales/en/dashboard.json';
import en_import from '../locales/en/import.json';
import en_settings from '../locales/en/settings.json';
import en_biview from '../locales/en/biview.json';

import kk_common from '../locales/kk/common.json';
import kk_navigation from '../locales/kk/navigation.json';
import kk_dashboard from '../locales/kk/dashboard.json';
import kk_import from '../locales/kk/import.json';
import kk_settings from '../locales/kk/settings.json';
import kk_biview from '../locales/kk/biview.json';

import ru_common from '../locales/ru/common.json';
import ru_navigation from '../locales/ru/navigation.json';
import ru_dashboard from '../locales/ru/dashboard.json';
import ru_import from '../locales/ru/import.json';
import ru_settings from '../locales/ru/settings.json';
import ru_biview from '../locales/ru/biview.json';

// Resources object with all translations
const resources = {
  en: {
    common: en_common,
    navigation: en_navigation,
    dashboard: en_dashboard,
    import: en_import,
    settings: en_settings,
    biview: en_biview
  },
  kk: {
    common: kk_common,
    navigation: kk_navigation,
    dashboard: kk_dashboard,
    import: kk_import,
    settings: kk_settings,
    biview: kk_biview
  },
  ru: {
    common: ru_common,
    navigation: ru_navigation,
    dashboard: ru_dashboard,
    import: ru_import,
    settings: ru_settings,
    biview: ru_biview
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Common namespaces across all pages
    ns: ['common', 'navigation', 'dashboard', 'import', 'settings', 'biview'],
    defaultNS: 'common',
    
    resources, // Pass the resources object with all translations
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Detection options
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n; 