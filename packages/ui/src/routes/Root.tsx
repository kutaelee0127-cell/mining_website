import { useMemo, useState } from "react";
import { AppShell } from "../app/AppShell";
import { login, logout, me } from "../api/auth";
import { createTranslator, nextLocale, persistLocale, readInitialLocale, type LocaleCode } from "../i18n";
import { LoginPage } from "./admin/LoginPage";
import { HistoryPage } from "./admin/HistoryPage";

export function Root() {
  const [locale, setLocale] = useState<LocaleCode>(() => readInitialLocale(typeof window === "undefined" ? null : window.localStorage));
  const [isAdmin, setIsAdmin] = useState(false);
  const t = useMemo(() => createTranslator(locale), [locale]);
  const path = typeof window === "undefined" ? "/" : window.location.pathname;

  const publicNav = [
    { key: "nav.home", href: "/" },
    { key: "nav.about", href: "/about" },
    { key: "nav.gallery", href: "/gallery" },
    { key: "nav.styles", href: "/styles" },
    { key: "nav.reviews", href: "/reviews" },
    { key: "nav.booking", href: "/booking" },
  ];

  const loadAdmin = async () => {
    const current = await me();
    setIsAdmin(Boolean(current));
  };

  return (
    <>
      <nav>
        {publicNav.map((item) => (
          <a key={item.href} href={item.href}>{t(item.key)}</a>
        ))}
      </nav>
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
      {path === "/__admin/login" ? (
        <LoginPage
          t={t}
          onLogin={async (username, password) => {
            const ok = await login(username, password);
            await loadAdmin();
            return ok;
          }}
        />
      ) : null}
      {path === "/__admin/revisions" ? <HistoryPage t={t} isAdmin={isAdmin} /> : null}
      <AppShell
        t={t}
        isAdmin={isAdmin}
        onLogout={async () => {
          await logout();
          setIsAdmin(false);
        }}
      />
    </>
  );
}
