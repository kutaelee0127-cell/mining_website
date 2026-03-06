import { useMemo, useState } from "react";
import { AppShell } from "../app/AppShell";
import { createTranslator, nextLocale, persistLocale, readInitialLocale, type LocaleCode } from "../i18n";

export function Root() {
  const [locale, setLocale] = useState<LocaleCode>(() => readInitialLocale(typeof window === "undefined" ? null : window.localStorage));
  const t = useMemo(() => createTranslator(locale), [locale]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const next = nextLocale(locale);
          setLocale(next);
          if (typeof window !== "undefined") {
            persistLocale(window.localStorage, next);
          }
        }}
      >
        {t("field.language")}: {locale}
      </button>
      <AppShell t={t} />
    </>
  );
}
