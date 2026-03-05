import { useState } from "react";
import { ThemeProvider } from "../../../ui-kit/src/components/ThemeProvider";
import { ThemeToggle } from "../../../ui-kit/src/components/ThemeToggle";
import { type ThemeMode } from "../state/theme";

export interface AppShellProps {
  t: (key: string) => string;
}

export function AppShell({ t }: AppShellProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [toggleTheme, setToggleTheme] = useState<() => void>(() => () => undefined);

  return (
    <ThemeProvider onChange={(value) => {
      setTheme(value.theme);
      setToggleTheme(() => value.toggleTheme);
    }}>
      <main>
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
