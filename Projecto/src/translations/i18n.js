import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import pt from "./pt/tr_LandingPage.json";
import en from "./en/tr_LandingPage.json";
import es from "./es/tr_LandingPage.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es }
    },
    lng: "pt",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  }
);

export default i18n;