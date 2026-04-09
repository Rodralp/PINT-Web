import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import pt from "./pt/tr_LandingPage.json";
import en from "./en/tr_LandingPage.json";
import es from "./es/tr_LandingPage.json";

const STORAGE_KEY = "preferredLanguage";
const SUPPORTED_LANGUAGES = ["pt", "en", "es"];

const normalizeLanguage = (language) => {
  if (!language) {
    return "pt";
  }

  const normalized = language.toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(normalized)) {
    return normalized;
  }

  const baseLanguage = normalized.split("-")[0];
  return SUPPORTED_LANGUAGES.includes(baseLanguage) ? baseLanguage : "pt";
};

const getInitialLanguage = () => {
  if (typeof window === "undefined") {
    return "pt";
  }

  try {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
    return normalizeLanguage(savedLanguage);
  } catch {
    return "pt";
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es }
    },
    lng: getInitialLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  }
);

if (typeof window !== "undefined") {
  i18n.on("languageChanged", (language) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, normalizeLanguage(language));
    } catch {
      // Ignore storage errors (private mode, blocked storage, etc.)
    }
  });
}

export default i18n;