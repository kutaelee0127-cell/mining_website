import { useEffect, useMemo, useState, type PropsWithChildren } from "react";

type ThemeMode = "dark" | "light";
const THEME_STORAGE_KEY = "mining.theme";

function readInitialTheme(storage: Pick<Storage, "getItem"> | null): ThemeMode {
  if (!storage) {
    return "dark";
  }

  const value = storage.getItem(THEME_STORAGE_KEY);
  if (value === "light" || value === "dark") {
    return value;
  }

  return "dark";
}

function nextTheme(current: ThemeMode): ThemeMode {
  return current === "dark" ? "light" : "dark";
}

export interface ThemeProviderValue {
  theme: ThemeMode;
  toggleTheme: () => void;
}

export interface ThemeProviderProps {
  onChange?: (value: ThemeProviderValue) => void;
}

export function ThemeProvider({ children, onChange }: PropsWithChildren<ThemeProviderProps>) {
  const [theme, setTheme] = useState<ThemeMode>(() => readInitialTheme(typeof window === "undefined" ? null : window.localStorage));

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const value = useMemo<ThemeProviderValue>(
    () => ({
      theme,
      toggleTheme: () => setTheme((prev) => nextTheme(prev)),
    }),
    [theme],
  );

  useEffect(() => {
    if (onChange) {
      onChange(value);
    }
  }, [onChange, value]);

  return <>{children}</>;
}
