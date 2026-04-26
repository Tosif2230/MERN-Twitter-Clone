import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import zh from "./locales/zh.json";
import fr from "./locales/fr.json";

const resources = {
  en: { translation: en.translation },
  hi: { translation: hi.translation },
  es: { translation: es.translation },
  pt: { translation: pt.translation },
  zh: { translation: zh.translation },
  fr: { translation: fr.translation },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "en",
      supportedLngs: ["en", "hi", "es", "pt", "zh", "fr"],
      load: "languageOnly",
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
        lookupLocalStorage: "i18nextLng",
      },
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      resources,
    });
}

export default i18n;
