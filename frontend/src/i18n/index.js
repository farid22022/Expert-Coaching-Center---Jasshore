import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enPublic from "./locales/en/public.json";
import enAdmin from "./locales/en/admin.json";
import bnCommon from "./locales/bn/common.json";
import bnPublic from "./locales/bn/public.json";
import bnAdmin from "./locales/bn/admin.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, public: enPublic, admin: enAdmin },
      bn: { common: bnCommon, public: bnPublic, admin: bnAdmin },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "bn"],
    ns: ["common", "public", "admin"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    react: { useSuspense: false },
  });

export default i18n;
