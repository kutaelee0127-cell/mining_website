import type { LocaleCode } from "../i18n";

export interface LanguageToggleProps {
  t: (key: string) => string;
  locale: LocaleCode;
  onToggle: () => void;
}

export function LanguageToggle({ t, locale, onToggle }: LanguageToggleProps) {
  return (
    <button type="button" onClick={onToggle} aria-label={t("action.toggleLanguage")}>
      {t("field.language")}: {locale}
    </button>
  );
}
