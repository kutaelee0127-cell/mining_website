import { AppShell } from "../app/AppShell";

const copy: Record<string, string> = {
  "action.toggleTheme": "action.toggleTheme",
  "status.themeDark": "status.themeDark",
  "status.themeLight": "status.themeLight",
};

export function Root() {
  return <AppShell t={(key) => copy[key] ?? key} />;
}
