type ThemeMode = "dark" | "light";

export interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  toggleLabel: string;
  darkLabel: string;
  lightLabel: string;
}

export function ThemeToggle({ theme, onToggle, toggleLabel, darkLabel, lightLabel }: ThemeToggleProps) {
  const stateLabel = theme === "dark" ? darkLabel : lightLabel;

  return (
    <button type="button" onClick={onToggle} aria-label={toggleLabel}>
      {toggleLabel}: {stateLabel}
    </button>
  );
}
