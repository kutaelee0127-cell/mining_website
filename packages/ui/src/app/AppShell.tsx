import { useState } from "react";
import { AdminBar } from "./AdminBar";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeProvider } from "../../../ui-kit/src/components/ThemeProvider";
import { ThemeToggle } from "../../../ui-kit/src/components/ThemeToggle";
import { type LocaleCode } from "../i18n";
import { type ThemeMode } from "../state/theme";

export interface AppShellProps {
  t: (key: string) => string;
  locale?: LocaleCode;
  onToggleLanguage?: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export function AppShell({ t, locale = "ko-KR", onToggleLanguage, isAdmin = false, onLogout }: AppShellProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [toggleTheme, setToggleTheme] = useState<() => void>(() => () => undefined);

  return (
    <ThemeProvider onChange={(value) => {
      setTheme(value.theme);
      setToggleTheme(() => value.toggleTheme);
    }}>
      <main>
        {isAdmin ? <AdminBar t={t} onLogout={onLogout ?? (() => undefined)} /> : null}
        {onToggleLanguage ? <LanguageToggle t={t} locale={locale} onToggle={onToggleLanguage} /> : null}
        <ThemeToggle
          theme={theme}
          onToggle={toggleTheme}
          toggleLabel={t("action.toggleTheme")}
          darkLabel={t("status.themeDark")}
          lightLabel={t("status.themeLight")}
        />
      </main>
    </ThemeProvider>
  );
}
