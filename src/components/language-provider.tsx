"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultLang, text, type AppLang } from "@/lib/i18n";

type LangContextValue = {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  toggleLang: () => void;
};

const STORAGE_KEY = "jobradar.lang";

const LanguageContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AppLang>(defaultLang);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as AppLang | null;
    if (saved === "fr" || saved === "ar") {
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang === "ar" ? "ar" : "fr";
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang: (nextLang) => setLangState(nextLang),
      toggleLang: () => setLangState((current) => (current === "fr" ? "ar" : "fr"))
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}

export function useText() {
  const { lang } = useLanguage();
  return text[lang];
}
