import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uk from "./locales/uk.json";

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

/** English is a separate chunk: Ukrainian visitors (the majority) never download it. */
const loadEnglish = async () => {
  if (i18n.hasResourceBundle("en", "translation")) return;
  const { default: en } = await import("./locales/en.json");
  i18n.addResourceBundle("en", "translation", en, true, true);
};

i18n.use(initReactI18next).init({
  resources: {
    uk: { translation: uk },
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

/** Resolves once the saved language is ready — render the app after it to avoid a flash of Ukrainian. */
export const i18nReady: Promise<void> =
  savedLang === "en" ? loadEnglish() : Promise.resolve();

/** Switch language, fetching the translation chunk first if needed. */
export const changeSiteLanguage = async (lng: SupportedLang) => {
  if (lng === "en") await loadEnglish();
  await i18n.changeLanguage(lng);
};

export default i18n;
