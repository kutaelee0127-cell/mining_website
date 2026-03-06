import enUS from "./locales/en-US.json";
import koKR from "./locales/ko-KR.json";

export type LocaleCode = "ko-KR" | "en-US";

const LANGUAGE_STORAGE_KEY = "mining.lang";

const dictionaries: Record<LocaleCode, Record<string, string>> = {
  "ko-KR": koKR,
  "en-US": enUS,
};

export function readInitialLocale(storage: Pick<Storage, "getItem"> | null): LocaleCode {
  if (!storage) {
    return "ko-KR";
  }

  const stored = storage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "ko-KR" || stored === "en-US") {
    return stored;
  }

  return "ko-KR";
}

export function nextLocale(current: LocaleCode): LocaleCode {
  return current === "ko-KR" ? "en-US" : "ko-KR";
}

export function persistLocale(storage: Pick<Storage, "setItem"> | null, locale: LocaleCode): void {
  if (storage) {
    storage.setItem(LANGUAGE_STORAGE_KEY, locale);
  }
}

export function createTranslator(locale: LocaleCode) {
  const dict = dictionaries[locale];
  return (key: string): string => dict[key] ?? key;
}

export function getDictionary(locale: LocaleCode): Record<string, string> {
  return dictionaries[locale];
}
