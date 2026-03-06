import { useState } from "react";
import { AdminBar } from "./AdminBar";
import { ThemeProvider } from "../../../ui-kit/src/components/ThemeProvider";
import { ThemeToggle } from "../../../ui-kit/src/components/ThemeToggle";
import { type ThemeMode } from "../state/theme";

export interface AppShellProps {
  t: (key: string) => string;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export function AppShell({ t, isAdmin = false, onLogout }: AppShellProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [toggleTheme, setToggleTheme] = useState<() => void>(() => () => undefined);

  return (
    <ThemeProvider onChange={(value) => {
      setTheme(value.theme);
      setToggleTheme(() => value.toggleTheme);
    }}>
      <main>
        {isAdmin ? <AdminBar t={t} onLogout={onLogout ?? (() => undefined)} /> : null}
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
