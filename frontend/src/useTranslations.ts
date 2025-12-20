import { useState } from 'react';
import { translations, Translations, Language } from './i18n';

interface UseTranslationsReturn {
  t: Translations;
  lang: Language;
  setLang: (lang: Language) => void;
}

export function useTranslations(
  defaultLang: Language = 'no'
): UseTranslationsReturn {
  const [lang, setLang] = useState<Language>(defaultLang);
  const t: Translations = translations[lang] || translations.no;

  return { t, lang, setLang };
}
