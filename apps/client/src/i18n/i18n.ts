import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uk from "./locales/uk.json";
import en from "./locales/en.json";

const SUPPORTED_LANGS = ["uk", "en"] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const getInitialLanguage = (): SupportedLang => {
  const saved = localStorage.getItem("lang");
  return saved === "en" ? "en" : "uk";
};

const savedLang = getInitialLanguage();

const applySiteLanguage = (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.setAttribute("translate", "no");
  document.documentElement.classList.add("notranslate");

  document.body.setAttribute("translate", "no");
  document.body.classList.add("notranslate");

  const root = document.getElementById("root");
  root?.setAttribute("translate", "no");
  root?.classList.add("notranslate");

  document
    .getElementById("content-language-meta")
    ?.setAttribute("content", lng);
};

applySiteLanguage(savedLang);

i18n.use(initReactI18next).init({
  resources: {
    uk: { translation: uk },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: "uk",
  supportedLngs: ["uk", "en"],
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
  applySiteLanguage(lng);
});

export default i18n;
