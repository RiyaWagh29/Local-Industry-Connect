import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import en from "./i18n/en.json";
import mr from "./i18n/mr.json";

export type Language = "en" | "mr";
type Translations = Record<string, string>;

const translations: Record<Language, Translations> = { en, mr };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  getLocalized: <T>(obj: T | Record<Language, T>) => T;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "mc_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === "mr" || stored === "en") ? stored as Language : "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let val = translations[language][key] ?? translations["en"][key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          val = val.replace(`{${k}}`, String(v));
        });
      }
      return val;
    },
    [language]
  );

  const getLocalized = useCallback(<T,>(obj: T | Record<Language, T>): T => {
    if (obj && typeof obj === 'object' && 'en' in obj && 'mr' in obj) {
      return (obj as Record<Language, T>)[language] || (obj as Record<Language, T>)['en'];
    }
    return obj as T;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
