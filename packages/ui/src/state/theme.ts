export type ThemeMode = "dark" | "light";

export const THEME_STORAGE_KEY = "mining.theme";

export function readInitialTheme(storage: Pick<Storage, "getItem"> | null): ThemeMode {
  if (!storage) {
    return "dark";
  }

  const value = storage.getItem(THEME_STORAGE_KEY);
  if (value === "light" || value === "dark") {
    return value;
  }

  return "dark";
}

export function nextTheme(current: ThemeMode): ThemeMode {
  return current === "dark" ? "light" : "dark";
}
