import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../app/AppShell";
import { login, logout, me } from "../api/auth";
import { createTranslator, nextLocale, persistLocale, readInitialLocale, type LocaleCode } from "../i18n";
import { LoginPage } from "./admin/LoginPage";
import { HistoryPage } from "./admin/HistoryPage";
import { HomePage } from "./home/HomePage";

export function Root() {
  const [locale, setLocale] = useState<LocaleCode>(() => readInitialLocale(typeof window === "undefined" ? null : window.localStorage));
  const [isAdmin, setIsAdmin] = useState(false);
  const t = useMemo(() => createTranslator(locale), [locale]);
  const path = typeof window === "undefined" ? "/" : window.location.pathname;

  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [healthTs, setHealthTs] = useState<string | null>(null);

  // Very small runtime proof for QA: show /api/health result on home.
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        setHealthOk(Boolean(d?.ok));
        setHealthTs(typeof d?.ts === 'string' ? d.ts : null);
      })
      .catch(() => {
        setHealthOk(false);
        setHealthTs(null);
      });
  }, []);

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

  useEffect(() => {
    void loadAdmin();
  }, []);

  const renderPage = () => {
    if (path === "/") {
      return <HomePage t={t} isAdmin={isAdmin} locale={locale} />;
    }

    if (path === "/about") {
      return (
        <section>
          <h1>{t("nav.about")}</h1>
          <p style={{ color: 'var(--muted)' }}>소개 페이지(디자이너/위치/인스타 링크) 콘텐츠는 태스크 단위로 연결됩니다.</p>
        </section>
      );
    }

    if (path === "/booking") {
      return (
        <section>
          <h1>{t("nav.booking")}</h1>
          <p style={{ color: 'var(--muted)' }}>예약 CTA 연결은 태스크 단위로 구현됩니다.</p>
        </section>
      );
    }

    return (
      <section>
        <h1>{path}</h1>
        <p style={{ color: 'var(--muted)' }}>페이지 콘텐츠는 플레이북 태스크로 순차 구현됩니다.</p>
      </section>
    );
  };

  return (
    <>
      <nav>
        {publicNav.map((item) => (
          <a key={item.href} href={item.href}>
            {t(item.key)}
          </a>
        ))}
      </nav>

      <main>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
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
        </div>

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

        {renderPage()}

        <AppShell
          t={t}
          isAdmin={isAdmin}
          onLogout={async () => {
            await logout();
            setIsAdmin(false);
          }}
        />
      </main>
    </>
  );
}
